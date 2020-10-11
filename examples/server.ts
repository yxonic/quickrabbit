import { connect } from './rabbit'

async function main() {
  const rabbit = await connect('amqp://guest:guest@localhost:5672/', 'platform')
  rabbit.checkImpl((arg) => ({
    available: arg.command === 'rabbit',
  }))
}

main()
