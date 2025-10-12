# 📄 Estructura de Templates para SQLite

## 🎯 Formato de Almacenamiento

Los templates se guardan en SQLite con la siguiente estructura:

### Tabla: `workflow_templates`

```sql
CREATE TABLE workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT,           -- JSON stringificado
    connections_data TEXT,     -- JSON stringificado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📦 Formato de `nodes_data`

El campo `nodes_data` debe ser un **string JSON** que contenga un array de objetos de nodo:

```typescript
JSON.stringify([
  {
    id: 1,                              // ID único del nodo (número entero)
    type: 'number',                     // Tipo de nodo (debe existir en NodeTypes)
    position: { x: -10, y: 0 },        // Posición en coordenadas mundo
    data: {                             // Datos opcionales
      value: 42                         // Valor inicial (si aplica)
    }
  },
  {
    id: 2,
    type: 'display',
    position: { x: 10, y: 0 }
  }
  // ... más nodos
])
```

### Campos obligatorios:
- ✅ `id`: Número entero único
- ✅ `type`: String que corresponde a una clave en `NodeTypes`
- ✅ `position`: Objeto con `x` e `y` numéricos

### Campos opcionales:
- `data`: Objeto con propiedades personalizadas del nodo
- `data.value`: Valor inicial del primer output (común en nodos input)

## 🔗 Formato de `connections_data`

El campo `connections_data` debe ser un **string JSON** que contenga un array de objetos de conexión:

```typescript
JSON.stringify([
  {
    from: {
      node: 1,    // ID del nodo origen
      pin: 0      // Índice del pin de salida (output)
    },
    to: {
      node: 2,    // ID del nodo destino
      pin: 0      // Índice del pin de entrada (input)
    }
  }
  // ... más conexiones
])
```

### Campos obligatorios:
- ✅ `from.node`: ID del nodo origen (debe existir en nodes_data)
- ✅ `from.pin`: Índice del output pin (≥0, <outputs.length)
- ✅ `to.node`: ID del nodo destino (debe existir en nodes_data)
- ✅ `to.pin`: Índice del input pin (≥0, <inputs.length)

## ✅ Validaciones Automáticas

Al cargar un template, el sistema valida:

1. **Estructura JSON**: Que nodes_data y connections_data sean JSON válido
2. **IDs únicos**: Que no haya IDs de nodo duplicados
3. **Tipos válidos**: Que todos los tipos de nodo existan en `NodeTypes`
4. **Posiciones válidas**: Que las posiciones sean números
5. **Referencias válidas**: Que las conexiones referencien nodos existentes
6. **Pins válidos**: Que los índices de pins estén dentro del rango

## 📊 Ejemplo Completo

```typescript
{
  name: '🧮 Suma Simple',
  description: 'Suma dos números',
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
}
```

## 🔧 Proceso de Carga

1. **Parse JSON**: Convertir strings a objetos JavaScript
2. **Validar estructura**: Verificar que todos los campos obligatorios existen
3. **Crear nodos**: Llamar a `Node.create()` para cada nodo
4. **Mapear IDs**: Construir mapa de ID → instancia de nodo
5. **Crear conexiones**: Llamar a `onConnect()` para cada conexión válida
6. **Centrar vista**: Ajustar viewOffset y zoom para mostrar todos los nodos
7. **Ejecutar una vez**: Llamar a `computeAll()` para inicializar valores

## 🐛 Errores Comunes

### ❌ Error: "No se encontró definición para el tipo de nodo"
**Causa**: El `type` del nodo no existe en `NodeTypes`
**Solución**: Verificar que el tipo esté registrado en `src/core/NodeTypes.ts`

### ❌ Error: "Nodo origen ID=X no encontrado en el mapa"
**Causa**: La conexión referencia un nodo que no se creó
**Solución**: 
- Verificar que el nodo existe en `nodes_data`
- Verificar que el tipo del nodo es válido
- Verificar que el ID coincide exactamente

### ❌ Error: "Pin de salida X no existe en nodo Y"
**Causa**: El índice del pin es mayor que el número de outputs del nodo
**Solución**: Verificar la definición del nodo en `NodeTypes` y ajustar el índice

### ❌ Error: "Pin de entrada X no existe en nodo Y"
**Causa**: El índice del pin es mayor que el número de inputs del nodo
**Solución**: Verificar la definición del nodo en `NodeTypes` y ajustar el índice

## 🔍 Herramientas de Depuración

### En consola del navegador:

```javascript
// Validar todos los templates
validateTemplates()

// Ver tipos de nodos disponibles
console.log(Object.keys(NodeTypes))

// Ver un template específico
const template = await dbService.loadTemplate(1)
console.log(JSON.parse(template.nodes_data))
console.log(JSON.parse(template.connections_data))
```

## 📝 Mejores Prácticas

1. **IDs secuenciales**: Usa IDs consecutivos (1, 2, 3, ...) para facilitar depuración
2. **Nombres descriptivos**: Usa nombres y descripciones claros para los templates
3. **Coordenadas razonables**: Mantén las coordenadas en el rango -10 a 10 para mejor visualización
4. **Testing individual**: Prueba cada template después de crearlo
5. **Documentación**: Agrega comentarios explicativos en templates complejos

## 🚀 Exportar/Importar Templates

### Exportar un template a JSON:
```javascript
const template = await dbService.loadTemplate(1)
const json = JSON.stringify(template, null, 2)
console.log(json)
// Copiar y pegar en un archivo .json
```

### Importar un template desde JSON:
```javascript
const templateData = { /* pegar JSON aquí */ }
await dbService.saveTemplate(templateData)
```

---

**Última actualización**: 12 de octubre de 2025
