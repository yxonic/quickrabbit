import { AnnotatedAction } from '../Annotations'
import RabbitRenderer from '../Renderer'

const initializeLines = `const ch = this.channel
await ch.assertExchange(this.exchange, 'topic')
await ch.assertQueue('core.reply-to')
ch.prefetch(1)
const { callbacks } = this
await ch.consume('core.reply-to', async (msg) => {
    if (msg === null) {
        return null
    }
    if (callbacks[msg.properties.correlationId] === undefined) {
        ch.nack(msg, false, false)
        return null
    }
    const res = await callbacks[msg.properties.correlationId](
        JSON.parse(msg.content.toString()),
        () => { delete callbacks[msg.properties.correlationId] },
    )
    ch.ack(msg)
    return res
})
ch.on('return', (msg: any) => {
    // messages are only returned if there is no worker
    if (msg === null || callbacks[msg.properties.correlationId] === undefined) {
        return null
    }
    return callbacks[msg.properties.correlationId](null, () => {
        delete callbacks[msg.properties.correlationId]
    })
})`

const connectLines = `const conn = await amqp.connect(url)
const ch = await conn.createChannel()
const rabbit = new Rabbit({
    channel: ch,
    exchange,
})
await rabbit.initialize()
return rabbit`

export default class TypeScriptRabbitRenderer extends RabbitRenderer {
  emitBlock(start: string, end: string, emit: () => void): void {
    this.emitLine(start, '{')
    this.indent(emit)
    this.emitLine('}', end)
  }

  beforeRabbit(): void {
    this.emitLine('import * as amqp from \'amqplib\'')
    this.emitLine('import * as cuid from \'cuid\'')
  }

  rabbitBlockStart(): string {
    return 'export class Rabbit'
  }

  beforeAction(): void {
    this.emitLine('channel: amqp.Channel')
    this.emitBlock('constructor()', '', () => {})
    this.emitBlock('async initialize()', '', () => {
      this.emitLines(initializeLines)
    })
  }

  renderAction(action: AnnotatedAction): void {
    action.actions.forEach((a) => {
      switch (a) {
        case 'call':
          this.emitBlock(`async ${action.name}(arg: ${action.inputType})`, '', () => {})
          break
        case 'return':
          this.emitBlock(
            `${action.name}Impl(f: (arg: ${action.inputType}) => `
              + `${action.outputType} | Promise<${action.outputType}>)`,
            '',
            () => {},
          )
          break
        case 'commit':
          this.emitBlock(
            `${action.name}(arg: ${action.inputType}, handler: (msg: ${action.inputType}) => void)`,
            '',
            () => {},
          )
          break
        case 'reply':
          this.emitBlock(
            `${action.name}Impl(f: (arg: ${action.inputType}, `
              + `reply: (msg: ${action.outputType}) => void, `
              + 'done: (error: Error | undefined) => void) => void)',
            '',
            () => {},
          )
          break
        case 'publish':
          this.emitBlock(`${action.name}Publish(msg: ${action.inputType})`, '', () => {})
          break
        case 'subscribe':
          this.emitBlock(`${action.name}Subscribe(handler: (msg: ${action.outputType}) => void)`, '', () => {})
          break
        default:
          break
      }
    })
  }

  afterRabbit(): void {
    this.emitBlock('export async function connect(url: string, exchange: string)', '', () => {
      this.emitLines(connectLines)
    })
  }
}
