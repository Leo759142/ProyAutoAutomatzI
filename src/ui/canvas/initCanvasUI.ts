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

export function initCanvasUI() {
  const canvas = document.getElementById('nodeCanvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas element not found');
  const ctx = canvas.getContext('2d')!;
  
  // Establecer tamaño inicial del canvas - un poco más pequeño que la ventana
  canvas.width = window.innerWidth - 40; // 20px margen a cada lado
  canvas.height = window.innerHeight - 100; // margen para la toolbar y abajo
  
  const coordsDisplay = document.getElementById('coordinates') || document.createElement('span');
  const zoomDisplay = document.getElementById('zoom') || document.createElement('span');
  const modeDisplay = document.getElementById('mode') || document.createElement('span');
  const editor = new NodeEditor(onConnect, onDrop);
  const selection = new CanvasSelection();
  const execution = new CanvasExecution(editor);
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    inpt.aspectRatio = canvas.width / canvas.height;
  });
  canvas.addEventListener('mousemove', (e) => CanvasEvents.handleMouseMove({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));
  canvas.addEventListener('mousedown', (e) => CanvasEvents.handleMouseDown({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));
  canvas.addEventListener('mouseup', (e) => CanvasEvents.handleMouseUp({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));
  canvas.addEventListener('wheel', (e) => CanvasEvents.handleWheel({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));
  // Manejo de teclas direccionales
  window.addEventListener('keydown', (e) => {
    // Movimiento diagonal y por teclas direccionales
    const moveSpeed = 0.1 / editor.scale;
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
      NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
    }, e);
  });
  
  // Eliminar duplicado y corregir sintaxis de keyup
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key.toLowerCase());
    CanvasEvents.handleKeyUp({
      canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
      screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
      NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
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
  function updateDraggingState() {
    isDragging = false;
    for (const node of editor.nodes) {
      if (node.selected && node.draggable) {
        isDragging = true;
        break;
      }
    }
  }

  // Llamar a updateDraggingState en cada frame
  function loop(time: number) {
    const deltaTime = time - lastTime;
    lastTime = time;
    updateInput();
    updateDraggingState();
    editor.update(inpt, deltaTime);
    editor.render(ctx, canvas.width, canvas.height);
    
    // Dibujar ejes coordenados
    const origin = worldToScreenLocal(new Vec2(0, 0));
    const axisLength = 1000; // Longitud de los ejes en píxeles
    
    // Eje X (verde)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(origin.x - axisLength, origin.y);
    ctx.lineTo(origin.x + axisLength, origin.y);
    ctx.stroke();
    
    // Eje Y (rojo)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.moveTo(origin.x, origin.y - axisLength);
    ctx.lineTo(origin.x, origin.y + axisLength);
    ctx.stroke();
    // Resaltar nodos seleccionados
    for (const node of selection.selectedNodes) {
  const pos = worldToScreenLocal(node.pos);
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
  ctx.lineWidth = 2;
  // Dibujar rectángulo centrado en el nodo
  ctx.strokeRect(pos.x - 20, pos.y - 12, 40, 24);
  ctx.restore();
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
