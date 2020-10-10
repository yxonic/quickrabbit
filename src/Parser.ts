import { Annotation } from './Annotations'

export default class Parser {
  constructor(private readonly src: string) {}

  // eslint-disable-next-line class-methods-use-this
  parse(): Array<Annotation> {
    return [
      {
        name: 'check',
        key: 'rpc.check',
        actions: ['call'],
        typename: 'CheckArg',
      },
      {
        name: 'check',
        key: 'rpc.check',
        actions: ['return'],
        typename: 'CheckRet',
      },
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
      {
        name: 'logAll',
        key: 'logging.*',
        actions: ['subscribe'],
        typename: 'LogMsg',
      },
    ]
  }
}
