// CanvasEvents.ts
// Gestión de eventos de mouse, teclado y wheel para el canvas
import { Vec2, InputState } from '../../types/types';
import { NodeEditor } from '../../core/NodeEditor';
import { Node, Pin } from '../../core/Node';

export type CanvasEventHandlers = {
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
  handleDblClick: (e: MouseEvent) => void;
  handleWheel: (e: WheelEvent) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
};

// Handlers desacoplados: reciben el manager y el evento
export function handleMouseMove(manager: any, e: MouseEvent) {
  const rect = manager.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const screenPos = new manager.Vec2(x, y);
  const worldPos = manager.screenToWorld(screenPos);
  if (manager.isPanning) {
    const dx = (x - manager.lastPanPoint.x) / (manager.canvas.width * 0.5) / manager.editor.scale;
    const dy = (y - manager.lastPanPoint.y) / (manager.canvas.height * 0.5) / manager.editor.scale;
    manager.editor.viewOffset.x -= dx;
    manager.editor.viewOffset.y -= dy;
    manager.lastPanPoint.x = x;
    manager.lastPanPoint.y = y;
  } else if (manager.selection.isMovingSelection && manager.selection.selectedNodes.size > 0) {
    const dx = worldPos.x - manager.selection.selectionMoveStart.x;
    const dy = worldPos.y - manager.selection.selectionMoveStart.y;
    for (const node of manager.selection.selectedNodes) {
      const offset = manager.selection.nodeOffsets.get(node);
      if (offset) {
        node.pos.x = offset.x + dx;
        node.pos.y = offset.y + dy;
      }
    }
  } else {
    manager.inpt.mousePos.x = x;
    manager.inpt.mousePos.y = y;
    if (!manager.selection.isSelecting) {
      let isOverNode = false;
      for (const node of manager.editor.nodes) {
        const dx = worldPos.x - node.pos.x;
        const dy = worldPos.y - node.pos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.2) {
          isOverNode = true;
          break;
        }
      }
      manager.canvas.style.cursor = isOverNode ? 'pointer' : 'default';
    }
  }
  manager.updateOverlay(manager.inpt.mousePos);
}

export function handleMouseDown(manager: any, e: MouseEvent) {
  // Evitar interferencia si el clic no es en el canvas
  if (e.target !== manager.canvas && !manager.canvas.contains(e.target)) return;
  
  const rect = manager.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const screenPos = new manager.Vec2(x, y);
  const worldPos = manager.screenToWorld(screenPos);
  if (e.button === 0) {
    if (manager.isMoveMode) {
      manager.isDragging = true;
      manager.dragStart.x = x;
      manager.dragStart.y = y;
      manager.viewOffsetStart.x = manager.editor.viewOffset.x;
      manager.viewOffsetStart.y = manager.editor.viewOffset.y;
      manager.canvas.style.cursor = 'grabbing';
    } else if (e.shiftKey) {
      manager.selection.isSelecting = true;
      manager.selection.selectionStart = screenPos;
      manager.selection.selectionStartWorld = new manager.Vec2(worldPos.x, worldPos.y);
      manager.canvas.style.cursor = 'crosshair';
    } else {
      let clickedNode = null;
      let clickedOnSelected = false;
      for (const node of manager.editor.nodes) {
        const dx = worldPos.x - node.pos.x;
        const dy = worldPos.y - node.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 0.2) {
          clickedNode = node;
          clickedOnSelected = manager.selection.selectedNodes.has(node);
          break;
        }
      }
      if (clickedNode) {
        if (!clickedOnSelected && !e.ctrlKey) manager.selection.selectedNodes.clear();
        if (e.ctrlKey && manager.selection.selectedNodes.has(clickedNode)) manager.selection.selectedNodes.delete(clickedNode);
        else manager.selection.selectedNodes.add(clickedNode);
        if (manager.selection.selectedNodes.size > 0) {
          manager.selection.isMovingSelection = true;
          manager.selection.selectionMoveStart = new manager.Vec2(worldPos.x, worldPos.y);
          manager.selection.nodeOffsets.clear();
          for (const node of manager.selection.selectedNodes) {
            manager.selection.nodeOffsets.set(node, new manager.Vec2(node.pos.x, node.pos.y));
          }
        }
      } else {
        if (!e.ctrlKey) manager.selection.selectedNodes.clear();
        manager.inpt.mouseButtonLeft = true;
      }
    }
  } else if (e.button === 1) {
    manager.inpt.mouseButtonMiddle = true;
    manager.isPanning = true;
    manager.lastPanPoint.x = x;
    manager.lastPanPoint.y = y;
    manager.canvas.style.cursor = 'grabbing';
  } else if (e.button === 2) {
    manager.inpt.mouseButtonRight = true;
  }
  e.preventDefault();
}

