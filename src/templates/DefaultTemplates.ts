import { WorkflowTemplate } from '../services/DatabaseService';

export const defaultTemplates: WorkflowTemplate[] = [
  {
    name: 'Comparador Simple',
    description: 'Compara dos números con operador mayor que',
    problemDescription: 'Evaluar si un número es mayor que otro usando el operador de comparación. Flujo: Dos entradas numéricas → Comparación > → Salida booleana.',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 15, customDescription: 'Primer número a comparar' } },
  { id: 2, type: 'number', position: { x: -10, y: 5 }, data: { value: 10, customDescription: 'Segundo número a comparar' } },
  { id: 3, type: 'greater', position: { x: 0, y: 0 }, data: { customDescription: 'Compara si A > B' } },
  { id: 4, type: 'display', position: { x: 10, y: 0 }, data: { customDescription: 'Muestra el resultado' } }
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
    problemDescription: 'Combinar condiciones usando lógica booleana. Evalúa si (12 > 8) AND (true). Demuestra flujo con comparación + lógica.',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -7.5 }, data: { value: 12, customDescription: 'Primer número' } },
  { id: 2, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 8, customDescription: 'Segundo número' } },
  { id: 3, type: 'greater', position: { x: -5, y: -5 }, data: { customDescription: 'Compara 12 > 8' } },
  { id: 4, type: 'boolean', position: { x: -10, y: 5 }, data: { value: true, customDescription: 'Condición adicional' } },
  { id: 5, type: 'and', position: { x: 5, y: 0 }, data: { customDescription: 'Operación AND lógica' } },
  { id: 6, type: 'display', position: { x: 10, y: 0 }, data: { customDescription: 'Resultado final' } }
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
    problemDescription: 'Implementar ramificación condicional (if-else). Entrada → Evaluación → Dos caminos (TRUE/FALSE). Demuestra flujo de control.',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: 0 }, data: { value: 15, customDescription: 'Valor de entrada' } },
  { id: 2, type: 'condition', position: { x: 0, y: 0 }, data: { customDescription: 'Evalúa y divide flujo' } },
  { id: 3, type: 'display', position: { x: 10, y: -4 }, data: { customDescription: 'Salida TRUE' } },
  { id: 4, type: 'display', position: { x: 10, y: 4 }, data: { customDescription: 'Salida FALSE' } }
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
    problemDescription: 'Evaluar múltiples operaciones aritméticas en paralelo. Calcular (10+5) y (10×5), luego comparar resultados. Demuestra paralelismo básico.',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 10, customDescription: 'Base: 10' } },
  { id: 2, type: 'number', position: { x: -10, y: 5 }, data: { value: 5, customDescription: 'Operador: 5' } },
  { id: 3, type: 'add', position: { x: -5, y: -2.5 }, data: { customDescription: '10 + 5 = 15' } },
  { id: 4, type: 'multiply', position: { x: -5, y: 2.5 }, data: { customDescription: '10 × 5 = 50' } },
  { id: 5, type: 'greater', position: { x: 5, y: 0 }, data: { customDescription: '¿15 > 50?' } },
  { id: 6, type: 'display', position: { x: 10, y: 0 }, data: { customDescription: 'Resultado comparación' } }
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
    problemDescription: 'Procesamiento de texto: concatenar strings y calcular longitud. Operaciones: "Hello" + " World!" = "Hello World!" (12 caracteres).',
    nodes_data: JSON.stringify([
  { id: 1, type: 'string', position: { x: -10, y: -2.5 }, data: { value: 'Hello', customDescription: 'Primera parte' } },
  { id: 2, type: 'string', position: { x: -10, y: 2.5 }, data: { value: ' World!', customDescription: 'Segunda parte' } },
  { id: 3, type: 'concat', position: { x: -5, y: 0 }, data: { customDescription: 'Concatena strings' } },
  { id: 4, type: 'length', position: { x: 5, y: 0 }, data: { customDescription: 'Longitud del texto' } },
  { id: 5, type: 'display', position: { x: 10, y: -1.25 }, data: { customDescription: 'Texto completo' } },
  { id: 6, type: 'display', position: { x: 10, y: 1.25 }, data: { customDescription: 'Número de caracteres' } }
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
    problemDescription: 'Problema: Calcular la suma de dos números enteros.\n\nObjetivo: Aprender el flujo básico de entrada → procesamiento → salida.\n\nRuta: Number(5) → Add ← Number(3) → Display(8)\n\nComplejidad: O(1) - Operación constante',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -2.5 }, data: { value: 5, customDescription: 'Primer sumando: valor inicial 5' } },
  { id: 2, type: 'number', position: { x: -10, y: 2.5 }, data: { value: 3, customDescription: 'Segundo sumando: valor inicial 3' } },
  { id: 3, type: 'add', position: { x: 0, y: 0 }, data: { customDescription: 'Operador suma: combina ambos valores' } },
  { id: 4, type: 'display', position: { x: 10, y: 0 }, data: { customDescription: 'Visualización del resultado final' } }
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
    problemDescription: 'Problema: Evaluar expresiones aritméticas complejas con múltiples operadores.\n\nObjetivo: Calcular (20+5) - (5×3) y (5×3) ÷ 3 en paralelo.\n\nRutas:\n- Ruta A: 20,5 → Add(25) → Subtract con 5,3 → Multiply(15) = 10\n- Ruta B: 5,3 → Multiply(15) → Divide con 3 = 5\n\nComplejidad: O(1) - Operaciones en paralelo',
    nodes_data: JSON.stringify([
  { id: 1, type: 'number', position: { x: -10, y: -5 }, data: { value: 20, customDescription: 'Base numérica para suma' } },
  { id: 2, type: 'number', position: { x: -10, y: 0 }, data: { value: 5, customDescription: 'Operando compartido: suma y mult' } },
  { id: 3, type: 'number', position: { x: -10, y: 5 }, data: { value: 3, customDescription: 'Multiplicador y divisor' } },
  { id: 4, type: 'add', position: { x: -5, y: -2.5 }, data: { customDescription: '20+5=25: primera operación' } },
  { id: 5, type: 'multiply', position: { x: -5, y: 2.5 }, data: { customDescription: '5×3=15: producto base' } },
  { id: 6, type: 'subtract', position: { x: 0, y: -1.25 }, data: { customDescription: '25-15=10: diferencia final' } },
  { id: 7, type: 'divide', position: { x: 0, y: 3.75 }, data: { customDescription: '15÷3=5: cociente final' } },
  { id: 8, type: 'display', position: { x: 10, y: -1.25 }, data: { customDescription: 'Resultado Ruta A: 10' } },
  { id: 9, type: 'display', position: { x: 10, y: 3.75 }, data: { customDescription: 'Resultado Ruta B: 5' } }
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
    problemDescription: 'Sistema de decisión multi-criterio. Evaluar: (25>18) AND (30>20), luego aplicar OR y NOT. Demuestra composición de operadores lógicos complejos.',
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
    problemDescription: 'Análisis de texto: concatenar múltiples strings ("Node" + "Editor" + "2025") y extraer métricas (longitud total). Pipeline de procesamiento de texto.',
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
    problemDescription: 'Sistema de validación avanzado con múltiples niveles de evaluación. Combina nodos condicionales, comparaciones y lógica AND/OR para validar datos complejos con múltiples salidas.',
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
    name: '📊 PERT/CPM: Proyecto Software',
    description: 'Diagrama PERT/CPM para calcular ruta crítica de un proyecto de desarrollo de software',
    problemDescription: '🎯 PROYECTO: Sistema de E-Commerce Completo\n\n📋 DESCRIPCIÓN: Desarrollar plataforma de comercio electrónico con backend, frontend, base de datos y testing. El proyecto tiene dependencias secuenciales y paralelas que deben optimizarse.\n\n📊 ACTIVIDADES:\n• A: Diseño del Sistema (5 días) - Arquitectura y mockups\n• B: Desarrollo Backend API (3 días) - Requiere A completado\n• C: Desarrollo Frontend UI (2 días) - Requiere A completado\n• D: Base de Datos (8 días) - Requiere B completado\n• E: Componentes React (6 días) - Requiere C completado\n• F: Testing Integral (4 días) - Requiere MAX(D, E)\n• G: Deploy a Producción (2 días) - Requiere F completado\n\n🎯 OBJETIVO: Determinar la ruta crítica (secuencia de actividades que NO pueden retrasarse) y el tiempo mínimo del proyecto.\n\n📈 ANÁLISIS ESPERADO:\n- Ruta Backend: A(5) → B(3) → D(8) → F(4) → G(2) = 22 días\n- Ruta Frontend: A(5) → C(2) → E(6) → F(4) → G(2) = 19 días\n- RUTA CRÍTICA: Backend = 22 días\n- Holgura Frontend: 3 días (22-19)',
    nodes_data: JSON.stringify([
      // INFO-PANEL: Descripción flotante del problema (NO-nodo)
      { id: 0, type: 'info-panel', position: { x: -15, y: -8 }, 
        data: { customDescription: '🎯 PROYECTO: Sistema de E-Commerce\n\nDesarrollar plataforma completa con backend API REST, frontend React, base de datos PostgreSQL, testing automatizado y deployment en AWS.\n\nOBJETIVO: Identificar la ruta crítica (actividades que NO pueden retrasarse sin afectar la fecha final) y optimizar el cronograma del proyecto.\n\nUSO: Ejecutar el algoritmo PERT/CPM para calcular ES (Early Start), EF (Early Finish), LS (Late Start), LF (Late Finish) y detectar la ruta crítica automáticamente.' } },
      
      // ACTIVIDADES DEL PROYECTO (nodos tipo TASK)
      { id: 1, type: 'task', position: { x: -10, y: 0 }, 
        data: { value: 5, customTitle: 'A: Diseño', customDescription: 'Diseño arquitectónico del sistema (5 días)' } },
      
      { id: 2, type: 'task', position: { x: -5, y: -3 }, 
        data: { value: 3, customTitle: 'B: Backend', customDescription: 'Desarrollo Backend API REST (3 días)' } },
      
      { id: 3, type: 'task', position: { x: -5, y: 3 }, 
        data: { value: 2, customTitle: 'C: Frontend', customDescription: 'Desarrollo Frontend UI (2 días)' } },
      
      { id: 4, type: 'task', position: { x: 0, y: -3 }, 
        data: { value: 8, customTitle: 'D: Base Datos', customDescription: 'Diseño e implementación BD (8 días)' } },
      
      { id: 5, type: 'task', position: { x: 0, y: 3 }, 
        data: { value: 6, customTitle: 'E: Componentes', customDescription: 'Componentes React (6 días)' } },
      
      { id: 6, type: 'task', position: { x: 5, y: 0 }, 
        data: { value: 4, customTitle: 'F: Testing', customDescription: 'Testing integral e2e (4 días)' } },
      
      { id: 7, type: 'task', position: { x: 10, y: 0 }, 
        data: { value: 2, customTitle: 'G: Deploy', customDescription: 'Deployment a AWS (2 días)' } },
      
      // DISPLAYS para visualización
      { id: 8, type: 'display', position: { x: 12, y: 0 }, 
        data: { customDescription: '✅ Proyecto Completado' } }
    ]),
    connections_data: JSON.stringify([
      // Dependencias del proyecto (grafo dirigido)
      // A es el nodo inicial (sin predecesores)
      
      // RUTA BACKEND: A → B → D → F → G
      { from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } }, // A → B
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } }, // B → D
      { from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } }, // D → F
      
      // RUTA FRONTEND: A → C → E → F → G
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } }, // A → C
      { from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 } }, // C → E
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } }, // E → F (F espera MAX(D, E))
      
      // FASE FINAL
      { from: { node: 6, pin: 0 }, to: { node: 7, pin: 0 } }, // F → G
      { from: { node: 7, pin: 0 }, to: { node: 8, pin: 0 } }  // G → Display
    ])
  },
  {
    name: '🏗️ PERT/CPM: Construcción Casa',
    description: 'Proyecto de construcción con múltiples dependencias y rutas paralelas',
    problemDescription: '🏠 PROYECTO: Construcción de Casa Residencial\n\n📋 DESCRIPCIÓN: Proyecto de construcción de vivienda unifamiliar de 120m² con todas las instalaciones. Incluye fases de diseño, construcción estructural, instalaciones y acabados.\n\n📊 ACTIVIDADES:\n• A: Planos y Permisos (7 días) - Documentación legal\n• B: Cimientos (10 días) - Excavación y fundación\n• C: Estructura (12 días) - Columnas y vigas - Requiere B\n• D: Muros (8 días) - Mampostería - Requiere C\n• E: Techo (6 días) - Losa y techumbre - Requiere D\n• F: Eléctrica (5 días) - Instalación eléctrica - Requiere E\n• G: Plomería (4 días) - Instalación sanitaria - Requiere E\n• H: Acabados (10 días) - Pisos, pintura, detalles - Requiere MAX(F,G)\n\n🎯 OBJETIVO: Determinar cuántos días toma el proyecto y qué actividades forman la ruta crítica.\n\n📈 ANÁLISIS ESPERADO:\n- Ruta: A (en paralelo con B) → B(10) → C(12) → D(8) → E(6) → MAX(F(5), G(4)) → H(10) = 50 días\n- Actividades críticas: B, C, D, E, F, H (sin holgura)\n- Holgura: A puede iniciar 3 días después sin afectar',
    nodes_data: JSON.stringify([
      // INFO-PANEL: Descripción flotante del problema (NO-nodo)
      { id: 0, type: 'info-panel', position: { x: -15, y: -8 }, 
        data: { customDescription: '🏠 PROYECTO: Construcción Casa Residencial\n\nConstruir vivienda unifamiliar de 120m² con estructura de concreto, instalaciones completas (eléctrica y plomería) y acabados de primera calidad.\n\nOBJETIVO: Planificar el proyecto identificando:\n1. Tiempo mínimo necesario (makespan)\n2. Ruta crítica (actividades que NO pueden retrasarse)\n3. Holguras disponibles en actividades no críticas\n\nUSO: Ejecutar algoritmo PERT/CPM para analizar el grafo de dependencias y calcular tiempos Early/Late para cada actividad.' } },
      
      // ACTIVIDADES (nodos tipo TASK con duraciones)
      { id: 1, type: 'task', position: { x: -10, y: -4 }, 
        data: { value: 7, customTitle: 'A: Planos', customDescription: 'Planos y permisos legales (7 días)' } },
      
      { id: 2, type: 'task', position: { x: -10, y: 0 }, 
        data: { value: 10, customTitle: 'B: Cimientos', customDescription: 'Excavación y cimientos (10 días)' } },
      
      { id: 3, type: 'task', position: { x: -5, y: 0 }, 
        data: { value: 12, customTitle: 'C: Estructura', customDescription: 'Columnas y vigas concreto (12 días)' } },
      
      { id: 4, type: 'task', position: { x: 0, y: 0 }, 
        data: { value: 8, customTitle: 'D: Muros', customDescription: 'Mampostería y bloques (8 días)' } },
      
      { id: 5, type: 'task', position: { x: 5, y: 0 }, 
        data: { value: 6, customTitle: 'E: Techo', customDescription: 'Losa y techumbre (6 días)' } },
      
      { id: 6, type: 'task', position: { x: 10, y: -2 }, 
        data: { value: 5, customTitle: 'F: Eléctrica', customDescription: 'Instalación eléctrica (5 días)' } },
      
      { id: 7, type: 'task', position: { x: 10, y: 2 }, 
        data: { value: 4, customTitle: 'G: Plomería', customDescription: 'Instalación sanitaria (4 días)' } },
      
      { id: 8, type: 'task', position: { x: 15, y: 0 }, 
        data: { value: 10, customTitle: 'H: Acabados', customDescription: 'Pisos, pintura, detalles (10 días)' } },
      
      // DISPLAY para resultado
      { id: 9, type: 'display', position: { x: 18, y: 0 }, 
        data: { customDescription: '✅ Casa Terminada' } }
    ]),
    connections_data: JSON.stringify([
      // Dependencias del proyecto
      // A y B pueden iniciar en paralelo (sin predecesores)
      
      // Secuencia estructural principal
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 0 } }, // B(Cimientos) → C(Estructura)
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } }, // C(Estructura) → D(Muros)
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 } }, // D(Muros) → E(Techo)
      
      // Instalaciones paralelas después del techo
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } }, // E(Techo) → F(Eléctrica)
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 } }, // E(Techo) → G(Plomería)
      
      // Acabados esperan a que AMBAS instalaciones terminen
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 } }, // F → H
      { from: { node: 7, pin: 0 }, to: { node: 8, pin: 0 } }, // G → H (convergencia)
      
      // Resultado final
      { from: { node: 8, pin: 0 }, to: { node: 9, pin: 0 } }  // H → Display
    ])
  },
  {
    name: '🔷 Dijkstra: Red Logística Nacional',
    description: 'Red de distribución compleja con 10 ciudades y múltiples rutas',
    problemDescription: '🚚 PROBLEMA: Optimización de Rutas de Transporte Nacional\n\n📋 CONTEXTO: Empresa de logística "TransNacional" necesita enviar mercancía desde su Centro de Operaciones (Ciudad A) hasta el Puerto de Exportación (Ciudad J), atravesando una red de 10 ciudades interconectadas.\n\n�️ RED DE CIUDADES:\nA (Centro) → B (5km), C (4km)\nB → D (3km), E (7km)\nC → D (6km), F (2km)\nD → G (4km)\nE → G (2km), H (5km)\nF → H (3km)\nG → I (6km)\nH → I (4km), J (8km)\nI → J (3km)\n\n💰 COSTOS (km = costo):\n• Ruta Corta Riesgosa: A→C→F→H→J = 17km\n• Ruta Segura Larga: A→B→E→H→J = 25km\n• Ruta Balanceada: A→C→F→H→I→J = 16km ✅\n\n🎯 OBJETIVO: Dijkstra encontrará la ruta óptima considerando todos los caminos posibles.',
    nodes_data: JSON.stringify([
      // INFO-PANEL
      { id: 0, type: 'info-panel', position: { x: -20, y: -12 }, 
        data: { customDescription: '🚚 RED LOGÍSTICA NACIONAL - 10 CIUDADES\n\nProblema: Encontrar ruta más corta desde Ciudad A (Centro Operaciones) hasta Ciudad J (Puerto Exportación).\n\nDijkstra explora TODAS las rutas posibles y garantiza encontrar la óptima.\n\nNOTA: Los valores de los nodos representan la DISTANCIA desde el nodo anterior (costo de la arista).' } },
      
      // NODOS (10 ciudades)
      { id: 1, type: 'number', position: { x: -15, y: 0 }, 
        data: { value: 0, customTitle: 'A: Centro', customDescription: 'Ciudad A - Centro de Operaciones' } },
      
      { id: 2, type: 'number', position: { x: -10, y: -4 }, 
        data: { value: 5, customTitle: 'B: Norte', customDescription: 'Ciudad B - 5km desde A' } },
      
      { id: 3, type: 'number', position: { x: -10, y: 4 }, 
        data: { value: 4, customTitle: 'C: Sur', customDescription: 'Ciudad C - 4km desde A' } },
      
      { id: 4, type: 'number', position: { x: -5, y: -2 }, 
        data: { value: 3, customTitle: 'D: Centro-N', customDescription: 'Ciudad D - Hub central norte' } },
      
      { id: 5, type: 'number', position: { x: -5, y: -6 }, 
        data: { value: 7, customTitle: 'E: Extremo N', customDescription: 'Ciudad E - 7km desde B' } },
      
      { id: 6, type: 'number', position: { x: -5, y: 6 }, 
        data: { value: 2, customTitle: 'F: Extremo S', customDescription: 'Ciudad F - 2km desde C' } },
      
      { id: 7, type: 'number', position: { x: 0, y: -2 }, 
        data: { value: 4, customTitle: 'G: Centro-E', customDescription: 'Ciudad G - Hub central este' } },
      
      { id: 8, type: 'number', position: { x: 0, y: 4 }, 
        data: { value: 3, customTitle: 'H: Este', customDescription: 'Ciudad H - Zona este' } },
      
      { id: 9, type: 'number', position: { x: 5, y: 0 }, 
        data: { value: 4, customTitle: 'I: Pre-Puerto', customDescription: 'Ciudad I - Antesala del puerto' } },
      
      { id: 10, type: 'number', position: { x: 10, y: 0 }, 
        data: { value: 3, customTitle: 'J: PUERTO', customDescription: 'Ciudad J - Puerto de Exportación' } },
      
      { id: 11, type: 'display', position: { x: 14, y: 0 }, 
        data: { customDescription: '✅ Carga Entregada' } }
    ]),
    connections_data: JSON.stringify([
      // Red compleja con múltiples caminos
      // Desde A (Centro)
      { from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } }, // A → B (5km)
      { from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } }, // A → C (4km)
      
      // Desde B (Norte)
      { from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } }, // B → D (3km)
      { from: { node: 2, pin: 0 }, to: { node: 5, pin: 0 } }, // B → E (7km)
      
      // Desde C (Sur)
      { from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } }, // C → D (6km)
      { from: { node: 3, pin: 0 }, to: { node: 6, pin: 0 } }, // C → F (2km)
      
      // Hacia G (Centro-Este)
      { from: { node: 4, pin: 0 }, to: { node: 7, pin: 0 } }, // D → G (4km)
      { from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 } }, // E → G (2km)
      
      // Hacia H (Este)
      { from: { node: 5, pin: 0 }, to: { node: 8, pin: 0 } }, // E → H (5km)
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 } }, // F → H (3km)
      
      // Hacia I (Pre-Puerto)
      { from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 } }, // G → I (6km)
      { from: { node: 8, pin: 0 }, to: { node: 9, pin: 0 } }, // H → I (4km)
      
      // Hacia J (PUERTO)
      { from: { node: 8, pin: 0 }, to: { node: 10, pin: 0 } }, // H → J (8km) Ruta directa
      { from: { node: 9, pin: 0 }, to: { node: 10, pin: 0 } }, // I → J (3km)
      
      // Display final
      { from: { node: 10, pin: 0 }, to: { node: 11, pin: 0 } }
    ])
  },
  {
    name: '⭐ A*: Red Multi-Planta Producción',
    description: 'Macroproceso industrial complejo con 13 estaciones, 4 plantas y optimización A*',
    problemDescription: '🏭 PROBLEMA: Optimización Flujo Multi-Planta Industrial\n\n📋 CONTEXTO: Corporación "MegaIndustrial" tiene 4 plantas (Norte, Sur, Este, Oeste) interconectadas. Necesita optimizar el flujo productivo desde Recepción hasta Almacén Central.\n\n⚙️ MACROPROCESO (13 estaciones):\n📍 PLANTA NORTE:\n• Recepción → Prep Norte (2h), Prep Sur (5h)\n• Prep Norte → Corte Norte (3h), Transfer Este (6h)\n\n📍 PLANTA SUR:\n• Prep Sur → Soldadura Sur (4h)\n• Soldadura Sur → Ensamble Sur (2h)\n\n📍 PLANTA ESTE:\n• Transfer Este → Ensamble Este (3h)\n• Corte Norte → Ensamble Este (5h)\n• Ensamble Sur → Ensamble Este (4h)\n• Ensamble Este → Control Este (2h)\n\n📍 PLANTA OESTE:\n• Ensamble Sur → Empaque Oeste (7h) [ruta directa]\n• Control Este → Empaque Oeste (4h)\n• Empaque Oeste → Almacén (1h)\n\n🎯 HEURÍSTICA A*: Estimación basada en plantas restantes\n- Recepción: h=12\n- Prep Norte: h=10, Prep Sur: h=9\n- Corte Norte: h=8, Soldadura: h=7\n- Transfer/Ensambles: h=6\n- Control: h=4\n- Empaque: h=2\n- Almacén: h=0\n\n📊 ANÁLISIS:\n- Ruta Larga Segura: Recep→PrepN→TransEste→EnsamEste→ControlEste→EmpOeste→Alm = 18h\n- Ruta Directa Rápida: Recep→PrepSur→SoldSur→EnsamSur→EmpOeste→Alm = 19h\n- RUTA ÓPTIMA A*: Recep→PrepN→CorteN→EnsamEste→ControlEste→EmpOeste→Alm = 17h ✅\n\n✅ A* encuentra ruta óptima explorando MENOS nodos que Dijkstra gracias a heurística',
    nodes_data: JSON.stringify([
      // INFO-PANEL
      { id: 0, type: 'info-panel', position: { x: -22, y: -14 }, 
        data: { customDescription: '🏭 MACROPROCESO MULTI-PLANTA (4 PLANTAS, 13 ESTACIONES)\n\nProblema: Optimizar flujo desde Recepción hasta Almacén Central atravesando red industrial compleja.\n\nA* = Dijkstra + Heurística Inteligente\nf(n) = g(n) + h(n)\n• g(n) = costo real acumulado\n• h(n) = estimación optimista al objetivo\n\nVENTAJA: A* explora MENOS nodos que Dijkstra manteniendo optimalidad.' } },
      
      // NODOS (13 estaciones)
      { id: 1, type: 'number', position: { x: -16, y: 0 }, 
        data: { value: 0, customTitle: '📦 RECEPCIÓN', customDescription: 'Recepción Materia Prima - INICIO' } },
      
      // PLANTA NORTE
      { id: 2, type: 'number', position: { x: -12, y: -4 }, 
        data: { value: 2, customTitle: 'Norte: Prep', customDescription: 'Planta Norte - Preparación (2h)' } },
      
      { id: 3, type: 'number', position: { x: -8, y: -4 }, 
        data: { value: 3, customTitle: 'Norte: Corte', customDescription: 'Planta Norte - Corte CNC (3h)' } },
      
      // PLANTA SUR
      { id: 4, type: 'number', position: { x: -12, y: 4 }, 
        data: { value: 5, customTitle: 'Sur: Prep', customDescription: 'Planta Sur - Preparación (5h)' } },
      
      { id: 5, type: 'number', position: { x: -8, y: 4 }, 
        data: { value: 4, customTitle: 'Sur: Soldadura', customDescription: 'Planta Sur - Soldadura (4h)' } },
      
      { id: 6, type: 'number', position: { x: -4, y: 4 }, 
        data: { value: 2, customTitle: 'Sur: Ensamble', customDescription: 'Planta Sur - Ensamble (2h)' } },
      
      // TRANSFER
      { id: 7, type: 'number', position: { x: -8, y: 0 }, 
        data: { value: 6, customTitle: 'Transfer Este', customDescription: 'Transferencia Norte→Este (6h)' } },
      
      // PLANTA ESTE
      { id: 8, type: 'number', position: { x: -4, y: -2 }, 
        data: { value: 5, customTitle: 'Este: Ensamble', customDescription: 'Planta Este - Ensamble Principal (5h)' } },
      
      { id: 9, type: 'number', position: { x: 0, y: -2 }, 
        data: { value: 2, customTitle: 'Este: Control', customDescription: 'Planta Este - Control Calidad (2h)' } },
      
      // PLANTA OESTE
      { id: 10, type: 'number', position: { x: 4, y: 0 }, 
        data: { value: 4, customTitle: 'Oeste: Empaque', customDescription: 'Planta Oeste - Empaque Final (4h)' } },
      
      // DESTINO
      { id: 11, type: 'number', position: { x: 8, y: 0 }, 
        data: { value: 1, customTitle: '🏬 ALMACÉN', customDescription: 'Almacén Central - DESTINO' } },
      
      { id: 12, type: 'display', position: { x: 12, y: 0 }, 
        data: { customDescription: '✅ Producto Almacenado' } }
    ]),
    connections_data: JSON.stringify([
      // Red multi-planta compleja
      // Desde Recepción
      { from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } }, // Recep → Norte Prep (2h)
      { from: { node: 1, pin: 0 }, to: { node: 4, pin: 0 } }, // Recep → Sur Prep (5h)
      
      // Planta Norte
      { from: { node: 2, pin: 0 }, to: { node: 3, pin: 0 } }, // Norte Prep → Corte (3h)
      { from: { node: 2, pin: 0 }, to: { node: 7, pin: 0 } }, // Norte Prep → Transfer Este (6h)
      
      // Planta Sur
      { from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 } }, // Sur Prep → Soldadura (4h)
      { from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } }, // Sur Soldadura → Ensamble (2h)
      
      // Hacia Planta Este
      { from: { node: 3, pin: 0 }, to: { node: 8, pin: 0 } }, // Norte Corte → Este Ensamble (5h)
      { from: { node: 7, pin: 0 }, to: { node: 8, pin: 0 } }, // Transfer → Este Ensamble (3h)
      { from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 } }, // Sur Ensamble → Este Ensamble (4h)
      
      // Proceso en Este
      { from: { node: 8, pin: 0 }, to: { node: 9, pin: 0 } }, // Este Ensamble → Control (2h)
      
      // Hacia Planta Oeste
      { from: { node: 6, pin: 0 }, to: { node: 10, pin: 0 } }, // Sur Ensamble → Oeste Empaque (7h) [directa]
      { from: { node: 9, pin: 0 }, to: { node: 10, pin: 0 } }, // Este Control → Oeste Empaque (4h)
      
      // Final
      { from: { node: 10, pin: 0 }, to: { node: 11, pin: 0 } }, // Empaque → Almacén (1h)
      { from: { node: 11, pin: 0 }, to: { node: 12, pin: 0 } }  // Display
    ])
  }
];

