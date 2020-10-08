import { AnnotatedAction, Annotation } from './Annotations'

export abstract class RabbitRenderer {
  private annotatedActions: Record<string, AnnotatedAction> = {}

  private emitContext: string[] = []

  constructor (readonly annotations: Array<Annotation>) {
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

  abstract renderAction (action: AnnotatedAction): void

  render (): string[] {
    Object.values(this.annotatedActions).forEach((action) => {
      this.renderAction(action)
    })
    return this.emitContext
  }

  // eslint-disable-next-line class-methods-use-this
  emitLine (...parts: string[]) {
    this.emitContext.push(parts.join(' '))
  }

  // eslint-disable-next-line class-methods-use-this
  indent (_: () => void) {}
}