export function handleMouseUp(manager: any, e: MouseEvent) {
  if (e.button === 0) {
    if (manager.isDragging) {
      manager.isDragging = false;
      manager.canvas.style.cursor = manager.isMoveMode ? 'grab' : 'default';
    }
    manager.inpt.mouseButtonLeft = false;
    if (manager.selection.isSelecting) {
      manager.selection.isSelecting = false;
      manager.canvas.style.cursor = 'default';
      const currentWorldPos = manager.screenToWorld(new manager.Vec2(manager.inpt.mousePos.x, manager.inpt.mousePos.y));
      const selectionWorldRect = {
        left: Math.min(manager.selection.selectionStartWorld.x, currentWorldPos.x),
        right: Math.max(manager.selection.selectionStartWorld.x, currentWorldPos.x),
        top: Math.min(manager.selection.selectionStartWorld.y, currentWorldPos.y),
        bottom: Math.max(manager.selection.selectionStartWorld.y, currentWorldPos.y)
      };
      if (!e.ctrlKey) manager.selection.selectedNodes.clear();
      for (const node of manager.editor.nodes) {
        if (node.pos.x >= selectionWorldRect.left && node.pos.x <= selectionWorldRect.right && node.pos.y >= selectionWorldRect.top && node.pos.y <= selectionWorldRect.bottom) {
          if (e.ctrlKey && manager.selection.selectedNodes.has(node)) manager.selection.selectedNodes.delete(node);
          else manager.selection.selectedNodes.add(node);
        }
      }
    }
    if (manager.selection.isMovingSelection) {
      manager.selection.isMovingSelection = false;
      manager.selection.nodeOffsets.clear();
    }
    const worldPos = manager.screenToWorld(new manager.Vec2(manager.inpt.mousePos.x, manager.inpt.mousePos.y));
    for (const node of manager.editor.nodes) {
      const dx = worldPos.x - node.pos.x;
      const dy = worldPos.y - node.pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.2) {
        manager.canvas.style.cursor = 'pointer';
        break;
      }
    }
  }
  if (e.button === 1) {
    manager.inpt.mouseButtonMiddle = false;
    manager.isPanning = false;
    manager.canvas.style.cursor = 'default';
  }
  if (e.button === 2) manager.inpt.mouseButtonRight = false;
}

export function handleDblClick(manager: any, e: MouseEvent) {
  // Evento de doble clic: abrir panel de propiedades del nodo
  e.preventDefault();
  e.stopPropagation();
  
  const rect = manager.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const screenPos = new manager.Vec2(x, y);
  const worldPos = manager.screenToWorld(screenPos);

  console.log('🖱️ DOBLE-CLICK en pantalla:', { screenX: x, screenY: y });
  console.log('🌍 Coordenadas mundo:', { worldX: worldPos.x.toFixed(2), worldY: worldPos.y.toFixed(2) });

  // Buscar el nodo bajo el cursor usando detección por rectángulo (más preciso)
  let foundNode = null;
  let minDistance = Infinity;
  
  for (const node of manager.editor.nodes) {
    // Usar el tamaño real del nodo para detección de rectángulo
    const halfWidth = node.size.x / 2;
    const halfHeight = node.size.y / 2;
    
    // Verificar si el click está dentro del rectángulo del nodo
    const withinX = worldPos.x >= (node.pos.x - halfWidth) && worldPos.x <= (node.pos.x + halfWidth);
    const withinY = worldPos.y >= (node.pos.y - halfHeight) && worldPos.y <= (node.pos.y + halfHeight);
    
    console.log(`  📦 Nodo "${node.title}" en (${node.pos.x.toFixed(2)}, ${node.pos.y.toFixed(2)}), tamaño: ${node.size.x.toFixed(1)}×${node.size.y.toFixed(1)}`);
    console.log(`     Límites: X[${(node.pos.x - halfWidth).toFixed(2)} - ${(node.pos.x + halfWidth).toFixed(2)}], Y[${(node.pos.y - halfHeight).toFixed(2)} - ${(node.pos.y + halfHeight).toFixed(2)}]`);
    console.log(`     Dentro: X=${withinX}, Y=${withinY}`);
    
    if (withinX && withinY) {
      // Calcular distancia al centro para priorizar nodos más cercanos si hay overlapping
      const dx = worldPos.x - node.pos.x;
      const dy = worldPos.y - node.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        foundNode = node;
      }
    }
  }

  if (foundNode) {
    console.log('✅ NODO ENCONTRADO:', foundNode.title);
    if (manager.propertiesPanel) {
      manager.propertiesPanel.show(foundNode);
      console.log('📝 Panel de propiedades abierto');
    } else {
      console.error('❌ ERROR: propertiesPanel no existe en manager');
      console.log('Manager keys:', Object.keys(manager));
    }
  } else {
    console.log('❌ No se encontró ningún nodo en esta posición');
    console.log(`   Total nodos en canvas: ${manager.editor.nodes.length}`);
  }
}

