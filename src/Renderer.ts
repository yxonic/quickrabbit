import { AnnotatedAction, Annotation } from './Annotations'

export default abstract class RabbitRenderer {
  private annotatedActions: Record<string, AnnotatedAction> = {}
  private emitContext: string[] = []
  private indentLevel = 0

  constructor(readonly annotations: Array<Annotation>) {
    this.annotations.forEach((annotation) => {
      annotation.actions.forEach((action) => {
        let a = this.annotatedActions[annotation.name]
        if (a === undefined) {
          a = {
            name: annotation.name,
            key: annotation.key,
            actions: [action],
            inputType: '',
            outputType: '',
          }
          this.annotatedActions[annotation.name] = a
        } else {
          a.actions.push(action)
        }
        if (['call', 'commit', 'publish'].lastIndexOf(action) !== -1) {
          if (a.inputType && a.inputType !== annotation.typename) {
            throw new Error('inconsistent type annotations')
          }
          this.annotatedActions[annotation.name] = {
            ...a,
            inputType: annotation.typename,
          }
        } else {
          if (a.outputType && a.outputType !== annotation.typename) {
            throw new Error('inconsistent type annotations')
          }
          this.annotatedActions[annotation.name] = {
            ...a,
            outputType: annotation.typename,
          }
        }
      })
    })
  }

  indentation(): string {
    return '    '
  }

  emitBlock(start: string, end: string, emit: () => void): void {
    this.emitLine(start)
    this.indent(emit)
    this.emitLine(end)
  }

  beforeRabbit(): void {}

  afterRabbit(): void {}

  rabbitBlockStart(): string {
    return ''
  }

  rabbitBlockEnd(): string {
    return ''
  }

  beforeAction(): void {}

  afterAction(): void {}

  abstract renderAction(action: AnnotatedAction): void

  render(): string[] {
    this.beforeRabbit()
    this.emitBlock(
      this.rabbitBlockStart(),
      this.rabbitBlockEnd(),
      () => {
        this.beforeAction()
        Object.values(this.annotatedActions).forEach((action) => {
          this.renderAction(action)
        })
        this.afterAction()
      },
    )
    this.afterRabbit()
    return this.emitContext
  }

  emitLine(...parts: string[]): void {
    const line = this.indentation().repeat(this.indentLevel) + parts.join(' ')
    this.emitContext.push(line.trimEnd())
  }

  emitLines(lines: string | string[]): void {
    (typeof lines === 'string' ? lines.split('\n') : lines).forEach((line) => {
      this.emitContext.push(this.indentation().repeat(this.indentLevel) + line.trimEnd())
    })
  }

  indent(f: () => void): void {
    this.indentLevel += 1
    f()
    this.indentLevel -= 1
  }
}
