# 🚀 Guía Rápida: Uso de Templates

## ⚠️ IMPORTANTE - Primera Vez Después de la Actualización

Si los templates **NO cargan correctamente**, sigue estos pasos:

### 🔄 Reset Database (Solo una vez)
```
1. Busca el botón "🔄 Reset DB" en el toolbar (segunda fila, izquierda)
2. Click en el botón
3. Confirma la advertencia
4. ✅ ¡Listo! Los templates ahora funcionarán correctamente
```

**Nota**: Esto eliminará templates personalizados guardados, pero restaurará los templates por defecto.

---

## 📚 Operaciones con Templates

### 1️⃣ Cargar un Template Existente
```
┌─────────────────────────────────────┐
│ 📁 Template ▼                       │  ← Dropdown con templates disponibles
└─────────────────────────────────────┘
         ↓ Seleccionar template
┌─────────────────────────────────────┐
│ [📥 Cargar]                         │  ← Click aquí
└─────────────────────────────────────┘
```

**Resultado**: El canvas se llena con los nodos del template seleccionado.

---

### 2️⃣ Modificar y Guardar Template Existente
```
1. Cargar template (paso 1)
2. Modificar nodos en el canvas
   - Mover nodos
   - Cambiar valores
   - Conectar/desconectar
   - Editar descripciones
3. Click en [💾 Guardar]
```

**Resultado**: Los cambios se guardan en el template original (no crea duplicado).

---

### 3️⃣ Crear Nuevo Template
```
1. Diseña tu workflow en el canvas
2. Click en [💾 Guardar Como]
3. Ingresa nombre: "Mi Template"
4. Ingresa descripción (opcional)
5. ✅ Confirmar
```

**Resultado**: Se crea un nuevo template que aparecerá en el dropdown.

---

### 4️⃣ Borrar Template
```
⚠️ NO IMPLEMENTADO AÚN
Actualmente solo se puede resetear toda la DB con "Reset DB"
```

---

## 🎯 Templates Por Defecto Disponibles

### 1. Tutorial Básico
**Descripción**: Introducción al editor de nodos con operaciones básicas  
**Problema**: Aprende a crear y conectar nodos, realizar operaciones matemáticas simples  
**Nodos**: 
- Number Input (2 nodos)
- Add (suma)
- Display (mostrar resultado)

---

### 2. Calculadora Simple
**Descripción**: Calculadora con múltiples operaciones matemáticas  
**Problema**: Sistema de cálculo con suma, resta, multiplicación y división  
**Nodos**:
- Number Input (4 nodos)
- Add, Subtract, Multiply, Divide
- Display (4 resultados)

---

### 3. Análisis PERT/CPM
**Descripción**: Gestión de proyectos con análisis de ruta crítica  
**Problema**: Determinar ruta crítica en proyectos con actividades interdependientes  
**Nodos**:
- Inicio del Proyecto
- Múltiples actividades con duraciones
- Punto Final
- Cálculo automático de ruta crítica

---

## 🔍 Analizar Rutas Óptimas

### Botón: 🔍 Analizar Rutas
**Ubicación**: Segunda fila del toolbar, izquierda

**Funcionalidad**:
```
Analiza el grafo actual y determina:
✅ Número de componentes conexas
✅ Número de nodos aislados (uninodos)
✅ Nodos fuente (sin entradas)
✅ Nodos sumidero (sin salidas)
✅ Si es posible calcular rutas óptimas
```

**Cuándo usarlo**:
- Antes de ejecutar algoritmos de ruta óptima
- Para validar estructura del grafo
- Para detectar nodos desconectados

---

## 🎨 Campos de Descripción

### A nivel de Template:
**problemDescription**: Descripción general del problema que resuelve el template

### A nivel de Nodo:
**customDescription**: Descripción específica del rol de cada nodo en el workflow

**Dónde verlas**:
- En el panel de propiedades (al seleccionar nodo)
- En el canvas (texto pequeño bajo el nodo)
- En el tooltip al cargar template

---

## 🛠️ Troubleshooting

### ❌ "Los templates no aparecen en el dropdown"
**Solución**: Click en "🔄 Reset DB"

### ❌ "Al cargar template, los nodos aparecen vacíos"
**Solución**: Click en "🔄 Reset DB"

### ❌ "Al guardar template, se crea duplicado"
**Solución**: Esto está corregido. Usa "💾 Guardar" para actualizar, "💾 Guardar Como" para crear nuevo.

### ❌ "El botón Guardar no hace nada"
**Solución**: Asegúrate de tener un template seleccionado en el dropdown antes de guardar.

### ❌ "Consola muestra errores de SQL"
**Solución**: Click en "🔄 Reset DB" y recarga la página.

---

## 📊 Diferencia entre Botones

| Botón | Acción | Cuándo usar |
|-------|--------|-------------|
| **💾 Guardar** | UPDATE template existente | Modificaste un template cargado |
| **💾 Guardar Como** | CREATE nuevo template | Quieres crear template desde cero |
| **📥 Cargar** | READ template seleccionado | Quieres trabajar con template existente |
| **🔄 Reset DB** | Reiniciar base de datos | Templates no funcionan correctamente |

---

## 🎓 Workflow Recomendado

### Para Aprender:
```
1. Cargar "Tutorial Básico"
2. Explorar los nodos y conexiones
3. Modificar valores
4. Click en Play ▶️ para ver ejecución
5. Guardar cambios con "Guardar"
```

### Para Crear Proyecto:
```
1. Click en "Limpiar" para empezar de cero
2. Agregar nodos con botón "➕ Nodo"
3. Conectar nodos arrastrando desde pins
4. Probar con Play ▶️
5. Guardar con "Guardar Como"
6. Darle nombre descriptivo
```

### Para Analizar Grafos:
```
1. Cargar o crear tu grafo
2. Click en "🔍 Analizar Rutas"
3. Revisar información de componentes
4. Ajustar si hay nodos desconectados
5. Volver a analizar
```

---

## 💡 Tips y Trucos

### ✅ Buenas Prácticas:
- Nombra tus templates descriptivamente
- Agrega descripciones personalizadas a los nodos clave
- Usa "Guardar Como" para crear variaciones de un template
- Analiza rutas antes de ejecutar algoritmos complejos

### ⚠️ Evitar:
- No uses "Guardar" sin tener template seleccionado
- No elimines todos los nodos antes de guardar (guarda workflow vacío)
- No olvides conectar los nodos antes de ejecutar

---

## 📞 Ayuda Adicional

Si encuentras problemas no listados aquí:
1. Abre la consola del navegador (F12)
2. Busca mensajes de error en rojo
3. Revisa `CORRECCION_TEMPLATES_CRUD.md` para detalles técnicos

---

**Última actualización**: 2025  
**Versión**: Post-CRUD Fix  
**Status**: ✅ Sistema CRUD Funcional
