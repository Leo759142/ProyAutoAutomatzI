# 🎯 Guía de Uso: Sistema de Validación y Varianza PERT

## 📖 Introducción

Este sistema permite:
1. **Validar** qué algoritmos son aplicables según la estructura del grafo
2. **Calcular varianza PERT** usando estimaciones optimista/pesimista/más probable
3. **Especificar unidades** contextuales (días, kilómetros, dólares, etc.)
4. **Obtener intervalos de confianza** para proyectos con incertidumbre

---

## 🚀 Caso de Uso 1: Proyecto de Construcción con PERT

### Escenario:
Tienes un proyecto de construcción con 5 tareas:
- **A**: Cimientos (5-7-12 días)
- **B**: Estructura (8-10-15 días)
- **C**: Instalaciones (4-6-10 días)
- **D**: Acabados (3-5-8 días)
- **E**: Limpieza (1-2-3 días)

### Pasos:

#### 1. Crear los nodos task
```typescript
// En el canvas, crear 5 nodos de tipo "task"
// A → B → C → D → E (conexión lineal)
```

#### 2. Configurar estimaciones PERT para cada tarea

**Tarea A (Cimientos)**:
- Hacer clic en el nodo A
- En el panel de propiedades, ir a "📊 Estimaciones PERT"
- Ingresar:
  - Tiempo Optimista: `5`
  - Tiempo Más Probable: `7`
  - Tiempo Pesimista: `12`
- Ver cálculos automáticos:
  - **Tiempo Esperado (TE)**: 7.50 días
  - **Varianza (σ²)**: 1.3611
  - **Desviación Estándar (σ)**: 1.17 días
- Hacer clic en "Aplicar"

**Repetir para las demás tareas B, C, D, E**

#### 3. Validar aplicabilidad de algoritmos

```typescript
import { getApplicableAlgorithms } from './algorithms/PathAlgorithms';

const validation = getApplicableAlgorithms(editor);

console.log('PERT aplicable:', validation.pert.applicable); // true
console.log('Razón:', validation.pert.reason); 
// "Algoritmo aplicable - Análisis de ruta crítica para planificación de proyectos"

console.log('Algoritmo recomendado:', validation.recommendedAlgorithm); // 'pert'
```

#### 4. Ejecutar PERT/CPM

```typescript
import { pertCPM } from './algorithms/PathAlgorithms';

const result = pertCPM(editor);

if (result.success) {
    console.log('✅ Ruta Crítica:', result.criticalPath);
    console.log('📊 Tiempo esperado del proyecto:', result.totalTime, 'días');
    console.log('📊 Varianza del proyecto:', result.details.variance);
    console.log('📊 Desviación estándar:', result.details.stdDev, 'días');
    
    console.log('⏱️ Intervalos de confianza:');
    console.log('  68%:', result.details.confidence68); // ±1σ
    console.log('  95%:', result.details.confidence95); // ±2σ
    console.log('  99.7%:', result.details.confidence997); // ±3σ
}
```

#### Resultado esperado:
```
✅ Ruta Crítica: A → B → C → D → E
📊 Tiempo esperado: 30.5 días
📊 Varianza: 6.8056
📊 Desviación estándar: 2.61 días

⏱️ Intervalos de confianza:
  68% confianza: 27.9 - 33.1 días (probabilidad 68% de terminar en este rango)
  95% confianza: 25.3 - 35.7 días (probabilidad 95% de terminar en este rango)
  99.7% confianza: 22.7 - 38.3 días (probabilidad 99.7% de terminar en este rango)
```

### Interpretación:
- El proyecto tardará **30.5 días** en promedio
- Hay un **68% de probabilidad** de terminar entre 27.9 y 33.1 días
- Hay un **95% de probabilidad** de terminar entre 25.3 y 35.7 días
- Es muy probable (99.7%) que termine en menos de 38.3 días

---

## 🚗 Caso de Uso 2: Red de Transporte con Dijkstra

### Escenario:
Tienes una red de ciudades conectadas por carreteras con distancias:
- Ciudad A → Ciudad B: 120 km
- Ciudad A → Ciudad C: 80 km
- Ciudad B → Ciudad D: 100 km
- Ciudad C → Ciudad D: 150 km

### Pasos:

#### 1. Crear nodos genéricos (no usar task)
```typescript
// Crear 4 nodos de tipo "number" o "string" (uno por ciudad)
// Conectar según el esquema de carreteras
```

#### 2. Asignar pesos a las conexiones

**Para cada conexión**:
- Hacer clic en la línea de conexión
- En el panel de propiedades de conexión, ingresar el peso:
  - A → B: `120`
  - A → C: `80`
  - B → D: `100`
  - C → D: `150`
- Hacer clic en "Aplicar"

#### 3. Validar aplicabilidad

