import { Node } from '../Node';

export class ProcessNode extends Node {
  constructor(definition) {
    super(definition);
  }
  compute() {
    // Ejemplo: multiplicar por 2
    this.outputs[0].value = (this.inputs[0].value ?? 0) * 2;
  }
}
