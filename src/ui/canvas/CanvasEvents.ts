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
  // No hay necesidad de arrastre temporal - el sistema es de click-click

  // Movimiento de nodos SOLO si hay selección activa (zona azul)
  if (manager.selection.isMovingSelection && manager.selection.selectedNodes.size > 0) {
    // Si estamos moviendo nodos, NO permitir panning
    const dx = worldPos.x - manager.selection.selectionMoveStart.x;
    const dy = worldPos.y - manager.selection.selectionMoveStart.y;
    for (const node of manager.selection.selectedNodes) {
      const offset = manager.selection.nodeOffsets.get(node);
      if (offset) {
        node.pos.x = offset.x + dx;
        node.pos.y = offset.y + dy;
      }
    }
    return;
  }

  // El sistema de conexiones ya no interfiere con el panning

  // Panning SOLO con botón central y si NO estamos moviendo nodos NI creando conexiones
  if (manager.isPanning && manager.inpt.mouseButtonMiddle && 
      !(manager.selection.isMovingSelection && manager.selection.selectedNodes.size > 0)) {
    // Sistema simplificado: 1 píxel = 1 unidad
    const dx = (x - manager.lastPanPoint.x) / manager.editor.scale;
    const dy = (y - manager.lastPanPoint.y) / manager.editor.scale;
    manager.editor.viewOffset.x -= dx;
    manager.editor.viewOffset.y -= dy;
    const MAX_OFFSET = 2000; // Aumentar límite para permitir más navegación
    manager.editor.viewOffset.x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, manager.editor.viewOffset.x));
    manager.editor.viewOffset.y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, manager.editor.viewOffset.y));
    manager.lastPanPoint.x = x;
    manager.lastPanPoint.y = y;
    return;
  }

  // Actualizar posición del mouse para otras interacciones
  manager.inpt.mousePos.x = x;
  manager.inpt.mousePos.y = y;
  if (!manager.selection.isSelecting) {
    // Verificar si está sobre un pin primero
    let isOverPin = false;
    const PIN_HOVER_RADIUS = 0.3;
    
    for (const node of manager.editor.nodes) {
      for (const pin of [...node.inputs, ...node.outputs]) {
        const dx = worldPos.x - pin.pos.x;
        const dy = worldPos.y - pin.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < PIN_HOVER_RADIUS) {
          isOverPin = true;
          // Cambiar cursor para indicar que se puede hacer clic
          const hasConnection = pin.userData !== null && pin.userData !== undefined;
          manager.canvas.style.cursor = hasConnection ? 'not-allowed' : 'crosshair';
          break;
        }
      }
      if (isOverPin) break;
    }
    
    if (!isOverPin) {
      // Si no está sobre un pin, verificar nodos
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
      // PRIMERO: Verificar si hay click en un PIN (área invisible ampliada)
      let clickedPin = null;
      const PIN_CLICK_RADIUS = 0.3; // Radio amplio para fácil clic en pines
      
      for (const node of manager.editor.nodes) {
        // Verificar pines de entrada
        for (const pin of node.inputs) {
          const dx = worldPos.x - pin.pos.x;
          const dy = worldPos.y - pin.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < PIN_CLICK_RADIUS) {
            clickedPin = pin;
            console.log(`📌 PIN CLICKEADO: ${pin.name} (input) del nodo ${node.title}`);
            break;
          }
        }
        if (clickedPin) break;
        
        // Verificar pines de salida
        for (const pin of node.outputs) {
          const dx = worldPos.x - pin.pos.x;
          const dy = worldPos.y - pin.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < PIN_CLICK_RADIUS) {
            clickedPin = pin;
            console.log(`📌 PIN CLICKEADO: ${pin.name} (output) del nodo ${node.title}`);
            break;
          }
        }
        if (clickedPin) break;
      }
      
      if (clickedPin) {
        // Sistema simple: primer click selecciona, segundo click conecta
        if (!manager.editor.selectedPin) {
          // Primer click: seleccionar pin origen
          manager.editor.selectedPin = clickedPin;
          console.log(`📌 Pin seleccionado: ${clickedPin.name} del nodo ${clickedPin.parent.title}`);
          manager.canvas.style.cursor = 'crosshair';
        } else {
          // Segundo click: intentar conectar
          const fromPin = manager.editor.selectedPin;
          const toPin = clickedPin;
          
          if (fromPin !== toPin && fromPin.isInput !== toPin.isInput) {
            // Conexión válida
            let sourcePin = fromPin.isInput ? toPin : fromPin;
            let targetPin = fromPin.isInput ? fromPin : toPin;
            
            // IMPORTANTE: Si el pin de entrada ya tiene conexión, eliminarla primero
            if (targetPin.userData !== null && targetPin.userData !== undefined) {
              const oldIndex = targetPin.userData;
              if (manager.editor.links[oldIndex]) {
                console.log(`🗑️ Eliminando conexión anterior del pin ${targetPin.name}`);
                // Limpiar userData de ambos pines de la conexión anterior
                const oldLink = manager.editor.links[oldIndex];
                if (oldLink[0]) oldLink[0].userData = null;
                if (oldLink[1]) oldLink[1].userData = null;
                manager.editor.links[oldIndex] = null; // Marcar como eliminado
              }
            }
            
            console.log(`🔗 Conectando: ${sourcePin.parent.title}.${sourcePin.name} → ${targetPin.parent.title}.${targetPin.name}`);
            
            // Crear la nueva conexión
            const index = manager.editor.links.length;
            sourcePin.userData = index;
            targetPin.userData = index;
            manager.editor.links[index] = [sourcePin, targetPin];
            
            // Recalcular valores
            manager.editor.computeAll();
          } else {
            console.log('❌ Conexión inválida: mismo pin o mismo tipo');
          }
          
          // Limpiar selección
          manager.editor.selectedPin = null;
          manager.canvas.style.cursor = 'default';
        }
        return;
      } else {
        // SEGUNDO: Si no hay pin, verificar click en nodo
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
    }
  } else if (e.button === 1) {
    manager.inpt.mouseButtonMiddle = true;
    manager.isPanning = true;
    manager.lastPanPoint.x = x;
    manager.lastPanPoint.y = y;
    manager.canvas.style.cursor = 'grabbing';
  } else if (e.button === 2) {
    // Click derecho: primero verificar si es en un PIN
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
      // Click derecho en PIN: eliminar TODAS las conexiones de ese pin
      const linkIndex = clickedPin.userData;
      if (linkIndex !== null && linkIndex !== undefined && manager.editor.links[linkIndex]) {
        const [fromPin, toPin] = manager.editor.links[linkIndex];
        console.log(`🗑️ Click derecho en PIN: Eliminando conexión ${fromPin.parent.title}.${fromPin.name} → ${toPin.parent.title}.${toPin.name}`);
        
        // Limpiar userData de ambos pines
        if (fromPin) fromPin.userData = null;
        if (toPin) toPin.userData = null;
        
        // Eliminar el link
        manager.editor.links[linkIndex] = null;
        
        // Recomputar
        manager.editor.computeAll();
        
        // Mostrar mensaje visual
        const logAudit = (window as any).logAudit;
        if (logAudit) {
          logAudit(`🗑️ Conexión eliminada: ${fromPin.parent.title}.${fromPin.name} → ${toPin.parent.title}.${toPin.name}`);
        }
        
        e.preventDefault();
        return;
      } else {
        console.log('ℹ️ Este pin no tiene conexiones para eliminar');
        const logAudit = (window as any).logAudit;
        if (logAudit) {
          logAudit(`ℹ️ Pin ${clickedPin.name} no tiene conexiones`);
        }
        e.preventDefault();
        return;
      }
    }
    
    // Si no es en pin, intentar eliminar conexión por proximidad al link
    const { getClosestLink } = require('./CanvasUtils');
    const closestLink = getClosestLink(worldPos, manager.editor.links, 0.3);
    if (closestLink) {
      const [fromPin, toPin] = closestLink.link;
      const linkIndex = closestLink.index;
      console.log(`🗑️ Click derecho en línea: Eliminando conexión ${fromPin.parent.title}.${fromPin.name} → ${toPin.parent.title}.${toPin.name}`);
      if (fromPin) fromPin.userData = null;
      if (toPin) toPin.userData = null;
      manager.editor.links[linkIndex] = null;
      manager.editor.computeAll();
      e.preventDefault();
      return;
    }
    // Si no hay link, ni nodo ni pin, deseleccionar todo
    let clickedNode = null;
    for (const node of manager.editor.nodes) {
      const dx = worldPos.x - node.pos.x;
      const dy = worldPos.y - node.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 0.2) {
        clickedNode = node;
        break;
      }
    }
    if (!clickedNode) {
      manager.selection.selectedNodes.clear();
      manager.selection.isMovingSelection = false;
      manager.selection.nodeOffsets.clear();
      manager.canvas.style.cursor = 'default';
      console.log('🖱️ Click derecho en canvas vacío: deselección total');
    }
    manager.inpt.mouseButtonRight = true;
  }
  e.preventDefault();
}

