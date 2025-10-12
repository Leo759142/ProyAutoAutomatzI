# 📝 Persistencia de Descripciones Personalizadas

## 🎯 Implementación Completa

### 1. **Modelo de Datos** ✅

#### `Node.ts`
```typescript
export class Node {
  // Campo para descripción personalizada
  public customDescription: string | null = null;
  
  get description(): string | undefined {
    // Si hay una descripción personalizada, usarla; sino, usar la del template
    return this.customDescription !== null ? this.customDescription : this.definition.description;
  }
}
```

**Prioridad de Descripción:**
1. `customDescription` (si existe) - Usuario ha personalizado
2. `definition.description` (por defecto) - Descripción del template

---

### 2. **UI - Panel de Propiedades** ✅

#### `PropertiesPanel.ts`

**Renderizado:**
- Campo `<textarea>` editable para la descripción
- Muestra la descripción actual (personalizada o por defecto)
- Placeholder: "Añade una descripción personalizada..."

**Al Guardar (applyChanges):**
```typescript
const descriptionTextarea = document.getElementById('nodeDescriptionTextarea') as HTMLTextAreaElement;
if (descriptionTextarea) {
  const newDescription = descriptionTextarea.value.trim();
  // Si está vacío, resetear a null para usar la descripción por defecto
  this.currentNode.customDescription = newDescription || null;
}
```

---

### 3. **Serialización (Guardar)** ✅

#### `SessionManager.ts` - Auto-guardado cada 10 segundos

**Inclusión de customDescription:**
```typescript
nodes: this.nodeEditor.nodes.map((node, index) => ({
  id: (node as any).id || `node_${index}`,
  type: node.type,
  pos: { x: node.pos.x, y: node.pos.y },
  data: {
    ...(((node as any).value !== undefined) ? { value: (node as any).value } : {}),
    ...(node.customDescription !== null ? { customDescription: node.customDescription } : {})
  }
}))
```

**Resultado JSON:**
```json
{
  "id": 1,
  "type": "add",
  "position": { "x": 0, "y": 0 },
  "data": {
    "value": 42,
    "customDescription": "Esta es mi descripción personalizada"
  }
}
```

---

### 4. **Deserialización (Cargar)** ✅

#### `NodeEditor.ts` - loadWorkflowTemplate()

**Restauración de customDescription:**
```typescript
// Aplicar datos personalizados al nodo
if (nodeData.data) {
  // Valor inicial
  if (nodeData.data.value !== undefined && node.outputs.length > 0) {
    node.outputs[0].value = nodeData.data.value;
  }
  
  // Restaurar descripción personalizada si existe
  if (nodeData.data.customDescription !== undefined) {
    node.customDescription = nodeData.data.customDescription;
    console.log(`✓ Descripción personalizada restaurada`);
  }
  
  // Otras propiedades personalizadas
  for (const key in nodeData.data) {
    if (key !== 'value' && key !== 'customDescription' && nodeData.data.hasOwnProperty(key) && key in node) {
      (node as any)[key] = nodeData.data[key];
    }
  }
}
```

---

### 5. **Sistema de Persistencia** ✅

#### **Redis (Simulado con localStorage)**

**Frecuencia:** Auto-guardado cada **10 segundos** (actualizado de 30s)

**Características:**
- ✅ Cifrado XOR simple (demo)
- ✅ Guarda toda la sesión: nodos, conexiones, vista, zoom
- ✅ Incluye `customDescription` en cada nodo
- ✅ Restaura automáticamente al recargar la página

**Clave localStorage:**
- `redis:canvas_session_[timestamp]_[random]` - Datos cifrados
- `redis:current_session` - Clave de la sesión activa

#### **SQLite (sql.js)**

**Uso:** Templates predefinidos (no incluye descripciones personalizadas)

**Flujo:**
1. Templates predefinidos → Guardados en SQLite al inicio
2. Usuario carga template → Nodos creados sin `customDescription`
3. Usuario edita descripción → `customDescription` asignado al nodo
4. Auto-guardado Redis → Descripción personalizada incluida en JSON
5. Recarga página → Redis restaura con `customDescription`

---

### 6. **Estilos CSS** ✅

```css
.description-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(100, 150, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
}

.description-textarea:focus {
  outline: none;
  border-color: rgba(100, 150, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 8px rgba(100, 150, 255, 0.3);
}
```

---

## 🔄 Flujo Completo de Persistencia

### **Escenario 1: Crear y Personalizar**
1. ✅ Usuario crea nodo "Add"
2. ✅ Doble-click → Panel de Propiedades
3. ✅ Edita descripción: "Suma valores de sensores"
4. ✅ Click "Aplicar" → `node.customDescription = "Suma valores de sensores"`
5. ⏱️ 10 segundos después → SessionManager auto-guarda
6. ✅ Redis guarda JSON con `customDescription`

### **Escenario 2: Recargar Página**
1. ✅ Usuario recarga la página (F5)
2. ✅ SessionManager.loadPreviousSession() ejecuta
3. ✅ RedisService.loadSession() lee localStorage
4. ✅ NodeEditor.loadWorkflowTemplate() crea nodos
5. ✅ `customDescription` restaurado desde `nodeData.data.customDescription`
6. ✅ Usuario ve su descripción personalizada intacta

