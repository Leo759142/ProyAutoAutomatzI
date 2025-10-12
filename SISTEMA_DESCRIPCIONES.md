# 📝 Sistema de Descripciones en Nodos

## 🎯 Resumen

El sistema de descripciones permite agregar metadatos informativos a cada nodo, distribuidos en tres niveles:

1. **Título** - Identificador principal del nodo (editable)
2. **Subtítulo** - Información breve del tipo/función (estático, del template)
3. **Descripción** - Texto explicativo largo (editable)

---

## 🔹 Título del Nodo

### Ubicación
- **Canvas**: Parte superior del nodo (fuente grande, bold)
- **Panel de Propiedades**: Input de texto editable

### Características
- ✅ Editable por el usuario
- ✅ Valor por defecto: `definition.title` del NodeType
- ✅ Personalizable con `customTitle`
- ✅ Persiste en auto-guardado y templates

### Implementación
**Node.ts:**
```typescript
public customTitle: string | null = null;

get title(): string {
  // Si hay título personalizado, usarlo; sino, usar el del template
  return this.customTitle !== null ? this.customTitle : this.definition.title;
}
```

**PropertiesPanel.ts:**
```typescript
const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.id = 'nodeTitleInput';
titleInput.className = 'title-input';
titleInput.placeholder = 'Título del nodo';
titleInput.value = this.currentNode.title;
```

**Renderizado (NodeEditor.ts):**
```typescript
ctx.fillStyle = 'white';
ctx.font = "bold 0.28px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
ctx.textAlign = 'center';
ctx.fillText(node.title, node.pos.x, node.pos.y - h/2 + 0.32);
```

### CSS
```css
.title-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(100, 150, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.title-input:focus {
  outline: none;
  border-color: rgba(100, 150, 255, 0.8);
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.4);
}
```

---

## 🔹 Subtítulo del Nodo

### Ubicación
- **Canvas**: Debajo del título (fuente mediana, semi-transparente)
- **Panel de Propiedades**: No editable, solo muestra en placeholder

### Características
- ❌ NO editable (viene del NodeType)
- ✅ Información contextual breve
- ✅ Se muestra en el canvas automáticamente
- ✅ Ayuda a identificar la función del nodo

### Ejemplos
```typescript
// NodeTypes.ts
"number": {
  type: "number",
  category: "input",
  title: "Number Input",
  subtitle: "Constant",          // ← Subtítulo
  description: "Produce un valor numérico constante configurable",
  inputs: [],
  outputs: [{ name: "value", type: PinType.Number }]
}

"add": {
  type: "add",
  category: "math",
  title: "Add",
  subtitle: "A + B",              // ← Subtítulo
  description: "Suma dos o más números. Soporta entradas dinámicas.",
  inputs: [
    { name: "a", type: PinType.Number, defaultValue: 0 },
    { name: "b", type: PinType.Number, defaultValue: 0 }
  ],
  outputs: [{ name: "result", type: PinType.Number }]
}
```

### Implementación
**Node.ts:**
```typescript
get subtitle(): string | undefined {
  return this.definition.subtitle;
}
```

**Renderizado (NodeEditor.ts):**
```typescript
// Subtítulo del nodo (si existe)
if (node.subtitle) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = "0.14px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
  ctx.fillText(node.subtitle, node.pos.x, node.pos.y - h/2 + 0.48);
}
```

---

## 🔹 Descripción del Nodo

### Ubicación
- **Canvas**: NO se muestra (por espacio limitado)
- **Panel de Propiedades**: Textarea editable grande

### Características
- ✅ Editable por el usuario
- ✅ Valor por defecto: `definition.description` del NodeType
- ✅ Personalizable con `customDescription`
- ✅ Persiste en auto-guardado y templates
- ✅ Soporta texto largo (multi-línea)

### Implementación
**Node.ts:**
```typescript
public customDescription: string | null = null;

get description(): string | undefined {
  // Si hay descripción personalizada, usarla; sino, usar la del template
  return this.customDescription !== null ? this.customDescription : this.definition.description;
}
```

**PropertiesPanel.ts:**
```typescript
// Crear textarea editable para la descripción
const descriptionTextarea = document.createElement('textarea');
descriptionTextarea.id = 'nodeDescriptionTextarea';
descriptionTextarea.className = 'description-textarea';
descriptionTextarea.placeholder = 'Añade una descripción personalizada...';
descriptionTextarea.value = this.currentNode.description || '';
descriptionTextarea.rows = 3;

nodeDescriptionContainer.appendChild(descriptionTextarea);
nodeDescriptionGroup.style.display = 'block';
```

