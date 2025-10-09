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
  editor.scale = 1.0; // Escala inicial normal
  
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
  // Estados de interacción
  let lastMousePos = { x: 0, y: 0 };
  let isPanning = false;
  let lastPanPoint = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let viewOffsetStart = { x: 0, y: 0 };

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
    updateOverlay(coordsDisplay, zoomDisplay, modeDisplay, mousePos, editor.scale);
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
  window.addEventListener('keydown', (e) => CanvasEvents.handleKeyDown({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));
  window.addEventListener('keyup', (e) => CanvasEvents.handleKeyUp({
    canvas, ctx, editor, selection, execution, isMoveMode, lastTime, keys, inpt, lastMousePos, isPanning, lastPanPoint, isDragging, dragStart, viewOffsetStart,
    screenToWorld: screenToWorldLocal, worldToScreen: worldToScreenLocal, updateOverlay: updateOverlayLocal, toggleMoveMode,
    NodeEditor, Node: editor.constructor, Vec2: editor.viewOffset.constructor
  }, e));

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

  // Arrastre natural del canvas con click izquierdo SOLO si no se arrastra nodo ni selección
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !isDragging && !selection.isSelecting) {
      isPanning = true;
      const rect = canvas.getBoundingClientRect();
      const mouseScreen = new Vec2(e.clientX - rect.left, e.clientY - rect.top);
      dragStart = { x: mouseScreen.x, y: mouseScreen.y };
      viewOffsetStart = { x: editor.viewOffset.x, y: editor.viewOffset.y };
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isPanning && !isDragging && !selection.isSelecting) {
      const rect = canvas.getBoundingClientRect();
      const mouseScreen = new Vec2(e.clientX - rect.left, e.clientY - rect.top);
      const dx = mouseScreen.x - dragStart.x;
      const dy = mouseScreen.y - dragStart.y;
      editor.viewOffset.x = viewOffsetStart.x - dx / (100 * editor.scale);
      editor.viewOffset.y = viewOffsetStart.y - dy / (100 * editor.scale);
      editor.render(ctx, canvas.width, canvas.height);
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      isPanning = false;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    isPanning = false;
  });

  // Al inicializar, centrar el sistema de coordenadas en el centro del canvas
  editor.viewOffset.x = 0;
  editor.viewOffset.y = 0;

  // Render loop
  function loop(time: number) {
    const deltaTime = time - lastTime;
    lastTime = time;
    updateInput();
    editor.update(inpt, deltaTime);
    editor.render(ctx, canvas.width, canvas.height);
    // Resaltar nodos seleccionados
    for (const node of selection.selectedNodes) {
      const pos = worldToScreenLocal(node.pos);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.stroke();
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
