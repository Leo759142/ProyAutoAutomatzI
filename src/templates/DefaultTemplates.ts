import { WorkflowTemplate } from '../services/DatabaseService';

export const defaultTemplates: WorkflowTemplate[] = [
  {
    name: 'Comparador Simple',
    description: 'Compara dos números con operador mayor que',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -200, y: -100 }, data: { value: 15 } },
      { id: 2, type: 'number', position: { x: -200, y: 100 }, data: { value: 10 } },
      { id: 3, type: 'greater', position: { x: 0, y: 0 } },
      { id: 4, type: 'display', position: { x: 200, y: 0 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } }
    ])
  },
  {
    name: 'Operación Lógica AND',
    description: 'Comparación de números y operación AND',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -300, y: -150 }, data: { value: 12 } },
      { id: 2, type: 'number', position: { x: -300, y: -50 }, data: { value: 8 } },
      { id: 3, type: 'greater', position: { x: -100, y: -100 } },
      { id: 4, type: 'boolean', position: { x: -300, y: 100 }, data: { value: true } },
      { id: 5, type: 'and', position: { x: 100, y: 0 } },
      { id: 6, type: 'display', position: { x: 300, y: 0 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } }
    ])
  },
  {
    name: 'Nodo Condicional',
    description: 'Usa el nodo Condition con dos salidas',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -200, y: 0 }, data: { value: 15 } },
      { id: 2, type: 'condition', position: { x: 0, y: 0 } },
      { id: 3, type: 'display', position: { x: 200, y: -80 } },
      { id: 4, type: 'display', position: { x: 200, y: 80 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 1 }, to: { node: 4, pin: 0 } }
    ])
  }
];
