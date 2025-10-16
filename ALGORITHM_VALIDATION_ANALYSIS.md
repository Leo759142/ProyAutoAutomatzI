# Análisis de Validación y Límites de Algoritmos

## 🎯 Objetivo
Revisar y mejorar la lógica de aplicación de algoritmos (Dijkstra, A*, PERT/CPM) para que:
1. **Sean permisivos cuando corresponda** - Permitir aplicar algoritmos si los datos lo permiten
2. **Sean restrictivos cuando sea necesario** - Rechazar aplicaciones cuando no tengan sentido
3. **Incluyan varianza PERT** - Cálculos de varianza estándar para análisis de riesgo
4. **Especifiquen unidades** - Claridad sobre qué representa cada medida (tiempo, distancia, costo, etc.)

---

## 📊 Estado Actual de los Algoritmos

### 1. **Dijkstra** (Camino más corto)
**Contexto**: Encuentra el camino de menor peso entre dos nodos

#### Validaciones Actuales:
- ✅ Verifica que existan nodos procesables (excluye `info-panel`)
- ✅ Usa pesos de **conexiones** (templateConnections.weight)
- ✅ Maneja nodos sin conexiones
- ✅ Detecta cuando no hay camino posible
- ✅ Peso por defecto = 1 si no se especifica

#### Problemas Identificados:
- ❌ **No especifica unidades**: Los pesos pueden representar distancia, tiempo, costo... pero no está documentado
- ❌ **No valida tipos de nodos**: Acepta cualquier grafo sin verificar si tiene sentido (ej: aplicar Dijkstra a un grafo PERT con nodos `task`)
- ⚠️ **Permisividad excesiva**: No rechaza grafos donde el concepto de "peso de conexión" no tiene sentido (ej: procesos lógicos)

#### Casos de Uso Válidos:
- ✅ Redes de transporte (distancia entre ciudades)
- ✅ Costos de operación (costo entre procesos)
- ✅ Grafos de decisión con costos asociados

#### Casos de Uso Inválidos (deberían rechazarse):
- ❌ Grafos PERT con nodos `task` (aquí importa la **duración del nodo**, no el peso de la conexión)
- ❌ Grafos puramente lógicos sin pesos significativos

---

### 2. **A*** (Camino óptimo con heurística)
**Contexto**: Similar a Dijkstra pero usa distancia euclidiana como heurística

#### Validaciones Actuales:
- ✅ Igual que Dijkstra
- ✅ Heurística basada en posición espacial de nodos (node.pos.x, node.pos.y)

#### Problemas Identificados:
- ❌ **Heurística no siempre es relevante**: La distancia euclidiana en canvas NO siempre refleja la "distancia real" del problema
- ❌ **No especifica unidades**: Mezcla píxeles del canvas con unidades del problema
- ⚠️ **Misma permisividad excesiva que Dijkstra**

#### Casos de Uso Válidos:
- ✅ Problemas de navegación/rutas donde la posición espacial importa
- ✅ Mapas donde los nodos tienen coordenadas geográficas

#### Casos de Uso Inválidos:
- ❌ Grafos abstractos donde la posición en canvas es arbitraria
- ❌ Grafos PERT (igual que Dijkstra)

---

### 3. **PERT/CPM** (Ruta crítica)
**Contexto**: Planificación de proyectos, encuentra tareas críticas

#### Validaciones Actuales:
- ✅ Requiere DAG (grafo acíclico dirigido)
- ✅ Detecta ciclos y rechaza
- ✅ Usa **duración de nodos** (node.outputs[0].value para nodos `task`)
- ✅ Calcula ES, EF, LS, LF, holgura
- ✅ Identifica camino crítico (slack = 0)
- ✅ Detecta y rechaza valores negativos (error de planteamiento)

#### Problemas Identificados:
- ❌ **NO incluye varianza**: PERT estándar usa 3 estimaciones (optimista, pesimista, más probable) para calcular varianza
- ❌ **No especifica unidades de tiempo**: ¿Son días? ¿horas? ¿semanas?
- ❌ **Solo acepta nodos `task`**: Debería ser más flexible con otros tipos de nodos que representen actividades
- ⚠️ **Permisividad insuficiente**: Solo funciona bien si TODOS los nodos son `task`

#### Fórmulas PERT Faltantes:
```
Tiempo Esperado (TE): TE = (O + 4M + P) / 6
  donde O = tiempo optimista
        M = tiempo más probable
        P = tiempo pesimista

Varianza (σ²): σ² = ((P - O) / 6)²

Desviación Estándar (σ): σ = √varianza

Varianza del Proyecto: Σ(varianza de cada tarea crítica)
```

#### Casos de Uso Válidos:
- ✅ Planificación de proyectos
- ✅ Análisis de rutas críticas
- ✅ Estimación de tiempos con incertidumbre

