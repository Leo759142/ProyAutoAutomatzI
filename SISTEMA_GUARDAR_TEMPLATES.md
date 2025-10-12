# 📁 Sistema de Guardado de Templates

## 🎯 Resumen

El sistema de guardado se ha separado profesionalmente en tres funcionalidades distintas:

1. **Guardar** - Sobrescribe el template seleccionado
2. **Guardar como** - Crea un nuevo template
3. **Auto-guardado** - Persistencia automática (Redis) cada 10 segundos

---

## 🔹 Guardar (Sobrescribir)

### Funcionalidad
- Sobrescribe el template actualmente seleccionado en el dropdown
- Mantiene el nombre y descripción original del template
- Actualiza nodos, conexiones y datos personalizados

### Comportamiento
```
Usuario → Click "Guardar" → Validación de selección → Actualización en DB → Confirmación
```

### Validaciones
- ✅ Verifica que haya un template seleccionado
- ✅ Alerta si no hay selección: "Selecciona un template para sobrescribir"
- ✅ Redirige a "Guardar como" para crear nuevos

### Implementación
**Botón HTML:**
```html
<button id="saveTemplate" title="Guardar cambios en el template actual">
  <svg>...</svg>
  <span>Guardar</span>
</button>
```

**Lógica (main.ts):**
```typescript
saveTemplateBtn.addEventListener('click', async () => {
  const id = Number(templateSelect.value);
  if (!id) {
    alert('⚠️ Selecciona un template para sobrescribir...');
    return;
  }
  const template = await dbService.loadTemplate(id);
  // Serializar nodos y conexiones
  const updatedTemplate = { ...template, nodes_data, connections_data };
  await dbService.saveTemplate(updatedTemplate);
  alert(`✅ Cambios guardados en "${template.name}"!`);
});
```

---

## 🔹 Guardar como (Nuevo)

### Funcionalidad
- Crea un nuevo template con nombre y descripción personalizados
- Serializa el estado actual del canvas
- Añade el nuevo template al dropdown automáticamente

### Comportamiento
```
Usuario → Click "Guardar como" → Prompt nombre → Prompt descripción → Guardado en DB → Actualización UI
```

### Prompts
1. **Nombre**: "Nombre del nuevo template:" (default: "Mi Workflow")
2. **Descripción**: "Descripción (opcional):" (default: "Template personalizado")

### Implementación
**Botón HTML:**
```html
<button id="saveAsTemplate" title="Guardar como nuevo template">
  <svg fill="#43A047">...</svg>
  <span>Guardar como</span>
</button>
```

**Lógica (main.ts):**
```typescript
saveAsTemplateBtn.addEventListener('click', async () => {
  const name = prompt('Nombre del nuevo template:', 'Mi Workflow');
  if (!name) return;
  const description = prompt('Descripción (opcional):', '');
  
  // Serializar nodos con customTitle y customDescription
  const nodesData = canvasUI.editor.nodes.map((node, index) => ({
    id: index + 1,
    type: node.type,
    position: { x: node.pos.x, y: node.pos.y },
    data: {
      ...(node.customTitle !== null ? { customTitle: node.customTitle } : {}),
      ...(node.customDescription !== null ? { customDescription: node.customDescription } : {})
    }
  }));
  
  const template = { name, description, nodes_data, connections_data };
  await dbService.saveTemplate(template);
  alert(`✅ Nuevo template "${name}" guardado exitosamente!`);
});
```

---

## 🔹 Auto-guardado (Persistencia)

### Funcionalidad
- Guarda automáticamente el estado del canvas cada 10 segundos
- Usa Redis (simulado en localStorage) con cifrado XOR
- Persiste customTitle y customDescription de cada nodo
- NO afecta los templates guardados manualmente

### Implementación
**SessionManager.ts:**
```typescript
private autoSaveInterval = 10000; // 10 segundos

saveCurrentSession() {
  const sessionData = {
    nodes: this.nodeEditor.nodes.map(node => ({
      type: node.type,
      position: { x: node.pos.x, y: node.pos.y },
      data: {
        value: node.outputs[0]?.value,
        customTitle: node.customTitle,
        customDescription: node.customDescription
      }
    })),
    connections: this.nodeEditor.links.map(...)
  };
  
  this.redis.set('current_session', JSON.stringify(sessionData));
}
```

---

## 📊 Datos Serializados

