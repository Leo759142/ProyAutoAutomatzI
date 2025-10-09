/*
MIT License - Copyright (c) 2023 Jaysmito Mukherjee
*/

export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  subtract(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  scale(factor: number): Vec2 {
    return new Vec2(this.x * factor, this.y * factor);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

export enum PinType {
  Number,
  String,
  Boolean,
  Vector,
  Custom
}

export enum PinMode {
  Input,
  Output
}

export interface PinDefinition {
  name: string;
  type: PinType;
  mode: PinMode;
  allowMultiple?: boolean;
  defaultValue?: any;
}

export interface INode {
  type: string;
  inputs: Pin[];
  outputs: Pin[];
  pos: Vec2;
}

export interface NodeDefinition {
  type: string;
  category: string;
  title: string;
  inputs: PinDefinition[];
  outputs: PinDefinition[];
  compute?: (inputs: any[], node?: INode) => any[];
}

export interface InputState {
  scale: number;
  aspectRatio: number;
  mousePos: Vec2;
  mouseButtonLeft: boolean;
  mouseButtonMiddle: boolean;
  mouseButtonRight: boolean;
  shift: boolean;
  ctrl: boolean;
  escape: boolean;
  deletePressed: boolean;
  aPressed: boolean;
}