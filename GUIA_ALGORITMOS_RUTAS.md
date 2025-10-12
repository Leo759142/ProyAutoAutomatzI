# 🎯 Algoritmos de Rutas Óptimas

## 📋 Descripción General

El sistema ahora incluye **3 algoritmos** de búsqueda de rutas óptimas que se pueden aplicar a los grafos/workflows:

1. **Dijkstra** - Camino más corto con pesos positivos
2. **A*** (A-Star) - Búsqueda heurística con distancia euclidiana
3. **PERT/CPM** - Análisis de ruta crítica en proyectos

---

## 🎮 Cómo Usar

### 1️⃣ Seleccionar Algoritmo
```
Toolbar (segunda fila) → Dropdown "🎯 Algoritmo"
    ↓
Opciones:
    • 🔷 Dijkstra (Camino más corto)
    • ⭐ A* (Heurística)
    • 📊 PERT/CPM (Ruta crítica)
```

### 2️⃣ Ejecutar
```
Click en botón "▶ Ejecutar"
    ↓
El algoritmo analiza el grafo actual
    ↓
Muestra resultados en:
    • Alert con resumen
    • Panel de auditoría con detalles
    • Consola con tabla de análisis
```

### 3️⃣ Analizar Capacidad (Opcional)
```
Click en botón "🔍 Analizar"
    ↓
Verifica si el grafo es apto para algoritmos
    ↓
Muestra:
    • Componentes conexas
    • Nodos fuente y sumidero
    • Uninodos detectados
```

---

## 🔷 Dijkstra - Camino Más Corto

### Descripción
Encuentra el **camino más corto** entre un nodo de inicio y un nodo de fin, considerando los **pesos** de las aristas.

### Requisitos
- ✅ Grafo **conexo** (todos los nodos conectados)
- ✅ Pesos **no negativos** en las aristas
- ✅ Al menos un nodo **fuente** (sin entradas)
- ✅ Al menos un nodo **sumidero** (sin salidas)

### Cómo Funciona
1. Parte del nodo fuente con distancia 0
2. Explora vecinos y actualiza distancias mínimas
3. Selecciona nodo no visitado con menor distancia
4. Repite hasta llegar al nodo destino

### Pesos en el Grafo
Los **pesos** se obtienen de:
- **Valor del nodo destino** (si es numérico)
- Si no tiene valor numérico: **peso = 1**

### Ejemplo de Uso
```
Grafo:
    A(5) → B(3) → D(8)
      ↓
    C(2) → D(8)

Dijkstra(A, D):
    Evalúa: A→B→D (costo 5+3+8=16)
           A→C→D (costo 5+2+8=15) ✅ Más corto
    
    Resultado: A → C → D (distancia 15)
```

### Resultado
```javascript
{
    algorithm: 'Dijkstra',
    success: true,
    path: [0, 2, 3],  // Índices de nodos
    distance: 15,
    message: "✅ Camino más corto encontrado:\nA → C → D\nDistancia total: 15"
}
```

---

## ⭐ A* (A-Star) - Búsqueda Heurística

### Descripción
Similar a Dijkstra pero usa una **heurística** (distancia euclidiana) para guiar la búsqueda hacia el objetivo, siendo más **eficiente**.

### Requisitos
- ✅ Mismo que Dijkstra
- ✅ Nodos con **posiciones espaciales** (coordenadas x, y)

### Cómo Funciona
1. Usa **f(n) = g(n) + h(n)**
   - `g(n)` = costo desde inicio hasta n
   - `h(n)` = **heurística** (distancia euclidiana a objetivo)
2. Prioriza nodos que parecen estar **más cerca** del objetivo
3. Explora menos nodos que Dijkstra si la heurística es buena

### Heurística Usada
```typescript
h(node) = √((x_objetivo - x_nodo)² + (y_objetivo - y_nodo)²)
```

### Ventajas sobre Dijkstra
- ✅ **Más rápido** en grafos grandes
- ✅ **Menos nodos explorados**
- ✅ **Óptimo** si la heurística es admisible (nunca sobreestima)

### Ejemplo de Uso
```
Grafo con posiciones:
    A(x:0, y:0) → B(x:5, y:5) → D(x:10, y:0)
                ↓
    C(x:0, y:5) → D(x:10, y:0)

A*:
    Calcula h(B) = √((10-5)² + (0-5)²) = 7.07
    Calcula h(C) = √((10-0)² + (0-5)²) = 11.18
    
    Prefiere explorar por B primero (menor f-score)
```

