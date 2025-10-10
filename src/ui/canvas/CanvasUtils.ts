// CanvasUtils.ts
// Funciones utilitarias para conversión de coordenadas y helpers
import { Vec2 } from '../../types/types';

/**
 * Convierte coordenadas de pantalla (píxeles del canvas) a coordenadas del mundo
 * IMPORTANTE: El sistema usa ctx.scale(100 * this.scale) en el render, 
 * por lo tanto 100 píxeles = 1 unidad de mundo
 * 
 * @param screenPos - Posición en píxeles del canvas (origen en esquina superior izquierda)
 * @param canvas - Elemento canvas
 * @param scale - Factor de zoom (1.0 = normal, > 1 = zoom in, < 1 = zoom out)
 * @param viewOffset - Desplazamiento de la vista (pan)
 */
export function screenToWorld(screenPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  // Factor de conversión: 100 píxeles = 1 unidad de mundo
  const PIXELS_PER_UNIT = 100;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // 1. Centrar coordenadas (restar centro)
  // 2. Convertir píxeles a unidades (dividir por 100)
  // 3. Aplicar escala inversa (dividir por scale)
  // 4. Sumar offset de vista
  return new Vec2(
    (screenPos.x - centerX) / (PIXELS_PER_UNIT * scale) + viewOffset.x,
    (screenPos.y - centerY) / (PIXELS_PER_UNIT * scale) + viewOffset.y
  );
}

/**
 * Convierte coordenadas del mundo a coordenadas de pantalla (píxeles del canvas)
 */
export function worldToScreen(worldPos: Vec2, canvas: HTMLCanvasElement, scale: number, viewOffset: Vec2): Vec2 {
  const PIXELS_PER_UNIT = 100;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Proceso inverso de screenToWorld
  return new Vec2(
    (worldPos.x - viewOffset.x) * (PIXELS_PER_UNIT * scale) + centerX,
    (worldPos.y - viewOffset.y) * (PIXELS_PER_UNIT * scale) + centerY
  );
}
