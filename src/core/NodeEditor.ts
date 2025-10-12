import { Vec2, InputState, PinType } from '../types/types';
import { Node, Pin } from './Node';
import { logAudit } from '../main';
import { RedisService, SessionData } from '../services/RedisService';
import { NodeTypes } from './NodeTypes';
import { ExecutionPluginManager } from './ExecutionPlugin';
import { BuiltinPlugins } from './plugins/BuiltinPlugins';

export class NodeEditor {
  // Factor de conversión fundamental: 100 píxeles = 1 unidad de mundo
  private readonly PIXELS_PER_UNIT = 100;

  /**
   * Agrega un nodo al editor en el CENTRO de la vista actual
   */
  public addNode(nodeType: string = 'number', x?: number, y?: number) {
    // Si no se especifica posición, colocar en el CENTRO de la vista actual
    const posX = x ?? this.viewOffset.x;
    const posY = y ?? this.viewOffset.y;
    
    const node = Node.create(nodeType, posX, posY);
    if (node) {
      this.nodes.push(node);
  logAudit(`✅ Nodo ${nodeType} creado en posición (${posX.toFixed(1)}, ${posX.toFixed(1)})`);
  console.log(`✅ Nodo ${nodeType} creado en posición (${posX.toFixed(1)}, ${posY.toFixed(1)})`);
    }
    return node;
  }

  /**
   * Limpia todos los nodos y conexiones del canvas
   */
  public clearCanvas() {
    this.nodes = [];
    this.links = [];
  }

