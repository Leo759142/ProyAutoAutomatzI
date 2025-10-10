// ARCHIVO OBSOLETO - No se usa en el proyecto
// La funcionalidad de procesamiento está integrada en Node.ts

import { Node } from '../Node';
import { NodeDefinition } from '../../types/types';

export class ProcessNode extends Node {
  constructor(definition: NodeDefinition) {
    super(definition);
  }
  // compute() ya está implementado en la clase base Node
}
