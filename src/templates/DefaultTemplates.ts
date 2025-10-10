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
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } }
    ])
  },
  {
    name: 'Operaciones Matemáticas',
    description: 'Demuestra nodos de suma, multiplicación y comparación',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -300, y: -100 }, data: { value: 10 } },
      { id: 2, type: 'number', position: { x: -300, y: 100 }, data: { value: 5 } },
      { id: 3, type: 'add', position: { x: -100, y: -50 } },
      { id: 4, type: 'multiply', position: { x: -100, y: 50 } },
      { id: 5, type: 'greater', position: { x: 100, y: 0 } },
      { id: 6, type: 'display', position: { x: 300, y: 0 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } }
    ])
  },
  {
    name: 'Manipulación de Strings',
    description: 'Demuestra concatenación y longitud de strings',
    nodes_data: JSON.stringify([
      { id: 1, type: 'string', position: { x: -300, y: -50 }, data: { value: 'Hello' } },
      { id: 2, type: 'string', position: { x: -300, y: 50 }, data: { value: ' World!' } },
      { id: 3, type: 'concat', position: { x: -100, y: 0 } },
      { id: 4, type: 'length', position: { x: 100, y: 0 } },
      { id: 5, type: 'display', position: { x: 300, y: -25 } },
      { id: 6, type: 'display', position: { x: 300, y: 25 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } }
    ])
  },
  {
    name: '🚀 TUTORIAL: Mi Primer Flujo',
    description: 'Ejemplo súper simple: dos números + suma + resultado',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -200, y: -50 }, data: { value: 5 } },
      { id: 2, type: 'number', position: { x: -200, y: 50 }, data: { value: 3 } },
      { id: 3, type: 'add', position: { x: 0, y: 0 } },
      { id: 4, type: 'display', position: { x: 200, y: 0 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } }
    ])
  },
  {
    name: '🧮 Calculadora Completa',
    description: 'Sistema de cálculo con múltiples operaciones matemáticas',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -400, y: -100 }, data: { value: 20 } },
      { id: 2, type: 'number', position: { x: -400, y: 0 }, data: { value: 5 } },
      { id: 3, type: 'number', position: { x: -400, y: 100 }, data: { value: 3 } },
      { id: 4, type: 'add', position: { x: -200, y: -50 } },
      { id: 5, type: 'multiply', position: { x: -200, y: 50 } },
      { id: 6, type: 'subtract', position: { x: 0, y: -25 } },
      { id: 7, type: 'divide', position: { x: 0, y: 75 } },
      { id: 8, type: 'display', position: { x: 200, y: -25 } },
      { id: 9, type: 'display', position: { x: 200, y: 75 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 1 } },
      { from: { node: 2, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } },
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 7, pin: 1 } },
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 } },
      { from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 } }
    ])
  },
  {
    name: '🔀 Sistema de Decisión Lógica',
    description: 'Flujo completo con comparaciones, lógica AND/OR y múltiples salidas',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -400, y: -150 }, data: { value: 25 } },
      { id: 2, type: 'number', position: { x: -400, y: -50 }, data: { value: 18 } },
      { id: 3, type: 'number', position: { x: -400, y: 50 }, data: { value: 30 } },
      { id: 4, type: 'number', position: { x: -400, y: 150 }, data: { value: 20 } },
      { id: 5, type: 'greater', position: { x: -200, y: -100 } },
      { id: 6, type: 'greater', position: { x: -200, y: 100 } },
      { id: 7, type: 'and', position: { x: 0, y: -50 } },
      { id: 8, type: 'or', position: { x: 0, y: 50 } },
      { id: 9, type: 'not', position: { x: 200, y: 0 } },
      { id: 10, type: 'display', position: { x: 400, y: -50 } },
      { id: 11, type: 'display', position: { x: 400, y: 50 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 3, pin: 0 }, to: { node: 6, pin: 0 } },
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 } },
      { from: { node: 6, pin: 0 }, to: { node: 7, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 8, pin: 0 } },
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 1 } },
      { from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 } },
      { from: { node: 9, pin: 0 }, to: { node: 10, pin: 0 } },
      { from: { node: 8, pin: 0 }, to: { node: 11, pin: 0 } }
    ])
  },
  {
    name: '📊 Análisis de Datos con Strings',
    description: 'Combina strings y obtiene información estadística',
    nodes_data: JSON.stringify([
      { id: 1, type: 'string', position: { x: -300, y: -100 }, data: { value: 'Node' } },
      { id: 2, type: 'string', position: { x: -300, y: 0 }, data: { value: 'Editor' } },
      { id: 3, type: 'string', position: { x: -300, y: 100 }, data: { value: '2025' } },
      { id: 4, type: 'concat', position: { x: -100, y: -50 } },
      { id: 5, type: 'concat', position: { x: 100, y: 0 } },
      { id: 6, type: 'length', position: { x: 300, y: -50 } },
      { id: 7, type: 'display', position: { x: 300, y: 50 } },
      { id: 8, type: 'display', position: { x: 500, y: 0 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 1 } },
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } },
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 } },
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 } }
    ])
  },
  {
    name: '🎲 Sistema de Validación Complejo',
    description: 'Validación multi-nivel con condiciones anidadas y resultados múltiples',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -500, y: -150 }, data: { value: 42 } },
      { id: 2, type: 'number', position: { x: -500, y: -50 }, data: { value: 10 } },
      { id: 3, type: 'number', position: { x: -500, y: 50 }, data: { value: 100 } },
      { id: 4, type: 'condition', position: { x: -300, y: -100 } },
      { id: 5, type: 'greater', position: { x: -300, y: 50 } },
      { id: 6, type: 'boolean', position: { x: -500, y: 150 }, data: { value: true } },
      { id: 7, type: 'and', position: { x: -100, y: -50 } },
      { id: 8, type: 'or', position: { x: -100, y: 100 } },
      { id: 9, type: 'equals', position: { x: 100, y: 0 } },
      { id: 10, type: 'display', position: { x: 300, y: -75 } },
      { id: 11, type: 'display', position: { x: 300, y: 0 } },
      { id: 12, type: 'display', position: { x: 300, y: 75 } }
    ]),
    connections_data: JSON.stringify([
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } },
      { from: { node: 1, pin: 0 }, to: { node: 5, pin: 0 } },
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 1 } },
      { from: { node: 4, pin: 0 }, to: { node: 7, pin: 0 } },
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 1 } },
      { from: { node: 4, pin: 1 }, to: { node: 8, pin: 0 } },
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 1 } },
      { from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 } },
      { from: { node: 8, pin: 0 }, to: { node: 9, pin: 1 } },
      { from: { node: 7, pin: 0 }, to: { node: 10, pin: 0 } },
      { from: { node: 8, pin: 0 }, to: { node: 11, pin: 0 } },
      { from: { node: 9, pin: 0 }, to: { node: 12, pin: 0 } }
    ])
  }
];
