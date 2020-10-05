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
class CheckArg {
    command: string
}

/// rpc.check[return]
class CheckRet {
    available: boolean
}

/// rpc.run[commit]
class RunArg {
    command: string
}

/// rpc.run[reply]
class RunMsg {
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

Generated:

```ts
// type declarations by quicktype
...

class QuickRabbit {
    ...

    check(arg: CheckArg): Promise<CheckRet> {
        ...
    }
    registerCheckResponder(f: (arg: CheckArg) => CheckRet | Promise<CheckRet>) {
        ...
    }

    run(arg: RunArg, callback: (msg: RunMsg) => void) {
        ...
    }
    registerRunWorker(f: (arg: CheckArg, reply: (msg: RunMsg) => void)) {
        ...
    }

    logCreate(arg: CreateMsg) {
        ...
    }
    subscribeLog() {

    }
}

export async function connect() {
    return new QuickRabbit(...)
}
```