### **Escenario 3: Cargar Template Predefinido**
1. ✅ Usuario selecciona template "Suma Avanzada"
2. ✅ Template cargado desde SQLite (sin `customDescription`)
3. ✅ Nodos creados con descripción por defecto
4. ✅ Usuario puede personalizar cada nodo
5. ✅ Personalizaciones guardadas en Redis automáticamente

---

## 📊 Estructura de Datos Persistidos

### **SessionData (Redis)**
```typescript
{
  nodes: [
    {
      id: 1,
      type: "add",
      pos: { x: 0, y: 0 },
      data: {
        customDescription: "Mi descripción personalizada"
      }
    },
    {
      id: 2,
      type: "number",
      pos: { x: -5, y: 0 },
      data: {
        value: 42
      }
    }
  ],
  connections: [...],
  viewOffset: { x: 0, y: 0 },
  scale: 1.0,
  timestamp: 1697123456789
}
```

### **WorkflowTemplate (SQLite)**
```sql
CREATE TABLE workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT NOT NULL,      -- JSON string con nodos
    connections_data TEXT NOT NULL -- JSON string con conexiones
);
```

**Nota:** SQLite almacena templates predefinidos. Las descripciones personalizadas (`customDescription`) solo existen en la sesión Redis del usuario.

---

## ✅ Verificación de Implementación

### **Checklist:**
- [x] Campo `customDescription` añadido a clase Node
- [x] Getter `description` con prioridad a customDescription
- [x] Textarea editable en PropertiesPanel
- [x] Guardado de customDescription en applyChanges()
- [x] Serialización en SessionManager (data.customDescription)
- [x] Deserialización en NodeEditor.loadWorkflowTemplate()
- [x] Auto-guardado cada 10 segundos
- [x] Estilos CSS profesionales
- [x] Logs de auditoría para debugging

---

## 🧪 Pruebas Recomendadas

### **Test 1: Persistencia Básica**
1. Crear nodo "Add"
2. Editar descripción a "Test personalizado"
3. Esperar 10 segundos
4. Recargar página (F5)
5. ✅ Verificar que la descripción persiste

### **Test 2: Múltiples Nodos**
1. Crear 3 nodos diferentes
2. Personalizar descripción de cada uno
3. Esperar 10 segundos
4. Recargar página
5. ✅ Verificar que todas las descripciones persisten

### **Test 3: Resetear a Default**
1. Personalizar descripción de un nodo
2. Abrir Panel de Propiedades
3. Borrar todo el texto del textarea
4. Aplicar cambios
5. ✅ Verificar que vuelve a mostrar descripción por defecto

### **Test 4: Templates Predefinidos**
1. Cargar template desde dropdown
2. ✅ Verificar que muestra descripciones por defecto
3. Personalizar un nodo
4. Esperar 10 segundos
5. Recargar página
6. ✅ Verificar que solo el nodo personalizado mantiene su descripción

---

## 🔐 Seguridad y Rendimiento

### **Cifrado Redis:**
- Cifrado XOR simple (demo)
- En producción: usar `crypto.subtle` o librerías como `crypto-js`

### **Optimizaciones:**
- Auto-guardado solo si hay cambios (`nodes.length > 0`)
- Serialización selectiva (solo campos necesarios)
- localStorage tiene límite de ~5-10MB (suficiente para workflows complejos)

### **Limpieza:**
```typescript
SessionManager.getInstance().clearSession(); // Eliminar sesión manualmente
```

---

## 📝 Notas Técnicas

### **¿Por qué customDescription y no sobrescribir definition.description?**
- ✅ Preserva la descripción original del template
- ✅ Permite resetear a default fácilmente (customDescription = null)
- ✅ Separación clara entre "definición de tipo" y "personalización de instancia"

### **¿Por qué Redis simulado y no SQLite para sesiones?**
- ✅ Redis es estándar para sesiones temporales
- ✅ Auto-guardado frecuente (10s) sin bloquear UI
- ✅ SQLite es mejor para datos estructurados permanentes (templates)

### **¿Cómo manejar migración de datos?**
Si cambias la estructura de SessionData:
1. Incrementar versión en RedisService
2. Añadir lógica de migración en loadSession()
3. Ejemplo: `if (!sessionData.version) { /* migrar */ }`

---

## 🚀 Próximas Mejoras Posibles

1. **Exportar/Importar Workflows con Descripciones**
   - Botón "Exportar JSON" que incluya `customDescription`
   - Botón "Importar JSON" que restaure personalizaciones

2. **Historial de Cambios**
   - Guardar versiones anteriores en Redis
   - Botón "Deshacer" para restaurar

3. **Sincronización Multi-Usuario**
   - Redis real con servidor backend
   - WebSockets para colaboración en tiempo real

4. **Búsqueda por Descripción**
   - Buscar nodos por contenido de descripción personalizada
   - Filtros en la UI

---

## 📚 Referencias

- **Archivos Modificados:**
  - `src/core/Node.ts` - Modelo de datos
  - `src/ui/PropertiesPanel.ts` - UI de edición
  - `src/services/SessionManager.ts` - Serialización
  - `src/core/NodeEditor.ts` - Deserialización
  - `src/style.css` - Estilos

- **Documentación Relacionada:**
  - `TEMPLATES_SQLITE.md` - Estructura de templates
  - `RESUMEN_EJECUTIVO.md` - Sistema general

---

**Última Actualización:** 2025-10-12  
**Versión Sistema:** 2.0  
**Estado:** ✅ Implementado y Funcional
