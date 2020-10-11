import { AnnotatedAction } from '../Annotations'
import RabbitRenderer from '../Renderer'

const connectLines = `const conn = await amqp.connect(url)
const ch = await conn.createChannel()
const rabbit = new Rabbit(conn, ch, exchange)
await rabbit.initialize()
return rabbit`

const initializeLines = `const ch = this.channel
await ch.assertExchange(this.exchange, 'topic')
const { queue: replyTo } = await ch.assertQueue('')
this.replyTo = replyTo
ch.prefetch(1)
const { callbacks } = this
await ch.consume(replyTo, async (msg) => {
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
ch.on('return', (msg) => {
    // messages are only returned if there is no worker
    if (msg === null || callbacks[msg.properties.correlationId] === undefined) {
        return null
    }
    return callbacks[msg.properties.correlationId](null, () => {
        delete callbacks[msg.properties.correlationId]
    })
})`

const publishLines = `const msg = JSON.stringify(obj)
return this.channel.publish(this.exchange, key, Buffer.from(msg))`

const subscribeLines = `const ch = this.channel
const { queue } = await ch.assertQueue('', { exclusive: true })
await ch.bindQueue(queue, this.exchange, key)
return ch.consume(queue, async (msg) => {
    if (msg === null) {
        return null
    }
    const r = await handler(JSON.parse(msg.content.toString()), async (m) => { await this.reply(msg, m) })
    if (r != null) {
        await this.reply(msg, r)
    }
}, { noAck: true })`

const replyLines = `const ch = await this.channel
return ch.publish(
    '', orig.properties.replyTo || 'core.reply-to',
    Buffer.from(JSON.stringify(msg)),
    {
        correlationId: orig.properties.correlationId,
    },
)`

const callLines = `const ch = this.channel
const message = JSON.stringify(obj)
const correlationId = cuid()

let promise: Promise<any> | null = null
if (callback === undefined) {
    promise = new Promise((resolve, _reject) => {
        // eslint-disable-next-line no-param-reassign
        this.callbacks[correlationId] = (msg: any, done: () => void) => {
            const r = resolve(msg)
            done()
            return r
        }
    })
} else {
    this.callbacks[correlationId] = callback
}
ch.publish(this.exchange, key, Buffer.from(message), {
    correlationId,
    replyTo: this.replyTo,
    mandatory: true,
})
if (promise !== null) {
    return promise
}
return null`

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
    this.emitLine('replyTo: string = \'\'')
    this.emitLine('callbacks: Record<string, (msg: any, done: () => void) => void> = {}')
    this.emitBlock('constructor(private connection: amqp.Connection, private channel: amqp.Channel, private exchange: string)', '', () => {})
    this.emitBlock('async initialize()', '', () => {
      this.emitLines(initializeLines)
    })
    this.emitBlock('async disconnect()', '', () => {
      this.emitLine('this.connection.close()')
    })
    this.emitBlock('async publish(key: string, obj: unknown)', '', () => {
      this.emitLines(publishLines)
    })
    this.emitBlock('async subscribe(key: string, handler: (obj: unknown, reply: (o: unknown) => Promise<void>) => void)', '', () => {
      this.emitLines(subscribeLines)
    })
    this.emitBlock('async call(key: string, obj: unknown, callback?: (msg: any, done: () => void) => void)', '', () => {
      this.emitLines(callLines)
    })
    this.emitBlock('async reply(orig: amqp.ConsumeMessage, msg: unknown)', '', () => {
      this.emitLines(replyLines)
    })
  }

  renderAction(action: AnnotatedAction): void {
    action.actions.forEach((a) => {
      switch (a) {
        case 'call':
          this.emitBlock(`async ${action.name}(arg: ${action.inputType})`, '', () => {
            this.emitLines([
              `const msg = await this.call('${action.key}', arg)`,
              'if (msg === null) { throw new Error(\'rpc server unavailable\') }',
              `return msg as ${action.outputType}`,
            ])
          })
          break
        case 'return':
          this.emitBlock(
            `${action.name}Impl(f: (arg: ${action.inputType}) => `
              + `${action.outputType} | Promise<${action.outputType}>)`,
            '',
            () => {
              this.emitBlock(
                `return this.subscribe('${action.key}', async (arg, reply) => `,
                ')',
                () => {
                  this.emitLine(`reply(await f(arg as ${action.inputType}))`)
                },
              )
            },
          )
          break
        case 'commit':
          this.emitBlock(
            `${action.name}(arg: ${action.inputType}, handler: (msg: ${action.inputType}, done: () => void) => void, onReturn: () => void)`,
            '',
            () => {
              this.emitBlock(
                `this.call('${action.key}', arg, (msg, done) =>`,
                ')',
                () => {
                  this.emitLines([
                    'if (msg === null) { return onReturn() }',
                    `handler(msg as ${action.inputType}, done)`,
                  ])
                },
              )
            },
          )
          break
        case 'reply':
          this.emitBlock(
            `${action.name}Impl(f: (arg: ${action.inputType}, `
              + `reply: (msg: ${action.outputType}) => void) => void)`,
            '',
            () => {
              this.emitBlock(
                `return this.subscribe('${action.key}', (arg, reply) => `,
                ')',
                () => {
                  this.emitLines([
                    `f(arg as ${action.inputType}, (msg) => { reply(msg) })`,
                  ])
                },
              )
            },
          )
          break
        case 'publish':
          this.emitBlock(`async ${action.name}Publish(arg: ${action.inputType})`, '', () => {
            this.emitLine(`await this.publish('${action.key}', arg)`)
          })
          break
        case 'subscribe':
          this.emitBlock(`${action.name}Subscribe(handler: (msg: ${action.outputType}) => void)`, '', () => {
            this.emitBlock(
              `return this.subscribe('${action.key}', (msg) =>`,
              ')',
              () => {
                this.emitLine(`handler(msg as ${action.outputType})`)
              },
            )
          })
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
