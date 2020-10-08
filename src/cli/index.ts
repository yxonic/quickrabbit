import * as path from 'path'
import * as fs from 'fs'
import {
  quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore, defined,
} from 'quicktype-core'
import { schemaForTypeScriptSources } from 'quicktype-typescript-input'
import Parser from '../Parser'
import TypeScriptRabbitRenderer from '../languages/TypeScript'

async function convert(fileNames: string[], targetLanguage: string) {
  const sources: { [fileName: string]: string } = {}

  fileNames.forEach((fileName) => {
    const baseName = path.basename(fileName)
    sources[baseName] = defined(fs.readFileSync(fileName, 'utf8'))
  })

  const schema = schemaForTypeScriptSources(sources)
  const inputData = new InputData()
  inputData.addSource(
    'schema',
    schema,
    () => new JSONSchemaInput(new FetchingJSONSchemaStore()),
  )

  const { lines: types } = await quicktype({
    inputData,
    lang: targetLanguage,
    rendererOptions: {
      'runtime-typecheck': 'false',
    },
  })

  const annotations = Object.values(sources).map((src) => {
    const parser = new Parser(src)
    return parser.parse()
  }).reduce(Array.prototype.concat)

  const renderer = new TypeScriptRabbitRenderer(annotations)
  const rabbit = renderer.render()

  return types.concat(rabbit)
}

async function main() {
  const lines = await convert(
    ['examples/Check.ts'],
    'TypeScript',
  )
  console.log(lines.join('\n'))
}

main()