**Guardado (PropertiesPanel.ts):**
```typescript
applyChanges() {
  // ... código de título
  
  const descriptionTextarea = document.getElementById('nodeDescriptionTextarea') as HTMLTextAreaElement;
  if (descriptionTextarea) {
    const newDescription = descriptionTextarea.value.trim();
    this.currentNode.customDescription = newDescription || null;
  }
}
```

### CSS
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

.description-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}
```

---

## 📊 Comparativa de Niveles

| Característica | Título | Subtítulo | Descripción |
|---------------|--------|-----------|-------------|
| **Editable** | ✅ Sí | ❌ No | ✅ Sí |
| **Visible en Canvas** | ✅ Sí | ✅ Sí | ❌ No |
| **Visible en Panel** | ✅ Sí | ⚠️ Placeholder | ✅ Sí |
| **Longitud** | Corto (1 línea) | Muy corto | Largo (multi-línea) |
| **Fuente Canvas** | Bold 0.28px | Regular 0.14px | N/A |
| **Color Canvas** | #FFFFFF | rgba(255,255,255,0.7) | N/A |
| **Persistencia** | customTitle | definition.subtitle | customDescription |
| **Propósito** | Identificar nodo | Función/tipo | Documentación |

---

## 🎨 Renderizado en Canvas

### Orden Visual (de arriba a abajo)
```
┌─────────────────────────┐
│    [Título]             │ ← Bold, 0.28px, blanco
│    [Subtítulo]          │ ← Regular, 0.14px, semi-transparente
│                         │
│  ◯         ◯            │ ← Pines de entrada/salida
│                         │
│    [Valor/Resultado]    │ ← Según tipo de nodo
└─────────────────────────┘
```

### Código de Renderizado
```typescript
// 1. Título (obligatorio)
ctx.fillStyle = 'white';
ctx.font = "bold 0.28px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
ctx.textAlign = 'center';
ctx.fillText(node.title, node.pos.x, node.pos.y - h/2 + 0.32);

// 2. Subtítulo (opcional)
if (node.subtitle) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = "0.14px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
  ctx.fillText(node.subtitle, node.pos.x, node.pos.y - h/2 + 0.48);
}

// 3. Pines y valores (continuación normal)
```

---

## 🔄 Persistencia

### Auto-guardado (SessionManager)
```typescript
saveCurrentSession() {
  const sessionData = {
    nodes: this.nodeEditor.nodes.map(node => ({
      type: node.type,
      position: { x: node.pos.x, y: node.pos.y },
      data: {
        value: node.outputs[0]?.value,
        customTitle: node.customTitle,           // ← Título personalizado
        customDescription: node.customDescription // ← Descripción personalizada
      }
    }))
  };
  
  this.redis.set('current_session', JSON.stringify(sessionData));
}
```

### Templates (DatabaseService)
```typescript
// Al guardar template
const nodesData = canvasUI.editor.nodes.map((node, index) => ({
  id: index + 1,
  type: node.type,
  position: { x: node.pos.x, y: node.pos.y },
  data: {
    ...(node.outputs[0]?.value !== undefined ? { value: node.outputs[0].value } : {}),
    ...(node.customTitle !== null ? { customTitle: node.customTitle } : {}),
    ...(node.customDescription !== null ? { customDescription: node.customDescription } : {})
  }
}));
```

### Restauración (NodeEditor)
```typescript
loadWorkflowTemplate(template: WorkflowTemplate) {
  template.nodes.forEach(nodeData => {
    const node = this.addNode(nodeData.type, nodeData.position.x, nodeData.position.y);
    
    // Restaurar título personalizado
    if (nodeData.data.customTitle !== undefined) {
      node.customTitle = nodeData.data.customTitle;
      logAudit(`  ✓ Título personalizado: ${nodeData.data.customTitle}`);
    }
    
    // Restaurar descripción personalizada
    if (nodeData.data.customDescription !== undefined) {
      node.customDescription = nodeData.data.customDescription;
      logAudit(`  ✓ Descripción personalizada: ${nodeData.data.customDescription}`);
    }
  });
}
```

---

## ✅ Ejemplos de Uso

### Caso 1: Nodo Number con valores por defecto
```typescript
// NodeTypes.ts (definición)
"number": {
  title: "Number Input",
  subtitle: "Constant",
  description: "Produce un valor numérico constante configurable"
}