export function handleWheel(manager: any, e: WheelEvent) {
  // Zoom centrado en el CENTRO de la pantalla (más suave y ligero)
  let scale = manager.editor.scale;
  const zoomIntensity = 0.05; // Reducido para zoom más suave
  
  if (e.deltaY < 0) {
    scale *= (1 + zoomIntensity);
  } else {
    scale *= (1 - zoomIntensity);
  }
  
  scale = Math.max(0.2, Math.min(3, scale)); // Rango ampliado
  manager.editor.scale = scale;
  manager.inpt.scale = scale;
  
  // El offset se mantiene centrado, no necesita ajuste
  manager.editor.render(manager.ctx, manager.canvas.width, manager.canvas.height);
  
  const rect = manager.canvas.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  manager.updateOverlay(new manager.Vec2(centerX, centerY));
  
  e.preventDefault();
}

export function handleKeyDown(manager: any, e: KeyboardEvent) {
  // Evitar interferencia con elementos UI
  if (e.target instanceof HTMLInputElement || 
      e.target instanceof HTMLTextAreaElement || 
      e.target instanceof HTMLSelectElement ||
      e.target instanceof HTMLButtonElement) return;
  
  const key = e.key.toLowerCase();
  if (!manager.keys.has(key)) {
    manager.keys.add(key);
    if (key === 'delete' || key === 'backspace') {
      if (manager.selection.selectedNodes.size > 0) {
        const nodesToDelete = new Set(manager.selection.selectedNodes);
        manager.editor.nodes = manager.editor.nodes.filter((node: any) => !nodesToDelete.has(node));
        manager.editor.links = manager.editor.links.map((link: any) => {
          if (!link) return [null, null];
          const [from, to] = link;
          if (from && to && (nodesToDelete.has(from.node) || nodesToDelete.has(to.node))) {
            if (from) from.userData = null;
            if (to) to.userData = null;
            return [null, null];
          }
          return link;
        });
        manager.selection.selectedNodes.clear();
      }
    }
  } else if (key === 'a' && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    const nodeTypeSelect = document.getElementById('nodeTypeSelect');
    const worldPos = manager.screenToWorld(manager.inpt.mousePos);
    let nodeType;
    if (nodeTypeSelect && nodeTypeSelect instanceof HTMLSelectElement && nodeTypeSelect.value) nodeType = nodeTypeSelect.value;
    else {
      const basicTypes = ['number', 'boolean', 'display'];
      nodeType = basicTypes[Math.floor(Math.random() * basicTypes.length)];
    }
    const alreadyExists = manager.editor.nodes.some((node: any) => {
      const dx = node.pos.x - worldPos.x;
      const dy = node.pos.y - worldPos.y;
      return Math.sqrt(dx * dx + dy * dy) < 0.2;
    });
    if (!alreadyExists) {
      const node = manager.Node.create(nodeType, worldPos.x, worldPos.y);
      if (node) {
        manager.editor.nodes.push(node);
        manager.selection.selectedNodes.clear();
        manager.selection.selectedNodes.add(node);
      }
    }
  }
}

export function handleKeyUp(manager: any, e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  if (manager.keys.has(key)) {
    manager.keys.delete(key);
    manager.updateInput();
  }
}
