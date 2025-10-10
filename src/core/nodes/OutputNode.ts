import { Node } from '../Node';
import { NodeDefinition } from '../../types/types';

export class OutputNode extends Node {
  constructor(definition: NodeDefinition) {
    super(definition);
  }
  compute() {
    // Nodo de salida - puede mostrar valores o ejecutar acciones
    const inputValue = this.inputs[0]?.value;
    
    // Ejemplo: Log del valor (podrías extenderlo para otras acciones)
    if (inputValue !== undefined) {
      console.log(`Output Node [${this.title}]:`, inputValue);
    }
    
    // Los nodos de salida generalmente no producen outputs
    // pero mantienen el valor de entrada para referencia
  }
}
