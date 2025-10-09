import { Node } from '../Node';

export class InputNode extends Node {
  constructor(definition) {
    super(definition);
  }
  compute() {
    // Recibe datos externos, por ejemplo, del usuario
    // this.outputs[0].value = ...
  }
}