#### Casos de Uso Inválidos:
- ❌ Problemas de ruta más corta (usar Dijkstra)
- ❌ Grafos con ciclos
- ❌ Grafos donde los nodos no representan actividades con duración

---

## 🔧 Propuestas de Mejora

### A. Sistema de Unidades Contextual

Agregar un concepto de "contexto del problema" que defina:

```typescript
interface ProblemContext {
  type: 'path-finding' | 'scheduling' | 'cost-optimization' | 'logic-flow';
  unit: string; // 'km', 'hours', 'USD', 'days', 'none'
  unitLabel: string; // 'Kilómetros', 'Horas', 'Dólares', 'Días'
  applicableAlgorithms: ('dijkstra' | 'astar' | 'pert')[];
}
```

**Ejemplos**:
```typescript
const CONTEXTS = {
  transportation: {
    type: 'path-finding',
    unit: 'km',
    unitLabel: 'Kilómetros',
    applicableAlgorithms: ['dijkstra', 'astar']
  },
  projectScheduling: {
    type: 'scheduling',
    unit: 'days',
    unitLabel: 'Días',
    applicableAlgorithms: ['pert']
  },
  costAnalysis: {
    type: 'cost-optimization',
    unit: 'USD',
    unitLabel: 'Dólares',
    applicableAlgorithms: ['dijkstra']
  }
}
```

### B. Validación Inteligente por Tipo de Nodo

Crear una función que determine qué algoritmos son aplicables:

```typescript
function getApplicableAlgorithms(editor: NodeEditor): {
  dijkstra: { applicable: boolean, reason: string },
  astar: { applicable: boolean, reason: string },
  pert: { applicable: boolean, reason: string }
} {
  const nodeTypes = new Set(editor.nodes.map(n => n.type));
  const hasWeights = editor.templateConnections?.some(c => c.weight !== undefined);
  const hasTasks = nodeTypes.has('task');
  const hasCycles = detectCycle(buildGraph(editor));
  
  return {
    dijkstra: {
      applicable: hasWeights && !hasTasks,
      reason: !hasWeights ? 
        'Requiere pesos en las conexiones' : 
        hasTasks ? 
          'No aplicable a grafos con nodos task (usar PERT)' : 
          'OK'
    },
    astar: {
      applicable: hasWeights && !hasTasks,
      reason: '(igual que Dijkstra)'
    },
    pert: {
      applicable: hasTasks && !hasCycles,
      reason: !hasTasks ? 
        'Requiere nodos task con duración' : 
        hasCycles ? 
          'Requiere grafo acíclico (DAG)' : 
          'OK'
    }
  };
}
```

### C. Extensión de Nodos Task para PERT con Varianza

Modificar el nodo `task` para soportar 3 estimaciones:

```typescript
"task": {
  type: "task",
  category: "pert",
  title: "Task",
  subtitle: "Activity",
  description: "Nodo de tarea/actividad para PERT/CPM con estimaciones optimista, pesimista y más probable",
  inputs: [
    {
      name: "predecessor",
      type: PinType.Number,
      mode: PinMode.Input,
      defaultValue: 0,
      allowMultiple: true
    }
  ],
  outputs: [{
    name: "duration",
    type: PinType.Number,
    mode: PinMode.Output,
    defaultValue: 1,
    allowMultiple: true
  }],
  // NUEVOS CAMPOS PARA PERT
  pertData: {
    optimistic?: number,    // Tiempo optimista (O)
    mostLikely?: number,    // Tiempo más probable (M)
    pessimistic?: number,   // Tiempo pesimista (P)
    expectedTime?: number,  // Calculado: (O + 4M + P) / 6
    variance?: number       // Calculado: ((P - O) / 6)²
  },
  compute: (inputs: any[], node: any) => {
    // Si hay datos PERT, usar expectedTime; si no, usar duration normal
    if (node.pertData?.optimistic && node.pertData?.mostLikely && node.pertData?.pessimistic) {
      const O = node.pertData.optimistic;
      const M = node.pertData.mostLikely;
      const P = node.pertData.pessimistic;
      
      node.pertData.expectedTime = (O + 4*M + P) / 6;
      node.pertData.variance = Math.pow((P - O) / 6, 2);
      
      return [node.pertData.expectedTime];
    }
    return [node.outputs[0].value];
  }
}
```

### D. Algoritmo PERT Extendido con Varianza

