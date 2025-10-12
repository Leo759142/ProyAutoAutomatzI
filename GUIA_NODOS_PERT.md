# 📊 Guía de Nodos PERT/CPM

## 🎯 Descripción

Se han implementado **dos nuevos tipos de nodos** especializados para problemas de planificación de proyectos usando PERT/CPM (Program Evaluation and Review Technique / Critical Path Method).

---

## 🆕 Nuevos Tipos de Nodos

### 1. **Nodo `task` (Actividad)**

**Propósito**: Representa una actividad o tarea dentro de un proyecto.

**Características**:
- ✅ **ES UN NODO** - Participa en el grafo y puede conectarse con otros nodos
- **Entrada**: `predecessor` - Para conectar dependencias
- **Salida**: `duration` - Duración de la actividad en días
- **Valor configurable**: La duración se configura en el output (por defecto 1 día)
- **Visualización especial**:
  - Muestra `⏱ Xd` con la duración
  - Cuando se ejecuta PERT/CPM, muestra ES/EF/LS/LF
  - Marca como **★ CRÍTICO** si pertenece a la ruta crítica
  - Muestra **Slack: Xd** si tiene holgura

**Ejemplo de uso**:
```
Nodo A (task): Diseño → duration: 5 días
Nodo B (task): Backend → duration: 3 días (depende de A)
```

**Propiedades importantes**:
- `customTitle`: Nombre de la actividad (ej: "A: Diseño")
- `customDescription`: Descripción detallada (ej: "Diseño arquitectónico del sistema (5 días)")
- `outputs[0].value`: Duración en días

---

### 2. **NO-Nodo `info-panel` (Panel de Información)**

**Propósito**: Mostrar la descripción general del problema de forma visual y destacada.

**Características**:
- ❌ **NO ES UN NODO** - No participa en el grafo de ejecución
- No tiene entradas ni salidas
- No afecta los cálculos ni conexiones
- **Posicionamiento libre**: Se coloca alejado del grafo principal
- **Renderizado especial**:
  - Panel grande y destacado (5.0 x 3.5 unidades)
  - Fondo semi-transparente con borde azul
  - Título: "ℹ️ INFORMACIÓN DEL PROBLEMA"
  - Texto dividido automáticamente en líneas
  - Soporta hasta 10 líneas visibles

**Ejemplo de uso**:
```javascript
{
  id: 0,
  type: 'info-panel',
  position: { x: -15, y: -8 }, // Alejado del grafo
  data: {
    customDescription: '🎯 PROYECTO: Sistema E-Commerce\n\nObjetivo: Calcular ruta crítica...'
  }
}
```

**Posicionamiento recomendado**:
- **x: -15 a -20** (izquierda del grafo)
- **y: -8 a -10** (arriba del grafo)
- Evitar superposición con nodos del proyecto

---

## 🔧 Cómo Usar

### Agregar Nodos desde la UI

1. **Desplegar el selector** de tipos de nodo en la toolbar
2. Buscar el grupo **"📊 PERT/CPM"**
3. Seleccionar:
   - `⏱ Task (Actividad)` - Para actividades del proyecto
   - `ℹ️ Info Panel (NO-nodo)` - Para descripción del problema

### Configurar un Nodo Task

1. Agregar el nodo al canvas
2. **Editar propiedades**:
   - `customTitle`: Nombre corto (ej: "A: Diseño")
   - `customDescription`: Descripción detallada
   - `outputs[0].value`: Duración en días
3. **Conectar dependencias**:
   - Conectar la salida del predecesor al input `predecessor` del sucesor
   - Ejemplo: `A.duration → B.predecessor` (B depende de A)

### Configurar un Info-Panel

1. Agregar el nodo fuera del área del grafo
2. **Editar `customDescription`** con el texto del problema:
   ```
   🎯 PROYECTO: [Nombre]
   
   DESCRIPCIÓN: [Descripción detallada]
   
   ACTIVIDADES:
   • A: [Actividad 1] (X días)
   • B: [Actividad 2] (Y días)
   
   OBJETIVO: [Meta del análisis]
   ```

---

## 📊 Algoritmo PERT/CPM

### Ejecución

1. Crear el grafo con nodos `task`
2. Conectar las dependencias
3. Agregar `info-panel` con la descripción
4. Seleccionar **"📊 PERT/CPM (Ruta crítica)"** en el selector de algoritmos
5. Hacer clic en **"▶ Ejecutar"**

### Resultados

El algoritmo calcula automáticamente:

- **ES (Early Start)**: Inicio más temprano posible
- **EF (Early Finish)**: Fin más temprano posible
- **LS (Late Start)**: Inicio más tardío permitido
- **LF (Late Finish)**: Fin más tardío permitido
- **Slack (Holgura)**: `LS - ES` (tiempo disponible sin retrasar el proyecto)
- **Ruta Crítica**: Secuencia de actividades con slack = 0

### Visualización

Después de ejecutar PERT/CPM, cada nodo `task` mostrará:

```
⏱ 5d                 ← Duración
ES:0 EF:5            ← Tiempos tempranos
LS:0 LF:5            ← Tiempos tardíos
★ CRÍTICO           ← Si slack = 0
```

O si tiene holgura:

