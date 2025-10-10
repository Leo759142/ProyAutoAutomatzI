// CanvasOverlay.ts
// Actualización de overlays UI: coordenadas, zoom, modo
import { Vec2 } from '../../types/types';

export function updateOverlay(coordsDisplay: HTMLElement, zoomDisplay: HTMLElement, modeDisplay: HTMLElement, mousePos: Vec2, scale: number) {
  // Mostrar coordenadas del mundo sin división, redondeadas a 1 decimal
  coordsDisplay.textContent = `(${mousePos.x.toFixed(1)}, ${mousePos.y.toFixed(1)})`;
  zoomDisplay.textContent = `${Math.round(scale * 100)}%`;
}