### Estructura de Nodo
```json
{
  "id": 1,
  "type": "number",
  "position": { "x": 100, "y": 200 },
  "data": {
    "value": 42,
    "customTitle": "Mi Número Mágico",
    "customDescription": "Este es un valor especial usado en..."
  }
}
```

### Estructura de Conexión
```json
{
  "from": { "node": 1, "pin": 0 },
  "to": { "node": 2, "pin": 0 }
}
```

### Template Completo
```json
{
  "id": 5,
  "name": "Calculadora Avanzada",
  "description": "Sistema de cálculo con validaciones",
  "nodes_data": "[...]",
  "connections_data": "[...]"
}
```

---

## 🎨 Estilos CSS

### Botón Guardar (Azul)
```css
#saveTemplate {
  background-color: #2196F3;
  color: white;
}

#saveTemplate:hover:not(:disabled) {
  background-color: #1976D2;
}
```

### Botón Guardar como (Verde)
```css
#saveAsTemplate {
  background-color: #2ecc71;
  color: white;
}

#saveAsTemplate:hover:not(:disabled) {
  background-color: #249383;
}
```

---

## ✅ Flujo Completo

### Escenario 1: Modificar template existente
1. Usuario carga "Tutorial Básico" desde dropdown
2. Añade/modifica nodos en canvas
3. Click "Guardar" → Sobrescribe "Tutorial Básico"
4. Confirmación: ✅ Cambios guardados en "Tutorial Básico"!

### Escenario 2: Crear template desde cero
1. Usuario crea workflow nuevo con nodos
2. Click "Guardar como" 
3. Ingresa nombre: "Mi Sistema"
4. Ingresa descripción: "Sistema personalizado"
5. Confirmación: ✅ Nuevo template "Mi Sistema" guardado exitosamente!
6. Aparece en el dropdown

### Escenario 3: Auto-guardado silencioso
1. Usuario trabaja en canvas
2. Cada 10 segundos: SessionManager.saveCurrentSession()
3. Estado guardado en Redis (localStorage cifrado)
4. Al recargar página: Estado restaurado automáticamente
5. No afecta templates manuales

---

## 🔍 Verificaciones

### ✅ Checklist de funcionalidad
- [x] Botón "Guardar" sobrescribe template seleccionado
- [x] Validación de selección antes de guardar
- [x] Botón "Guardar como" crea nuevos templates
- [x] Prompts para nombre y descripción
- [x] Serialización de customTitle y customDescription
- [x] Auto-guardado cada 10 segundos en Redis
- [x] Restauración automática al recargar
- [x] Actualización del dropdown tras guardar
- [x] Estilos CSS diferenciados (azul vs verde)
- [x] Sin errores TypeScript

### 🎯 Próximos pasos sugeridos
1. ✅ Implementado: Separación Guardar/Guardar como
2. ✅ Implementado: Títulos y descripciones editables
3. ⏳ Pendiente: Exportar/Importar templates a JSON
4. ⏳ Pendiente: Compartir templates entre usuarios
5. ⏳ Pendiente: Versioning de templates

---

## 📝 Notas Técnicas

### Persistencia en capas
```
Canvas State → SessionManager (10s) → Redis (localStorage cifrado)
              ↓
              DatabaseService → SQLite (templates manuales)
```

### Diferencias clave
| Característica | Guardar | Guardar como | Auto-guardado |
|---------------|---------|--------------|---------------|
| **Acción** | Manual | Manual | Automático |
| **Frecuencia** | On-demand | On-demand | Cada 10s |
| **Destino** | SQLite (actualiza) | SQLite (nuevo) | Redis (sesión) |
| **Prompt** | No | Sí (nombre/desc) | No |
| **Validación** | Template seleccionado | Nombre válido | Ninguna |

---

## 🚀 Resumen Ejecutivo

**Antes:** Un solo botón "Guardar" que siempre creaba templates nuevos, sin distinción clara entre actualizar y crear.

**Ahora:** Sistema profesional de tres niveles:
1. **Guardar**: Actualización rápida de templates existentes
2. **Guardar como**: Creación explícita de nuevos templates
3. **Auto-guardado**: Respaldo silencioso y automático

**Beneficios:**
- ✅ Flujo de trabajo más intuitivo
- ✅ Prevención de creación accidental de duplicados
- ✅ Respaldo automático sin intervención del usuario
- ✅ Separación clara de responsabilidades
- ✅ UX similar a software profesional (Photoshop, VS Code, etc.)
