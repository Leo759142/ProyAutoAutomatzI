import { WorkflowTemplate } from '../services/DatabaseService';

export const defaultTemplates: WorkflowTemplate[] = [
  {
    name: 'Comparador Simple',
    description: 'Compara dos números con operador mayor que',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 15 } },
  { id: 2, type: 'number', position: { x: -10, y: 5 }, data: { value: 10 } },
  { id: 3, type: 'greater', position: { x: 0, y: 0 } },
  { id: 4, type: 'display', position: { x: 10, y: 0 } }
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
  { id: 1, type: 'number', position: { x: -10, y: -7.5 }, data: { value: 12 } },
  { id: 2, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 8 } },
  { id: 3, type: 'greater', position: { x: -5, y: -5 } },
  { id: 4, type: 'boolean', position: { x: -10, y: 5 }, data: { value: true } },
  { id: 5, type: 'and', position: { x: 5, y: 0 } },
  { id: 6, type: 'display', position: { x: 10, y: 0 } }
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
  { id: 1, type: 'number', position: { x: -10, y: 0 }, data: { value: 15 } },
  { id: 2, type: 'condition', position: { x: 0, y: 0 } },
  { id: 3, type: 'display', position: { x: 10, y: -4 } },
  { id: 4, type: 'display', position: { x: 10, y: 4 } }
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
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 10 } },
  { id: 2, type: 'number', position: { x: -10, y: 5 }, data: { value: 5 } },
  { id: 3, type: 'add', position: { x: -5, y: -2.5 } },
  { id: 4, type: 'multiply', position: { x: -5, y: 2.5 } },
  { id: 5, type: 'greater', position: { x: 5, y: 0 } },
  { id: 6, type: 'display', position: { x: 10, y: 0 } }
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
  { id: 1, type: 'string', position: { x: -10, y: -2.5 }, data: { value: 'Hello' } },
  { id: 2, type: 'string', position: { x: -10, y: 2.5 }, data: { value: ' World!' } },
  { id: 3, type: 'concat', position: { x: -5, y: 0 } },
  { id: 4, type: 'length', position: { x: 5, y: 0 } },
  { id: 5, type: 'display', position: { x: 10, y: -1.25 } },
  { id: 6, type: 'display', position: { x: 10, y: 1.25 } }
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
  { id: 1, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 5 } },
  { id: 2, type: 'number', position: { x: -10, y: 2.5 }, data: { value: 3 } },
  { id: 3, type: 'add', position: { x: 0, y: 0 } },
  { id: 4, type: 'display', position: { x: 10, y: 0 } }
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
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 20 } },
  { id: 2, type: 'number', position: { x: -10, y: 0 }, data: { value: 5 } },
  { id: 3, type: 'number', position: { x: -10, y: 5 }, data: { value: 3 } },
  { id: 4, type: 'add', position: { x: -5, y: -2.5 } },
  { id: 5, type: 'multiply', position: { x: -5, y: 2.5 } },
  { id: 6, type: 'subtract', position: { x: 0, y: -1.25 } },
  { id: 7, type: 'divide', position: { x: 0, y: 3.75 } },
  { id: 8, type: 'display', position: { x: 10, y: -1.25 } },
  { id: 9, type: 'display', position: { x: 10, y: 3.75 } }
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
  { id: 1, type: 'number', position: { x: -10, y: -7.5 }, data: { value: 25 } },
  { id: 2, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 18 } },
  { id: 3, type: 'number', position: { x: -10, y: 2.5 }, data: { value: 30 } },
  { id: 4, type: 'number', position: { x: -10, y: 7.5 }, data: { value: 20 } },
  { id: 5, type: 'greater', position: { x: -5, y: -5 } },
  { id: 6, type: 'greater', position: { x: -5, y: 5 } },
  { id: 7, type: 'and', position: { x: 0, y: -2.5 } },
  { id: 8, type: 'or', position: { x: 0, y: 2.5 } },
  { id: 9, type: 'not', position: { x: 5, y: 0 } },
  { id: 10, type: 'display', position: { x: 10, y: -2.5 } },
  { id: 11, type: 'display', position: { x: 10, y: 2.5 } }
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
  { id: 1, type: 'string', position: { x: -10, y: -5 }, data: { value: 'Node' } },
  { id: 2, type: 'string', position: { x: -10, y: 0 }, data: { value: 'Editor' } },
  { id: 3, type: 'string', position: { x: -10, y: 5 }, data: { value: '2025' } },
  { id: 4, type: 'concat', position: { x: -5, y: -2.5 } },
  { id: 5, type: 'concat', position: { x: 5, y: 0 } },
  { id: 6, type: 'length', position: { x: 10, y: -2.5 } },
  { id: 7, type: 'display', position: { x: 10, y: 2.5 } },
  { id: 8, type: 'display', position: { x: 10, y: 0 } }
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
      { id: 1, type: 'number', position: { x: -10, y: -7.5 }, data: { value: 42 } },
      { id: 2, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 10 } },
      { id: 3, type: 'number', position: { x: -10, y: 2.5 }, data: { value: 100 } },
      { id: 4, type: 'condition', position: { x: -5, y: -5 } },
      { id: 5, type: 'greater', position: { x: -5, y: 2.5 } },
      { id: 6, type: 'boolean', position: { x: -10, y: 7.5 }, data: { value: true } },
      { id: 7, type: 'and', position: { x: 0, y: -2.5 } },
      { id: 8, type: 'or', position: { x: 0, y: 5 } },
      { id: 9, type: 'equals', position: { x: 5, y: 0 } },
      { id: 10, type: 'display', position: { x: 10, y: -3.75 } },
      { id: 11, type: 'display', position: { x: 10, y: 0 } },
      { id: 12, type: 'display', position: { x: 10, y: 3.75 } }
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
  },
  {
    name: '📊 PERT/CPM: Gestión de Proyecto',
    description: 'Diagrama PERT/CPM para calcular ruta crítica de un proyecto de desarrollo de software',
    nodes_data: JSON.stringify([
      { id: 1, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 5 } },
      { id: 2, type: 'number', position: { x: -10, y: -1.25 }, data: { value: 3 } },
      { id: 3, type: 'number', position: { x: -10, y: 0 }, data: { value: 2 } },
      { id: 4, type: 'add', position: { x: -7.5, y: -2 } },
      { id: 5, type: 'number', position: { x: -5, y: -1.25 }, data: { value: 8 } },
      { id: 6, type: 'add', position: { x: -2.5, y: -1.75 } },
      { id: 7, type: 'add', position: { x: -7.5, y: 0.75 } },
      { id: 8, type: 'number', position: { x: -5, y: 1.25 }, data: { value: 6 } },
      { id: 9, type: 'add', position: { x: -2.5, y: 1 } },
      { id: 10, type: 'greater', position: { x: 1, y: -0.5 } },
      { id: 11, type: 'number', position: { x: 3.5, y: -1.25 }, data: { value: 4 } },
      { id: 12, type: 'number', position: { x: 3.5, y: 0 }, data: { value: 3 } },
      { id: 13, type: 'add', position: { x: 6, y: -0.5 } },
      { id: 14, type: 'number', position: { x: 8.5, y: -0.5 }, data: { value: 2 } },
      { id: 15, type: 'add', position: { x: 10, y: -0.5 } },
      { id: 16, type: 'display', position: { x: 1, y: -2.5 } },
      { id: 17, type: 'display', position: { x: 1, y: 1.25 } },
      { id: 18, type: 'display', position: { x: 3.5, y: -2.5 } },
      { id: 19, type: 'display', position: { x: 11, y: -0.5 } }
    ]),
    connections_data: JSON.stringify([
      // RUTA BACKEND: A(5) → B(3) → D(8)
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } }, // A → Add(A+B)
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 1 } }, // B → Add(A+B)
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } }, // A+B → Add(A+B+D)
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 1 } }, // D → Add(A+B+D)
      { from: { node: 6, pin: 0 }, to: { node: 16, pin: 0 } }, // Mostrar ruta backend
      
      // RUTA FRONTEND: A(5) → C(2) → E(6)
      { from: { node: 1, pin: 0 }, to: { node: 7, pin: 0 } }, // A → Add(A+C)
      { from: { node: 3, pin: 0 }, to: { node: 7, pin: 1 } }, // C → Add(A+C)
      { from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 } }, // A+C → Add(A+C+E)
      { from: { node: 8, pin: 0 }, to: { node: 9, pin: 1 } }, // E → Add(A+C+E)
      { from: { node: 9, pin: 0 }, to: { node: 17, pin: 0 } }, // Mostrar ruta frontend
      
      // COMPARAR RUTAS (Greater actúa como MAX)
      { from: { node: 6, pin: 0 }, to: { node: 10, pin: 0 } }, // Ruta Backend (16 días)
      { from: { node: 9, pin: 0 }, to: { node: 10, pin: 1 } }, // Ruta Frontend (13 días)
      { from: { node: 10, pin: 0 }, to: { node: 18, pin: 0 } }, // Mostrar si Backend > Frontend (true)
      
      // TESTING: Usar ruta crítica + testing
      { from: { node: 6, pin: 0 }, to: { node: 13, pin: 0 } }, // Usar backend (ruta crítica)
      { from: { node: 11, pin: 0 }, to: { node: 13, pin: 1 } }, // + Testing integración
      
      // DEPLOYMENT
      { from: { node: 13, pin: 0 }, to: { node: 15, pin: 0 } }, // Ruta crítica + testing
      { from: { node: 14, pin: 0 }, to: { node: 15, pin: 1 } }, // + Deploy
      
      // RESULTADO FINAL
      { from: { node: 15, pin: 0 }, to: { node: 19, pin: 0 } }  // TIEMPO TOTAL: 22 días
    ])
  },
  {
    name: '🏗️ PERT/CPM: Construcción Casa',
    description: 'Proyecto de construcción con múltiples dependencias y rutas paralelas',
    nodes_data: JSON.stringify([
      // TAREAS INICIALES (paralelas) - Coordenadas en unidades mundo
      { id: 1, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 7 } },  // A: Planos y permisos
      { id: 2, type: 'number', position: { x: -10, y: 0 }, data: { value: 10 } },    // B: Excavación y cimientos
      { id: 3, type: 'number', position: { x: -10, y: 2.5 }, data: { value: 5 } },   // C: Materiales y logística
      
      // ESTRUCTURA (depende de cimientos)
      { id: 4, type: 'add', position: { x: -7.5, y: -1.25 } },  // MAX(A, B) simulado
      { id: 5, type: 'number', position: { x: -5, y: -1.25 }, data: { value: 15 } }, // D: Levantamiento de muros
      { id: 6, type: 'add', position: { x: -2.5, y: -1.25 } },  // Ruta hasta muros
      
      // INSTALACIONES (paralelas, dependen de muros)
      { id: 7, type: 'number', position: { x: 0, y: -2.5 }, data: { value: 8 } },  // E: Instalación eléctrica
      { id: 8, type: 'number', position: { x: 0, y: 0 }, data: { value: 6 } },     // F: Instalación plomería
      { id: 9, type: 'number', position: { x: 0, y: 2.5 }, data: { value: 4 } },   // G: HVAC
      
      // Cálculo de rutas de instalaciones
      { id: 10, type: 'add', position: { x: 5, y: -2.5 } }, // Ruta muros + eléctrica
      { id: 11, type: 'add', position: { x: 5, y: 0 } },    // Ruta muros + plomería
      { id: 12, type: 'add', position: { x: 5, y: 2.5 } },  // Ruta muros + HVAC
      
      // MAX de instalaciones
      { id: 13, type: 'greater', position: { x: 7.5, y: -1.25 } }, // MAX(eléctrica, plomería)
      { id: 14, type: 'greater', position: { x: 10, y: 0 } },   // MAX(prev, HVAC)
      
      // ACABADOS FINALES
      { id: 15, type: 'number', position: { x: 7.5, y: 2.5 }, data: { value: 12 } }, // H: Acabados y pintura
      { id: 16, type: 'add', position: { x: 10, y: 1.25 } },    // Tiempo total
      
      // DISPLAYS
      { id: 17, type: 'display', position: { x: -2.5, y: -5 } },    // Display ruta hasta muros
      { id: 18, type: 'display', position: { x: 7.5, y: -5 } },     // Display MAX(elec,plom)
      { id: 19, type: 'display', position: { x: 10, y: -2.5 } },     // Display tiempo instalaciones
      { id: 20, type: 'display', position: { x: 12.5, y: 1.25 } }    // Display tiempo TOTAL
    ]),
    connections_data: JSON.stringify([
      // Calcular MAX(A, B) para inicio
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } }, // A: Planos
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 1 } }, // B: Cimientos
      
      // Ruta crítica hasta muros
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } },
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 1 } }, // D: Muros
      { from: { node: 6, pin: 0 }, to: { node: 17, pin: 0 } }, // Display
      
      // Instalaciones (todas parten de muros terminados)
      { from: { node: 6, pin: 0 }, to: { node: 10, pin: 0 } }, // Muros → +Eléctrica
      { from: { node: 7, pin: 0 }, to: { node: 10, pin: 1 } },
      
      { from: { node: 6, pin: 0 }, to: { node: 11, pin: 0 } }, // Muros → +Plomería
      { from: { node: 8, pin: 0 }, to: { node: 11, pin: 1 } },
      
      { from: { node: 6, pin: 0 }, to: { node: 12, pin: 0 } }, // Muros → +HVAC
      { from: { node: 9, pin: 0 }, to: { node: 12, pin: 1 } },
      
      // Calcular MAX de instalaciones
      { from: { node: 10, pin: 0 }, to: { node: 13, pin: 0 } }, // Eléctrica vs Plomería
      { from: { node: 11, pin: 0 }, to: { node: 13, pin: 1 } },
      { from: { node: 13, pin: 0 }, to: { node: 18, pin: 0 } }, // Display
      
      { from: { node: 13, pin: 0 }, to: { node: 14, pin: 0 } }, // MAX vs HVAC
      { from: { node: 12, pin: 0 }, to: { node: 14, pin: 1 } },
      { from: { node: 14, pin: 0 }, to: { node: 19, pin: 0 } }, // Display
      
      // Acabados finales
      { from: { node: 14, pin: 0 }, to: { node: 16, pin: 0 } }, // Ruta crítica instalaciones
      { from: { node: 15, pin: 0 }, to: { node: 16, pin: 1 } }, // + Acabados
      
      // Resultado final
      { from: { node: 16, pin: 0 }, to: { node: 20, pin: 0 } } // TOTAL: 47 días
    ])
  }
];

