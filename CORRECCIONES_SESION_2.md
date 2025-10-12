# 🔧 Correcciones Aplicadas - Sesión 2025-10-12

## ✅ Problema 1: Error de Redis con caracteres Unicode

### 🐛 Error Original
```
InvalidCharacterError: Failed to execute 'btoa' on 'Window': 
The string to be encoded contains characters outside of the Latin1 range.
```

### 🔍 Causa
El método `btoa()` de JavaScript solo soporta caracteres en el rango **Latin1 (ISO-8859-1)**, que incluye caracteres del 0-255. Los emojis y caracteres Unicode especiales (como 🎯, 📊, ⏱️) usados en los templates estaban causando el error.

### ✅ Solución Implementada

**Archivo**: `src/services/RedisService.ts`

#### Función `encrypt()` actualizada:
```typescript
private encrypt(data: string): string {
  try {
    // 1. Convertir a UTF-8 usando TextEncoder
    const utf8Encoder = new TextEncoder();
    const utf8Data = utf8Encoder.encode(data);
    
    // 2. Cifrado XOR sobre bytes UTF-8
    let encrypted = '';
    for (let i = 0; i < utf8Data.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      const dataChar = utf8Data[i];
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    
    // 3. Base64 encode (ahora seguro - solo Latin1)
    return btoa(encrypted);
  } catch (error) {
    console.error('Error en encrypt:', error);
    // Fallback: base64 sin cifrar
    return btoa(unescape(encodeURIComponent(data)));
  }
}
```

#### Función `decrypt()` actualizada:
```typescript
private decrypt(encryptedData: string): string {
  try {
    const data = atob(encryptedData); // Base64 decode
    
    // 1. Descifrar XOR
    const decryptedBytes: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      const dataChar = data.charCodeAt(i);
      decryptedBytes.push(dataChar ^ keyChar);
    }
    
    // 2. Convertir de UTF-8 a string usando TextDecoder
    const utf8Decoder = new TextDecoder();
    const uint8Array = new Uint8Array(decryptedBytes);
    return utf8Decoder.decode(uint8Array);
  } catch (error) {
    console.error('Error decryptando datos:', error);
    // Fallback: decodificar sin descifrar
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch {
      return '';
    }
  }
}
```

### 🎯 Mejoras
- ✅ **Soporte completo Unicode**: Emojis, acentos, caracteres especiales
- ✅ **Doble fallback**: Si falla, intenta decodificar sin cifrar
- ✅ **Mantiene compatibilidad**: Usa TextEncoder/TextDecoder estándar
- ✅ **Sin dependencias externas**: APIs nativas del navegador

---

## ✅ Problema 2: Eliminar conexiones con clic derecho en PIN

### 📝 Requerimiento
Poder eliminar conexiones haciendo clic derecho sobre un **PIN**, no solo sobre la línea de conexión.

### ✅ Solución Implementada

**Archivo**: `src/ui/canvas/CanvasEvents.ts`

#### Funcionalidad agregada en `handleMouseDown()`:

```typescript
} else if (e.button === 2) { // Click derecho
  // 1. Verificar si es en un PIN
  let clickedPin = null;
  const PIN_CLICK_RADIUS = 0.3;
  
  for (const node of manager.editor.nodes) {
    for (const pin of [...node.inputs, ...node.outputs]) {
      const dx = worldPos.x - pin.pos.x;
      const dy = worldPos.y - pin.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < PIN_CLICK_RADIUS) {
        clickedPin = pin;
        break;
      }
    }
    if (clickedPin) break;
  }
  
  if (clickedPin) {
    // Eliminar conexión del pin
    const linkIndex = clickedPin.userData;
    if (linkIndex !== null && manager.editor.links[linkIndex]) {
      const [fromPin, toPin] = manager.editor.links[linkIndex];
      
      // Limpiar userData de ambos pines
      if (fromPin) fromPin.userData = null;
      if (toPin) toPin.userData = null;
      
      // Eliminar el link
      manager.editor.links[linkIndex] = null;
      
      // Recomputar valores
      manager.editor.computeAll();
      
      // Log en audit panel
      logAudit(`🗑️ Conexión eliminada: ${fromPin.parent.title} → ${toPin.parent.title}`);
      
      return;
    } else {
      logAudit(`ℹ️ Pin ${clickedPin.name} no tiene conexiones`);
      return;
    }
  }
  
  // 2. Si no es en pin, verificar línea de conexión (comportamiento anterior)
  const closestLink = getClosestLink(worldPos, manager.editor.links, 0.3);
  if (closestLink) {
    // ... código existente para eliminar por línea
  }
}
```

