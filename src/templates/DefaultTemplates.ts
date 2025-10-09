import { WorkflowTemplate } from '../services/DatabaseService';

export const defaultTemplates: WorkflowTemplate[] = [
  {
    name: 'Calculadora Simple',
    description: 'Suma y multiplicación de dos números',
    nodes_data: JSON.stringify([
      { id: 1, type: 'math/add', position: { x: 100, y: 100 }, data: { value: 5 } },
      { id: 2, type: 'input/number', position: { x: 100, y: 200 }, data: { value: 3 } },
      { id: 3, type: 'math/add', position: { x: 300, y: 150 } },
      { id: 4, type: 'output/display', position: { x: 500, y: 150 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } }
    ])
  },
  {
    name: 'Comparador Lógico',
    description: 'Comparación de números y operación AND',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: 100, y: 100 }, data: { value: 7 } },
      { id: 2, type: 'number', position: { x: 100, y: 200 }, data: { value: 4 } },
      { id: 3, type: 'greater', position: { x: 300, y: 120 } },
      { id: 4, type: 'boolean', position: { x: 100, y: 300 }, data: { value: true } },
      { id: 5, type: 'and', position: { x: 400, y: 200 } },
      { id: 6, type: 'display', position: { x: 600, y: 200 } }
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
    name: 'Conversor Booleano',
    description: 'Conversión entre números y booleanos',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: 100, y: 100 }, data: { value: 0 } },
      { id: 2, type: 'equals', position: { x: 300, y: 100 } },
      { id: 3, type: 'boolean', position: { x: 100, y: 200 }, data: { value: false } },
      { id: 4, type: 'or', position: { x: 400, y: 150 } },
      { id: 5, type: 'display', position: { x: 600, y: 150 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 2, pin: 1 } },
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 1 } },
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 } }
    ])
  }
];
