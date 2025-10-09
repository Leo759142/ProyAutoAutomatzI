import { Vec2, PinType, PinMode, NodeDefinition, PinDefinition } from '../types/types';
import { NodeTypes } from './NodeTypes';

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

  constructor(private definition: NodeDefinition) {
    this.size = new Vec2(2.0, Math.max(1.0, Math.max(definition.inputs.length, definition.outputs.length) * 0.5));
    
    // Initialize pins
    definition.inputs.forEach((pinDef, index) => {
      this.inputs.push(new Pin(this, pinDef, index));
    });

    definition.outputs.forEach((pinDef, index) => {
      this.outputs.push(new Pin(this, pinDef, index));
    });
  }

  setPosition(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
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
      const outputValues = this.definition.compute(inputValues);
      this.outputs.forEach((pin, index) => {
        pin.value = outputValues[index];
      });
    }
  }

  static create(type: string, x: number, y: number): Node | null {
    const definition = NodeTypes[type];
    if (!definition) return null;

    const node = new Node(definition);
    node.setPosition(x, y);
    return node;
  }
}