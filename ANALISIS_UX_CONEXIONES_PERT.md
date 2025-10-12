# 🔍 ANÁLISIS: Problemas de UX en Sistema de Conexiones

## 🐛 Problemas Identificados

### 1. **Confusión entre Selección de Nodo vs Pin vs Conexión**

**Situación actual:**
```
Click en canvas puede significar:
1. ❓ Click en pin (para conectar)
2. ❓ Click en nodo (para seleccionar/mover)
3. ❓ Click en conexión (para eliminar)
4. ❓ Click en vacío (para deseleccionar)
```

**Problema**: El sistema verifica en este orden:
1. Primero pins (radio 0.3 unidades)
2. Luego nodos (radio 0.2 unidades)
3. **NUNCA verifica conexiones**

**Resultado**: 
- ❌ No se pueden seleccionar conexiones con click
- ❌ Click derecho en conexión no elimina
- ❌ Usuario debe usar DELETE después de seleccionar pin

---

### 2. **Falta Click Derecho para Eliminar Conexiones**

**Comportamiento esperado:**
```
1. Click derecho en conexión → Elimina la conexión
2. Click derecho en nodo → Menú contextual (futuro)
3. Click derecho en vacío → No hace nada
```

**Comportamiento actual:**
```
1. Click derecho en conexión → No hace nada ❌
2. DELETE en pin seleccionado → Elimina conexión ✅
3. Pero... ¿cómo selecciono una conexión? ❌
```

---

### 3. **Sistema de Adición de Pins No Implementado**

**Problema**: Usuario NO puede agregar/quitar inputs manualmente

**Comportamiento actual:**
- ✅ Inputs se agregan automáticamente según template
- ❌ Usuario no puede añadir más inputs en tiempo real
- ❌ No hay UI para botón "+/-" en nodos

**Casos de uso:**
```
Usuario quiere sumar 6 números:
- Opción A: Crear template con 6 conexiones (automático) ✅
- Opción B: Click en "+" en el nodo ADD (manual) ❌ NO EXISTE
```

---

### 4. **PERT/CPM: ¿Necesitamos Nodos Especializados?**

**Pregunta crítica**: ¿Los operadores actuales son suficientes para PERT/CPM?

**Análisis de templates PERT/CPM actuales:**

#### Template "PERT/CPM: Gestión de Proyecto"
```
RUTA BACKEND: A(5) → B(3) → D(8) = 16 días
  Nodo 1 (5) ─┐
  Nodo 2 (3) ─┼→ ADD (5+3) ─┐
                              ├→ ADD (8+8) → Display (16)
  Nodo 5 (8) ────────────────┘

RUTA FRONTEND: A(5) → C(2) → E(6) = 13 días
  Similar estructura...

COMPARAR RUTAS: GREATER (16 > 13) → true
  Ruta Backend > Ruta Frontend
```

**Problema actual**:
- ✅ Suma de tareas: Funciona con ADD
- ✅ Comparación de rutas: Funciona con GREATER
- ❌ **NO calcula ruta crítica automáticamente**
- ❌ **NO identifica el camino más largo**
- ❌ **Usuario debe construir TODAS las rutas manualmente**

---

## 💡 Soluciones Propuestas

### Solución 1: Mejorar Detección de Click en Conexiones

**Implementar:**
1. Función `getClosestLink(worldPos, threshold)` 
2. Detectar click en bezier curves
3. Prioridad: PIN > CONEXIÓN > NODO > VACÍO

**Algoritmo:**
```typescript
function getClosestLink(worldPos: Vec2, threshold: number = 0.2): [Pin, Pin] | null {
  let closestLink = null;
  let minDistance = threshold;
  
  for (const link of editor.links) {
    if (!link || link[0] === null || link[1] === null) continue;
    
    const [fromPin, toPin] = link;
    const distance = distanceToBezie curve(worldPos, fromPin.pos, toPin.pos);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestLink = link;
    }
  }
  
  return closestLink;
}

function distanceToBezierCurve(point: Vec2, p1: Vec2, p2: Vec2): number {
  // Bezier cúbico: muestrear 20 puntos y calcular distancia mínima
  const samples = 20;
  let minDist = Infinity;
  
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const bezierPoint = evaluateBezier(t, p1, p2);
    const dist = distance(point, bezierPoint);
    minDist = Math.min(minDist, dist);
  }
  
  return minDist;
}
```

---

### Solución 2: Click Derecho para Eliminar Conexiones

**Modificar `handleMouseDown()` en CanvasEvents.ts:**