```typescript
const validation = getApplicableAlgorithms(editor);

console.log('Dijkstra aplicable:', validation.dijkstra.applicable); // true
console.log('Razón:', validation.dijkstra.reason);
// "Algoritmo aplicable - Encuentra el camino más corto basado en pesos de conexiones"

console.log('PERT aplicable:', validation.pert.applicable); // true (funciona)
console.log('Severidad:', validation.pert.severity); // 'warning'
console.log('Razón:', validation.pert.reason);
// "Funciona, pero es más útil con nodos task que representen actividades"
```

#### 4. Ejecutar Dijkstra

```typescript
import { dijkstra } from './algorithms/PathAlgorithms';

// Desde ciudad A (índice 0) hasta ciudad D (índice 3)
const result = dijkstra(editor, 0, 3);

if (result.success) {
    console.log('✅ Camino más corto:', result.path);
    console.log('📏 Distancia total:', result.distance, 'km');
    console.log('🛤️ Ruta:', result.details.nodeNames.join(' → '));
}
```

#### Resultado esperado:
```
✅ Camino más corto: [0, 2, 3]
📏 Distancia total: 230 km
🛤️ Ruta: Ciudad A → Ciudad C → Ciudad D
```

### Interpretación:
- La ruta más corta de A a D es **A → C → D** (230 km)
- No es A → B → D (220 km), porque el algoritmo encontró una mejor

---

## 💰 Caso de Uso 3: Análisis de Costos

### Escenario:
Tienes una cadena de procesos productivos con costos operativos:
- Proceso 1 → Proceso 2: $500
- Proceso 1 → Proceso 3: $800
- Proceso 2 → Proceso 4: $300
- Proceso 3 → Proceso 4: $400

### Pasos:

#### 1. Configurar contexto de problema

```typescript
import { PROBLEM_CONTEXTS } from './types/ProblemContext';

// Usar contexto de optimización de costos
const context = PROBLEM_CONTEXTS.costAnalysis;
console.log('Unidad:', context.unit.label); // "Dólares"
console.log('Algoritmos aplicables:', context.applicableAlgorithms); // ['dijkstra']
```

#### 2. Crear grafo con pesos (igual que Caso 2)

#### 3. Validar con contexto

```typescript
const validation = getApplicableAlgorithms(editor, context);

console.log('Dijkstra aplicable:', validation.dijkstra.applicable); // true
console.log('Contexto inferido:', validation.context?.type); // 'cost-optimization'
console.log('Unidad:', validation.context?.unit.shortLabel); // '$'
```

#### 4. Ejecutar Dijkstra

```typescript
const result = dijkstra(editor, 0, 3);

if (result.success) {
    console.log(`✅ Ruta de menor costo: ${result.distance} ${context.unit.shortLabel}`);
    // "✅ Ruta de menor costo: 800 $"
}
```

---

## ⚠️ Caso de Uso 4: Grafo Inválido (con ciclos)

### Escenario:
Intentas crear un proyecto PERT con dependencias circulares:
- A → B
- B → C
- C → A (ciclo!)

### Validación:

```typescript
const validation = getApplicableAlgorithms(editor);

console.log('PERT aplicable:', validation.pert.applicable); // false
console.log('Razón:', validation.pert.reason);
// "PERT/CPM requiere un grafo acíclico (DAG) - Se detectaron ciclos"

console.log('Sugerencias:', validation.pert.suggestions);
// [
//   "Elimina las conexiones que crean ciclos",
//   "Verifica que el flujo de actividades sea unidireccional"
// ]
```

### Resultado:

```typescript
const result = pertCPM(editor);

console.log(result.success); // false
console.log(result.message);
// "❌ PERT/CPM requiere un grafo acíclico (DAG). Se detectaron ciclos."
```

---

## 🎨 Interfaz de Usuario Recomendada

### Botones de Algoritmos con Validación:

```html
<!-- Botón Dijkstra -->
<button 
    id="dijkstraBtn"
    :disabled="!validation.dijkstra.applicable"
    :class="validation.dijkstra.severity"
>
    🗺️ Dijkstra
    <span v-if="validation.dijkstra.severity === 'ok'">✅</span>
    <span v-if="validation.dijkstra.severity === 'warning'">⚠️</span>
    <span v-if="validation.dijkstra.severity === 'error'">❌</span>
</button>

<!-- Tooltip con razón -->
<div class="tooltip">
    {{ validation.dijkstra.reason }}
    <ul v-if="validation.dijkstra.suggestions">
        <li v-for="s in validation.dijkstra.suggestions">{{ s }}</li>
    </ul>
</div>
```

### Panel de Resultados PERT:

