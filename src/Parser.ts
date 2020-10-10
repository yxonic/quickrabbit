import { Annotation } from './Annotations'

export class Parser {
  constructor(private readonly src: string) {}

  // eslint-disable-next-line class-methods-use-this
  parse(): Array<Annotation> {
    return [
      {
        name: 'run',
        key: 'rpc.run',
        actions: ['commit'],
        typename: 'RunArg',
      },
      {
        name: 'run',
        key: 'rpc.run',
        actions: ['reply'],
        typename: 'RunMsg',
      },
      {
        name: 'logCreate',
        key: 'logging.create',
        actions: ['publish', 'subscribe'],
        typename: 'CreateMsg',
      },
    ]
  }
}
