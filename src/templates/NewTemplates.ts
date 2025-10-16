import { WorkflowTemplate } from '../services/DatabaseService';

export const newTemplates: WorkflowTemplate[] = [
	{
		name: '📅 PERT: Lanzamiento SaaS',
		description: 'Cronograma PERT/CPM para la salida de un producto SaaS con ruta crítica identificada',
		problemDescription: `---
context: projectScheduling
unit: days
icon: 📅
title: Lanzamiento SaaS (PERT)
---
# 📅 Lanzamiento SaaS

**Objetivo:** planificar el lanzamiento de una plataforma SaaS midiendo ruta crítica y holguras.

| Código | Actividad | O (d) | M (d) | P (d) | TE estimado |
| ------ | --------- | ----: | ----: | ----: | ----------: |
| A | Descubrimiento & UX | 5 | 6 | 7 | 6.0 |
| B | Infraestructura Cloud | 2 | 3 | 4 | 3.0 |
| C | Desarrollo Frontend | 4 | 5 | 6 | 5.0 |
| D | Integraciones Core | 1 | 2 | 3 | 2.0 |
| E | QA Automatizado | 4 | 5 | 6 | 5.0 |
| F | Beta Cerrada | 3 | 4 | 5 | 4.0 |
| G | Deploy Comercial | 1 | 2 | 3 | 2.0 |

### ✅ Resultado esperado
- Ruta crítica: **A → C → E → F → G**
- Duración total estimada: **22 días**
- Holgura secundaria: camino A → B → D → F → G con +4 d libres
`,
		nodes_data: JSON.stringify([
			{ id: 0, type: 'info-panel', position: { x: -16, y: -8 }, data: { customDescription: '📅 Lanzamiento SaaS\n\nPlanifica dependencias entre UX, cloud, QA y despliegue. Ejecuta PERT/CPM para ver ES/EF/LS/LF y resaltar la ruta crítica esperada (A→C→E→F→G = 22 d).' } },
			{ id: 1, type: 'task', position: { x: -12, y: 0 }, data: { customTitle: 'A: Descubrimiento', customDescription: 'Kick-off, UX y roadmap (O=5, M=6, P=7 d)', pertData: { optimistic: 5, mostLikely: 6, pessimistic: 7 } } },
			{ id: 2, type: 'task', position: { x: -6, y: -4 }, data: { customTitle: 'B: Infra Cloud', customDescription: 'Despliegue infra y pipelines (O=2, M=3, P=4 d)', pertData: { optimistic: 2, mostLikely: 3, pessimistic: 4 } } },
			{ id: 3, type: 'task', position: { x: -6, y: 4 }, data: { customTitle: 'C: Frontend', customDescription: 'MVP React + diseño responsive (O=4, M=5, P=6 d)', pertData: { optimistic: 4, mostLikely: 5, pessimistic: 6 } } },
			{ id: 4, type: 'task', position: { x: -1, y: -3 }, data: { customTitle: 'D: Integraciones', customDescription: 'Pagos y analytics (O=1, M=2, P=3 d)', pertData: { optimistic: 1, mostLikely: 2, pessimistic: 3 } } },
			{ id: 5, type: 'task', position: { x: -1, y: 3 }, data: { customTitle: 'E: QA Automatizado', customDescription: 'Tests e2e, performance y seguridad (O=4, M=5, P=6 d)', pertData: { optimistic: 4, mostLikely: 5, pessimistic: 6 } } },
			{ id: 6, type: 'task', position: { x: 5, y: 0 }, data: { customTitle: 'F: Beta Cerrada', customDescription: 'Piloto con clientes clave (O=3, M=4, P=5 d)', pertData: { optimistic: 3, mostLikely: 4, pessimistic: 5 } } },
			{ id: 7, type: 'task', position: { x: 10, y: 0 }, data: { customTitle: 'G: Deploy Comercial', customDescription: 'Release global + monitoreo (O=1, M=2, P=3 d)', pertData: { optimistic: 1, mostLikely: 2, pessimistic: 3 } } },
			{ id: 8, type: 'display', position: { x: 13, y: 0 }, data: { customDescription: '✅ Proyecto lanzado (esperado 22 d, ruta crítica A→C→E→F→G)' } }
		]),
		connections_data: JSON.stringify([
			{ from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } },
			{ from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
			{ from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } },
			{ from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 } },
			{ from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 } },
			{ from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } },
			{ from: { node: 6, pin: 0 }, to: { node: 7, pin: 0 } },
			{ from: { node: 7, pin: 0 }, to: { node: 8, pin: 0 } }
		])
	},
	{
		name: '🏥 PERT: Campaña de Vacunación',
		description: 'Planificación probabilística de una campaña nacional de vacunación con análisis de holguras',
		problemDescription: `---
context: publicHealth
unit: days
icon: 🏥
title: Campaña de Vacunación (PERT)
---
# 🏥 Campaña Nacional de Vacunación

**Objetivo:** desplegar brigadas, cadena de frío y comunicación para aplicar 500k dosis en 4 semanas.

| Código | Actividad | O (d) | M (d) | P (d) | TE estimado |
| ------ | --------- | ----: | ----: | ----: | ----------: |
| A | Logística y suministros | 3 | 4 | 6 | 4.2 |
| B | Capacitar brigadas | 2 | 3 | 4 | 3.0 |
| C | Cadena de frío nacional | 3 | 4 | 5 | 4.0 |
| D | Piloto regional | 2 | 3 | 5 | 3.2 |
| E | Escalado nacional | 4 | 5 | 7 | 5.2 |
| F | Reporte de impacto | 1 | 2 | 3 | 2.0 |

### ✅ Resultado esperado
- Ruta crítica: **A → C → D → E → F**
- Duración total aproximada: **18.5 días**
- Holgura clave: B puede retrasarse ~1 día sin afectar el cronograma
`,
		nodes_data: JSON.stringify([
			{ id: 0, type: 'info-panel', position: { x: -18, y: -8 }, data: { customDescription: '🏥 Vacunación masiva\n\nCoordina logística nacional (suministros, cadena de frío y capacitación). Usa PERT/CPM para identificar la ruta crítica A→C→D→E→F (~18.5 d) y la holgura de la capacitación (B).' } },
			{ id: 1, type: 'task', position: { x: -12, y: 0 }, data: { customTitle: 'A: Logística central', customDescription: 'Procura vacunas, transporte y seguros (O=3, M=4, P=6 d)', pertData: { optimistic: 3, mostLikely: 4, pessimistic: 6 } } },
			{ id: 2, type: 'task', position: { x: -6, y: -4 }, data: { customTitle: 'B: Capacitación', customDescription: 'Entrena 240 brigadas municipales (O=2, M=3, P=4 d)', pertData: { optimistic: 2, mostLikely: 3, pessimistic: 4 } } },
			{ id: 3, type: 'task', position: { x: -6, y: 4 }, data: { customTitle: 'C: Cadena de frío', customDescription: 'Monitorea 18 cámaras frigoríficas (O=3, M=4, P=5 d)', pertData: { optimistic: 3, mostLikely: 4, pessimistic: 5 } } },
			{ id: 4, type: 'task', position: { x: -1, y: 0 }, data: { customTitle: 'D: Piloto regional', customDescription: 'Piloto en 3 ciudades priorizadas (O=2, M=3, P=5 d)', pertData: { optimistic: 2, mostLikely: 3, pessimistic: 5 } } },
			{ id: 5, type: 'task', position: { x: 5, y: 0 }, data: { customTitle: 'E: Escalado nacional', customDescription: 'Cobertura de 12 regiones (O=4, M=5, P=7 d)', pertData: { optimistic: 4, mostLikely: 5, pessimistic: 7 } } },
			{ id: 6, type: 'task', position: { x: 10, y: 0 }, data: { customTitle: 'F: Reporte impacto', customDescription: 'Reporte OMS y gabinete (O=1, M=2, P=3 d)', pertData: { optimistic: 1, mostLikely: 2, pessimistic: 3 } } },
			{ id: 7, type: 'display', position: { x: 13, y: 0 }, data: { customDescription: '✅ Cobertura 500k dosis (≈18.5 d)' } }
		]),
		connections_data: JSON.stringify([
			{ from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 } },
			{ from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
			{ from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 } },
			{ from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 } },
			{ from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 } },
			{ from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 } },
			{ from: { node: 6, pin: 0 }, to: { node: 7, pin: 0 } }
		])
	},
	{
		name: '🚚 Dijkstra: Red Logística Nacional',
		description: 'Optimiza envíos desde un hub central hasta el puerto usando pesos reales en kilómetros',
		problemDescription: `---
context: transportation
unit: km
icon: 🚚
title: Red Logística Nacional (Dijkstra)
---
# 🚚 Red Logística Nacional

**Contexto:** la empresa TransNacional debe entregar contenedores desde el Centro (A) hasta el Puerto (J) atravesando 10 ciudades.

| Origen | Destino | Distancia |
| ------ | ------- | --------: |
| A | B | 5 km |
| A | C | 4 km |
| C | F | 2 km |
| F | H | 3 km |
| H | I | 4 km |
| I | J | 3 km |
| ... | ... | ... |

### ✅ Resultado esperado
- Camino mínimo: **A → C → F → H → I → J = 16 km**
- Alternativa directa pero más cara: A → C → F → H → J = 17 km
- Usa pesos de conexiones; ideal para comparar con A*
`,
		nodes_data: JSON.stringify([
			{ id: 0, type: 'info-panel', position: { x: -20, y: -10 }, data: { customDescription: '🚚 Corredor logístico nacional\n\nEncuentra la mejor ruta de A (Centro) a J (Puerto). Dijkstra usará los pesos (km) configurados en cada conexión para garantizar el camino más corto.' } },
			{ id: 1, type: 'task', position: { x: -15, y: 0 }, data: { customTitle: 'A: Centro', customDescription: 'Centro de Operaciones (origen)' } },
			{ id: 2, type: 'task', position: { x: -10, y: -5 }, data: { customTitle: 'B: Norte', customDescription: 'Ciudad B - acceso por autopista (5 km desde A)' } },
			{ id: 3, type: 'task', position: { x: -10, y: 5 }, data: { customTitle: 'C: Sur', customDescription: 'Ciudad C - 4 km desde A' } },
			{ id: 4, type: 'task', position: { x: -5, y: -2 }, data: { customTitle: 'D: Centro-N', customDescription: 'Ciudad D - conexión B (3 km) / C (6 km)' } },
			{ id: 5, type: 'task', position: { x: -5, y: -7 }, data: { customTitle: 'E: Cordillera', customDescription: 'Ciudad E - 7 km desde B' } },
			{ id: 6, type: 'task', position: { x: -5, y: 7 }, data: { customTitle: 'F: Llanura', customDescription: 'Ciudad F - nodo clave (2 km desde C)' } },
			{ id: 7, type: 'task', position: { x: 0, y: -2 }, data: { customTitle: 'G: Centro-E', customDescription: 'Ciudad G - 4 km desde D / 2 km desde E' } },
			{ id: 8, type: 'task', position: { x: 0, y: 5 }, data: { customTitle: 'H: Este', customDescription: 'Ciudad H - 5 km desde E / 3 km desde F' } },
			{ id: 9, type: 'task', position: { x: 5, y: 0 }, data: { customTitle: 'I: Pre-Puerto', customDescription: 'Ciudad I - 6 km desde G / 4 km desde H' } },
			{ id: 10, type: 'task', position: { x: 10, y: 0 }, data: { customTitle: 'J: Puerto', customDescription: 'Puerto de exportación (destino final)' } },
			{ id: 11, type: 'display', position: { x: 13, y: 0 }, data: { customDescription: '✅ Contenedor entregado (ruta 16 km)' } }
		]),
		connections_data: JSON.stringify([
			{ from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 }, weight: 5 },
			{ from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 }, weight: 4 },
			{ from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 }, weight: 3 },
			{ from: { node: 2, pin: 0 }, to: { node: 5, pin: 0 }, weight: 7 },
			{ from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 }, weight: 6 },
			{ from: { node: 3, pin: 0 }, to: { node: 6, pin: 0 }, weight: 2 },
			{ from: { node: 4, pin: 0 }, to: { node: 7, pin: 0 }, weight: 4 },
			{ from: { node: 5, pin: 0 }, to: { node: 7, pin: 0 }, weight: 2 },
			{ from: { node: 5, pin: 0 }, to: { node: 8, pin: 0 }, weight: 5 },
			{ from: { node: 6, pin: 0 }, to: { node: 8, pin: 0 }, weight: 3 },
			{ from: { node: 7, pin: 0 }, to: { node: 9, pin: 0 }, weight: 6 },
			{ from: { node: 8, pin: 0 }, to: { node: 9, pin: 0 }, weight: 4 },
			{ from: { node: 8, pin: 0 }, to: { node: 10, pin: 0 }, weight: 8 },
			{ from: { node: 9, pin: 0 }, to: { node: 10, pin: 0 }, weight: 3 },
			{ from: { node: 10, pin: 0 }, to: { node: 11, pin: 0 } }
		])
	},
	{
		name: '🤖 A*: Robot Picking en Almacén',
		description: 'Ruta inteligente para un robot de picking que debe pasar por la estantería 42 antes de salir',
		problemDescription: `---
context: warehouseRouting
unit: minutes
icon: 🤖
title: Picking Robot (A*)
---
# 🤖 Robot Picking en Almacén

**Contexto:** un robot autónomo parte del Dock (inicio), recoge pedidos en la Estantería 42 y sale por el área de Despacho.

| Nodo | Rol | Heurística (min restantes) |
| ---- | --- | -------------------------: |
| Dock | Inicio | 12 |
| Pasillo Norte | Alternativa rápida | 8 |
| Pasillo Sur | Evita congestión | 9 |
| Estantería 42 | Punto de picking | 5 |
| Buffer de Empaque | Consolidación | 2 |
| Salida Dispatch | Destino | 0 |

### ✅ Resultado esperado
- Ruta sugerida: **Dock → Pasillo Norte → Estantería 42 → Buffer → Salida = 12 min**
- A* explora menos nodos que Dijkstra gracias a la heurística espacial
- Pruébalo moviendo nodos: la heurística usa la posición real en el canvas
`,
		nodes_data: JSON.stringify([
			{ id: 0, type: 'info-panel', position: { x: -22, y: -10 }, data: { customDescription: '🤖 Picking robot en almacén\n\nDebe visitar la Estantería 42 obligatoriamente. A* usa distancias heurísticas basadas en la posición de los nodos para explorar menos opciones que Dijkstra.' } },
			{ id: 1, type: 'task', position: { x: -16, y: 0 }, data: { customTitle: 'Dock de recepción', customDescription: 'Inicio: robot cargado con lista de pedidos' } },
			{ id: 2, type: 'task', position: { x: -10, y: -4 }, data: { customTitle: 'Pasillo Norte', customDescription: 'Pasillo cercano sin congestión (heurística 8)' } },
			{ id: 3, type: 'task', position: { x: -10, y: 4 }, data: { customTitle: 'Pasillo Sur', customDescription: 'Pasillo alternativo (heurística 9)' } },
			{ id: 4, type: 'task', position: { x: -4, y: 0 }, data: { customTitle: 'Estantería 42', customDescription: 'Punto de picking obligatorio (heurística 5)' } },
			{ id: 5, type: 'task', position: { x: 2, y: 0 }, data: { customTitle: 'Buffer de empaque', customDescription: 'Consolidación y etiquetado (heurística 2)' } },
			{ id: 6, type: 'task', position: { x: 8, y: 0 }, data: { customTitle: 'Salida Dispatch', customDescription: 'Zona de despacho (destino final)' } },
			{ id: 7, type: 'display', position: { x: 12, y: 0 }, data: { customDescription: '✅ Pedido despachado (≈12 min)' } }
		]),
		connections_data: JSON.stringify([
			{ from: { node: 1, pin: 0 }, to: { node: 2, pin: 0 }, weight: 4 },
			{ from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 }, weight: 5 },
			{ from: { node: 2, pin: 0 }, to: { node: 4, pin: 0 }, weight: 3 },
			{ from: { node: 3, pin: 0 }, to: { node: 4, pin: 0 }, weight: 2 },
			{ from: { node: 2, pin: 0 }, to: { node: 5, pin: 0 }, weight: 6 },
			{ from: { node: 3, pin: 0 }, to: { node: 5, pin: 0 }, weight: 5 },
			{ from: { node: 4, pin: 0 }, to: { node: 5, pin: 0 }, weight: 2 },
			{ from: { node: 5, pin: 0 }, to: { node: 6, pin: 0 }, weight: 3 },
			{ from: { node: 4, pin: 0 }, to: { node: 6, pin: 0 }, weight: 6 },
			{ from: { node: 6, pin: 0 }, to: { node: 7, pin: 0 } }
		])
	},
	{
		name: '🛡️ Decisión: Respuesta a Incidente',
		description: 'Árbol de decisión para incidentes de ciberseguridad con condiciones, compuertas lógicas y salidas',
		problemDescription: `---
context: incidentResponse
unit: boolean
icon: 🛡️
title: Mesa de Crisis (Decision Flow)
---
# 🛡️ Respuesta a Incidente de Ciberseguridad

**Escenario:** se detecta actividad anómala en los servidores financieros.

- Severidad detectada: 85/100
- Tiempo desde la detección: 6 horas
- Confirmación de exfiltración: Sí
- Impacto operativo: No

### ✅ Preguntas clave
1. ¿La severidad supera el umbral de crisis?
2. ¿Existe evidencia de exfiltración de datos?
3. ¿Hay impacto operativo en curso?

### ✅ Resultado esperado
- Salida 1: **Escalar a CSIRT y notificar autoridad** (True)
- Salida 2: **Monitoreo reforzado** (True)
- Salida 3: **Continuidad operativa OK** (True)
`,
		nodes_data: JSON.stringify([
			{ id: 0, type: 'info-panel', position: { x: -18, y: 6 }, data: { customDescription: '🛡️ Incidente crítico\n\nEvalúa severidad, exfiltración y continuidad. Usa compuertas lógicas para decidir qué protocolos activar.' } },
			{ id: 1, type: 'number', position: { x: -16, y: -2 }, data: { value: 85, customDescription: 'Severidad detectada (0-100)' } },
			{ id: 2, type: 'number', position: { x: -16, y: -6 }, data: { value: 70, customDescription: 'Umbral crítico definido por CSIRT' } },
			{ id: 3, type: 'greater', position: { x: -10, y: -4 }, data: { customTitle: 'Severidad > Umbral', customDescription: '¿Supera el umbral crítico?' } },
			{ id: 4, type: 'boolean', position: { x: -16, y: 2 }, data: { value: true, customDescription: 'Exfiltración confirmada' } },
			{ id: 5, type: 'boolean', position: { x: -16, y: 6 }, data: { value: false, customDescription: 'Impacto operativo en curso' } },
			{ id: 6, type: 'and', position: { x: -4, y: -1 }, data: { customTitle: 'Escalar a CSIRT' } },
			{ id: 7, type: 'or', position: { x: -4, y: 5 }, data: { customTitle: 'Monitoreo reforzado' } },
			{ id: 8, type: 'not', position: { x: 2, y: 6 }, data: { customTitle: 'Continuidad OK' } },
			{ id: 9, type: 'display', position: { x: 4, y: -2 }, data: { customDescription: '📣 Escalar a CSIRT y notificar autoridad' } },
			{ id: 10, type: 'display', position: { x: 4, y: 4 }, data: { customDescription: '👁️ Activar monitoreo reforzado' } },
			{ id: 11, type: 'display', position: { x: 6, y: 6 }, data: { customDescription: '✅ Continuidad operativa confirmada' } }
		]),
		connections_data: JSON.stringify([
			{ from: { node: 1, pin: 0 }, to: { node: 3, pin: 0 } },
			{ from: { node: 2, pin: 0 }, to: { node: 3, pin: 1 } },
			{ from: { node: 3, pin: 0 }, to: { node: 6, pin: 0 } },
			{ from: { node: 4, pin: 0 }, to: { node: 6, pin: 1 } },
			{ from: { node: 6, pin: 0 }, to: { node: 9, pin: 0 } },
			{ from: { node: 3, pin: 0 }, to: { node: 7, pin: 0 } },
			{ from: { node: 5, pin: 0 }, to: { node: 7, pin: 1 } },
			{ from: { node: 7, pin: 0 }, to: { node: 10, pin: 0 } },
			{ from: { node: 5, pin: 0 }, to: { node: 8, pin: 0 } },
			{ from: { node: 8, pin: 0 }, to: { node: 11, pin: 0 } }
		])
	}
];