// Canvas
┌─────────────────────────┐
│   Number Input          │ ← title (por defecto)
│   Constant              │ ← subtitle
│                         │
│   ◯           42 ◯      │
└─────────────────────────┘

// Panel de Propiedades
Título: [Number Input____________________]
Descripción: [Produce un valor numérico constante configurable]
```

### Caso 2: Nodo Number personalizado
```typescript
// Usuario edita en Panel de Propiedades
customTitle = "Precio Base"
customDescription = "Este es el precio inicial antes de aplicar descuentos e impuestos"

// Canvas
┌─────────────────────────┐
│   Precio Base           │ ← customTitle
│   Constant              │ ← subtitle (no cambia)
│                         │
│   ◯          100 ◯      │
└─────────────────────────┘

// Panel de Propiedades
Título: [Precio Base____________________]
Descripción: [Este es el precio inicial antes de aplicar descuentos e impuestos]
```

### Caso 3: Nodo Add con subtítulo
```typescript
// NodeTypes.ts
"add": {
  title: "Add",
  subtitle: "A + B",
  description: "Suma dos o más números. Soporta entradas dinámicas."
}

// Canvas
┌─────────────────────────┐
│        Add              │ ← title
│        A + B            │ ← subtitle (fórmula)
│                         │
│  ◯◯         = 150 ◯     │
└─────────────────────────┘
```

---

## 🚀 Flujo de Edición

### 1. Abrir Panel de Propiedades
```
Usuario → Doble-click en nodo → Panel se abre a la derecha
```

### 2. Editar Título
```
Usuario → Click en input "Título del nodo" → Escribe nuevo nombre → Tab
```

### 3. Editar Descripción
```
Usuario → Click en textarea → Escribe documentación → Tab
```

### 4. Aplicar Cambios
```
Usuario → Click "✔ Aplicar Cambios" → Cambios guardados en nodo
                                    → Canvas se actualiza
                                    → Auto-guardado en 10s
```

### 5. Guardar en Template
```
Usuario → Click "Guardar" o "Guardar como" → customTitle y customDescription
                                            → Serializados en template
                                            → Persistidos en SQLite
```

---

## 🔍 Verificaciones

### ✅ Checklist de funcionalidad
- [x] Título editable en Panel de Propiedades
- [x] Título personalizado se muestra en Canvas
- [x] Título por defecto desde NodeTypes
- [x] Subtítulo estático se muestra en Canvas
- [x] Subtítulo NO es editable
- [x] Descripción editable en Panel de Propiedades
- [x] Descripción NO se muestra en Canvas (por espacio)
- [x] customTitle persiste en auto-guardado
- [x] customDescription persiste en auto-guardado
- [x] customTitle persiste en templates
- [x] customDescription persiste en templates
- [x] Restauración correcta al cargar template
- [x] Textarea multi-línea para descripción
- [x] Estilos CSS profesionales
- [x] Sin errores TypeScript

---

## 📝 Decisiones de Diseño

### ¿Por qué la descripción NO se muestra en el Canvas?
**Razón:** Espacio limitado en el nodo.

**Alternativas consideradas:**
1. ❌ Mostrar en tooltip al hover (requiere sistema de tooltips complejo)
2. ❌ Mostrar debajo del nodo (ocupa mucho espacio vertical)
3. ✅ **Mostrar solo en Panel de Propiedades** (solución elegida)

**Beneficios:**
- Canvas limpio y profesional
- Descripciones largas no afectan diseño
- Información disponible cuando se necesita (doble-click)
- Similar a otros editores profesionales (Unreal Engine Blueprints, etc.)

### ¿Por qué el subtítulo NO es editable?
**Razón:** El subtítulo es información semántica del tipo de nodo.

**Ejemplos:**
- "A + B" para Add → Indica operación matemática
- "Constant" para Number → Indica fuente de datos
- ">10" para Condition → Indica condición lógica

**Beneficio:** Usuarios identifican rápidamente el tipo/función del nodo sin necesidad de leer el tipo.

---

## 🎯 Resumen Ejecutivo

**Sistema de tres niveles para metadatos de nodos:**

1. **Título** (editable): Identificación principal del nodo en canvas
2. **Subtítulo** (estático): Información breve de tipo/función
3. **Descripción** (editable): Documentación larga en panel

**Persistencia completa:**
- Auto-guardado cada 10 segundos (Redis)
- Templates guardados manualmente (SQLite)
- Restauración automática al cargar

**Experiencia de usuario:**
- Canvas limpio y profesional
- Información contextual accesible
- Documentación personalizable
- Sin sobrecarga visual