### Resultado
```javascript
{
    algorithm: 'A*',
    success: true,
    path: [0, 1, 3],
    distance: 18,
    message: "✅ Camino óptimo encontrado (A*):\nA → B → D\nDistancia total: 18",
    details: {
        heuristicUsed: 'Distancia Euclidiana'
    }
}
```

---

## 📊 PERT/CPM - Ruta Crítica

### Descripción
Análisis de **proyectos** para encontrar la **ruta crítica** (secuencia de tareas que determina la duración mínima del proyecto).

### Requisitos
- ✅ Grafo **acíclico** (DAG - Directed Acyclic Graph)
- ✅ Sin ciclos (PERT/CPM NO funciona con ciclos)
- ✅ Nodos representan **tareas/actividades**
- ✅ Pesos representan **duración** de tareas

### Conceptos Clave

#### Early Start (ES)
Momento **más temprano** en que puede iniciar una tarea.
```
ES[tarea] = MAX(EF[predecesores])
```

#### Early Finish (EF)
Momento **más temprano** en que puede terminar una tarea.
```
EF[tarea] = ES[tarea] + duración[tarea]
```

#### Late Start (LS)
Momento **más tardío** en que puede iniciar sin retrasar el proyecto.
```
LS[tarea] = LF[tarea] - duración[tarea]
```

#### Late Finish (LF)
Momento **más tardío** en que puede terminar sin retrasar el proyecto.
```
LF[tarea] = MIN(LS[sucesores])
```

#### Holgura (Slack)
Tiempo de **flexibilidad** que tiene una tarea.
```
Slack[tarea] = LS[tarea] - ES[tarea]
```

#### Ruta Crítica
Secuencia de tareas con **holgura = 0** (no pueden retrasarse sin afectar el proyecto).

### Cómo Funciona
1. **Forward Pass**: Calcula ES y EF desde inicio
2. **Backward Pass**: Calcula LS y LF desde fin
3. **Holgura**: LS - ES para cada tarea
4. **Ruta Crítica**: Tareas con holgura ≈ 0

### Ejemplo de Uso: Desarrollo de Software

```
Tareas:
    A: Diseño (5 días)
    B: Backend (3 días, después de A)
    C: Frontend (2 días, después de A)
    D: Base de datos (8 días, después de B)
    E: Componentes (6 días, después de C)
    F: Testing (4 días, después de D y E)

Grafo:
         B(3) → D(8) ↘
    A(5)              → F(4)
         C(2) → E(6) ↗

PERT/CPM Calcula:

Tarea | ES | EF | LS | LF | Slack | Crítica
------|----|----|----|----|-------|--------
A     | 0  | 5  | 0  | 5  | 0     | ✅ SÍ
B     | 5  | 8  | 5  | 8  | 0     | ✅ SÍ
C     | 5  | 7  | 9  | 11 | 4     | ❌ NO
D     | 8  | 16 | 8  | 16 | 0     | ✅ SÍ
E     | 7  | 13 | 11 | 17 | 4     | ❌ NO
F     | 16 | 20 | 16 | 20 | 0     | ✅ SÍ

Ruta Crítica: A → B → D → F (20 días)
Ruta Alternativa: A → C → E → F (17 días con 3 días de holgura)
```

### Resultado
```javascript
{
    algorithm: 'PERT/CPM',
    success: true,
    criticalPath: [0, 1, 3, 5],
    totalTime: 20,
    message: "✅ Ruta Crítica encontrada:\nDiseño → Backend → Base de datos → Testing\n\nTiempo total del proyecto: 20 días\nNodos críticos: 4",
    details: {
        analysisTable: [/* tabla con ES, EF, LS, LF, Slack */]
    }
}
```

### Ventajas
- ✅ Identifica tareas **críticas** (no pueden retrasarse)
- ✅ Calcula **duración mínima** del proyecto
- ✅ Detecta **holguras** (flexibilidad en tareas)
- ✅ Ayuda a **optimizar recursos** y **priorizar** tareas

---

## 🎯 Comparación de Algoritmos

| Característica | Dijkstra | A* | PERT/CPM |
|----------------|----------|----|---------| 
| **Propósito** | Camino más corto | Camino más corto optimizado | Ruta crítica |
| **Heurística** | ❌ No | ✅ Sí (Euclidiana) | ❌ No |
| **Complejidad** | O(V²) o O(E log V) | O(E log V) | O(V + E) |
| **Permite ciclos** | ✅ Sí | ✅ Sí | ❌ No (DAG) |
| **Pesos negativos** | ❌ No | ❌ No | ✅ Sí |
| **Uso típico** | GPS, redes | Videojuegos, IA | Gestión de proyectos |
| **Velocidad** | Medio | Rápido | Rápido |
| **Óptimo** | ✅ Siempre | ✅ Si h admisible | ✅ Siempre |