  /**
   * Carga un workflow template en el editor
   */
  public loadWorkflowTemplate(template: { nodes_data: string; connections_data: string; }) {
    try {
  logAudit('🚀 ========== INICIANDO CARGA DE TEMPLATE ==========');
  console.log('🚀 ========== INICIANDO CARGA DE TEMPLATE ==========');
      this.clearCanvas();
      
      // Validar que los datos no estén vacíos
      if (!template.nodes_data || !template.connections_data) {
  logAudit('❌ Template incompleto: faltan nodes_data o connections_data');
  console.error('❌ Template incompleto: faltan nodes_data o connections_data');
        return;
      }

      const nodesData = JSON.parse(template.nodes_data);
      const connectionsData = JSON.parse(template.connections_data);
      
  logAudit(`📦 Total de nodos a cargar: ${nodesData.length}`);
  console.log(`📦 Total de nodos a cargar: ${nodesData.length}`);
  logAudit(`🔗 Total de conexiones a crear: ${connectionsData.length}`);
  console.log(`🔗 Total de conexiones a crear: ${connectionsData.length}`);
      
      const nodeMap: { [key: number]: any } = {};
      let nodesCreatedCount = 0;
      let nodesFailedCount = 0;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      // PRE-ANÁLISIS: Contar cuántos inputs necesita cada nodo según conexiones
      const nodeInputCounts: { [key: number]: number } = {};
      connectionsData.forEach((conn: any) => {
        const toNodeId = conn.to?.node;
        const toPinIndex = conn.to?.pin ?? 0;
        if (toNodeId !== undefined) {
          // Calcular el máximo índice de pin + 1 para saber cuántos inputs necesita
          nodeInputCounts[toNodeId] = Math.max(nodeInputCounts[toNodeId] || 0, toPinIndex + 1);
        }
      });
      
  logAudit('🔍 Inputs requeridos por nodo: ' + JSON.stringify(nodeInputCounts));
  console.log('🔍 Inputs requeridos por nodo:', nodeInputCounts);
      
      // FASE 1: Crear todos los nodos
      for (let i = 0; i < nodesData.length; i++) {
        const nodeData = nodesData[i];
        
        // Validar que el nodo tenga los datos mínimos
        if (!nodeData.type) {
          logAudit(`❌ Nodo en índice ${i} no tiene tipo definido: ${JSON.stringify(nodeData)}`);
          console.error(`❌ Nodo en índice ${i} no tiene tipo definido:`, nodeData);
          nodesFailedCount++;
          continue;
        }

        if (!nodeData.id) {
          logAudit(`⚠️ Nodo ${nodeData.type} en índice ${i} no tiene ID, usando índice+1`);
          console.warn(`⚠️ Nodo ${nodeData.type} en índice ${i} no tiene ID, usando índice+1`);
          nodeData.id = i + 1;
        }

        if (nodeData.position) {
          minX = Math.min(minX, nodeData.position.x);
          minY = Math.min(minY, nodeData.position.y);
          maxX = Math.max(maxX, nodeData.position.x);
          maxY = Math.max(maxY, nodeData.position.y);
        }
        
        const absoluteX = nodeData.position?.x || 0;
        const absoluteY = nodeData.position?.y || 0;
        
  logAudit(`🔍 [${i+1}/${nodesData.length}] Creando nodo ID=${nodeData.id}, tipo="${nodeData.type}", pos=(${absoluteX}, ${absoluteY})`);
  console.log(`🔍 [${i+1}/${nodesData.length}] Creando nodo ID=${nodeData.id}, tipo="${nodeData.type}", pos=(${absoluteX}, ${absoluteY})`);
        
        // Determinar cuántos inputs necesita este nodo
        const requiredInputs = nodeInputCounts[nodeData.id] || 0;
        const node = Node.create(nodeData.type, absoluteX, absoluteY, requiredInputs);
        
        if (node) {
          // Aplicar datos personalizados al nodo
          if (nodeData.data) {
            if (nodeData.data.value !== undefined && node.outputs.length > 0) {
              node.outputs[0].value = nodeData.data.value;
              logAudit(`  ✓ Valor inicial del nodo: ${nodeData.data.value}`);
              console.log(`  ✓ Valor inicial del nodo: ${nodeData.data.value}`);
            }
            // Restaurar título personalizado si existe
            if (nodeData.data.customTitle !== undefined) {
              node.customTitle = nodeData.data.customTitle;
              logAudit(`  ✓ Título personalizado: ${nodeData.data.customTitle}`);
              console.log(`  ✓ Título personalizado restaurado`);
            }
            // Restaurar descripción personalizada si existe
            if (nodeData.data.customDescription !== undefined) {
              node.customDescription = nodeData.data.customDescription;
              logAudit(`  ✓ Descripción personalizada: ${nodeData.data.customDescription}`);
              console.log(`  ✓ Descripción personalizada restaurada`);
            }
            // Aplicar otras propiedades personalizadas
            for (const key in nodeData.data) {
              if (key !== 'value' && key !== 'customTitle' && key !== 'customDescription' && nodeData.data.hasOwnProperty(key) && key in node) {
                (node as any)[key] = nodeData.data[key];
              }
            }
          }
          
          node.pos.x = absoluteX;
          node.pos.y = absoluteY;
          this.nodes.push(node);
          nodeMap[nodeData.id] = node;
          nodesCreatedCount++;
          logAudit(`✅ Nodo ID=${nodeData.id} creado exitosamente (${nodesCreatedCount}/${nodesData.length})`);
          console.log(`✅ Nodo ID=${nodeData.id} creado exitosamente (${nodesCreatedCount}/${nodesData.length})`);
        } else {
          logAudit(`❌ No se pudo crear nodo ID=${nodeData.id}, tipo="${nodeData.type}". El tipo no existe en NodeTypes.`);
          console.error(`❌ No se pudo crear nodo ID=${nodeData.id}, tipo="${nodeData.type}". El tipo no existe en NodeTypes.`);
          nodesFailedCount++;
        }
      }

  logAudit(`\n📊 RESUMEN CREACIÓN DE NODOS:`);
  console.log(`\n📊 RESUMEN CREACIÓN DE NODOS:`);
  logAudit(`  ✅ Creados: ${nodesCreatedCount}`);
  console.log(`  ✅ Creados: ${nodesCreatedCount}`);
  logAudit(`  ❌ Fallidos: ${nodesFailedCount}`);
  console.log(`  ❌ Fallidos: ${nodesFailedCount}`);
  logAudit(`  📝 IDs en mapa: ${Object.keys(nodeMap).join(', ')}`);
  console.log(`  📝 IDs en mapa:`, Object.keys(nodeMap).join(', '));
      
      // FASE 2: Crear conexiones
      let connectionsCreatedCount = 0;
      let connectionsFailedCount = 0;
      
  logAudit(`\n🔗 ========== CREANDO CONEXIONES ==========`);
  console.log(`\n🔗 ========== CREANDO CONEXIONES ==========`);
      
      for (let i = 0; i < connectionsData.length; i++) {
        const conn = connectionsData[i];
        
        // Validar estructura de la conexión
        if (!conn.from || !conn.to) {
          logAudit(`❌ Conexión ${i+1} mal formada: ${JSON.stringify(conn)}`);
          console.error(`❌ Conexión ${i+1} mal formada:`, conn);
          connectionsFailedCount++;
          continue;
        }
        
        const fromNode = nodeMap[conn.from.node];
        const toNode = nodeMap[conn.to.node];
        
  logAudit(`🔍 [${i+1}/${connectionsData.length}] Conectando: Nodo ${conn.from.node}[pin ${conn.from.pin}] → Nodo ${conn.to.node}[pin ${conn.to.pin}]`);
  console.log(`🔍 [${i+1}/${connectionsData.length}] Conectando: Nodo ${conn.from.node}[pin ${conn.from.pin}] → Nodo ${conn.to.node}[pin ${conn.to.pin}]`);
        
        if (!fromNode) {
          logAudit(`  ❌ Nodo origen ID=${conn.from.node} no encontrado en el mapa`);
          console.error(`  ❌ Nodo origen ID=${conn.from.node} no encontrado en el mapa`);
          connectionsFailedCount++;
          continue;
        }
        
        if (!toNode) {
          logAudit(`  ❌ Nodo destino ID=${conn.to.node} no encontrado en el mapa`);
          console.error(`  ❌ Nodo destino ID=${conn.to.node} no encontrado en el mapa`);
          connectionsFailedCount++;
          continue;
        }
        
        const fromPin = fromNode.outputs[conn.from.pin];
        const toPin = toNode.inputs[conn.to.pin];
        
        if (!fromPin) {
          console.error(`  ❌ Pin de salida ${conn.from.pin} no existe en nodo ${conn.from.node} (tiene ${fromNode.outputs.length} outputs)`);
          connectionsFailedCount++;
          continue;
        }
        
        if (!toPin) {
          console.error(`  ❌ Pin de entrada ${conn.to.pin} no existe en nodo ${conn.to.node} (tiene ${toNode.inputs.length} inputs)`);
          connectionsFailedCount++;
          continue;
        }
        
        // Verificar compatibilidad de tipos
        if (fromPin.type !== toPin.type) {
          console.warn(`  ⚠️ ADVERTENCIA: Tipos incompatibles - ${fromPin.type} → ${toPin.type}`);
        }
        
        this.onConnect(fromPin, toPin);
        connectionsCreatedCount++;
        console.log(`  ✅ Conexión creada exitosamente (${connectionsCreatedCount}/${connectionsData.length})`);
      }
      
      console.log(`\n📊 RESUMEN CREACIÓN DE CONEXIONES:`);
      console.log(`  ✅ Creadas: ${connectionsCreatedCount}`);
      console.log(`  ❌ Fallidas: ${connectionsFailedCount}`);
      
      // FASE 3: Ajustar vista y zoom
      if (minX !== Infinity && minY !== Infinity) {
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.viewOffset.x = centerX;
        this.viewOffset.y = centerY;
        
        const width = (maxX - minX);
        const height = (maxY - minY);
        const scale = Math.min(
          window.innerWidth / ((width + 2) * this.PIXELS_PER_UNIT),
          (window.innerHeight - 50) / ((height + 2) * this.PIXELS_PER_UNIT)
        );
        this.scale = Math.max(0.2, Math.min(2, scale));
        
        console.log(`\n🎯 Vista ajustada: centro=(${centerX.toFixed(2)}, ${centerY.toFixed(2)}), zoom=${(this.scale * 100).toFixed(0)}%`);
      }
      
      // FASE 4: Ejecutar una vez para inicializar valores
      this.computeAll();
      
      console.log(`\n✅ ========== CARGA DE TEMPLATE COMPLETADA ==========\n`);
      
    } catch (error) {
      console.error('❌ ========== ERROR CRÍTICO AL CARGAR TEMPLATE ==========');
      console.error('Error:', error);
      console.error('Stack:', (error as Error).stack);
    }
  }
  nodes: Node[] = [];
  links: [Pin | null, Pin | null][] = [];
  viewOffset: Vec2 = new Vec2();
  scale: number = 1.0;
  isRunning: boolean = false;
  
