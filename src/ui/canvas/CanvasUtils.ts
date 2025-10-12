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

/**
 * Evalúa un punto en una curva Bezier cúbica
 * @param t - Parámetro [0, 1]
 * @param p0 - Punto inicial
 * @param p1 - Punto de control 1
 * @param p2 - Punto de control 2
 * @param p3 - Punto final
 */
function evaluateCubicBezier(t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2 {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  
  return new Vec2(
    mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
  );
}

/**
 * Calcula la distancia mínima de un punto a una curva Bezier
 * @param point - Punto a verificar
 * @param p1 - Punto inicial de la curva (pin origen)
 * @param p2 - Punto final de la curva (pin destino)
 * @param samples - Número de puntos a muestrear en la curva (más = más preciso)
 */
export function distanceToBezierCurve(point: Vec2, p1: Vec2, p2: Vec2, samples: number = 20): number {
  // Puntos de control para la curva Bezier (mismo cálculo que en renderizado)
  const dx = p2.x - p1.x;
  const controlOffsetX = Math.min(Math.abs(dx) * 0.5, 3.0);
  
  const cp1 = new Vec2(p1.x + controlOffsetX, p1.y);
  const cp2 = new Vec2(p2.x - controlOffsetX, p2.y);
  
  let minDistance = Infinity;
  
  // Muestrear puntos en la curva
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const bezierPoint = evaluateCubicBezier(t, p1, cp1, cp2, p2);
    
    // Calcular distancia euclidiana
    const dist = distance(point, bezierPoint);
    minDistance = Math.min(minDistance, dist);
  }
  
  return minDistance;
}

/**
 * Calcula distancia euclidiana entre dos puntos
 */
function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Encuentra la conexión más cercana al punto dado
 * @param point - Punto en coordenadas del mundo
 * @param links - Array de conexiones [Pin, Pin]
 * @param threshold - Distancia máxima para considerar un click válido
 * @returns El link más cercano o null si ninguno está cerca
 */
export function getClosestLink(point: Vec2, links: any[], threshold: number = 0.3): any {
  let closestLink = null;
  let minDistance = threshold;
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    
    // Verificar que el link sea válido
    if (!link || link[0] === null || link[1] === null) continue;
    
    const [fromPin, toPin] = link;
    
    // Verificar que los pins tengan posición
    if (!fromPin.pos || !toPin.pos) continue;
    
    // Calcular distancia del punto a la curva
    const dist = distanceToBezierCurve(point, fromPin.pos, toPin.pos);
    
    if (dist < minDistance) {
      minDistance = dist;
      closestLink = { link, index: i, distance: dist };
    }
  }
  
  return closestLink;
}