```typescript
} else if (e.button === 2) {  // Click derecho
  e.preventDefault();
  
  // Buscar conexión bajo el cursor
  const closestLink = getClosestLink(worldPos, 0.3);
  
  if (closestLink) {
    const [fromPin, toPin] = closestLink;
    const linkIndex = fromPin.userData || toPin.userData;
    
    console.log(`🗑️ Click derecho: Eliminando conexión ${fromPin.parent.title} → ${toPin.parent.title}`);
    
    // Limpiar userData
    if (fromPin) fromPin.userData = null;
    if (toPin) toPin.userData = null;
    
    // Eliminar link
    manager.editor.links[linkIndex] = null;
    
    // Recalcular
    manager.editor.computeAll();
    
    return;
  }
  
  // Si no hay conexión, marcar botón derecho para otros usos
  manager.inpt.mouseButtonRight = true;
}
```

---

### Solución 3: UI para Añadir/Quitar Pins Dinámicamente

**Opción A: Botones +/- en Panel de Propiedades**

```typescript
// En PropertiesPanel.ts
private renderAddRemovePins() {
  if (!this.currentNode) return;
  
  // Solo para operadores multi-input
  const multiInputTypes = ['add', 'multiply', 'and', 'or', 'concat'];
  if (!multiInputTypes.includes(this.currentNode.type)) return;
  
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'pin-controls';
  
  // Botón +
  const addButton = document.createElement('button');
  addButton.textContent = '+ Añadir Input';
  addButton.onclick = () => {
    this.currentNode.addExtraInputs(this.currentNode.inputs.length + 1);
    this.renderProperties(); // Refrescar
  };
  
  // Botón -
  const removeButton = document.createElement('button');
  removeButton.textContent = '- Quitar Input';
  removeButton.disabled = this.currentNode.inputs.length <= 2;
  removeButton.onclick = () => {
    if (this.currentNode.inputs.length > 2) {
      this.currentNode.inputs.pop();
      this.renderProperties(); // Refrescar
    }
  };
  
  controlsContainer.appendChild(addButton);
  controlsContainer.appendChild(removeButton);
  
  return controlsContainer;
}
```

**Opción B: Botones Inline en el Nodo (más complejo)**

Renderizar pequeños botones +/- directamente en el nodo, cerca de los inputs.

---

### Solución 4: Nodos Especializados para PERT/CPM

**Análisis**: ¿Necesitamos algoritmos Dijkstra/A*?

#### **Respuesta: NO para PERT/CPM básico, SÍ para optimización avanzada**

**PERT/CPM clásico**:
- ✅ No es búsqueda de camino en grafo
- ✅ Es **análisis de red de precedencias**
- ✅ Objetivo: Encontrar **camino más largo** (ruta crítica)
- ✅ Se puede resolver con **algoritmo de camino crítico** (topological sort + longest path)

**Dijkstra/A***:
- ❌ Diseñados para **camino más corto**
- ❌ No directamente aplicables a PERT/CPM
- ✅ Podrían usarse con pesos negativos (hack) pero no es natural

#### **Propuesta: Nodo `CriticalPath`**

```typescript
"critical-path": {
  type: "critical-path",
  category: "pert",
  title: "Critical Path",
  inputs: [
    { name: "tasks", type: PinType.Custom, mode: PinMode.Input }  // Array de tareas
  ],
  outputs: [
    { name: "critical", type: PinType.Custom, mode: PinMode.Output },  // Ruta crítica
    { name: "duration", type: PinType.Number, mode: PinMode.Output }    // Duración total
  ],
  compute: (inputs) => {
    const tasks = inputs[0];  // { id, duration, dependencies: [ids] }
    
    // Algoritmo: Topological Sort + Longest Path
    const sorted = topologicalSort(tasks);
    const longestPaths = calculateLongestPaths(sorted);
    const criticalPath = findCriticalPath(longestPaths);
    const duration = Math.max(...Object.values(longestPaths));
    
    return [criticalPath, duration];
  }
}
```

**Problema**: Este nodo requiere una estructura de datos compleja (array de objetos con dependencias).

#### **Alternativa Pragmática: Nodo `MAX`**

```typescript
"max": {
  type: "max",
  category: "math",
  title: "MAX",
  inputs: [
    { name: "A", type: PinType.Number, mode: PinMode.Input, defaultValue: 0 },
    { name: "B", type: PinType.Number, mode: PinMode.Input, defaultValue: 0 }
  ],
  outputs: [
    { name: "result", type: PinType.Number, mode: PinMode.Output }
  ],
  compute: (inputs) => {
    if (inputs.length > 2) {
      return [Math.max(...inputs.filter(v => v !== undefined && v !== null))];
    }
    return [Math.max(inputs[0] ?? 0, inputs[1] ?? 0)];
  }
}
```

