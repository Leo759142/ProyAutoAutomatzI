// initCanvasUI.ts
// Punto de entrada modular para la UI del canvas
import { NodeEditor } from '../../core/NodeEditor';
import { CanvasSelection } from './CanvasSelection';
import { CanvasExecution } from './CanvasExecution';
import { updateOverlay } from './CanvasOverlay';
import { screenToWorld, worldToScreen } from './CanvasUtils';
import * as CanvasEvents from './CanvasEvents';
import { Vec2, InputState } from '../../types/types';
import { Pin } from '../../core/Node';
import { PropertiesPanel } from '../PropertiesPanel';

export function initCanvasUI() {
  // Overlay input for editing node values
  let inputOverlay: HTMLDivElement | null = null;
  function showInputOverlay(node: any) {
    if (!inputOverlay) {
      inputOverlay = document.createElement('div');
      inputOverlay.style.position = 'absolute';
      inputOverlay.style.zIndex = '1000';
      inputOverlay.style.background = '#222';
      inputOverlay.style.border = '1px solid #888';
      inputOverlay.style.padding = '8px';
      inputOverlay.style.borderRadius = '6px';
      inputOverlay.style.color = '#fff';
      inputOverlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      document.body.appendChild(inputOverlay);
    }
    inputOverlay.innerHTML = '';

    // Title for the overlay
    const title = document.createElement('div');
    title.textContent = node.title;
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.borderBottom = '1px solid #444';
    title.style.paddingBottom = '4px';
    inputOverlay.appendChild(title);

    // Container for inputs
    const inputsContainer = document.createElement('div');
    inputsContainer.style.display = 'flex';
    inputsContainer.style.flexDirection = 'column';
    inputsContainer.style.gap = '8px';
    inputOverlay.appendChild(inputsContainer);

    // Function to create an input element based on pin type
    function createInputForPin(pin: any, isInput: boolean) {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';

      const label = document.createElement('label');
      label.textContent = pin.name + ':';
      label.style.minWidth = '80px';
      container.appendChild(label);

      let input: HTMLInputElement;
      if (pin.type === 0) { // PinType.Number
        input = document.createElement('input');
        input.type = 'number';
        input.value = (pin.value ?? pin.definition?.defaultValue ?? 0).toString();
        input.step = 'any';
        input.style.width = '80px';
      } else if (pin.type === 2) { // PinType.Boolean
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = pin.value ?? pin.definition?.defaultValue ?? false;
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = (pin.value ?? pin.definition?.defaultValue ?? '').toString();
        input.style.width = '120px';
      }

      // Style the input
      input.style.background = '#333';
      input.style.border = '1px solid #555';
      input.style.color = '#fff';
      input.style.padding = '4px 8px';
      input.style.borderRadius = '4px';

      // If pin is connected, disable input
      const isConnected = editor.links.some(link => 
        link && (link[0] === pin || link[1] === pin)
      );
      if (isConnected && isInput) {
        input.disabled = true;
        input.style.opacity = '0.5';
        container.title = 'Connected - unlink to edit';
      }

      container.appendChild(input);

      // Update value on change
      input.oninput = () => {
        if (pin.type === 0) { // PinType.Number
          pin.value = parseFloat(input.value) || 0;
        } else if (pin.type === 2) { // PinType.Boolean
          pin.value = input.checked;
        } else {
          pin.value = input.value;
        }
        editor.computeAll();
      };

      return container;
    }

    // Add inputs section if node has inputs
    if (node.inputs.length > 0) {
      const inputsTitle = document.createElement('div');
      inputsTitle.textContent = 'Inputs';
      inputsTitle.style.fontSize = '0.9em';
      inputsTitle.style.color = '#aaa';
      inputsTitle.style.marginTop = '4px';
      inputsContainer.appendChild(inputsTitle);

      node.inputs.forEach((pin: any) => {
        inputsContainer.appendChild(createInputForPin(pin, true));
      });
    }

    // Add outputs section if node has outputs
    if (node.outputs.length > 0) {
      const outputsTitle = document.createElement('div');
      outputsTitle.textContent = 'Outputs';
      outputsTitle.style.fontSize = '0.9em';
      outputsTitle.style.color = '#aaa';
      outputsTitle.style.marginTop = '8px';
      inputsContainer.appendChild(outputsTitle);

      node.outputs.forEach((pin: any) => {
        inputsContainer.appendChild(createInputForPin(pin, false));
      });
    }

    inputOverlay.style.display = 'block';
    // Position overlay near node
    const screenPos = worldToScreenLocal(node.pos);
    inputOverlay.style.left = (screenPos.x + 40) + 'px';
    inputOverlay.style.top = (screenPos.y + 40) + 'px';
  }
  function hideInputOverlay() {
    if (inputOverlay) inputOverlay.style.display = 'none';
  }
  const canvas = document.getElementById('nodeCanvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas element not found');
  const ctx = canvas.getContext('2d')!;
  
  // Canvas ocupa TODA la ventana disponible para máxima área de trabajo
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 80; // Solo margen para toolbar
  
  const coordsDisplay = document.getElementById('coordinates') || document.createElement('span');
  const zoomDisplay = document.getElementById('zoom') || document.createElement('span');
  const modeDisplay = document.getElementById('mode') || document.createElement('span');
  const editor = new NodeEditor(onConnect, onDrop);
  const selection = new CanvasSelection();
  const execution = new CanvasExecution(editor);
  const propertiesPanel = new PropertiesPanel();
  let isMoveMode = false;
  let lastTime = 0;
  let keys: Set<string> = new Set();
  
  // Inicializar el sistema de coordenadas centrado
  editor.scale = 1.0;
  editor.viewOffset = new Vec2(0, 0);
  
  // Estados de interacción
  let isPanning = false;
  let panStart = new Vec2();
  let panOffset = new Vec2();
  let isDragging = false;
  let dragStart = new Vec2();
  let viewOffsetStart = new Vec2();
  let lastMousePos = new Vec2();
  let lastPanPoint = new Vec2();
  
  // Los eventos de mouse ahora son manejados por CanvasEvents.ts
  
  // Agregar un nodo inicial para probar
  editor.addNode('number', 0, 0);
  
  let inpt: InputState = {
    scale: 1.0,
    aspectRatio: canvas.width / canvas.height,
    mousePos: new Vec2(0, 0),
    mouseButtonLeft: false,
    mouseButtonMiddle: false,
    mouseButtonRight: false,
    shift: false,
    ctrl: false,
    escape: false,
    deletePressed: false,
    aPressed: false,
  };
  // Métodos utilitarios

  // Métodos utilitarios
  function updateInput() {
    inpt.shift = keys.has('shift');
    inpt.ctrl = keys.has('control');
    inpt.escape = keys.has('escape');
    inpt.deletePressed = keys.has('delete') || keys.has('backspace');
    inpt.aPressed = keys.has('a');
  }

  function toggleMoveMode() {
    isMoveMode = !isMoveMode;
    canvas.style.cursor = isMoveMode ? 'grab' : 'default';
    modeDisplay.textContent = isMoveMode ? 'Move' : 'Select';
    if (!isMoveMode && isDragging) isDragging = false;
  }

  function screenToWorldLocal(screenPos: Vec2) {
    return screenToWorld(screenPos, canvas, editor.scale, editor.viewOffset);
  }
  function worldToScreenLocal(worldPos: Vec2) {
    return worldToScreen(worldPos, canvas, editor.scale, editor.viewOffset);
  }
  function updateOverlayLocal(mousePos: Vec2) {
    // mousePos es en pantalla, convertir a mundo
    const worldPos = screenToWorld(mousePos, canvas, editor.scale, editor.viewOffset);
    updateOverlay(coordsDisplay, zoomDisplay, modeDisplay, worldPos, editor.scale);
  }

  // Delegar eventos
  window.addEventListener('resize', () => {
    // Canvas se ajusta COMPLETAMENTE a la ventana
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80; // Solo espacio para toolbar
    inpt.aspectRatio = canvas.width / canvas.height;
    console.log(`📐 Canvas redimensionado: ${canvas.width}x${canvas.height}`);
  });
  canvas.addEventListener('mousemove', (e) => CanvasEvents.handleMouseMove({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
  }, e));
  canvas.addEventListener('mousedown', (e) => CanvasEvents.handleMouseDown({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
  }, e));
  canvas.addEventListener('mouseup', (e) => CanvasEvents.handleMouseUp({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
  }, e));
  canvas.addEventListener('dblclick', (e) => CanvasEvents.handleDblClick({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
  }, e));
  canvas.addEventListener('wheel', (e) => CanvasEvents.handleWheel({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
  }, e));
  // Manejo de teclas direccionales
  window.addEventListener('keydown', (e) => {
    // Movimiento diagonal y por teclas direccionales
  const moveSpeed = 0.4 / editor.scale; // velocidad aumentada
    // Atajo Ctrl+G para centrar la vista en (0,0)
    if (e.ctrlKey && e.key.toLowerCase() === 'g') {
      editor.viewOffset.x = 0;
      editor.viewOffset.y = 0;
      editor.render(ctx, canvas.width, canvas.height);
      updateOverlayLocal(new Vec2(canvas.width/2, canvas.height/2));
      e.preventDefault();
      return;
    }
    keys.add(e.key.toLowerCase());
    let dx = 0, dy = 0;
    if (keys.has('arrowleft')) dx -= 1;
    if (keys.has('arrowright')) dx += 1;
    if (keys.has('arrowup')) dy -= 1;
    if (keys.has('arrowdown')) dy += 1;
    if (dx !== 0 || dy !== 0) {
      // Normalizar para movimiento diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
      }
      editor.viewOffset.x += dx * moveSpeed;
      editor.viewOffset.y += dy * moveSpeed;
      editor.render(ctx, canvas.width, canvas.height);
      updateOverlayLocal(inpt.mousePos);
      e.preventDefault();
    }
    CanvasEvents.handleKeyDown({
      canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
      screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
      NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
    }, e);
  });
  
  // Eliminar duplicado y corregir sintaxis de keyup
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
    CanvasEvents.handleKeyUp({
      canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
      screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
      NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor, propertiesPanel
    }, e);
  });
  // Arrastre del canvas con botón izquierdo (sin nodos seleccionados)
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !selection.selectedNodes.size && !selection.isSelecting) {
      isPanning = true;
      const rect = canvas.getBoundingClientRect();
      panStart = new Vec2(e.clientX - rect.left, e.clientY - rect.top);
      panOffset = new Vec2(editor.viewOffset.x, editor.viewOffset.y);
      canvas.style.cursor = 'grabbing';
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    if (isPanning) {
      const rect = canvas.getBoundingClientRect();
      const current = new Vec2(e.clientX - rect.left, e.clientY - rect.top);
  const dx = (current.x - panStart.x) / (100 * editor.scale);
  const dy = (current.y - panStart.y) / (100 * editor.scale);
  editor.viewOffset.x = panOffset.x - dx;
  editor.viewOffset.y = panOffset.y - dy;
      editor.render(ctx, canvas.width, canvas.height);
      updateOverlayLocal(screenToWorldLocal(current));
    }
  });
  canvas.addEventListener('mouseup', () => {
    isPanning = false;
    canvas.style.cursor = 'default';
  });
  canvas.addEventListener('mouseleave', () => {
    isPanning = false;
    canvas.style.cursor = 'default';
  });

    // Control de zoom con escala más suave
  const zoomRange = document.getElementById('zoomRange') as HTMLInputElement;
  if (zoomRange) {
    zoomRange.min = '50';   // Mínimo zoom 50%
    zoomRange.max = '150';  // Máximo zoom 150%
    zoomRange.step = '1';   // Pasos de 1% para un zoom muy suave
    zoomRange.value = '100'; // Valor inicial 100%
    
    // Inicializa el valor del span
    if (zoomDisplay) zoomDisplay.textContent = `${zoomRange.value}%`;
    
    zoomRange.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      // Usar una escala más suave para el editor
      editor.scale = value / 100;
      inpt.scale = editor.scale;
      
      // Actualiza el span de zoom
      if (zoomDisplay) zoomDisplay.textContent = `${value}%`;
      
      // Forzar actualización inmediata
      editor.render(ctx, canvas.width, canvas.height);
      updateOverlayLocal(inpt.mousePos);
    });
  }  // Atajo de modo movimiento
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Space') toggleMoveMode();
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Space') toggleMoveMode();
  });

  // Centrar el sistema de coordenadas en el canvas
  editor.viewOffset.x = 0;
  editor.viewOffset.y = 0;

  // Crear nodo inicial en el centro del canvas en coordenadas de mundo
  const centerScreen = new Vec2(canvas.width / 2, canvas.height / 2);
  const centerWorld = screenToWorld(centerScreen, canvas, editor.scale, editor.viewOffset);
  editor.addNode('number', centerWorld.x, centerWorld.y);

  // Sincronizar isDragging con selección
  // OBSOLETO: Esta función ya no se usa, el dragging se maneja en CanvasEvents
  // function updateDraggingState() {
  //   isDragging = false;
  //   for (const node of editor.nodes) {
  //     if (node.selected) {
  //       isDragging = true;
  //       break;
  //     }
  //   }
  // }

  // Llamar a updateDraggingState en cada frame
  function loop(time: number) {
    const deltaTime = time - lastTime;
    lastTime = time;
    updateInput();
    // updateDraggingState(); // OBSOLETO: ya no se usa
    editor.update(inpt, deltaTime);
    editor.render(ctx, canvas.width, canvas.height);
    
    // Los ejes ya se dibujan en NodeEditor.render(), no duplicar aquí
    
    // Resaltar nodos seleccionados
    for (const node of selection.selectedNodes) {
  const pos = worldToScreenLocal(node.pos);
  ctx.save();
  // Zona de drag: header/título, pero círculo pequeño y a la izquierda
  const nodeWidth = 80 * editor.scale; // Ancho estimado del nodo
  const headerHeight = 18 * editor.scale;
  // Rectángulo centrado en el header, alineado con el holder de draggable
  const rectWidth = 28 * editor.scale;
  const rectHeight = headerHeight;
  const rectX = pos.x - rectWidth / 2;
  const rectY = pos.y - headerHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 123, 255, 0.18)';
  ctx.strokeStyle = 'rgba(0, 123, 255, 0.85)';
  ctx.lineWidth = 2 * editor.scale;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
  ctx.restore();
    }
    // Show input overlay for any selected node
    let selectedNode = null;
    for (const node of selection.selectedNodes) {
      selectedNode = node;
      break; // Show overlay for the first selected node
    }
    if (selectedNode) {
      showInputOverlay(selectedNode);
    } else {
      hideInputOverlay();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // API pública mínima
  return {
    editor,
    selection,
    execution,
    updateOverlay: updateOverlayLocal,
    screenToWorld: screenToWorldLocal,
    worldToScreen: worldToScreenLocal,
    toggleMoveMode,
  };
}

// Conexión de nodos
function onConnect(this: NodeEditor, a: Pin, b: Pin) {
  const index = this.links.length;
  a.userData = index;
  b.userData = index;
  this.links[index] = [a, b];
}

function onDrop(this: NodeEditor, px: number, py: number, a: Pin) {
  if (a.userData !== null) {
    const ind = a.userData;
    if (this.links[ind]) {
      this.links[ind][0]!.userData = null;
      this.links[ind][1]!.userData = null;
      this.links[ind] = [null, null];
    }
  }
}