```
⏱ 2d
ES:5 EF:7
LS:8 LF:10
Slack: 3d           ← Puede retrasarse 3 días
```

---

## 🎨 Colores y Estilo

### Nodo Task
- **Color principal**: Cyan `#00BCD4`
- **Fuente duración**: Bold 0.22px
- **Datos PERT**: 0.11px
- **Crítico**: Texto rojo `#FF5050`
- **Slack**: Verde `#4CAF50`

### Info-Panel
- **Fondo**: `rgba(40, 40, 60, 0.95)` (casi opaco)
- **Borde**: Azul `#6496FF` (grosor 0.08)
- **Título**: Cyan bold 0.35px
- **Texto**: Blanco 0.16px con transparencia 0.9
- **Ancho**: 5.0 unidades
- **Alto**: 3.5 unidades

---

## 📦 Templates Incluidos

### 1. **📊 PERT/CPM: Proyecto Software**

**Problema**: Desarrollar plataforma de e-commerce completa

**Actividades**:
- A: Diseño (5d)
- B: Backend (3d) → requiere A
- C: Frontend (2d) → requiere A
- D: Base Datos (8d) → requiere B
- E: Componentes (6d) → requiere C
- F: Testing (4d) → requiere MAX(D, E)
- G: Deploy (2d) → requiere F

**Ruta Crítica**: A → B → D → F → G = **22 días**

### 2. **🏗️ PERT/CPM: Construcción Casa**

**Problema**: Construcción de vivienda residencial 120m²

**Actividades**:
- A: Planos (7d) - puede iniciar en paralelo
- B: Cimientos (10d) - puede iniciar en paralelo
- C: Estructura (12d) → requiere B
- D: Muros (8d) → requiere C
- E: Techo (6d) → requiere D
- F: Eléctrica (5d) → requiere E
- G: Plomería (4d) → requiere E
- H: Acabados (10d) → requiere MAX(F, G)

**Ruta Crítica**: B → C → D → E → F → H = **50 días**

---

## 🚀 Ventajas

### Antes (nodos matemáticos)
❌ Usaba `add`, `greater`, `multiply` para simular PERT  
❌ Difícil de entender la semántica del proyecto  
❌ Cálculos manuales de rutas  
❌ Descripción del problema oculta o en consola  

### Ahora (nodos especializados)
✅ Nodos `task` representan actividades reales  
✅ Semántica clara y profesional  
✅ Cálculo automático con algoritmo PERT/CPM  
✅ Visualización en tiempo real de ES/EF/LS/LF  
✅ Panel visible con descripción del problema  
✅ Detección automática de ruta crítica  

---

## 🔍 Consideraciones Técnicas

### Filtrado en Grafo

- El algoritmo `buildWeightedGraph()` **ignora** nodos `info-panel`
- No se crean aristas desde/hacia `info-panel`
- Los `info-panel` no afectan los cálculos de PERT

### Peso de Aristas

Para nodos `task`:
```typescript
weight = task.outputs[0].value  // Duración de la actividad
```

Para otros nodos:
```typescript
weight = node.outputs[0].value || 1  // Valor o 1 por defecto
```

### Almacenamiento de Resultados

Los resultados se guardan en `node.userData.pertData`:
```typescript
{
  ES: number,
  EF: number,
  LS: number,
  LF: number,
  slack: number,
  isCritical: boolean
}
```

---

## 📝 Ejemplo Completo

```typescript
// INFO-PANEL (NO-nodo)
{
  id: 0,
  type: 'info-panel',
  position: { x: -15, y: -8 },
  data: {
    customDescription: 'PROYECTO: Desarrollo App Móvil\n\nObjetivo: Calcular tiempo mínimo...'
  }
}

// ACTIVIDADES (nodos task)
{
  id: 1,
  type: 'task',
  position: { x: -10, y: 0 },
  data: {
    value: 5,
    customTitle: 'A: Diseño',
    customDescription: 'Diseño UX/UI de la aplicación (5 días)'
  }
},
{
  id: 2,
  type: 'task',
  position: { x: -5, y: 0 },
  data: {
    value: 8,
    customTitle: 'B: Desarrollo',
    customDescription: 'Desarrollo de funcionalidades (8 días)'
  }
}

// CONEXIONES
{ from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } }  // A → B
```

---

## 🎯 Próximos Pasos

1. ✅ Nodos `task` e `info-panel` implementados
2. ✅ Templates actualizados con nueva estructura
3. ✅ Algoritmo PERT/CPM adaptado
4. ✅ Visualización automática de datos PERT
5. 🔲 Panel flotante con tabla de resultados (futuro)
6. 🔲 Highlighting en ejecución paso a paso (futuro)
7. 🔲 Exportar resultados a CSV/PDF (futuro)

---

## 📚 Referencias

- **PERT**: Program Evaluation and Review Technique
- **CPM**: Critical Path Method
- **Forward Pass**: Calcular ES y EF
- **Backward Pass**: Calcular LS y LF
- **Slack**: Holgura = LS - ES = LF - EF
- **Ruta Crítica**: Camino con slack = 0 (no puede retrasarse)

---

**Fecha**: 2025-10-12  
**Versión**: 1.0.0  
**Autor**: GitHub Copilot
