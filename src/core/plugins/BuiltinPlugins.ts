// Plugins predefinidos para diferentes estrategias de ejecución
import { ExecutionPlugin, ExecutionContext } from '../ExecutionPlugin';

// Plugin: Logger de ejecución detallado
export const DebugLoggerPlugin: ExecutionPlugin = {
  name: 'debug-logger',
  description: 'Registra información detallada de la ejecución',
  version: '1.0.0',
  
  beforeExecution: (nodes, context) => {
    context.log(`🚀 Iniciando ejecución con ${nodes.length} nodos`);
    context.customData.set('startTime', Date.now());
  },
  
  afterExecution: (nodes, context) => {
    const duration = Date.now() - (context.customData.get('startTime') || 0);
    context.log(`✅ Ejecución completada en ${duration}ms`);
  },
  
  beforeNodeExecution: (node, context) => {
    context.log(`📦 Ejecutando nodo: ${node.title} (${node.type})`);
    const count = context.nodeExecutionCount.get(node) || 0;
    context.nodeExecutionCount.set(node, count + 1);
    return true;
  },
  
  afterNodeExecution: (node, result, context) => {
    const count = context.nodeExecutionCount.get(node) || 0;
    context.log(`✨ Nodo ${node.title} ejecutado ${count} veces. Resultado: ${JSON.stringify(result)}`);
  }
};

// Plugin: Límite de iteraciones para evitar loops infinitos
export const SafetyLimitPlugin: ExecutionPlugin = {
  name: 'safety-limit',
  description: 'Previene loops infinitos limitando iteraciones',
  version: '1.0.0',
  
  config: {
    maxIterations: 100,
    timeout: 5000 // 5 segundos por nodo
  },
  
  shouldContinueExecution: (iteration, context) => {
    if (iteration > 100) {
      context.log('⚠️ Límite de iteraciones alcanzado, deteniendo ejecución', 'warn');
      context.emit('safety.limit.reached', { iteration, reason: 'max_iterations' });
      return false;
    }
    return true;
  },
  
  beforeNodeExecution: (node, context) => {
    const count = context.nodeExecutionCount.get(node) || 0;
    if (count > 50) {
      context.log(`⚠️ Nodo ${node.title} ejecutado ${count} veces, posible loop`, 'warn');
      return false; // Skip este nodo
    }
    return true;
  }
};

// Plugin: Validación de tipos en tiempo real
export const TypeValidationPlugin: ExecutionPlugin = {
  name: 'type-validation',
  description: 'Valida tipos de datos entre conexiones',
  version: '1.0.0',
  
  transformInput: (value, pin, context) => {
    // Validar tipo según la definición del pin
    const expectedType = pin.definition?.type;
    const actualType = typeof value;
    
    if (expectedType === 'Number' && actualType !== 'number') {
      if (value !== null && value !== undefined && !isNaN(Number(value))) {
        context.log(`🔄 Convirtiendo ${value} de ${actualType} a number`, 'info');
        return Number(value);
      } else {
        context.log(`❌ Error de tipo: esperado Number, recibido ${actualType}`, 'error');
        return 0; // Valor por defecto
      }
    }
    
    if (expectedType === 'Boolean' && actualType !== 'boolean') {
      context.log(`🔄 Convirtiendo ${value} de ${actualType} a boolean`, 'info');
      return Boolean(value);
    }
    
    return value;
  },
  
  onError: (error, node, context) => {
    context.log(`💥 Error en nodo ${node.title}: ${error.message}`, 'error');
    context.emit('validation.error', { node: node.title, error: error.message });
  }
};

// Plugin: Performance monitor
export const PerformancePlugin: ExecutionPlugin = {
  name: 'performance-monitor',
  description: 'Monitorea rendimiento de la ejecución',
  version: '1.0.0',
  
  beforeNodeExecution: (node, context) => {
    context.customData.set(`node_${node.id}_start`, performance.now());
    return true;
  },
  
  afterNodeExecution: (node, result, context) => {
    const startTime = context.customData.get(`node_${node.id}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (duration > 10) { // Si toma más de 10ms
        context.log(`⏱️ Nodo ${node.title} tardó ${duration.toFixed(2)}ms`, 'warn');
      }
      
      // Guardar estadísticas
      const stats = context.customData.get('performance_stats') || {};
      stats[node.id] = (stats[node.id] || []).concat(duration);
      context.customData.set('performance_stats', stats);
    }
  },
  
  afterExecution: (nodes, context) => {
    const stats = context.customData.get('performance_stats') || {};
    let totalTime = 0;
    let slowestNode = null;
    let slowestTime = 0;
    
    for (const [nodeId, times] of Object.entries(stats)) {
      const avgTime = (times as number[]).reduce((a, b) => a + b, 0) / (times as number[]).length;
      totalTime += avgTime;
      
      if (avgTime > slowestTime) {
        slowestTime = avgTime;
        slowestNode = nodes.find(n => n.id === nodeId)?.title || nodeId;
      }
    }
    
    if (slowestNode) {
      context.log(`📊 Nodo más lento: ${slowestNode} (${slowestTime.toFixed(2)}ms promedio)`);
    }
    
    context.emit('performance.report', { 
      totalTime, 
      slowestNode, 
      slowestTime, 
      nodeCount: nodes.length 
    });
  }
};

// Plugin: Visualización de flujo de datos
export const DataFlowVisualizerPlugin: ExecutionPlugin = {
  name: 'data-flow-visualizer',
  description: 'Visualiza el flujo de datos entre nodos',
  version: '1.0.0',
  
  afterNodeExecution: (node, result, context) => {
    // Emitir evento para que la UI pueda mostrar el flujo de datos
    context.emit('dataflow.update', {
      nodeId: node.id,
      nodeTitle: node.title,
      outputs: node.outputs?.map((pin: any) => ({
        name: pin.name,
        value: pin.value,
        type: typeof pin.value
      })) || []
    });
  }
};

// Registry de plugins predefinidos
export const BuiltinPlugins = {
  'debug-logger': DebugLoggerPlugin,
  'safety-limit': SafetyLimitPlugin,
  'type-validation': TypeValidationPlugin,
  'performance-monitor': PerformancePlugin,
  'data-flow-visualizer': DataFlowVisualizerPlugin
};