```typescript
export function pertCPMWithVariance(editor: NodeEditor): PathResult {
  // ... código existente ...
  
  // NUEVO: Calcular varianza del proyecto
  const projectVariance = criticalPath.reduce((sum, nodeId) => {
    const node = editor.nodes[nodeId];
    if (node.pertData?.variance) {
      return sum + node.pertData.variance;
    }
    return sum;
  }, 0);
  
  const projectStdDev = Math.sqrt(projectVariance);
  
  // Intervalos de confianza (distribución normal)
  const confidence68 = {
    min: totalTime - projectStdDev,
    max: totalTime + projectStdDev
  };
  
  const confidence95 = {
    min: totalTime - 2 * projectStdDev,
    max: totalTime + 2 * projectStdDev
  };
  
  return {
    algorithm: 'PERT/CPM',
    success: true,
    criticalPath,
    totalTime,
    message: `✅ Ruta Crítica encontrada:\n${pathNames.join(' → ')}\n\n` +
             `📊 ANÁLISIS DE TIEMPOS:\n` +
             `  • Tiempo esperado: ${totalTime} ${unit}\n` +
             `  • Desviación estándar: ${projectStdDev.toFixed(2)} ${unit}\n` +
             `  • Intervalo 68% confianza: ${confidence68.min.toFixed(1)} - ${confidence68.max.toFixed(1)} ${unit}\n` +
             `  • Intervalo 95% confianza: ${confidence95.min.toFixed(1)} - ${confidence95.max.toFixed(1)} ${unit}\n` +
             `  • Nodos críticos: ${criticalPath.length}`,
    details: {
      criticalNodes: criticalPath,
      nodeNames: pathNames,
      projectDuration: totalTime,
      variance: projectVariance,
      stdDev: projectStdDev,
      confidence68,
      confidence95,
      analysisTable: details
    }
  };
}
```

### E. UI para Configurar Estimaciones PERT

En `PropertiesPanel.ts`, agregar campos para nodos `task`:

```html
<div class="pert-estimation-group" v-if="node.type === 'task'">
  <h4>📊 Estimaciones PERT</h4>
  <label>
    Tiempo Optimista (O):
    <input type="number" id="optimistic" min="0" step="0.1">
  </label>
  <label>
    Tiempo Más Probable (M):
    <input type="number" id="mostLikely" min="0" step="0.1">
  </label>
  <label>
    Tiempo Pesimista (P):
    <input type="number" id="pessimistic" min="0" step="0.1">
  </label>
  <div class="calculated-values">
    <p><strong>Tiempo Esperado (TE):</strong> <span id="expectedTime">-</span></p>
    <p><strong>Varianza (σ²):</strong> <span id="variance">-</span></p>
    <p><strong>Desv. Estándar (σ):</strong> <span id="stdDev">-</span></p>
  </div>
</div>
```

---

## 📋 Resumen de Reglas de Aplicación

| Algoritmo | Requiere | Rechaza | Unidades Típicas |
|-----------|----------|---------|------------------|
| **Dijkstra** | Pesos en conexiones | Nodos `task` (mejor PERT) | km, USD, unidades genéricas |
| **A*** | Pesos en conexiones + posiciones relevantes | Nodos `task`, grafos abstractos | km, coordenadas espaciales |
| **PERT/CPM** | Nodos `task` con duraciones, DAG | Ciclos, ausencia de tareas | días, horas, semanas |

---

## ✅ Checklist de Implementación

- [ ] Crear `ProblemContext` interface y tipos
- [ ] Implementar `getApplicableAlgorithms()` con validación inteligente
- [ ] Extender `NodeTypes.task` con campos `pertData`
- [ ] Modificar `pertCPM()` para calcular varianza y desviación estándar
- [ ] Crear UI en `PropertiesPanel.ts` para estimaciones PERT
- [ ] Agregar selector de unidades en configuración del template
- [ ] Mostrar unidades en resultados de algoritmos
- [ ] Agregar advertencias visuales cuando un algoritmo no es aplicable
- [ ] Documentar en tooltips cuándo usar cada algoritmo

---

## 🎓 Recomendaciones Pedagógicas

Para hacer el sistema más comprensible:

1. **Tooltips explicativos** en botones de algoritmos:
   - "Dijkstra: Encuentra el camino más corto considerando pesos de CONEXIONES"
   - "PERT/CPM: Analiza proyectos con actividades secuenciales, calcula ruta crítica y varianza"

2. **Ejemplos pre-cargados**:
   - Template "Red de Transporte" → Dijkstra/A*
   - Template "Proyecto de Construcción" → PERT/CPM
   - Template "Análisis de Costos" → Dijkstra

3. **Validación preventiva**:
   - Antes de ejecutar, mostrar: "✅ Este algoritmo es aplicable" o "⚠️ Este algoritmo no es recomendado para este grafo: [razón]"

4. **Visualización de resultados**:
   - Mostrar unidades en todos los valores numéricos
   - Color-coding: verde para camino óptimo, rojo para ruta crítica
   - Gráfica de varianza para PERT

---

**Fecha**: 15 de Octubre, 2025  
**Autor**: Análisis técnico del sistema de algoritmos