  // Sistema de plugins
  public pluginManager: ExecutionPluginManager = new ExecutionPluginManager();

  private draggingNode: Node | null = null;
  public draggingPin: Pin | null = null; // Público para acceso desde eventos
  public selectedPin: Pin | null = null; // Pin seleccionado para conectar
  private hoveringPin: Pin | null = null;
  private lastMousePos: Vec2 = new Vec2();
  private tempLinkEnd: Vec2 = new Vec2();
  private lastAddTime: number = 0;
  private lastMouseButtonLeft: boolean = false;

  constructor(
    private onConnect: (a: Pin, b: Pin) => void,
    private onDrop: (px: number, py: number, a: Pin) => void,
  ) {
    // Registrar plugins built-in
    Object.values(BuiltinPlugins).forEach(plugin => {
      this.pluginManager.registerPlugin(plugin);
    });
    
    // Activar plugins por defecto
    this.pluginManager.activatePlugin('safety-limit');
    this.pluginManager.activatePlugin('type-validation');
  }

  private screenToWorld(screenPos: Vec2): Vec2 {
    // IMPORTANTE: Debe coincidir con el factor usado en render() -> ctx.scale(PIXELS_PER_UNIT * this.scale)
    const centerX = window.innerWidth / 2;
    const centerY = (window.innerHeight - 50) / 2;
    
    return new Vec2(
      (screenPos.x - centerX) / (this.PIXELS_PER_UNIT * this.scale) + this.viewOffset.x,
      (screenPos.y - centerY) / (this.PIXELS_PER_UNIT * this.scale) + this.viewOffset.y
    );
  }

  private worldToScreen(worldPos: Vec2): Vec2 {
    // IMPORTANTE: Proceso inverso de screenToWorld
    const centerX = window.innerWidth / 2;
    const centerY = (window.innerHeight - 50) / 2;
    
    return new Vec2(
      (worldPos.x - this.viewOffset.x) * (this.PIXELS_PER_UNIT * this.scale) + centerX,
      (worldPos.y - this.viewOffset.y) * (this.PIXELS_PER_UNIT * this.scale) + centerY
    );
  }

  private getCanvasBounds(): { min: Vec2, max: Vec2 } {
    const topLeft = this.screenToWorld(new Vec2(0, 0));
    const bottomRight = this.screenToWorld(new Vec2(window.innerWidth, window.innerHeight - 50));
    return {
      min: new Vec2(
        Math.min(topLeft.x, bottomRight.x),
        Math.min(topLeft.y, bottomRight.y)
      ),
      max: new Vec2(
        Math.max(topLeft.x, bottomRight.x),
        Math.max(topLeft.y, bottomRight.y)
      )
    };
  }

  private clampToCanvas(pos: Vec2): Vec2 {
    const bounds = this.getCanvasBounds();
    const margin = 1; // Margen para evitar que los nodos se peguen al borde
    return new Vec2(
      Math.max(bounds.min.x + margin, Math.min(bounds.max.x - margin, pos.x)),
      Math.max(bounds.min.y + margin, Math.min(bounds.max.y - margin, pos.y))
    );
  }