export function handleMouseUp(manager: any, e: MouseEvent) {
  if (e.button === 0) {
    const rect = manager.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const screenPos = new manager.Vec2(x, y);
    const worldPosUp = manager.screenToWorld(screenPos);
    
    // El sistema de conexiones ahora es click-click, no hay arrastre a manejar
    
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
  // Evento de doble clic: abrir panel de propiedades del nodo o editar peso de conexión
  e.preventDefault();
  e.stopPropagation();
  
  const rect = manager.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const screenPos = new manager.Vec2(x, y);
  const worldPos = manager.screenToWorld(screenPos);

  console.log('🖱️ DOBLE-CLICK en pantalla:', { screenX: x, screenY: y });
  console.log('🌍 Coordenadas mundo:', { worldX: worldPos.x.toFixed(2), worldY: worldPos.y.toFixed(2) });

  // PRIMERO: Verificar si el doble click fue en una línea de conexión
  try {
    const { getClosestLink } = require('./CanvasUtils');
    const closestLink = getClosestLink(worldPos, manager.editor.links, 0.4); // Radio más amplio para edición
    
    if (closestLink) {
      console.log('✏️ DOBLE-CLICK detectado en línea de conexión');
      console.log('🔍 Link encontrado:', closestLink);
      
      const linkIndex = closestLink.index;
      const [fromPin, toPin] = closestLink.link;
      
      if (!fromPin || !toPin) {
        console.error('❌ Error: pins no válidos en la conexión');
        return;
      }
      
      // Obtener peso actual
      let currentWeight = 1;
      if (manager.editor.templateConnections && 
          manager.editor.templateConnections[linkIndex] && 
          manager.editor.templateConnections[linkIndex].weight !== undefined) {
        currentWeight = manager.editor.templateConnections[linkIndex].weight;
      }
      
      console.log(`📊 Peso actual: ${currentWeight}`);
      
      // Mostrar prompt para editar peso
      const promptMsg = `Editar peso de conexión:\n${fromPin.parent.title} → ${toPin.parent.title}\n\nPeso actual: ${currentWeight}`;
      const newWeight = prompt(promptMsg, currentWeight.toString());
      
      console.log('💬 Respuesta del usuario:', newWeight);
      
      if (newWeight !== null && !isNaN(Number(newWeight)) && newWeight.trim() !== '') {
        const weightValue = Number(newWeight);
        
        // Actualizar peso en templateConnections
        if (!manager.editor.templateConnections) {
          manager.editor.templateConnections = [];
        }
        if (!manager.editor.templateConnections[linkIndex]) {
          manager.editor.templateConnections[linkIndex] = {};
        }
        manager.editor.templateConnections[linkIndex].weight = weightValue;
        
        console.log(`✅ Peso actualizado: ${fromPin.parent.title} → ${toPin.parent.title} = ${weightValue}`);
        
        // Log en auditoría
        const logAudit = (window as any).logAudit;
        if (logAudit) {
          logAudit(`✏️ Peso editado: ${fromPin.parent.title} → ${toPin.parent.title} = ${weightValue}`);
        } else {
          console.log('📝 Auditoría: Peso editado');
        }
        
        // Recomputar y redibujar
        manager.editor.computeAll();
        console.log('🔄 Recomputando y redibujando canvas');
      } else {
        console.log('❌ Edición cancelada o valor inválido');
      }
      return;
    } else {
      console.log('🔍 No se encontró línea de conexión cerca del click');
    }
  } catch (error) {
    console.error('❌ Error en edición de peso:', error);
  }

  // SEGUNDO: Buscar el nodo bajo el cursor usando detección por rectángulo (más preciso)
  let foundNode = null;
  let minDistance = Infinity;
  
  for (const node of manager.editor.nodes) {
    // Usar el tamaño real del nodo para detección de rectángulo
    // Ampliar área de detección: margen extra de 0.3 unidades
    const margin = 0.3;
    const halfWidth = node.size.x / 2 + margin;
    const halfHeight = node.size.y / 2 + margin;

    // Verificar si el click está dentro del rectángulo ampliado del nodo
    const withinX = worldPos.x >= (node.pos.x - halfWidth) && worldPos.x <= (node.pos.x + halfWidth);
    const withinY = worldPos.y >= (node.pos.y - halfHeight) && worldPos.y <= (node.pos.y + halfHeight);

    console.log(`  📦 Nodo "${node.title}" en (${node.pos.x.toFixed(2)}, ${node.pos.y.toFixed(2)}), tamaño: ${node.size.x.toFixed(1)}×${node.size.y.toFixed(1)}, margen: ${margin}`);
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
      // PRIMERO: Si hay un pin seleccionado, eliminar su conexión
      if (manager.editor.selectedPin) {
        const pin = manager.editor.selectedPin;
        if (pin.userData !== null && pin.userData !== undefined) {
          const linkIndex = pin.userData;
          const link = manager.editor.links[linkIndex];
          if (link) {
            console.log(`🗑️ Eliminando conexión del pin ${pin.name}`);
            // Limpiar userData de ambos pines
            if (link[0]) link[0].userData = null;
            if (link[1]) link[1].userData = null;
            manager.editor.links[linkIndex] = null; // Marcar como eliminado
            // Recalcular valores
            manager.editor.computeAll();
          }
        }
        // Limpiar selección
        manager.editor.selectedPin = null;
        manager.canvas.style.cursor = 'default';
        return;
      }
      
      // SEGUNDO: Si hay nodos seleccionados, eliminarlos
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
