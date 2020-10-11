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
