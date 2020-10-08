export type Action = 'call' | 'return' | 'commit' | 'reply' | 'publish' | 'subscribe'

export interface Annotation {
  readonly name: string
  readonly key: string
  readonly actions: Array<Action>
  readonly typename: string
}

export interface AnnotatedAction {
  readonly name: string
  readonly key: string
  readonly actions: Array<Action>
  readonly inputType: string
  readonly outputType: string
}
