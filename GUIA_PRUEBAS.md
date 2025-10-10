# 🧪 GUÍA DE PRUEBAS Y USO DEL PROYECTO

## 🎯 CÓMO PROBAR EL PROYECTO

### 1. Verificar que el Servidor está Corriendo
```powershell
# El servidor debe estar en http://localhost:5173
# Verifica que veas el Node Editor en el navegador
```

---

## 📝 INSTRUCCIONES DE USO

### **Navegación Básica**

#### Zoom y Pan:
- **Zoom In/Out:** Slider en la parte inferior derecha
- **Pan (Mover vista):** Click derecho + arrastrar O botón central del mouse
- **Teclas de flecha:** Mover la vista con las flechas del teclado

#### Crear Nodos:
1. **Método 1:** Click en "Add Node (+)" en el toolbar
   - Selecciona tipo del dropdown
   - Se crea en el centro de la vista actual

2. **Método 2:** Presiona tecla 'A'
   - Crea nodo en la posición del cursor
   - Usa el tipo seleccionado en el dropdown

#### Seleccionar Nodos:
- **Click simple:** Selecciona un nodo
- **Ctrl + Click:** Selección múltiple
- **Shift + Drag:** Selección rectangular

#### Editar Valores:
1. Click en un nodo para seleccionarlo
2. Aparece un **overlay negro a la derecha** del nodo
3. Edita los valores en los inputs:
   - **Number:** Input numérico
   - **Boolean:** Checkbox
4. Los cambios se aplican **inmediatamente**

#### Conectar Nodos:
1. **Click en un pin** (círculo verde)
2. **Arrastrar** hacia otro pin
3. **Soltar** sobre pin compatible:
   - ✅ Input ↔ Output
   - ✅ Tipos compatibles (Number, Boolean, etc.)
4. La conexión se crea con una **curva Bézier**

#### Ejecutar Flujo:
1. **Play ▶:** Inicia ejecución continua (cada 100ms)
2. **Pause ⏸:** Pausa la ejecución
3. **Stop ⬛:** Detiene completamente
4. Los valores se **propagan automáticamente** a través de las conexiones

#### Eliminar:
- **Delete o Backspace:** Elimina nodos seleccionados

---

## 🧪 PRUEBAS PASO A PASO

### ✅ Test 1: Crear y Editar Nodo Number

**Objetivo:** Verificar que se pueden crear nodos y editar valores

**Pasos:**
1. Abre el navegador en `http://localhost:5173`
2. Presiona tecla **'A'** (o click en "Add Node")
3. Asegúrate que "Number Input" esté seleccionado
4. Se crea un nodo **Number** en el canvas
5. **Click en el nodo** para seleccionarlo
6. Aparece overlay negro a la derecha
7. **Cambia el valor a 42**
8. El valor debe cambiar **inmediatamente**

**Resultado Esperado:**
- ✅ Nodo Number creado
- ✅ Overlay visible al seleccionar
- ✅ Valor cambia al editar

**Si falla:**
- Verifica la consola del navegador (F12)
- Asegúrate que el input overlay esté visible
- Prueba hacer click en diferentes partes del nodo

---

### ✅ Test 2: Conectar Dos Nodos

**Objetivo:** Verificar sistema de conexiones

**Pasos:**
1. Crea dos nodos **Number** (valor: 10 y 5)
2. Crea un nodo **Greater Than (>)**
3. Arrastra conexión desde **Number1 output** → **Greater Than input A**
4. Arrastra conexión desde **Number2 output** → **Greater Than input B**
5. Crea un nodo **Display**
6. Conecta **Greater Than output** → **Display input**
7. Las conexiones deben verse como **curvas verdes/doradas**

**Resultado Esperado:**
- ✅ Línea temporal durante drag
- ✅ Conexión se crea al soltar
- ✅ Curvas Bézier visibles
- ✅ 3 conexiones totales

**Si falla:**
- Verifica que los pines estén visibles (círculos verdes pequeños)
- Asegúrate de hacer click exactamente en el pin
- Radio de detección es 0.15 unidades

---

### ✅ Test 3: Ejecutar Flujo Simple

**Objetivo:** Verificar propagación de valores

**Continuando Test 2:**
1. Presiona **Play ▶**
2. El nodo Display debe **actualizarse**
3. Debe mostrar **`true`** (porque 10 > 5)
4. **Cambia Number1 a 3**
5. Display debe mostrar **`false`** (porque 3 < 5)
6. Presiona **Stop ⬛**

**Resultado Esperado:**
- ✅ Play inicia ejecución
- ✅ Display muestra valor correcto
- ✅ Valores se actualizan al cambiar inputs
- ✅ Stop detiene ejecución

**Si falla:**
- Abre consola (F12) y busca errores
- Verifica que las conexiones estén correctas
- Asegúrate que compute() se llame

---

### ✅ Test 4: Cargar Template

**Objetivo:** Verificar carga de templates predefinidos

**Pasos:**
1. En el toolbar, busca el **select "Seleccionar Template"**
2. Abre el dropdown
3. Debes ver **3 opciones**:
   - Comparador Simple
   - Operación Lógica AND
   - Nodo Condicional
4. Selecciona **"Comparador Simple"**
5. Click en **"Cargar Template"**
6. El canvas debe **limpiar** y cargar el template
7. Debes ver **4 nodos** conectados

**Resultado Esperado:**
- ✅ Dropdown tiene 3 templates
- ✅ Template se carga al hacer click
- ✅ Nodos aparecen conectados
- ✅ Vista se centra en el template

