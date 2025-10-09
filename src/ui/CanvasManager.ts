/*
MIT License - Copyright (c) 2023 Jaysmito Mukherjee
*/

import { Vec2, InputState } from '../types/types';
import { NodeEditor, Pin } from '../core/NodeEditor';
import { Node } from '../core/Node';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private editor: NodeEditor;
  private executionInterval: number | null = null;
  private inpt: InputState = {
    scale: 1.0,
    aspectRatio: 1.0,
    mousePos: new Vec2(),
    mouseButtonLeft: false,
    mouseButtonMiddle: false,
    mouseButtonRight: false,
    shift: false,
    ctrl: false,
    escape: false,
    deletePressed: false,
    aPressed: false,
  };

  private keys: Set<string> = new Set();
  private lastTime: number = 0;

  constructor() {
    this.setupCanvas();
    this.editor = new NodeEditor(this.onConnect, this.onDrop);
    this.setupEventListeners();
    this.startRenderLoop();
  }

  private setupCanvas() {
    this.canvas = document.getElementById('nodeCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d')!;
    if (!this.ctx) {
      console.error('Could not get 2D context');
      return;
    }

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 50; // Adjust for toolbar
    this.inpt.aspectRatio = this.canvas.width / this.canvas.height;

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleResize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.inpt.aspectRatio = this.canvas.width / this.canvas.height;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.inpt.mousePos.x = x;
    this.inpt.mousePos.y = y;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.inpt.mouseButtonLeft = true;
    if (e.button === 1) this.inpt.mouseButtonMiddle = true;
    if (e.button === 2) this.inpt.mouseButtonRight = true;
    e.preventDefault();
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.inpt.mouseButtonLeft = false;
    if (e.button === 1) this.inpt.mouseButtonMiddle = false;
    if (e.button === 2) this.inpt.mouseButtonRight = false;
  };

  private handleWheel = (e: WheelEvent) => {
    this.inpt.scale += e.deltaY * -0.001;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
    this.updateInput(); // Actualizar inmediatamente el estado de entrada
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
    this.updateInput(); // Actualizar inmediatamente el estado de entrada
  };

  private onConnect = (a: Pin, b: Pin) => {
    const index = this.editor.links.length;
    a.userData = index;
    b.userData = index;
    this.editor.links[index] = [a, b];
  };

  private onDrop = (px: number, py: number, a: Pin) => {
    if (a.userData !== null) {
      const ind = a.userData;
      if (this.editor.links[ind]) {
        this.editor.links[ind][0]!.userData = null;
        this.editor.links[ind][1]!.userData = null;
        this.editor.links[ind] = [null, null];
      }
    }
  };

  private updateInput() {
    this.inpt.shift = this.keys.has('shift');
    this.inpt.ctrl = this.keys.has('control');
    this.inpt.escape = this.keys.has('escape');
    this.inpt.deletePressed = this.keys.has('delete') || this.keys.has('backspace');
    this.inpt.aPressed = this.keys.has('a');
  }

  private loop = (time: number) => {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.updateInput();
    this.editor.update(this.inpt, deltaTime);
    this.editor.render(this.ctx, this.canvas.width, this.canvas.height);

    requestAnimationFrame(this.loop);
  };

  private startRenderLoop() {
    requestAnimationFrame(this.loop);
  }

  // Métodos públicos para la interfaz
  triggerAddNode(nodeType: string = 'number') {
    const x = -this.editor.viewOffset.x + (Math.random() * 2 - 1);
    const y = -this.editor.viewOffset.y + (Math.random() * 2 - 1);
    const node = Node.create(nodeType, x, y);
    if (node) {
      this.editor.nodes.push(node);
    }
  }

  triggerClearCanvas() {
    this.editor.nodes = [];
    this.editor.links = [];
  }

  startExecution() {
    this.editor.isRunning = true;
    if (!this.executionInterval) {
      this.executionInterval = window.setInterval(() => {
        if (this.editor.isRunning) {
          this.editor.computeAll();
        }
      }, 100); // Actualizar cada 100ms
    }
  }

  stopExecution() {
    this.editor.isRunning = false;
    if (this.executionInterval) {
      window.clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
  }
}