#### Indicador visual en `handleMouseMove()`:

```typescript
// Verificar si está sobre un pin
let isOverPin = false;
const PIN_HOVER_RADIUS = 0.3;

for (const node of manager.editor.nodes) {
  for (const pin of [...node.inputs, ...node.outputs]) {
    const dx = worldPos.x - pin.pos.x;
    const dy = worldPos.y - pin.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < PIN_HOVER_RADIUS) {
      isOverPin = true;
      // Cambiar cursor según si tiene conexión
      const hasConnection = pin.userData !== null && pin.userData !== undefined;
      manager.canvas.style.cursor = hasConnection ? 'not-allowed' : 'crosshair';
      break;
    }
  }
  if (isOverPin) break;
}
```

### 🎯 Funcionalidad Completa

#### Clic Izquierdo en PIN:
1. **Primer clic**: Selecciona el pin (cursor `crosshair`)
2. **Segundo clic** en otro pin: Crea conexión
3. **Comportamiento inteligente**: Si el pin destino ya tiene conexión, la elimina automáticamente antes de crear la nueva

#### Clic Derecho en PIN:
1. **Si tiene conexión**: Elimina la conexión
2. **Si no tiene conexión**: Muestra mensaje informativo
3. **Feedback visual**: Mensaje en audit panel

#### Cursor del mouse:
- 🎯 `crosshair`: Pin sin conexión (puede conectar)
- 🚫 `not-allowed`: Pin con conexión (clic derecho para eliminar)
- 👆 `pointer`: Sobre nodo
- 👋 `default`: Canvas vacío

#### Clic Derecho en LÍNEA (mantiene funcionalidad anterior):
- Detecta la línea más cercana (radio 0.3 unidades)
- Elimina la conexión

---

## 📊 Resumen de Cambios

### Archivos Modificados:
1. ✅ `src/services/RedisService.ts`
   - Función `encrypt()` con soporte UTF-8
   - Función `decrypt()` con soporte UTF-8
   - Fallbacks robustos

2. ✅ `src/ui/canvas/CanvasEvents.ts`
   - Clic derecho en PIN elimina conexión
   - Hover sobre PIN muestra cursor apropiado
   - Feedback visual en audit panel

### Nuevas Capacidades:
- ✅ Guardar/cargar templates con emojis sin errores
- ✅ Eliminar conexiones desde el PIN origen o destino
- ✅ Indicador visual claro de qué se puede hacer
- ✅ Mensajes informativos en el audit panel

---

## 🧪 Cómo Probar

### Test 1: Redis con Unicode
1. Cargar template "📊 PERT/CPM: Proyecto Software"
2. Verificar que NO aparezca error de `btoa`
3. ✅ Debería guardar sesión sin problemas

### Test 2: Eliminar conexión desde PIN
1. Crear dos nodos con una conexión
2. Hacer **hover** sobre un pin conectado → cursor 🚫 `not-allowed`
3. Hacer **clic derecho** sobre el pin
4. ✅ Conexión eliminada + mensaje en audit panel

### Test 3: Pin sin conexión
1. Hacer hover sobre pin sin conexión → cursor 🎯 `crosshair`
2. Hacer clic derecho sobre pin sin conexión
3. ✅ Mensaje: "ℹ️ Pin X no tiene conexiones"

### Test 4: Eliminar desde línea (funcionalidad anterior)
1. Hacer clic derecho sobre la línea de conexión
2. ✅ Conexión eliminada (como antes)

---

## 🚀 Impacto

### Antes:
❌ Error de Redis al guardar templates con emojis  
❌ Solo se podían eliminar conexiones haciendo clic en la línea  
❌ No había feedback visual sobre qué se puede hacer con pines  

### Ahora:
✅ Redis funciona con cualquier carácter Unicode  
✅ Eliminar conexiones desde PIN o línea  
✅ Cursor indica estado del pin (conectado/libre)  
✅ Mensajes claros en audit panel  
✅ UX más intuitiva y consistente  

---

**Fecha**: 2025-10-12  
**Autor**: GitHub Copilot  
**Estado**: ✅ Implementado y compilado exitosamente
