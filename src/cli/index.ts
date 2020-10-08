import * as path from 'path'
import * as fs from 'fs'
import {
  quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore, defined,
} from 'quicktype-core'
import { schemaForTypeScriptSources } from 'quicktype-typescript-input'

function makeTypeScriptSource (fileNames: string[]) {
  const sources: { [fileName: string]: string } = {}

  fileNames.forEach((fileName) => {
    const baseName = path.basename(fileName)
    sources[baseName] = defined(fs.readFileSync(fileName, 'utf8'))
  })

  return schemaForTypeScriptSources(sources)
}

async function convert (fileNames: string[], targetLanguage: string) {
  const source = makeTypeScriptSource(fileNames)

  const inputData = new InputData()
  inputData.addSource(
    'schema',
    source,
    () => new JSONSchemaInput(new FetchingJSONSchemaStore()),
  )

  return quicktype({
    inputData,
    lang: targetLanguage,
  })
}

async function main () {
  const { lines } = await convert(
    ['examples/Rabbit.ts'],
    'Rust',
  )
  console.log(lines.join('\n'))
}

main()
