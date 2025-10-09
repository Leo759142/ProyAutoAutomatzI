import { Vec2, InputState, PinType } from '../types/types';
import { Node, Pin } from './Node';
import { NodeTypes } from './NodeTypes';

export class NodeEditor {
  /**
   * Agrega un nodo al editor en una posición aleatoria o especificada
   */
  public addNode(nodeType: string = 'number', x?: number, y?: number) {
    const posX = x ?? -this.viewOffset.x + (Math.random() * 2 - 1);
    const posY = y ?? -this.viewOffset.y + (Math.random() * 2 - 1);
    const node = Node.create(nodeType, posX, posY);
    if (node) {
      this.nodes.push(node);
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
      this.clearCanvas();
      const nodesData = JSON.parse(template.nodes_data);
      const connectionsData = JSON.parse(template.connections_data);
      const nodeMap: { [key: number]: any } = {};

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < nodesData.length; i++) {
        const nodeData = nodesData[i];
        if (nodeData.position) {
          minX = Math.min(minX, nodeData.position.x);
          minY = Math.min(minY, nodeData.position.y);
          maxX = Math.max(maxX, nodeData.position.x);
          maxY = Math.max(maxY, nodeData.position.y);
        }
        const absoluteX = (nodeData.position?.x || 0) / 100;
        const absoluteY = (nodeData.position?.y || 0) / 100;
        const node = Node.create(nodeData.type, absoluteX, absoluteY);
        if (node) {
          if (nodeData.data) {
            if (nodeData.data.value !== undefined && node.outputs.length > 0) {
              node.outputs[0].value = nodeData.data.value;
            }
            for (const key in nodeData.data) {
              if (key !== 'value' && nodeData.data.hasOwnProperty(key) && key in node) {
                (node as any)[key] = nodeData.data[key];
              }
            }
          }
          node.pos.x = absoluteX;
          node.pos.y = absoluteY;
          this.nodes.push(node);
          nodeMap[nodeData.id || i + 1] = node;
        }
      }
      for (const conn of connectionsData) {
        const fromNode = nodeMap[conn.from.node];
        const toNode = nodeMap[conn.to.node];
        if (fromNode && toNode) {
          if (fromNode.outputs[conn.from.pin] && toNode.inputs[conn.to.pin]) {
            this.onConnect(fromNode.outputs[conn.from.pin], toNode.inputs[conn.to.pin]);
          }
        }
      }
      if (minX !== Infinity && minY !== Infinity) {
        const centerX = (minX + maxX) / 200;
        const centerY = (minY + maxY) / 200;
        this.viewOffset.x = centerX;
        this.viewOffset.y = centerY;
        const width = (maxX - minX) / 100;
        const height = (maxY - minY) / 100;
        const scale = Math.min(
          window.innerWidth / (width + 2),
          (window.innerHeight - 50) / (height + 2)
        );
        this.scale = Math.max(0.1, Math.min(1, scale / 200));
      }
      this.computeAll();
    } catch (error) {
      console.error('Error al cargar el template:', error);
    }
  }
  nodes: Node[] = [];
  links: [Pin | null, Pin | null][] = [];
  viewOffset: Vec2 = new Vec2();
  scale: number = 1.0;
  isRunning: boolean = false;

  private draggingNode: Node | null = null;
  private draggingPin: Pin | null = null;
  private hoveringPin: Pin | null = null;
  private lastMousePos: Vec2 = new Vec2();
  private tempLinkEnd: Vec2 = new Vec2();
  private lastAddTime: number = 0;
  private lastMouseButtonLeft: boolean = false;

  constructor(
    private onConnect: (a: Pin, b: Pin) => void,
    private onDrop: (px: number, py: number, a: Pin) => void
  ) {}

  private screenToWorld(screenPos: Vec2): Vec2 {
    const scaleFactor = 100 * this.scale;
    return new Vec2(
      (screenPos.x - window.innerWidth / 2) / scaleFactor + this.viewOffset.x,
      (screenPos.y - (window.innerHeight - 50) / 2) / scaleFactor + this.viewOffset.y
    );
  }

  private worldToScreen(worldPos: Vec2): Vec2 {
    const scaleFactor = 100 * this.scale;
    return new Vec2(
      (worldPos.x - this.viewOffset.x) * scaleFactor + window.innerWidth / 2,
      (worldPos.y - this.viewOffset.y) * scaleFactor + (window.innerHeight - 50) / 2
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

    if (inpt.mouseButtonMiddle) {
      const delta = currentMouseWorld.subtract(this.screenToWorld(this.lastMousePos));
      this.viewOffset = this.viewOffset.subtract(delta);
    }

    if (inpt.aPressed && Date.now() - this.lastAddTime > 300) {
      this.lastAddTime = Date.now();
      const nodeTypes = Object.keys(NodeTypes);
      const randomType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const node = Node.create(randomType, currentMouseWorld.x, currentMouseWorld.y);
      if (node) {
        this.nodes.push(node);
      }
    }

    if (inpt.deletePressed) {
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
    for (const node of this.nodes) {
      const h = node.size.y;
      const w = node.size.x;
      const inputCount = node.inputs.length;
      for (let i = 0; i < inputCount; i++) {
        const pin = node.inputs[i];
        pin.pos.x = node.pos.x - w / 2;
        pin.pos.y = node.pos.y - h / 2 + (i + 1) * h / (inputCount + 1);
      }
      const outputCount = node.outputs.length;
      for (let i = 0; i < outputCount; i++) {
        const pin = node.outputs[i];
        pin.pos.x = node.pos.x + w / 2;
        pin.pos.y = node.pos.y - h / 2 + (i + 1) * h / (outputCount + 1);
      }
    }
  }

  private updateInteractions(inpt: InputState, currentMouseWorld: Vec2) {
    this.hoveringPin = null;
    for (const node of this.nodes) {
      for (const pin of [...node.inputs, ...node.outputs]) {
        if (this.distance(currentMouseWorld, pin.pos) < 0.1) {
          this.hoveringPin = pin;
          break;
        }
      }
      if (this.hoveringPin) break;
    }

    if (inpt.mouseButtonLeft && !this.lastMouseButtonLeft) {
      if (this.hoveringPin) {
        this.draggingPin = this.hoveringPin;
      } else {
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

    if (this.draggingNode && inpt.mouseButtonLeft) {
      const bounds = this.getCanvasBounds();
      this.draggingNode.drag(currentMouseWorld.x, currentMouseWorld.y, bounds);
    }

    if (this.draggingPin && inpt.mouseButtonLeft) {
      this.tempLinkEnd = currentMouseWorld;
    }

    if (!inpt.mouseButtonLeft && this.lastMouseButtonLeft) {
      if (this.draggingPin) {
        if (this.hoveringPin && 
            this.hoveringPin !== this.draggingPin && 
            this.hoveringPin.isInput !== this.draggingPin.isInput) {
          // Verificar tipos compatibles
          if (this.hoveringPin.type === this.draggingPin.type) {
            this.onConnect(this.draggingPin, this.hoveringPin);
            this.computeAll(); // Recalcular valores
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

  private findExecutionOrder(): Node[] {
    const visited = new Set<Node>();
    const order: Node[] = [];

    const visit = (node: Node) => {
      if (visited.has(node)) return;
      visited.add(node);

      // Primero procesar los nodos que conectan a las entradas de este nodo
      this.links.forEach(link => {
        if (link && link[1] && link[1].parent === node) {
          visit(link[0].parent);
        }
      });

      order.push(node);
    };

    // Comenzar desde los nodos sin salidas (nodos finales)
    this.nodes.forEach(node => {
      if (node.outputs.length === 0) {
        visit(node);
      }
    });

    // Procesar cualquier nodo restante
    this.nodes.forEach(node => visit(node));

    return order;
  }

  computeAll() {
    // Resetear valores
    this.nodes.forEach(node => {
      node.inputs.forEach(pin => pin.value = pin.definition.defaultValue);
      node.outputs.forEach(pin => pin.value = pin.definition.defaultValue);
    });

    // Obtener orden de ejecución
    const executionOrder = this.findExecutionOrder();

    // Computar nodos en orden (soporte asíncrono)
    (async () => {
      for (const node of executionOrder) {
        // Propagar valores de entrada
        this.links.forEach(link => {
          if (link && link[1] && link[1].parent === node) {
            link[1].value = link[0].value;
          }
        });

        // Computar el nodo (soporta async)
        if (typeof node.compute === 'function') {
          await node.compute();
        }

        // Debug
        console.log('Computed node:', node.type, {
          inputs: node.inputs.map(pin => pin.value),
          outputs: node.outputs.map(pin => pin.value)
        });
      }
    })();
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(30, 30, 30)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(100 * this.scale, 100 * this.scale);
    ctx.translate(-this.viewOffset.x, -this.viewOffset.y);

    this.renderLinks(ctx);
    this.renderTempLink(ctx);
    this.renderNodes(ctx);

    ctx.restore();
  }

  private renderLinks(ctx: CanvasRenderingContext2D) {
    for (let i = 1; i < this.links.length; i++) {
      const link = this.links[i];
      if (link && link[0] && link[1]) {
        this.drawBezierLink(ctx, link[0].pos, link[1].pos);
      }
    }
  }

  private renderTempLink(ctx: CanvasRenderingContext2D) {
    if (this.draggingPin) {
      this.drawBezierLink(ctx, this.draggingPin.pos, this.tempLinkEnd, true);
    }
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
      const w = node.size.x;
      const h = node.size.y;

      // Dibujar sombra
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 0.1;
      ctx.shadowOffsetX = 0.05;
      ctx.shadowOffsetY = 0.05;

      // Fondo del nodo con gradiente o color lógico para ConditionNode
      let fillStyle: CanvasGradient | string;
      let highlight = false;
      if (node.type === 'condition') {
        // Color según la salida lógica
        const isTrue = node.outputs[0]?.value === true;
        fillStyle = isTrue ? 'rgb(80, 200, 120)' : 'rgb(200, 80, 80)';
        highlight = node.highlightUntil > Date.now();
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
      // Dibujar nodo con esquinas redondeadas
      ctx.beginPath();
      ctx.roundRect(node.pos.x - w/2, node.pos.y - h/2, w, h, 0.1);
      ctx.fill();
      // Animación visual: resplandor
      if (highlight) {
        ctx.save();
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 0.25;
        ctx.beginPath();
        ctx.roundRect(node.pos.x - w/2, node.pos.y - h/2, w, h, 0.1);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 0.07;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Título del nodo
      ctx.fillStyle = 'white';
      ctx.font = '0.15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.pos.x, node.pos.y - h/2 + 0.25);

      // Renderizar pines
      this.renderPins(ctx, node);

      // Renderizar valores si es un nodo de entrada o salida
      if (node.type === 'input/number') {
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.font = '0.12px sans-serif';
        ctx.textAlign = 'center';
        const value = node.outputs[0].value;
        ctx.fillText(value.toString(), node.pos.x, node.pos.y + 0.1);
      } else if (node.type === 'output' || node.title.toLowerCase().includes('output')) {
        ctx.fillStyle = 'rgb(150, 255, 150)';
        ctx.font = '0.14px sans-serif';
        ctx.textAlign = 'center';
        const value = node.inputs[0]?.value;
        ctx.fillText(value !== undefined ? value.toString() : '-', node.pos.x, node.pos.y + 0.18);
      } else if (node.type === 'condition') {
        ctx.fillStyle = 'white';
        ctx.font = '0.13px sans-serif';
        ctx.textAlign = 'center';
        const valTrue = node.outputs[0]?.value;
        const valFalse = node.outputs[1]?.value;
        ctx.fillText(`true: ${valTrue ? '✔️' : '❌'} | false: ${valFalse ? '✔️' : '❌'}`,
          node.pos.x, node.pos.y + 0.18);
      }
    }
  }

  private renderPins(ctx: CanvasRenderingContext2D, node: Node) {
    const renderPin = (pin: Pin) => {
      ctx.beginPath();
      ctx.arc(pin.pos.x, pin.pos.y, 0.06, 0, 2 * Math.PI);
      
      // Color según el tipo de pin
      const gradient = ctx.createRadialGradient(
        pin.pos.x, pin.pos.y, 0,
        pin.pos.x, pin.pos.y, 0.06
      );

      if (pin.type === PinType.Number) {
        gradient.addColorStop(0, 'rgb(150, 255, 150)');
        gradient.addColorStop(1, 'rgb(100, 200, 100)');
      }

      ctx.fillStyle = gradient;
      ctx.fill();

      // Borde del pin
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.01;
      ctx.stroke();

      // Nombre del pin
      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.font = '0.08px sans-serif';
      ctx.textAlign = pin.isInput ? 'right' : 'left';
      const textOffset = pin.isInput ? -0.1 : 0.1;
      ctx.fillText(pin.name, pin.pos.x + textOffset, pin.pos.y + 0.03);
    };

    node.inputs.forEach(renderPin);
    node.outputs.forEach(renderPin);
  }
}