import { Vec2, InputState, PinType } from '../types/types';
import { Node, Pin } from './Node';
import { NodeTypes } from './NodeTypes';

export class NodeEditor {
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
    return new Vec2(
      (screenPos.x - window.innerWidth / 2) / 100 + this.viewOffset.x,
      (screenPos.y - (window.innerHeight - 50) / 2) / 100 + this.viewOffset.y
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
    return point.x > node.pos.x - halfW && point.x < node.pos.x + halfW &&
           point.y > node.pos.y - halfH && point.y < node.pos.y + halfH;
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
      const delta = currentMouseWorld.subtract(this.screenToWorld(this.lastMousePos));
      // Aplicar movimiento suave
      const speed = 0.5;
      const targetPos = this.draggingNode.pos.add(delta);
      this.draggingNode.pos = new Vec2(
        this.draggingNode.pos.x + (targetPos.x - this.draggingNode.pos.x) * speed,
        this.draggingNode.pos.y + (targetPos.y - this.draggingNode.pos.y) * speed
      );
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
        // Aplicar efecto elástico al soltar
        const finalPos = this.draggingNode.pos;
        const elasticEffect = () => {
          const dampingFactor = 0.8;
          const springStrength = 0.2;
          const dx = finalPos.x - this.draggingNode!.pos.x;
          const dy = finalPos.y - this.draggingNode!.pos.y;
          
          if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            this.draggingNode!.pos = new Vec2(
              this.draggingNode!.pos.x + dx * springStrength,
              this.draggingNode!.pos.y + dy * springStrength
            );
            requestAnimationFrame(elasticEffect);
          }
        };
        elasticEffect();
      }
      this.draggingNode = null;
    }
  }

  computeAll() {
    // Resetear valores
    this.nodes.forEach(node => {
      node.inputs.forEach(pin => pin.value = pin.definition.defaultValue);
    });

    // Propagar valores a través de las conexiones
    this.links.forEach(link => {
      if (link && link[0] && link[1]) {
        const [output, input] = link;
        input.value = output.value;
      }
    });

    // Computar todos los nodos
    this.nodes.forEach(node => node.compute());
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

      // Fondo del nodo con gradiente
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
      
      ctx.fillStyle = gradient;
      // Dibujar nodo con esquinas redondeadas
      ctx.beginPath();
      ctx.roundRect(node.pos.x - w/2, node.pos.y - h/2, w, h, 0.1);
      ctx.fill();
      
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
      } else if (node.type === 'output/display') {
        ctx.fillStyle = 'rgb(150, 255, 150)';
        ctx.font = '0.14px sans-serif';
        ctx.textAlign = 'center';
        const value = node.inputs[0].value;
        ctx.fillText(value !== undefined ? value.toString() : '-', node.pos.x, node.pos.y + 0.1);
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