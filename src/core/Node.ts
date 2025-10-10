import { Vec2, PinType, PinMode, NodeDefinition, PinDefinition } from '../types/types';
import { NodeTypes } from './NodeTypes';
import { DraggableNode } from './DraggableNode';

export class Pin {
  pos: Vec2 = new Vec2();
  isSet: boolean = false;
  userData: any = null;
  value: any;

  constructor(
    public parent: Node,
    public definition: PinDefinition,
    public index: number
  ) {
    this.value = definition.defaultValue;
  }

  get isInput(): boolean {
    return this.definition.mode === PinMode.Input;
  }

  get name(): string {
    return this.definition.name;
  }

  get type(): PinType {
    return this.definition.type;
  }
}

export class Node {
  pos: Vec2 = new Vec2();
  selected: boolean = false;
  userData: any = null;
  inputs: Pin[] = [];
  outputs: Pin[] = [];
  size: Vec2;
  private draggable: DraggableNode;
  // Animación para ConditionNode
  public highlightUntil: number = 0;
  // Highlight para ejecución paso a paso
  public stepHighlight: boolean = false;

  constructor(private definition: NodeDefinition) {
  // Tamaño base aumentado para mejor visibilidad
  this.size = new Vec2(3.5, Math.max(2.0, Math.max(definition.inputs.length, definition.outputs.length) * 1.0));
    
    // Initialize pins
    definition.inputs.forEach((pinDef, index) => {
      this.inputs.push(new Pin(this, pinDef, index));
    });

    definition.outputs.forEach((pinDef, index) => {
      this.outputs.push(new Pin(this, pinDef, index));
    });

    // Initialize draggable behavior
    this.draggable = new DraggableNode(this.pos, (newPos: Vec2) => {
      this.pos = newPos;
    });
  }

  setPosition(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
  }

  startDrag(mouseX: number, mouseY: number) {
    this.draggable.startDrag(mouseX, mouseY);
  }

  drag(mouseX: number, mouseY: number, bounds?: { min: Vec2, max: Vec2 }) {
    this.draggable.drag(mouseX, mouseY, bounds);
  }

  endDrag() {
    this.draggable.endDrag();
  }

  get title(): string {
    return this.definition.title;
  }

  get type(): string {
    return this.definition.type;
  }

  compute() {
    if (this.definition.compute) {
      const inputValues = this.inputs.map(pin => pin.value);
      const outputValues = this.definition.compute(inputValues, this);
      // Solo actualizar outputs si hay valores retornados
      if (outputValues && outputValues.length > 0) {
        this.outputs.forEach((pin, index) => {
          if (index < outputValues.length && outputValues[index] !== undefined) {
            pin.value = outputValues[index];
          }
        });
      }
    }
  }

  static create(type: string, x: number, y: number): Node | null {
    // Búsqueda directa del tipo
    const definition = NodeTypes[type];
    
    if (!definition) {
      console.warn(`No se encontró definición para el tipo de nodo: ${type}`);
      console.log('Tipos disponibles:', Object.keys(NodeTypes));
      return null;
    }

    const node = new Node(definition);
    node.setPosition(x, y);
    return node;
  }
}