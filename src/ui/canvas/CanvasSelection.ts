// CanvasSelection.ts
// Lógica de selección y movimiento de nodos
import { Node } from '../../core/Node';
import { Vec2 } from '../../types/types';

export class CanvasSelection {
  isSelecting: boolean = false;
  selectionStart: Vec2 = new Vec2();
  selectionStartWorld: Vec2 = new Vec2();
  selectedNodes: Set<Node> = new Set();
  isMovingSelection: boolean = false;
  selectionMoveStart: Vec2 = new Vec2();
  nodeOffsets: Map<Node, Vec2> = new Map();
}
