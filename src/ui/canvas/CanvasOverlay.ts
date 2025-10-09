// CanvasOverlay.ts
// Actualización de overlays UI: coordenadas, zoom, modo
import { Vec2 } from '../../types/types';

export function updateOverlay(coordsDisplay: HTMLElement, zoomDisplay: HTMLElement, modeDisplay: HTMLElement, mousePos: Vec2, scale: number) {
  coordsDisplay.textContent = `(${(mousePos.x/100).toFixed(2)}, ${(mousePos.y/100).toFixed(2)})`;
  zoomDisplay.textContent = `${Math.round(scale * 100)}%`;
}
