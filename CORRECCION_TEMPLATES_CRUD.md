# 🔧 Corrección de Templates CRUD

## 📋 Problema Detectado

Los templates no se cargaban ni guardaban correctamente después de agregar el campo `problemDescription`.

### Causa Raíz

**Schema Mismatch** entre la definición de tabla y las operaciones INSERT/SELECT:

```typescript
// ❌ ANTES - CREATE TABLE sin problem_description
CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT NOT NULL,
    connections_data TEXT NOT NULL
)

// ✅ INSERT con problem_description (columna inexistente)
INSERT INTO workflow_templates (name, description, problem_description, ...)

// ⚠️ SELECT * esperando problem_description en row[3]
const template = {
    problemDescription: row[3] as string,  // row[3] = nodes_data ❌
    nodes_data: row[4] as string,          // row[4] = connections_data ❌
    connections_data: row[5] as string     // row[5] = undefined ❌
}
```

**Resultado**: Desalineación de índices de columnas, causando que los datos se leyeran en posiciones incorrectas.

---

## ✅ Soluciones Implementadas

### 1. **Corrección del Schema en `initialize()`**

**Archivo**: `src/services/DatabaseService.ts`

**Cambio**:
```typescript
// ✅ DESPUÉS - CREATE TABLE con problem_description
CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    problem_description TEXT,  // ← AGREGADO
    nodes_data TEXT NOT NULL,
    connections_data TEXT NOT NULL
)
```

**Impacto**: Ahora el schema coincide con las operaciones INSERT/SELECT.

---

### 2. **Implementación de `updateTemplate()`**

**Problema**: Solo existía `saveTemplate()` que hacía INSERT. No había forma de actualizar templates existentes.

**Solución**: Agregado método UPDATE

```typescript
async updateTemplate(id: number, template: Omit<WorkflowTemplate, 'id'>) {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.run(
        `UPDATE workflow_templates 
         SET name = ?, description = ?, problem_description = ?, nodes_data = ?, connections_data = ? 
         WHERE id = ?`,
        [template.name, template.description, template.problemDescription || '', 
         template.nodes_data, template.connections_data, id]
    );
    this.saveToLocalStorage();
}
```

**Características**:
- Actualiza todos los campos del template
- Mantiene el ID original
- Maneja `problemDescription` opcional con fallback a string vacío
- Persiste cambios en localStorage

---

### 3. **Corrección del botón "Guardar Template"**

**Archivo**: `src/main.ts`

**Problema**: El botón de guardar usaba `saveTemplate()` (INSERT) en lugar de actualizar.

**Antes**:
```typescript
const updatedTemplate = {
    ...template,  // Incluye 'id' ❌
    nodes_data: JSON.stringify(nodesData),
    connections_data: JSON.stringify(connectionsData)
};

await dbService.saveTemplate(updatedTemplate);  // INSERT ❌
```

**Después**:
```typescript
const updatedTemplate = {
    name: template.name,
    description: template.description,
    problemDescription: template.problemDescription,
    nodes_data: JSON.stringify(nodesData),
    connections_data: JSON.stringify(connectionsData)
};

await dbService.updateTemplate(id, updatedTemplate);  // UPDATE ✅
```

**Impacto**: 
- Ahora actualiza correctamente sin crear duplicados
- Mantiene el ID del template original
- Preserva los metadatos (name, description, problemDescription)

---

### 4. **Botón Reset Database**

**Archivo**: `index.html` + `src/main.ts`

**Propósito**: Permitir al usuario reiniciar la base de datos cuando hay problemas de schema.

**HTML**:
```html
<button id="resetDatabase" title="Reiniciar base de datos">
    <svg><!-- Icono de recarga --></svg>
    <span>🔄 Reset DB</span>
</button>
```

**Lógica**:
```typescript
resetDatabaseBtn.addEventListener('click', async () => {
    const confirmReset = confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los templates...');
    if (!confirmReset) return;
    
    try {
        localStorage.removeItem('workflowDb');  // Limpiar DB vieja
        await dbService.initialize();           // Recrear con nuevo schema
        await loadTemplatesIntoUI();            // Recargar templates por defecto
        alert('✅ Base de datos reiniciada');
    } catch (error) {
        alert('❌ Error al resetear');
    }
});
```

**Funcionalidad**:
- Elimina localStorage con schema viejo
- Reinicializa DatabaseService con schema correcto
- Recarga templates por defecto desde `DefaultTemplates.ts`
- Requiere confirmación del usuario

---

### 5. **Función Reutilizable `loadTemplatesIntoUI()`**

**Archivo**: `src/main.ts`

**Problema**: El código para cargar templates en el `<select>` estaba duplicado.

**Solución**:
```typescript
async function loadTemplatesIntoUI() {
    const dbService = DatabaseService.getInstance();
    const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
    if (!templateSelect) return;

    // Limpiar opciones existentes
    while (templateSelect.options.length > 1) {
        templateSelect.remove(1);
    }
    
    // Cargar templates actualizados
    const templates = await dbService.listTemplates();
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id?.toString() || '';
        option.textContent = template.name;
        option.title = template.description || '';
        templateSelect.appendChild(option);
    });
}
```

**Usos**:
- Inicialización en `DOMContentLoaded`
- Después de guardar template
- Después de crear nuevo template
- Después de resetear database

---

## 📊 Mapeo Completo de CRUD Operations