  private distance(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private isPointInNode(point: Vec2, node: Node): boolean {
    const halfW = node.size.x / 2;
    const halfH = node.size.y / 2;
    const dx = Math.abs(point.x - node.pos.x);
    const dy = Math.abs(point.y - node.pos.y);
    return dx <= halfW && dy <= halfH;
  }

  update(inpt: InputState, deltaTime: number) {
    this.scale = Math.max(0.1, inpt.scale);
    const currentMouseWorld = this.screenToWorld(inpt.mousePos);

    // Bloquear panning si hay un nodo siendo arrastrado O si se está creando una conexión
    const isNodeBeingDragged = this.draggingNode !== null;
    const isPinBeingDragged = this.draggingPin !== null;
    
    if (inpt.mouseButtonMiddle && !isNodeBeingDragged && !isPinBeingDragged) {
      const delta = currentMouseWorld.subtract(this.screenToWorld(this.lastMousePos));
      this.viewOffset = this.viewOffset.subtract(delta);
    }

    if (inpt.aPressed && Date.now() - this.lastAddTime > 300) {
      this.lastAddTime = Date.now();
      
      // Obtener el tipo seleccionado del dropdown
      const nodeTypeSelect = document.getElementById('nodeTypeSelect') as HTMLSelectElement;
      let nodeType = 'number'; // Default
      
      if (nodeTypeSelect && nodeTypeSelect.value) {
        nodeType = nodeTypeSelect.value;
      } else {
        // Si no hay selección, mostrar mensaje
        console.warn('⚠️ Por favor selecciona un tipo de nodo en el dropdown antes de presionar "A"');
        return;
      }
      
      const node = Node.create(nodeType, currentMouseWorld.x, currentMouseWorld.y);
      if (node) {
        this.nodes.push(node);
        console.log(`✅ Nodo "${nodeType}" creado en (${currentMouseWorld.x.toFixed(1)}, ${currentMouseWorld.y.toFixed(1)})`);
      }
    }

    // Solo eliminar nodos si el foco NO está en un input editable
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
    if (inpt.deletePressed && !isInputFocused) {
      this.nodes = this.nodes.filter(node => !node.selected);
      this.links = this.links.filter(link => 
        link[0] && link[1] && !link[0].parent.selected && !link[1].parent.selected
      );
    }

    this.updatePinPositions();
    this.updateInteractions(inpt, currentMouseWorld);

    this.lastMousePos = inpt.mousePos;
    this.lastMouseButtonLeft = inpt.mouseButtonLeft;
  }

  private updatePinPositions() {
  // Márgenes mínimos para que los pines estén prácticamente pegados al borde
  const PIN_MARGIN_X = 0.01; // margen lateral casi nulo
  const PIN_MARGIN_Y = 0.20; // margen vertical para evitar el título
    for (const node of this.nodes) {
      // Calcular dimensiones dinámicas exactamente igual que en renderNodes
      const baseWidth = 2.6;
      const minHeight = 1.2;
      let contentLines = 2; // título + resultado
      if (node.inputs.length > 2 || node.outputs.length > 2) {
        contentLines += Math.max(node.inputs.length, node.outputs.length) - 2;
      }
      const dynamicHeight = minHeight + contentLines * 0.18;
      const w = baseWidth; // Usar ancho fijo
      const h = Math.max(node.size.y, dynamicHeight); // Usar alto dinámico
      
      const inputCount = node.inputs.length;
      for (let i = 0; i < inputCount; i++) {
        const pin = node.inputs[i];
        pin.pos.x = node.pos.x - w / 2 + PIN_MARGIN_X;
        pin.pos.y = node.pos.y - h / 2 + PIN_MARGIN_Y + (i + 0.5) * (h - 2 * PIN_MARGIN_Y) / Math.max(inputCount, 1);
      }
      const outputCount = node.outputs.length;
      for (let i = 0; i < outputCount; i++) {
        const pin = node.outputs[i];
        pin.pos.x = node.pos.x + w / 2 - PIN_MARGIN_X;
        pin.pos.y = node.pos.y - h / 2 + PIN_MARGIN_Y + (i + 0.5) * (h - 2 * PIN_MARGIN_Y) / Math.max(outputCount, 1);
      }
    }
  }

  private updateInteractions(inpt: InputState, currentMouseWorld: Vec2) {
    // Detectar hover sobre pines
    this.hoveringPin = null;
    for (const node of this.nodes) {
      for (const pin of [...node.inputs, ...node.outputs]) {
        if (this.distance(currentMouseWorld, pin.pos) < 0.15) {
          this.hoveringPin = pin;
          break;
        }
      }
      if (this.hoveringPin) break;
    }

    // Iniciar acciones al presionar botón izquierdo
    if (inpt.mouseButtonLeft && !this.lastMouseButtonLeft && !inpt.mouseButtonMiddle) {
      if (this.hoveringPin) {
        // Empezar a arrastrar desde un pin
        this.draggingPin = this.hoveringPin;
        this.tempLinkEnd = inpt.mousePos;
      } else {
        // Intentar seleccionar un nodo
        for (const node of this.nodes) {
          if (this.isPointInNode(currentMouseWorld, node)) {
            this.draggingNode = node;
            node.selected = true;
            node.startDrag(currentMouseWorld.x, currentMouseWorld.y);
            // Deseleccionar otros nodos
            this.nodes.forEach(n => {
              if (n !== node) n.selected = false;
            });
            break;
          }
        }
      }
    }

    // Actualizar drag de nodo
    if (this.draggingNode && inpt.mouseButtonLeft) {
      const bounds = this.getCanvasBounds();
      this.draggingNode.drag(currentMouseWorld.x, currentMouseWorld.y, bounds);
    }

    // Actualizar línea temporal de conexión
    if (this.draggingPin && inpt.mouseButtonLeft) {
      this.tempLinkEnd = inpt.mousePos;
    }

    // Soltar botón izquierdo
    if (!inpt.mouseButtonLeft && this.lastMouseButtonLeft) {
      if (this.draggingPin) {
        // Intentar crear conexión
        if (this.hoveringPin && 
            this.hoveringPin !== this.draggingPin && 
            this.hoveringPin.isInput !== this.draggingPin.isInput) {
          
          // Asegurar que from es output y to es input
          let fromPin = this.draggingPin;
          let toPin = this.hoveringPin;
          if (fromPin.isInput) {
            [fromPin, toPin] = [toPin, fromPin];
          }
          
          // Validar conexión
          if (this.validateConnection(fromPin, toPin)) {
            // Eliminar conexión existente en el pin de entrada si existe
            const existingLinkIndex = this.links.findIndex(link => 
              link && link[1] === toPin
            );
            if (existingLinkIndex >= 0) {
              const oldLink = this.links[existingLinkIndex];
              if (oldLink && oldLink[0] && oldLink[1]) {
                oldLink[0].userData = null;
                oldLink[1].userData = null;
              }
              this.links[existingLinkIndex] = [null, null];
            }
            
            // Crear nueva conexión
            this.onConnect(fromPin, toPin);
            this.computeAll(); // Recalcular valores inmediatamente
          }
        } else {
          this.onDrop(currentMouseWorld.x, currentMouseWorld.y, this.draggingPin);
        }
        this.draggingPin = null;
      }
      
      if (this.draggingNode) {
        this.draggingNode.endDrag();
        this.draggingNode = null;
      }
    }
  }

  private validateConnection(from: Pin, to: Pin): boolean {
    // Verificar que uno sea entrada y otro salida
    if (from.isInput === to.isInput) {
      console.warn('No se pueden conectar dos pines del mismo tipo');
      return false;
    }

    // Asegurar que from es siempre la salida y to la entrada
    if (from.isInput) {
      [from, to] = [to, from];
    }

    // Verificar tipos compatibles
    if (from.type !== to.type && from.type !== PinType.Custom && to.type !== PinType.Custom) {
      console.warn('Tipos incompatibles:', from.type, to.type);
      return false;
    }

    // Verificar que la entrada no esté ya conectada (a menos que permita múltiples)
    const existingConnection = this.links.find(link => 
      link && link[1] === to && !to.definition.allowMultiple
    );
    if (existingConnection) {
      console.warn('La entrada ya está conectada');
      return false;
    }

    return true;
  }

  /**
   * Detecta todas las componentes conexas (grafos separados) en el canvas
   * Una componente conexa es un conjunto de nodos que están conectados entre sí
   * @returns Array de arrays, donde cada sub-array es una componente conexa
   */
  public findConnectedComponents(): Node[][] {
    const visited = new Set<Node>();
    const components: Node[][] = [];

    const exploreComponent = (startNode: Node): Node[] => {
      const component: Node[] = [];
      const stack: Node[] = [startNode];

      while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;

        visited.add(node);
        component.push(node);

        // Explorar vecinos (tanto upstream como downstream)
        this.links.forEach(link => {
          if (!link || !link[0] || !link[1]) return;
          
          // Si este nodo es la fuente, agregar el destino
          if (link[0].parent === node && !visited.has(link[1].parent)) {
            stack.push(link[1].parent);
          }
          // Si este nodo es el destino, agregar la fuente
          if (link[1].parent === node && !visited.has(link[0].parent)) {
            stack.push(link[0].parent);
          }
        });
      }

      return component;
    };

    // Explorar cada nodo no visitado
    this.nodes.forEach(node => {
      if (!visited.has(node)) {
        const component = exploreComponent(node);
        if (component.length > 0) {
          components.push(component);
        }
      }
    });

    return components;
  }

