/**
 * ProblemContext.ts
 * Define el contexto del problema y las unidades aplicables
 */

/**
 * Tipos de problemas que se pueden modelar
 */
export enum ProblemType {
  PathFinding = 'path-finding',        // Problemas de ruta más corta
  Scheduling = 'scheduling',           // Planificación de proyectos (PERT/CPM)
  CostOptimization = 'cost-optimization', // Optimización de costos
  LogicFlow = 'logic-flow'            // Flujos lógicos sin métricas
}

/**
 * Unidades de medida disponibles
 */
export interface Unit {
  code: string;        // 'km', 'hours', 'USD', 'days', 'none'
  label: string;       // 'Kilómetros', 'Horas', 'Dólares', 'Días'
  shortLabel: string;  // 'km', 'h', '$', 'd'
  category: 'distance' | 'time' | 'cost' | 'none';
}

/**
 * Unidades predefinidas
 */
export const UNITS: { [key: string]: Unit } = {
  // Distancia
  kilometers: {
    code: 'km',
    label: 'Kilómetros',
    shortLabel: 'km',
    category: 'distance'
  },
  meters: {
    code: 'm',
    label: 'Metros',
    shortLabel: 'm',
    category: 'distance'
  },
  miles: {
    code: 'mi',
    label: 'Millas',
    shortLabel: 'mi',
    category: 'distance'
  },
  
  // Tiempo
  days: {
    code: 'days',
    label: 'Días',
    shortLabel: 'd',
    category: 'time'
  },
  hours: {
    code: 'hours',
    label: 'Horas',
    shortLabel: 'h',
    category: 'time'
  },
  minutes: {
    code: 'minutes',
    label: 'Minutos',
    shortLabel: 'min',
    category: 'time'
  },
  weeks: {
    code: 'weeks',
    label: 'Semanas',
    shortLabel: 'sem',
    category: 'time'
  },
  months: {
    code: 'months',
    label: 'Meses',
    shortLabel: 'mes',
    category: 'time'
  },
  
  // Costo
  usd: {
    code: 'USD',
    label: 'Dólares',
    shortLabel: '$',
    category: 'cost'
  },
  eur: {
    code: 'EUR',
    label: 'Euros',
    shortLabel: '€',
    category: 'cost'
  },
  
  // Sin unidad
  none: {
    code: 'none',
    label: 'Sin unidad',
    shortLabel: '',
    category: 'none'
  },
  generic: {
    code: 'units',
    label: 'Unidades genéricas',
    shortLabel: 'u',
    category: 'none'
  }
};

/**
 * Contexto del problema que determina qué algoritmos son aplicables
 */
export interface ProblemContext {
  type: ProblemType;
  unit: Unit;
  applicableAlgorithms: ('dijkstra' | 'astar' | 'pert')[];
  description: string;
}

/**
 * Contextos predefinidos
 */
export const PROBLEM_CONTEXTS: { [key: string]: ProblemContext } = {
  transportation: {
    type: ProblemType.PathFinding,
    unit: UNITS.kilometers,
    applicableAlgorithms: ['dijkstra', 'astar'],
    description: 'Red de transporte - Encuentra rutas óptimas entre ubicaciones'
  },
  
  projectScheduling: {
    type: ProblemType.Scheduling,
    unit: UNITS.days,
    applicableAlgorithms: ['pert'],
    description: 'Planificación de proyectos - Análisis de ruta crítica y varianza'
  },
  
  costAnalysis: {
    type: ProblemType.CostOptimization,
    unit: UNITS.usd,
    applicableAlgorithms: ['dijkstra'],
    description: 'Análisis de costos - Optimización de gastos operativos'
  },
  
  logistics: {
    type: ProblemType.PathFinding,
    unit: UNITS.hours,
    applicableAlgorithms: ['dijkstra', 'astar'],
    description: 'Logística y tiempos de entrega'
  },
  
  constructionProject: {
    type: ProblemType.Scheduling,
    unit: UNITS.weeks,
    applicableAlgorithms: ['pert'],
    description: 'Proyecto de construcción - Gestión de tareas y dependencias'
  },
  
  generic: {
    type: ProblemType.PathFinding,
    unit: UNITS.generic,
    applicableAlgorithms: ['dijkstra', 'astar', 'pert'],
    description: 'Problema genérico - Todos los algoritmos disponibles'
  }
};

/**
 * Resultado de validación de aplicabilidad de un algoritmo
 */
export interface AlgorithmApplicability {
  applicable: boolean;
  reason: string;
  severity: 'ok' | 'warning' | 'error';
  suggestions?: string[];
}

/**
 * Resultado completo de validación de todos los algoritmos
 */
export interface AlgorithmsValidation {
  dijkstra: AlgorithmApplicability;
  astar: AlgorithmApplicability;
  pert: AlgorithmApplicability;
  recommendedAlgorithm?: 'dijkstra' | 'astar' | 'pert';
  context?: ProblemContext;
}
