# quickrabbit

`quickrabbit` generates strongly-typed functions for implementing RPC, task queue, Pub/Sub, etc. using RabbitMQ. It is based on the awesome [`quicktype`](https://github.com/quicktype/quicktype) library.

## Usage

1. Create a shared `rabbit` project across all related projects.
2. Add type declarations in `rabbit` using [extended annotations](#extended-annotations).
3. Configure git submodule for each project.
4. Add `quickrabbit` to build process.
5. Use generated function declarations!

## Extended Annotations

Supported types: call, return, commit, reply, publish, subscribe.

```ts
/// rpc.check[call]
class CheckArgs {
    command: string
}

/// rpc.check[return]
class CheckRet {
    available: boolean
}

/// rpc.run[commit]
class RunArgs {
    command: string
}

/// rpc.run[reply]
class RunWorkerMsg {
    time: Date
    message: string
}

/// logging.create[publish,subscribe]
class CreateMsg {
    id: string
    name: string
    time: Date
}

/// logging.*[subscribe]
class LoggingSubMsg {
    time: Date
}
```
