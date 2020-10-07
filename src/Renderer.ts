import { TypeScriptRenderer } from 'quicktype-core'
import { Action, Annotation } from './Annotations'

export abstract class RabbitRenderer {
  constructor(readonly annotations: Array<Annotation>) {}
  abstract renderAction(action: Action, name: string, key: string): void
  renderRabbit() {
    for (const annotation of this.annotations) {
      for (const action of annotation.actions) {
        this.renderAction(action, annotation.name, annotation.key)
      }
    }
  }
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}

