import { connect } from './rabbit'

async function main() {
  const rabbit = await connect('amqp://guest:guest@localhost:5672/', 'platform')
  console.log(await rabbit.check({
    command: 'rabbit',
  }))
  console.log(await rabbit.check({
    command: 'duck',
  }))
  rabbit.disconnect()
}

main()
