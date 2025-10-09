// CanvasUtils.ts
// Funciones utilitarias para conversión de coordenadas y helpers
import { Vec2 } from '../../types/types';

export function screenToWorld(screenPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  return new Vec2(
    (screenPos.x - canvas.width / 2) * scale + viewOffset.x,
    (screenPos.y - canvas.height / 2) * scale + viewOffset.y
  );
}

export function worldToScreen(worldPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  return new Vec2(
    (worldPos.x - viewOffset.x) / scale + canvas.width / 2,
    (worldPos.y - viewOffset.y) / scale + canvas.height / 2
  );
}
