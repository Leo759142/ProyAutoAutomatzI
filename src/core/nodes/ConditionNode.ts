import { Node } from '../Node';

export class ConditionNode extends Node {
  constructor(definition) {
    super(definition);
  }
  compute() {
    // Si el valor de entrada > 10, salida 0 es true, salida 1 es false
    const val = this.inputs[0].value ?? 0;
    this.outputs[0].value = val > 10;
    this.outputs[1].value = val <= 10;
    // Activar animación visual por 1 segundo
    this.highlightUntil = Date.now() + 1000;
  }
}