  /**
   * Encuentra el orden de ejecución TOPOLÓGICO dentro de una componente específica
   * @param component - Array de nodos de una componente conexa
   * @returns Array de nodos en orden de ejecución (topológico)
   */
  public findExecutionOrderForComponent(component: Node[]): Node[] {
    const visited = new Set<Node>();
    const order: Node[] = [];

    const visit = (node: Node) => {
      if (visited.has(node) || !component.includes(node)) return;
      visited.add(node);

      // Primero procesar dependencias (nodos upstream)
      this.links.forEach(link => {
        if (link && link[0] && link[1] && link[1].parent === node) {
          visit(link[0].parent);
        }
      });

      order.push(node);
    };

    // Comenzar desde nodos sin inputs conectados (fuentes del grafo)
    component.forEach(node => {
      const hasInputConnections = this.links.some(link => 
        link && link[1] && link[1].parent === node
      );
      if (!hasInputConnections) {
        visit(node);
      }
    });

    // Procesar nodos restantes en la componente
    component.forEach(node => visit(node));

    return order;
  }

  /**
   * Encuentra el orden de ejecución para TODOS los nodos en el canvas
   * Detecta componentes conexas y ordena cada una topológicamente
   * @returns Array de nodos en orden de ejecución completo
   */
  public findExecutionOrder(): Node[] {
    // Detectar componentes conexas
    const components = this.findConnectedComponents();
    
    if (components.length > 1) {
      logAudit(`🔍 Detectadas ${components.length} componentes conexas separadas`);
      console.log(`🔍 Detectadas ${components.length} componentes conexas:`, 
        components.map((c, i) => `Componente ${i+1}: ${c.length} nodos`));
    }
    
    const allOrder: Node[] = [];

    // Ejecutar cada componente en orden topológico
    components.forEach((component, index) => {
      const componentOrder = this.findExecutionOrderForComponent(component);
      if (components.length > 1) {
        logAudit(`  📦 Componente ${index + 1}: ${componentOrder.map(n => n.title).join(' → ')}`);
      }
      allOrder.push(...componentOrder);
    });

    return allOrder;
  }

  public async computeSingleNode(node: Node) {
    // Hook: Antes de ejecutar el nodo
    const shouldExecute = await this.pluginManager.executeBeforeNodeExecution(node);
    if (!shouldExecute) return;

    try {
      // Propagar valores de entrada ANTES de compute para este nodo específico
      this.links.forEach(link => {
        if (link && link[0] && link[1] && link[1].parent === node) {
          const transformedValue = this.pluginManager.transformInput(link[0].value, link[1]);
          link[1].value = transformedValue;
        }
      });

      // Computar el nodo
      let result = null;
      if (typeof node.compute === 'function') {
        result = node.compute();
      }

      // Aplicar transformaciones a las salidas
      node.outputs.forEach(pin => {
        pin.value = this.pluginManager.transformOutput(pin.value, pin);
      });

      // Hook: Después de ejecutar el nodo
      await this.pluginManager.executeAfterNodeExecution(node, result);
    } catch (error) {
      // Hook: Error en la ejecución del nodo
      this.pluginManager.getActivePlugins().forEach(plugin => {
        if (plugin.onError) {
          plugin.onError(error as Error, node, this.pluginManager.getContext());
        }
      });
    }
  }

  async computeAll() {
    // Actualizar contexto del plugin manager
    this.pluginManager.updateContext({
      iteration: this.pluginManager.getContext().iteration + 1,
      startTime: Date.now(),
      executionMode: 'realtime' // Será actualizado por CanvasExecution
    });

    // Hook: Antes de la ejecución
    await this.pluginManager.executeBeforeExecution(this.nodes);
    
    // Verificar si debe continuar la ejecución
    if (!this.pluginManager.shouldContinueExecution()) {
      return;
    }

    // NO resetear valores de nodos input (number, boolean)
    // Solo resetear inputs de nodos que reciben conexiones
    this.nodes.forEach(node => {
      if (node.inputs.length > 0) {
        node.inputs.forEach(pin => {
          // Resetear solo si no está conectado
          const isConnected = this.links.some(link => 
            link && link[1] === pin
          );
          if (!isConnected) {
            pin.value = pin.definition.defaultValue;
          }
        });
      }
    });

    // Obtener orden de ejecución
    const executionOrder = this.findExecutionOrder();

    // Computar nodos en orden SINCRÓNICAMENTE
    for (const node of executionOrder) {
      // Hook: Antes de ejecutar el nodo
      const shouldExecute = await this.pluginManager.executeBeforeNodeExecution(node);
      if (!shouldExecute) continue;

      try {
        // Propagar valores de entrada ANTES de compute con transformaciones
        this.links.forEach(link => {
          if (link && link[0] && link[1] && link[1].parent === node) {
            const transformedValue = this.pluginManager.transformInput(link[0].value, link[1]);
            link[1].value = transformedValue;
          }
        });

        // Computar el nodo
        let result = null;
        if (typeof node.compute === 'function') {
          result = node.compute();
        }

        // Aplicar transformaciones a las salidas
        node.outputs.forEach(pin => {
          pin.value = this.pluginManager.transformOutput(pin.value, pin);
        });

        // Hook: Después de ejecutar el nodo
        await this.pluginManager.executeAfterNodeExecution(node, result);
      } catch (error) {
        // Hook: Error en la ejecución del nodo
        this.pluginManager.getActivePlugins().forEach(plugin => {
          if (plugin.onError) {
            plugin.onError(error as Error, node, this.pluginManager.getContext());
          }
        });
      }
    }

    // Hook: Después de la ejecución
    await this.pluginManager.executeAfterExecution(this.nodes);
  }

