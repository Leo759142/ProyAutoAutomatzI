// CanvasUtils.ts
// Funciones utilitarias para conversión de coordenadas y helpers
import { Vec2 } from '../../types/types';

export function screenToWorld(screenPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  // Convertir coordenadas de pantalla a mundo
  const worldX = ((screenPos.x - canvas.width / 2) / (100 * scale)) + viewOffset.x;
  const worldY = ((screenPos.y - canvas.height / 2) / (100 * scale)) + viewOffset.y;
  return new Vec2(worldX, worldY);
}

export function worldToScreen(worldPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  // Convertir coordenadas de mundo a pantalla
  const screenX = ((worldPos.x - viewOffset.x) * 100 * scale) + canvas.width / 2;
  const screenY = ((worldPos.y - viewOffset.y) * 100 * scale) + canvas.height / 2;
  return new Vec2(screenX, screenY);
}