**Uso en PERT/CPM:**
```
RUTA 1: ADD(5+3+8) = 16
RUTA 2: ADD(5+2+6) = 13

MAX(RUTA1, RUTA2) = 16  ← RUTA CRÍTICA
```

**Ventajas:**
- ✅ Simple y directo
- ✅ Compatible con sistema actual
- ✅ No requiere estructura de datos compleja
- ✅ Usuario construye el grafo visualmente

**Desventajas:**
- ❌ Usuario debe construir TODAS las rutas manualmente
- ❌ No automatiza el análisis de dependencias

---

## 🎯 Recomendaciones Finales

### Prioridad 1: Problemas de UX (Críticos)
1. ✅ **Implementar detección de click en conexiones**
2. ✅ **Click derecho para eliminar conexiones**
3. ✅ **Mejorar orden de prioridad: PIN > LINK > NODE**

### Prioridad 2: Funcionalidad (Alta)
4. ✅ **UI para añadir/quitar pins** (Panel de Propiedades)
5. ✅ **Nodo MAX** para PERT/CPM
6. ⏳ **Nodo MIN** (complementario)

### Prioridad 3: Avanzado (Media)
7. ⏳ **Nodo Critical Path** (requiere diseño de estructura de datos)
8. ⏳ **Visualización de ruta crítica** (highlight)
9. ⏳ **Algoritmos de optimización** (Dijkstra/A* para otros casos)

---

## 🚀 Plan de Implementación

### Fase 1: Mejorar UX de Conexiones (HOY)
- [ ] Función `distanceToBezierCurve()`
- [ ] Función `getClosestLink()`
- [ ] Modificar `handleMouseDown()` para detectar conexiones
- [ ] Click derecho elimina conexión
- [ ] Probar con templates existentes

### Fase 2: UI para Pins Dinámicos (HOY)
- [ ] Modificar `PropertiesPanel.ts`
- [ ] Agregar botones +/- para inputs
- [ ] Método `Node.removeLastInput()`
- [ ] Validar que no se eliminen inputs conectados

### Fase 3: Nodos MAX/MIN (HOY)
- [ ] Agregar `max` y `min` a `NodeTypes.ts`
- [ ] Lógica compute() con inputs dinámicos
- [ ] Probar con template PERT/CPM

### Fase 4: Validación (HOY)
- [ ] Probar todos los templates
- [ ] Verificar que conexiones se eliminan correctamente
- [ ] Verificar que pins se añaden/quitan correctamente
- [ ] Documentar cambios

---

## 📊 Análisis de Templates PERT/CPM

### Template Actual (Manual):
```
16 nodos, 14 conexiones
Usuario construye rutas manualmente:
- RUTA BACKEND = ADD + ADD + ADD = 3 nodos
- RUTA FRONTEND = ADD + ADD + ADD = 3 nodos
- COMPARACIÓN = GREATER = 1 nodo
- DISPLAYS = 4 nodos
```

### Con Nodo MAX (Simplificado):
```
14 nodos, 12 conexiones  (2 nodos menos)
- RUTA BACKEND = ADD + ADD + ADD = 3 nodos
- RUTA FRONTEND = ADD + ADD + ADD = 3 nodos
- RUTA CRÍTICA = MAX(BACKEND, FRONTEND) = 1 nodo  ← Nuevo
- DISPLAYS = 3 nodos (1 menos, MAX ya muestra el mayor)
```

**Beneficio**: 12% reducción de complejidad

### Con Nodo CriticalPath (Futuro):
```
8 nodos, 7 conexiones  (50% reducción)
- TASKS = Array de objetos = 1 nodo
- CRITICAL PATH = Análisis automático = 1 nodo
- DISPLAYS = múltiples salidas del nodo CriticalPath
```

**Beneficio**: 50% reducción, pero requiere rediseño significativo

---

## ✅ Conclusión

### Problemas UX:
- **Críticos**: Conexiones no seleccionables, click derecho no funciona
- **Solución**: Implementar detección de bezier + click derecho

### Pins Dinámicos:
- **Actual**: Solo automático por template
- **Necesidad**: UI para añadir manualmente
- **Solución**: Botones +/- en PropertiesPanel

### PERT/CPM:
- **Operadores actuales**: Suficientes para manual
- **Mejora**: Nodo MAX para simplificar
- **Futuro**: Nodo CriticalPath para automatizar

### Dijkstra/A*:
- **NO necesarios** para PERT/CPM básico
- **Útiles** para otros casos (routing, pathfinding)
- **Conclusión**: Posponer hasta caso de uso específico

---

**Siguiente paso**: Implementar Fase 1 (UX de Conexiones)