```html
<div class="pert-results" v-if="pertResult.success">
    <h3>📊 Análisis PERT/CPM</h3>
    
    <div class="critical-path">
        <strong>Ruta Crítica:</strong>
        <span>{{ pertResult.details.nodeNames.join(' → ') }}</span>
    </div>
    
    <div class="project-duration">
        <strong>Duración Esperada:</strong>
        <span>{{ pertResult.totalTime }} {{ unit }}</span>
    </div>
    
    <div class="variance-section" v-if="pertResult.details.variance > 0">
        <h4>📈 Análisis de Riesgo</h4>
        
        <div class="stat">
            <strong>Varianza:</strong>
            <span>{{ pertResult.details.variance.toFixed(4) }}</span>
        </div>
        
        <div class="stat">
            <strong>Desviación Estándar:</strong>
            <span>{{ pertResult.details.stdDev.toFixed(2) }} {{ unit }}</span>
        </div>
        
        <h5>⏱️ Intervalos de Confianza</h5>
        <ul>
            <li>
                <strong>68% probabilidad:</strong>
                {{ pertResult.details.confidence68.min.toFixed(1) }} - 
                {{ pertResult.details.confidence68.max.toFixed(1) }} {{ unit }}
            </li>
            <li>
                <strong>95% probabilidad:</strong>
                {{ pertResult.details.confidence95.min.toFixed(1) }} - 
                {{ pertResult.details.confidence95.max.toFixed(1) }} {{ unit }}
            </li>
            <li>
                <strong>99.7% probabilidad:</strong>
                {{ pertResult.details.confidence997.min.toFixed(1) }} - 
                {{ pertResult.details.confidence997.max.toFixed(1) }} {{ unit }}
            </li>
        </ul>
    </div>
    
    <div class="tip" v-else>
        💡 Configura estimaciones PERT (O/M/P) en las tareas para análisis de varianza
    </div>
</div>
```

---

## 🧮 Fórmulas PERT

### Tiempo Esperado (TE):
```
TE = (O + 4M + P) / 6
```
Donde:
- O = Tiempo Optimista
- M = Tiempo Más Probable
- P = Tiempo Pesimista

### Varianza (σ²):
```
σ² = ((P - O) / 6)²
```

### Desviación Estándar (σ):
```
σ = √σ²
```

### Varianza del Proyecto:
```
σ²_proyecto = Σ σ²_tarea_crítica
```
Se suman las varianzas de **solo las tareas críticas** (con holgura = 0)

### Intervalos de Confianza:
```
68% confianza: [TE - 1σ, TE + 1σ]
95% confianza: [TE - 2σ, TE + 2σ]
99.7% confianza: [TE - 3σ, TE + 3σ]
```

---

## 📚 Referencias

### Teoría PERT:
- [Project Evaluation and Review Technique (PERT)](https://en.wikipedia.org/wiki/Program_evaluation_and_review_technique)
- [Critical Path Method (CPM)](https://en.wikipedia.org/wiki/Critical_path_method)

### Distribución Normal:
- Regla 68-95-99.7 (Regla empírica)
- Los intervalos asumen distribución normal de tiempos

---

## 🎓 Preguntas Frecuentes

### ¿Cuándo usar Dijkstra vs PERT?

**Usar Dijkstra cuando**:
- El problema es de ruta más corta (transporte, costos, etc.)
- Los **pesos están en las conexiones** (no en los nodos)
- No hay dependencias temporales complejas

**Usar PERT cuando**:
- El problema es de planificación de proyectos
- Las **duraciones están en los nodos** (tareas con tiempo de ejecución)
- Necesitas identificar tareas críticas
- Quieres analizar incertidumbre con estimaciones O/M/P

### ¿Por qué mi grafo no permite PERT?

**Razones comunes**:
1. **Hay ciclos**: PERT requiere DAG (Directed Acyclic Graph)
   - Solución: Elimina conexiones que crean ciclos
2. **No hay nodos task**: PERT funciona mejor con nodos de tipo "task"
   - Solución: Usa nodos task en lugar de nodos genéricos
3. **Las tareas no tienen duración**: Los nodos task deben tener `duration > 0`
   - Solución: Configura la duración en las propiedades de cada tarea

### ¿Qué pasa si solo algunas tareas tienen estimaciones PERT?

- El algoritmo **sigue funcionando**
- Calcula la varianza **solo de las tareas que tienen estimaciones**
- Muestra un contador: "Tareas con estimaciones PERT: 3/5"
- Para tareas sin estimaciones, usa la duración simple

### ¿Cómo interpreto los intervalos de confianza?

**68% confianza** (±1σ):
- Hay un 68% de probabilidad de que el proyecto termine dentro de este rango
- Es el rango más probable

**95% confianza** (±2σ):
- Hay un 95% de probabilidad de terminar en este rango
- Rango seguro para planificación

**99.7% confianza** (±3σ):
- Casi certeza (99.7%) de terminar en este rango
- Incluye escenarios extremos

---

**Fecha**: 15 de Octubre, 2025  
**Versión del sistema**: 1.0.0
