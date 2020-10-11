# quickrabbit

`quickrabbit` generates strongly-typed easy-to-use APIs for implementing cross-language actions such as RPC, task queue and Pub/Sub, using RabbitMQ. It is based on the awesome [`quicktype`](https://github.com/quicktype/quicktype) library.

**STILL WORK IN PROGRESS!**

Supported output languages: TypeScript, Python, Java, Go, Rust.

## TODO
- [ ] Message type and error handling.
- [ ] Renderer for all languages.
- [ ] Parser.
- [ ] CLI.
- [ ] Testing.

## Usage

1. Create a shared `rabbit` project across all related projects.
2. Add type declarations in `rabbit` using [extended annotations](#extended-annotations).
3. Configure git submodule for each project.
4. Add `quickrabbit` to build process.
5. Use generated function declarations!

## Extended Annotations

Grammar:

```ts
/// name[key]: action[, action, ...]
class TypeName
```

Supported actions: call, return, commit, reply, publish, subscribe.

```ts
/// check[rpc.check]: call
class CheckArg {
    command: string
}

/// check[rpc.check]: return
class CheckRet {
    available: boolean
}

/// run[rpc.run]: commit
class RunArg {
    command: string
}

/// run[rpc.run]: reply
class RunMsg {
    time: Date
    message: string
}

/// logCreate[logging.create]: publish,subscribe
class CreateMsg {
    id: string
    name: string
    time: Date
}

/// logAll[logging.*]: subscribe
class LogMsg {
    time: Date
}
```

Generated (TypeScript):

```ts
// type declarations by quicktype
...

// main class with auto-generated functions
class QuickRabbit {
    ...

    check(arg: CheckArg): Promise<CheckRet> {
        ...
    }
    checkImpl(f: (arg: CheckArg) => CheckRet | Promise<CheckRet>) {
        ...
    }

    run(arg: RunArg, handler: (msg: RunMsg) => void) {
        ...
    }
    runImpl(f: (arg: CheckArg, reply: (msg: RunMsg) => void)) {
        ...
    }

    logCreatePublish(msg: CreateMsg) {
        ...
    }
    logCreateSubscribe(msg: CreateMsg) {
        ...
    }

    logAllSubscribe(handler: (msg: LogMsg) => void) {
        ...
    }
}

// create connection
export async function connect() {
    ...
    return new QuickRabbit(...)
}
```