  /**
   * Ejecuta múltiples componentes conexas en paralelo (para grafos independientes)
   * Útil para mejorar el rendimiento cuando hay varios grafos desconectados
   * @returns Promesa que se resuelve cuando todas las componentes han sido ejecutadas
   */
  async computeAllParallel() {
    // Actualizar contexto del plugin manager
    this.pluginManager.updateContext({
      iteration: this.pluginManager.getContext().iteration + 1,
      startTime: Date.now(),
      executionMode: 'parallel'
    });

    // Hook: Antes de la ejecución
    await this.pluginManager.executeBeforeExecution(this.nodes);
    
    // Verificar si debe continuar la ejecución
    if (!this.pluginManager.shouldContinueExecution()) {
      return;
    }

    // Detectar componentes conexas
    const components = this.findConnectedComponents();
    
    console.log(`🔀 Ejecutando ${components.length} componente(s) en paralelo`);
    logAudit(`🔀 Ejecución paralela: ${components.length} componentes`);

    // Ejecutar cada componente como una promesa
    const promises = components.map(async (component, index) => {
      console.log(`  Componente ${index + 1}: ${component.length} nodos`);
      const order = this.findExecutionOrderForComponent(component);
      
      for (const node of order) {
        // Hook: Antes de ejecutar el nodo
        const shouldExecute = await this.pluginManager.executeBeforeNodeExecution(node);
        if (!shouldExecute) continue;

        try {
          // Propagar valores de entrada
          this.links.forEach(link => {
            if (link && link[0] && link[1] && link[1].parent === node) {
              const transformedValue = this.pluginManager.transformInput(link[0].value, link[1]);
              link[1].value = transformedValue;
            }
          });

          // Computar el nodo
          let result = null;
          if (typeof node.compute === 'function') {
            result = node.compute();
          }

          // Aplicar transformaciones a las salidas
          node.outputs.forEach(pin => {
            pin.value = this.pluginManager.transformOutput(pin.value, pin);
          });

          // Hook: Después de ejecutar el nodo
          await this.pluginManager.executeAfterNodeExecution(node, result);
        } catch (error) {
          // Hook: Error en la ejecución del nodo
          this.pluginManager.getActivePlugins().forEach(plugin => {
            if (plugin.onError) {
              plugin.onError(error as Error, node, this.pluginManager.getContext());
            }
          });
        }
      }
    });

    // Esperar a que TODAS las componentes terminen
    await Promise.all(promises);
    
    console.log(`✅ Todas las componentes ejecutadas en paralelo`);
    logAudit(`✅ Ejecución paralela completada`);

    // Hook: Después de la ejecución
    await this.pluginManager.executeAfterExecution(this.nodes);
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(30, 30, 30)';
    ctx.fillRect(0, 0, width, height);

    // DIBUJAR CUADRICULA Y EJES
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.PIXELS_PER_UNIT * this.scale, this.PIXELS_PER_UNIT * this.scale);
    ctx.translate(-this.viewOffset.x, -this.viewOffset.y);

    // Cuadrícula con ÁREA MUY GRANDE para templates complejos
    const gridSpacing = 1;
    const gridRange = 25; // Área fija de 50x50 unidades (-25 a +25)
    
    // Cuadrícula secundaria (más tenue)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.01;
    ctx.beginPath();
    for (let i = -gridRange; i <= gridRange; i += 0.5) {
      ctx.moveTo(i, -gridRange);
      ctx.lineTo(i, gridRange);
      ctx.moveTo(-gridRange, i);
      ctx.lineTo(gridRange, i);
    }
    ctx.stroke();

    // Cuadrícula principal
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    for (let i = -gridRange; i <= gridRange; i += gridSpacing) {
      ctx.moveTo(i, -gridRange);
      ctx.lineTo(i, gridRange);
      ctx.moveTo(-gridRange, i);
      ctx.lineTo(gridRange, i);
    }
    ctx.stroke();