---

## 📝 Casos de Uso

### 🔷 Usar Dijkstra Cuando:
- ✅ Necesitas el camino **más corto garantizado**
- ✅ Grafo con **pesos positivos**
- ✅ No tienes información de posiciones espaciales
- ✅ Ejemplo: Enrutamiento de paquetes en red

### ⭐ Usar A* Cuando:
- ✅ Necesitas el camino más corto **rápidamente**
- ✅ Tienes **coordenadas espaciales** de nodos
- ✅ Grafos **grandes** donde Dijkstra sería lento
- ✅ Ejemplo: Navegación en mapas, pathfinding en juegos

### 📊 Usar PERT/CPM Cuando:
- ✅ Gestión de **proyectos** con tareas dependientes
- ✅ Necesitas identificar **tareas críticas**
- ✅ Calcular **duración mínima** del proyecto
- ✅ Optimizar **recursos** y **cronogramas**
- ✅ Ejemplo: Construcción, desarrollo de software, eventos

---

## 🚀 Templates PERT/CPM

Los templates incluidos están diseñados para PERT/CPM:

### 📊 PERT/CPM: Gestión de Proyecto
- **Tareas**: 7 actividades de desarrollo de software
- **Ruta crítica**: A → B → D → F → G
- **Duración**: 22 días
- **Holguras**: Ruta frontend tiene 9 días de margen

### 🏗️ PERT/CPM: Construcción Casa
- **Tareas**: 8 fases de construcción
- **Ruta crítica**: Cimientos → Muros → Instalaciones → Acabados
- **Duración**: 47 días
- **Paralelismo**: Instalaciones (eléctrica, plomería, HVAC)

---

## ⚠️ Errores Comunes

### ❌ "No se encontraron nodos de inicio o fin"
**Causa**: Grafo sin nodos fuente o sumidero  
**Solución**: Asegúrate de tener:
- Nodo(s) **sin conexiones entrantes** (fuente)
- Nodo(s) **sin conexiones salientes** (sumidero)

### ❌ "PERT/CPM requiere un grafo acíclico"
**Causa**: Hay ciclos en el grafo  
**Solución**: Elimina conexiones que formen ciclos. PERT/CPM solo funciona con DAGs.

### ❌ "No existe camino entre nodo X y nodo Y"
**Causa**: Nodos desconectados  
**Solución**: Conecta los nodos o selecciona nodos de la misma componente conexa.

---

## 🛠️ Debugging

### Ver Estructura del Grafo
```javascript
// En consola
const editor = window.canvasUI.editor;
console.log('Nodos:', editor.nodes.length);
console.log('Links:', editor.links.filter(l => l !== null).length);
console.log('Componentes:', editor.findConnectedComponents().length);
```

### Verificar Pesos
```javascript
// Ver pesos de aristas
editor.links.forEach((link, i) => {
    if (!link) return;
    const from = editor.nodes.indexOf(link[0].parent);
    const to = editor.nodes.indexOf(link[1].parent);
    const weight = link[1].parent.outputs[0]?.value || 1;
    console.log(`Link ${i}: ${from} → ${to} (peso: ${weight})`);
});
```

### Detectar Ciclos
```javascript
// El resultado de PERT/CPM indica si hay ciclos
import { pertCPM } from './algorithms/PathAlgorithms';
const result = pertCPM(editor);
console.log(result.message);
```

---

## 📚 Referencias

### Dijkstra
- **Paper original**: Edsger W. Dijkstra (1959)
- **Complejidad**: O(V²) naive, O((V+E) log V) con heap
- **Wikipedia**: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

### A*
- **Desarrollado por**: Peter Hart, Nils Nilsson, Bertram Raphael (1968)
- **Complejidad**: O(E log V) promedio
- **Wikipedia**: https://en.wikipedia.org/wiki/A*_search_algorithm

### PERT/CPM
- **PERT**: Desarrollado por US Navy (1958)
- **CPM**: DuPont y Remington Rand (1957)
- **Complejidad**: O(V + E) (ordenamiento topológico)
- **Wikipedia**: https://en.wikipedia.org/wiki/Critical_path_method

---

**Fecha**: Octubre 12, 2025  
**Versión**: 1.0  
**Status**: ✅ Implementación Completa
