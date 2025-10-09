import { Node } from '../Node';

export class OutputNode extends Node {
  constructor(definition) {
    super(definition);
  }
  compute() {
    // Mostrar el resultado final
    // Por ejemplo, actualizar la UI o enviar notificación
    // this.inputs[0].value
  }
}