    // EJES PRINCIPALES (X e Y)
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)'; // Eje Y (rojo)
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.moveTo(0, -gridRange);
    ctx.lineTo(0, gridRange);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; // Eje X (verde)
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.moveTo(-gridRange, 0);
    ctx.lineTo(gridRange, 0);
    ctx.stroke();

    // Punto origen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 0.05, 0, 2 * Math.PI);
    ctx.fill();

    this.renderLinks(ctx);
    this.renderTempLink(ctx);
    this.renderNodes(ctx);

    ctx.restore();
  }

  private renderLinks(ctx: CanvasRenderingContext2D) {
    // ✅ FIX: Empezar desde 0 para renderizar TODAS las conexiones
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];
      if (link && link[0] && link[1]) {
        this.drawBezierLink(ctx, link[0].pos, link[1].pos);
      }
    }
  }

  private renderTempLink(ctx: CanvasRenderingContext2D) {
    // No hay líneas temporales en el sistema click-click
  }

  private drawBezierLink(ctx: CanvasRenderingContext2D, p1: Vec2, p2: Vec2, isTemp: boolean = false) {
    const dx = p2.x - p1.x;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(
      p1.x + dx * 0.4, p1.y,
      p2.x - dx * 0.4, p2.y,
      p2.x, p2.y
    );
    ctx.strokeStyle = `rgba(204, 153, 51, ${isTemp ? 0.5 : 1.0})`;
    ctx.lineWidth = 0.1;
    ctx.stroke();
  }

  private renderNodes(ctx: CanvasRenderingContext2D) {
    for (const node of this.nodes) {
      // Ancho fijo y alto dinámico según contenido
      const baseWidth = 2.6; // ancho predeterminado en unidades canvas
      const minHeight = 1.2; // alto mínimo
      let contentLines = 2; // título + resultado
      if (node.inputs.length > 2 || node.outputs.length > 2) contentLines += Math.max(node.inputs.length, node.outputs.length) - 2;
      const dynamicHeight = minHeight + contentLines * 0.18;
      const w = baseWidth;
      const h = Math.max(node.size.y, dynamicHeight);

  // Dibujar sombra
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 0.1;
  ctx.shadowOffsetX = 0.05;
  ctx.shadowOffsetY = 0.05;

      // Fondo del nodo con gradiente o color lógico para ConditionNode
      let fillStyle: CanvasGradient | string;
      let highlight = false;
      let isOptimalPath = false;
      
      // Verificar si está en el camino óptimo (Dijkstra/A*/PERT)
      if (node.userData?.pathHighlight || node.userData?.isInOptimalPath) {
        isOptimalPath = true;
      }
      
      // Verificar si está en ejecución paso a paso
      const stepExecuting = node.stepHighlight;
      
      if (isOptimalPath && !stepExecuting) {
        // HIGHLIGHTING CYAN para camino óptimo/crítico
        const gradient = ctx.createLinearGradient(
          node.pos.x - w/2, node.pos.y - h/2,
          node.pos.x - w/2, node.pos.y + h/2
        );
        gradient.addColorStop(0, 'rgb(0, 188, 212)'); // Cyan brillante
        gradient.addColorStop(1, 'rgb(0, 150, 170)'); // Cyan oscuro
        fillStyle = gradient;
        highlight = true; // Activar resplandor
      } else if (node.type === 'condition') {
        // Color según la salida lógica
        const isTrue = node.outputs[0]?.value === true;
        fillStyle = isTrue ? 'rgb(80, 200, 120)' : 'rgb(200, 80, 80)';
        highlight = node.highlightUntil > Date.now();
      } else if (stepExecuting) {
        // Highlight especial para ejecución paso a paso
        fillStyle = 'rgb(255, 215, 0)'; // Dorado
        highlight = true;
      } else {
        const gradient = ctx.createLinearGradient(
          node.pos.x - w/2, node.pos.y - h/2,
          node.pos.x - w/2, node.pos.y + h/2
        );
        if (node.selected) {
          gradient.addColorStop(0, 'rgb(80, 120, 180)');
          gradient.addColorStop(1, 'rgb(60, 100, 160)');
        } else {
          gradient.addColorStop(0, 'rgb(70, 70, 70)');
          gradient.addColorStop(1, 'rgb(50, 50, 50)');
        }
        fillStyle = gradient;
      }
      ctx.fillStyle = fillStyle;
      // Dibujar nodo con esquinas redondeadas y padding interno
      ctx.beginPath();
      ctx.roundRect(node.pos.x - w/2, node.pos.y - h/2, w, h, 0.18);
      ctx.fill();
      // Animación visual: resplandor
      if (highlight) {
        ctx.save();
        // Color del resplandor según el tipo de highlighting
        const glowColor = isOptimalPath ? 'rgb(0, 255, 255)' : 'yellow'; // Cyan para camino óptimo
        const strokeColor = isOptimalPath ? 'rgb(0, 255, 255)' : 'yellow';
        
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isOptimalPath ? 0.35 : 0.25; // Más intenso para camino óptimo
        ctx.beginPath();
        ctx.roundRect(node.pos.x - w/2, node.pos.y - h/2, w, h, 0.1);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isOptimalPath ? 0.10 : 0.07; // Borde más grueso para camino óptimo
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

  // Título del nodo (aún más grande y profesional)
  ctx.fillStyle = 'white';
  ctx.font = "bold 0.28px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(node.title, node.pos.x, node.pos.y - h/2 + 0.32);

  // Subtítulo del nodo (si existe)
  if (node.subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = "0.14px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
    ctx.fillText(node.subtitle, node.pos.x, node.pos.y - h/2 + 0.48);
  }

  // Descripción del nodo (si existe) - mostrar debajo del título
  const description = node.customDescription || node.description;
  if (description) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = "italic 0.12px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
    // Truncar si es muy largo
    const maxDescLength = 25;
    const displayDesc = description.length > maxDescLength 
      ? description.substring(0, maxDescLength) + '...' 
      : description;
    ctx.fillText(displayDesc, node.pos.x, node.pos.y - h/2 + 0.64);
  }

  // Renderizar valores según el tipo de nodo (más grande y profesional, pero no bold)
  ctx.fillStyle = 'white';
  ctx.font = "0.19px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
  ctx.textAlign = 'center';
      
      if (node.type === 'number') {
        // Nodo Number - mostrar valor del output
        const value = node.outputs[0]?.value ?? 0;
        ctx.fillStyle = 'rgb(100, 255, 100)';
        ctx.fillText(`${value}`, node.pos.x, node.pos.y + 0.23);
      } else if (node.type === 'boolean') {
        // Nodo Boolean - mostrar estado
        const value = node.outputs[0]?.value ?? false;
        ctx.fillStyle = value ? 'rgb(100, 255, 100)' : 'rgb(255, 100, 100)';
        ctx.fillText(value ? 'TRUE' : 'FALSE', node.pos.x, node.pos.y + 0.23);
      } else if (node.type === 'string') {
        // Nodo String - mostrar valor del output
        const value = node.outputs[0]?.value ?? "";
        ctx.fillStyle = 'rgb(150, 150, 255)';
        const displayText = value.toString().length > 8 ? value.toString().substring(0, 8) + "..." : value.toString();
        ctx.fillText(`"${displayText}"`, node.pos.x, node.pos.y + 0.23);
      } else if (node.type === 'display') {
        // Nodo Display - mostrar valor de entrada
        const value = node.inputs[0]?.value;
        ctx.fillStyle = 'rgb(255, 255, 100)';
        const displayText = value !== undefined ? value.toString() : 'NULL';
        ctx.fillText(`→ ${displayText}`, node.pos.x, node.pos.y + 0.23);
      } else if (node.type === 'condition') {
        // Nodo Condition - mostrar ambas salidas
        const valTrue = node.outputs[0]?.value;
        const valFalse = node.outputs[1]?.value;
        ctx.fillStyle = 'white';
        ctx.font = "0.16px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
        ctx.fillText(`T:${valTrue?'✔':'✘'} F:${valFalse?'✔':'✘'}`, node.pos.x, node.pos.y + 0.23);
      } else if (['add', 'subtract', 'multiply', 'divide', 'modulo', 'greater', 'and', 'or', 'not', 'equals'].includes(node.type)) {
        // Nodos de operación - mostrar resultado
        const result = node.outputs[0]?.value;
        if (result !== undefined) {
          ctx.fillStyle = 'rgb(255, 200, 100)';
          ctx.font = "0.19px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
          const displayText = typeof result === 'boolean' ? (result ? 'TRUE' : 'FALSE') : result.toString();
          ctx.fillText(`= ${displayText}`, node.pos.x, node.pos.y + 0.23);
        }
      } else if (['concat', 'length'].includes(node.type)) {
        // Nodos de string - mostrar resultado
        const result = node.outputs[0]?.value;
        if (result !== undefined) {
          ctx.fillStyle = 'rgb(200, 150, 255)';
          ctx.font = "0.19px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
          let displayText = result.toString();
          if (node.type === 'concat' && displayText.length > 8) {
            displayText = displayText.substring(0, 8) + "...";
          }
          ctx.fillText(`= ${displayText}`, node.pos.x, node.pos.y + 0.23);
        }
      } else if (node.type === 'task') {
        // Nodo TASK - mostrar duración y datos PERT
        const duration = node.outputs[0]?.value ?? 1;
        ctx.fillStyle = 'rgb(0, 188, 212)'; // Cyan
        ctx.font = "bold 0.22px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
        ctx.fillText(`⏱ ${duration}d`, node.pos.x, node.pos.y + 0.23);
        
        // Mostrar ES/EF/LS/LF si están calculados
        if (node.userData?.pertData) {
          const { ES, EF, LS, LF, slack, isCritical } = node.userData.pertData;
          ctx.font = "0.11px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
          ctx.fillStyle = isCritical ? 'rgb(255, 50, 50)' : 'rgb(76, 175, 80)';
          ctx.fillText(`ES:${ES} EF:${EF}`, node.pos.x, node.pos.y + 0.38);
          ctx.fillText(`LS:${LS} LF:${LF}`, node.pos.x, node.pos.y + 0.50);
          if (isCritical) {
            ctx.fillStyle = 'rgb(255, 50, 50)';
            ctx.font = "bold 0.13px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
            ctx.fillText('★ CRÍTICO', node.pos.x, node.pos.y + 0.64);
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`Slack: ${slack}d`, node.pos.x, node.pos.y + 0.64);
          }
        }
      } else if (node.type === 'info-panel') {
        // NO-NODO INFO-PANEL - renderizado especial grande
        const panelWidth = 5.0;
        const panelHeight = 3.5;
        
        // Fondo del panel con borde destacado
        ctx.fillStyle = 'rgba(40, 40, 60, 0.95)';
        ctx.strokeStyle = 'rgb(100, 150, 255)';
        ctx.lineWidth = 0.08;
        ctx.beginPath();
        ctx.roundRect(
          node.pos.x - panelWidth/2, 
          node.pos.y - panelHeight/2, 
          panelWidth, 
          panelHeight, 
          0.15
        );
        ctx.fill();
        ctx.stroke();
        
        // Título del panel
        ctx.fillStyle = 'rgb(100, 200, 255)';
        ctx.font = "bold 0.35px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('ℹ️ INFORMACIÓN DEL PROBLEMA', node.pos.x, node.pos.y - panelHeight/2 + 0.45);
        
        // Descripción del problema
        const description = node.customDescription || node.description || 'Sin descripción';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = "0.16px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
        ctx.textAlign = 'left';
        
        // Dividir texto en líneas
        const maxWidth = panelWidth - 0.4;
        const lineHeight = 0.22;
        const words = description.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Renderizar líneas (máximo 10)
        let startY = node.pos.y - panelHeight/2 + 0.8;
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
          ctx.fillText(lines[i], node.pos.x - panelWidth/2 + 0.2, startY + i * lineHeight);
        }
        
        // Indicador si hay más texto
        if (lines.length > 10) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = "italic 0.14px 'Montserrat', 'Segoe UI', 'Roboto', Arial, sans-serif";
          ctx.textAlign = 'center';
          ctx.fillText('...', node.pos.x, startY + 10 * lineHeight + 0.15);
        }
        
        // NO renderizar pines para info-panel (es un NO-nodo)
        continue; // Saltar al siguiente nodo sin renderizar pines
      }
      
      // Renderizar pines para todos los nodos normales (excepto info-panel)
      this.renderPins(ctx, node, h);
    }
  }

  private renderPins(ctx: CanvasRenderingContext2D, node: Node, nodeHeight?: number) {
    // Usar dimensiones dinámicas exactamente igual que en renderNodes
    const baseWidth = 2.6; // Mismo ancho fijo que renderNodes
    const h = nodeHeight ?? node.size.y;
    const w = baseWidth; // Usar ancho fijo en lugar de node.size.x
  // Márgenes mínimos para que los pines estén prácticamente pegados al borde (mismo que updatePinPositions)
  const PIN_MARGIN_X = 0.01; // margen lateral casi nulo (mismo que updatePinPositions)
  const PIN_MARGIN_Y = 0.20; // margen vertical para evitar el título (mismo que updatePinPositions)
    // Recalcular posiciones de pines para las dimensiones dinámicas
    const inputCount = node.inputs.length;
    for (let i = 0; i < inputCount; i++) {
      const pin = node.inputs[i];
      pin.pos.x = node.pos.x - w / 2 + PIN_MARGIN_X;
      pin.pos.y = node.pos.y - h / 2 + PIN_MARGIN_Y + (i + 0.5) * (h - 2 * PIN_MARGIN_Y) / Math.max(inputCount, 1);
    }
    const outputCount = node.outputs.length;
    for (let i = 0; i < outputCount; i++) {
      const pin = node.outputs[i];
      pin.pos.x = node.pos.x + w / 2 - PIN_MARGIN_X;
      pin.pos.y = node.pos.y - h / 2 + PIN_MARGIN_Y + (i + 0.5) * (h - 2 * PIN_MARGIN_Y) / Math.max(outputCount, 1);
    }
    // Renderizar pines
    const renderPin = (pin: Pin) => {
      const isSelected = pin === this.selectedPin;
      const radius = isSelected ? 0.1 : 0.06;
      ctx.beginPath();
      ctx.arc(pin.pos.x, pin.pos.y, radius, 0, 2 * Math.PI);
      // Color según el tipo de pin
      const gradient = ctx.createRadialGradient(
        pin.pos.x, pin.pos.y, 0,
        pin.pos.x, pin.pos.y, radius
      );
      if (isSelected) {
        gradient.addColorStop(0, 'rgb(255, 255, 100)');
        gradient.addColorStop(1, 'rgb(255, 200, 0)');
      } else if (pin.type === PinType.Number) {
        gradient.addColorStop(0, 'rgb(150, 255, 150)');
        gradient.addColorStop(1, 'rgb(100, 200, 100)');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = isSelected ? 'rgb(255, 255, 0)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isSelected ? 0.02 : 0.01;
      ctx.stroke();
      ctx.fillStyle = isSelected ? 'rgb(255, 255, 0)' : 'rgb(200, 200, 200)';
      ctx.font = '0.10px "Montserrat", "Segoe UI", "Roboto", Arial, sans-serif';
      ctx.textAlign = pin.isInput ? 'right' : 'left';
      const textOffset = pin.isInput ? -0.15 : 0.15;
      ctx.fillText(pin.name, pin.pos.x + textOffset, pin.pos.y + 0.03);
    };
    node.inputs.forEach(renderPin);
    node.outputs.forEach(renderPin);
  }
}