| Operación | Método | SQL | Uso |
|-----------|--------|-----|-----|
| **Create** | `saveTemplate()` | `INSERT INTO workflow_templates` | Botón "Guardar Como" |
| **Read** (uno) | `loadTemplate(id)` | `SELECT * FROM workflow_templates WHERE id = ?` | Botón "Cargar" |
| **Read** (todos) | `listTemplates()` | `SELECT * FROM workflow_templates` | Cargar dropdown |
| **Update** | `updateTemplate(id, template)` | `UPDATE workflow_templates SET ... WHERE id = ?` | Botón "Guardar" |
| **Delete** | `deleteTemplate(id)` | `DELETE FROM workflow_templates WHERE id = ?` | (Existente) |

---

## 🔄 Flujo de Trabajo Corregido

### Escenario 1: Cargar Template Existente
```
Usuario selecciona template del dropdown
    ↓
Click en "Cargar"
    ↓
loadTemplate(id)
    ↓
SELECT * FROM workflow_templates WHERE id = ?
    ↓
Parsear row[3] = problemDescription ✅
    ↓
Cargar nodos y conexiones en canvas
```

### Escenario 2: Modificar y Guardar Template
```
Usuario modifica nodos en canvas
    ↓
Click en "Guardar"
    ↓
Serializar nodesData y connectionsData
    ↓
updateTemplate(id, {...})  ← NUEVO
    ↓
UPDATE workflow_templates SET ... WHERE id = ?
    ↓
Recargar dropdown con loadTemplatesIntoUI()
```

### Escenario 3: Crear Nuevo Template
```
Usuario click en "Guardar Como"
    ↓
Solicitar nombre y descripción
    ↓
saveTemplate({name, description, problemDescription, ...})
    ↓
INSERT INTO workflow_templates
    ↓
Recargar dropdown con loadTemplatesIntoUI()
```

### Escenario 4: Database Corrupta
```
Usuario tiene schema viejo en localStorage
    ↓
Templates no cargan correctamente
    ↓
Click en "Reset DB"
    ↓
Confirmar advertencia
    ↓
localStorage.removeItem('workflowDb')
    ↓
dbService.initialize() → CREATE TABLE con problem_description ✅
    ↓
Cargar DefaultTemplates
    ↓
loadTemplatesIntoUI()
```

---

## 🧪 Validación

### Checklist de Verificación

- ✅ **Schema Consistency**: CREATE TABLE incluye `problem_description`
- ✅ **INSERT Operations**: `saveTemplate()` inserta `problemDescription`
- ✅ **SELECT Operations**: `loadTemplate()` lee `row[3]` como `problemDescription`
- ✅ **UPDATE Operations**: `updateTemplate()` implementado correctamente
- ✅ **Column Alignment**: Todos los índices coinciden con schema
- ✅ **Null Safety**: `problemDescription || ''` en UPDATE, `|| null` en INSERT
- ✅ **UI Refresh**: `loadTemplatesIntoUI()` recarga dropdown consistentemente
- ✅ **Error Handling**: Try/catch en operaciones críticas
- ✅ **User Feedback**: Alerts informativos en cada operación

### Errores de Compilación Resueltos

```
❌ Property 'nodesData' does not exist
    → Cambiado a nodes_data

❌ Property 'connectionsData' does not exist
    → Cambiado a connections_data

❌ Type 'string | undefined' is not assignable
    → Agregado || '' fallback

❌ Expected 1 arguments, but got 2
    → logAudit() corregido a recibir solo string

✅ 0 errores relacionados con DatabaseService o templates
```

---

## 📚 Archivos Modificados

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `src/services/DatabaseService.ts` | ✅ Schema corregido<br>✅ updateTemplate() agregado | 40-80, 145-165 |
| `src/main.ts` | ✅ Botón guardar usa updateTemplate()<br>✅ loadTemplatesIntoUI() creada<br>✅ Botón reset DB agregado | 60-90, 240-250, 380-420 |
| `index.html` | ✅ Botón Reset DB en toolbar | 50-62 |
| `src/templates/DefaultTemplates.ts` | ✅ problemDescription en templates<br>✅ customDescription en nodos | (ya corregido previamente) |
| `db/schema.sql` | ✅ problem_description agregado | (ya corregido previamente) |

---

## 🎯 Resultado Final

### Antes (❌ Roto)
- Templates no se cargaban: índices desalineados
- Guardar creaba duplicados: usaba INSERT en lugar de UPDATE
- No había forma de actualizar templates
- Schema inconsistente entre archivos

### Después (✅ Funcional)
- ✅ Templates se cargan correctamente con `problemDescription`
- ✅ Guardar actualiza template existente sin duplicar
- ✅ CRUD completo: Create, Read, Update, Delete
- ✅ Schema consistente en todos los puntos
- ✅ Botón Reset DB para casos extremos
- ✅ UI se actualiza consistentemente
- ✅ Código DRY con `loadTemplatesIntoUI()`

---

## 🔍 Debugging Tips

Si los templates siguen sin cargar:

1. **Verificar localStorage**:
   ```javascript
   localStorage.getItem('workflowDb')  // Debe existir
   ```

2. **Inspeccionar schema actual**:
   ```sql
   PRAGMA table_info(workflow_templates);
   ```

3. **Click en "Reset DB"**:
   - Elimina localStorage viejo
   - Recrea tabla con schema correcto

4. **Verificar consola**:
   ```
   Available templates: N  ← Debe ser > 0
   ```

5. **Comprobar DefaultTemplates**:
   - Deben tener `problemDescription` definido
   - Deben tener `customDescription` en nodos

---

## 📝 Notas Finales

- **Breaking Change**: Usuarios con DB vieja necesitarán usar "Reset DB"
- **Migración**: No se implementó ALTER TABLE automático (requiere versioning)
- **Alternativa**: Implementar migration logic en futuras versiones
- **Testing**: Probar en navegador limpio para validar flujo completo

---

**Fecha**: 2025
**Versión**: Post-CRUD Fix
**Status**: ✅ RESUELTO
