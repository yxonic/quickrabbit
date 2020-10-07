import { TypeScriptRenderer } from 'quicktype-core'
import { Annotation } from '../Annotations'
import { RabbitRenderer, applyMixins } from '../Renderer'

class TypeScriptRabbitRenderer extends RabbitRenderer {
  constructor(annotations: Array<Annotation>) {
    super(annotations)
  }
  renderAction() {
  }
}
  
interface TypeScriptRabbitRenderer extends TypeScriptRenderer {}
applyMixins(TypeScriptRabbitRenderer, [TypeScriptRenderer])