**Si falla:**
- Verifica que la base de datos se inicializó
- Revisa la consola para errores de parsing
- Asegúrate que los tipos de nodo existan

---

### ✅ Test 5: Operador Lógico AND

**Objetivo:** Verificar lógica booleana

**Pasos:**
1. Crea dos nodos **Boolean** (ambos con valor `true`)
2. Crea un nodo **AND**
3. Conecta ambos Booleans al AND
4. Crea un nodo **Display**
5. Conecta AND output → Display
6. Presiona **Play**
7. Display debe mostrar **`true`**
8. **Cambia Boolean1 a `false`**
9. Display debe mostrar **`false`**

**Resultado Esperado:**
- ✅ AND funciona correctamente
- ✅ true AND true = true
- ✅ false AND true = false
- ✅ Valores se actualizan en tiempo real

---

### ✅ Test 6: Nodo Condicional

**Objetivo:** Verificar nodo con múltiples outputs

**Pasos:**
1. Carga template **"Nodo Condicional"**
2. Verás:
   - 1 Number input
   - 1 Condition node (>10)
   - 2 Display nodes (true/false paths)
3. Number inicial es **15**
4. Presiona **Play**
5. Display superior (true path) debe activarse
6. **Cambia Number a 5**
7. Display inferior (false path) debe activarse

**Resultado Esperado:**
- ✅ Condition node tiene 2 outputs
- ✅ Solo un path se activa a la vez
- ✅ Valores correctos en cada path
- ✅ Animación de highlight (amarillo)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema 1: "No aparecen nodos al presionar 'A'"
**Solución:**
- Asegúrate que un tipo esté seleccionado en el dropdown
- Verifica que el cursor esté sobre el canvas
- Revisa la consola para errores

### Problema 2: "No puedo conectar nodos"
**Solución:**
- Verifica que estés haciendo click exactamente en el **pin** (círculo verde)
- Asegúrate de conectar **Output → Input**
- Los tipos deben ser compatibles (Number con Number, Boolean con Boolean)
- Display acepta cualquier tipo (Custom)

### Problema 3: "Display no muestra valores"
**Solución:**
- Presiona **Play** para ejecutar
- Verifica que las conexiones sean correctas
- Revisa la consola para errores de compute()
- Asegúrate que los nodos input tengan valores

### Problema 4: "Input overlay no aparece"
**Solución:**
- Haz **click directo en el nodo** (no en el fondo)
- El overlay aparece a la derecha del nodo
- Si está fuera de pantalla, mueve la vista
- Verifica que el nodo esté seleccionado (resaltado)

### Problema 5: "Templates no cargan"
**Solución:**
- Espera a que la base de datos se inicialice (~2 segundos)
- Revisa la consola para errores de SQL
- Verifica que LocalStorage esté habilitado
- Recarga la página (F5)

### Problema 6: "Valores no se actualizan"
**Solución:**
- Asegúrate que **Play esté activo** (botón debe decir "Pause")
- Verifica que las conexiones estén bien hechas
- Los nodos Number/Boolean mantienen sus valores
- Otros nodos calculan en base a inputs

---

## 📊 VERIFICACIÓN FINAL

### Checklist de Funcionalidades:

- [ ] ✅ Crear nodos desde toolbar
- [ ] ✅ Crear nodos con tecla 'A'
- [ ] ✅ Seleccionar nodos con click
- [ ] ✅ Editar valores con overlay
- [ ] ✅ Conectar nodos arrastrando pines
- [ ] ✅ Ver curvas Bézier en conexiones
- [ ] ✅ Ejecutar flujo con Play
- [ ] ✅ Pausar ejecución
- [ ] ✅ Detener con Stop
- [ ] ✅ Ver valores en Display nodes
- [ ] ✅ Cargar templates
- [ ] ✅ Eliminar nodos con Delete
- [ ] ✅ Zoom con slider
- [ ] ✅ Pan con mouse
- [ ] ✅ Coordenadas en overlay

---

## 🎨 TIPS Y TRUCOS

### Productividad:
1. **Usa 'A' rápidamente** para crear nodos
2. **Shift + Drag** para selección múltiple
3. **Ctrl + Click** para añadir a selección
4. **Delete** borra múltiples nodos
5. **Flecha izq/der** para navegar

### Organización:
1. Coloca nodos **Input a la izquierda**
2. Nodos **Process en el centro**
3. Nodos **Output a la derecha**
4. Usa **zoom out** para ver todo el flujo
5. **Pan** para centrar área de trabajo

### Depuración:
1. **Display nodes** para ver valores intermedios
2. **Play/Pause** para debugging paso a paso
3. **Consola F12** para ver logs
4. **Input overlay** muestra todos los valores
5. **Condition nodes** tienen highlight visual

---

## 📸 EJEMPLOS VISUALES

### Flujo Típico:
```
[Number: 15] ──→ [Greater >10] ──→ [Display: true]
                      ↑
[Number: 10] ────────┘
```

### Flujo con Lógica:
```
[Number: 12] ──→ [Greater >10] ──┐
                                  ├──→ [AND] ──→ [Display: true]
[Boolean: true] ──────────────────┘
```

### Flujo Condicional:
```
                  ┌──→ [Display: true]  (si >10)
[Number] ──→ [Condition]
                  └──→ [Display: false] (si ≤10)
```

---

**¡El proyecto está completamente funcional!** 🎉

Si encuentras algún problema, revisa:
1. Consola del navegador (F12)
2. Documentos PROBLEMAS_DETECTADOS.md
3. Documentos CORRECCIONES_APLICADAS.md
