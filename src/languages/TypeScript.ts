import { AnnotatedAction } from '../Annotations'
import RabbitRenderer from '../Renderer'

export default class TypeScriptRabbitRenderer extends RabbitRenderer {
  emitBlock(start: string, end: string, emit: () => void): void {
    this.emitLine(start, '{')
    this.indent(emit)
    this.emitLine('}', end)
  }

  rabbitBlockStart(): string {
    return 'export class Rabbit'
  }

  beforeAction(): void {
    this.emitBlock('constructor()', '', () => {})
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
    this.emitBlock('export async function connect()', '', () => {
      this.emitLine('return new Rabbit()')
    })
  }
}
