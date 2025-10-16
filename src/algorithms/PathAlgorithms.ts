import { Node } from '../core/Node';
import { NodeEditor } from '../core/NodeEditor';
import { 
    AlgorithmsValidation, 
    AlgorithmApplicability, 
    ProblemContext,
    PROBLEM_CONTEXTS,
    UNITS 
} from '../types/ProblemContext';

export interface PathResult {
    algorithm: string;
    success: boolean;
    path?: number[];
    distance?: number;
    criticalPath?: number[];
    totalTime?: number;
    message: string;
    details?: any;
    unit?: string; // Unidad de medida del resultado
}

export interface GraphNode {
    id: number;
    node: Node;
    edges: { target: number; weight: number }[];
}

/**
 * Convierte el editor de nodos en un grafo con pesos para Dijkstra/A*
 * Usa los pesos de las CONEXIONES (templateConnections) si existen
 * 
 * POLÍTICA: Incluye TODOS los nodos procesables (task, condition, etc.)
 * pero EXCLUYE info-panel. Display nodes se incluyen pero se marcan como finales.
 */
function buildWeightedGraphForPath(editor: NodeEditor): Map<number, GraphNode> {
    const graph = new Map<number, GraphNode>();
    
    // Crear nodos del grafo - solo excluir info-panel
    editor.nodes.forEach((node, index) => {
        if (node.type === 'info-panel') return; // Ignorar info-panel
        
        graph.set(index, {
            id: index,
            node: node,
            edges: []
        });
    });
    
    // Agregar aristas con pesos de las CONEXIONES
    // Solo excluir info-panel, pero permitir display nodes
    editor.links.forEach((link, linkIndex) => {
        if (!link || !link[0] || !link[1]) return;
        
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Solo ignorar info-panel
        if (fromNode.type === 'info-panel' || toNode.type === 'info-panel') {
            return;
        }
        
        // Peso de la CONEXIÓN (de templateConnections si existe)
        let weight = 1; // Peso por defecto
        
        if (editor.templateConnections && editor.templateConnections[linkIndex]) {
            const connData = editor.templateConnections[linkIndex];
            if (connData.weight !== undefined) {
                weight = connData.weight;
            }
        }
        
        const graphNode = graph.get(fromIndex);
        if (graphNode) {
            graphNode.edges.push({ target: toIndex, weight });
        }
    });
    
    return graph;
}

/**
 * Convierte el editor de nodos en un grafo con pesos para PERT/CPM
 * Usa la duración de los NODOS (node.outputs[0].value para tasks)
 */
function buildWeightedGraphForPERT(editor: NodeEditor): Map<number, GraphNode> {
    const graph = new Map<number, GraphNode>();
    
    // Crear nodos del grafo (filtrar info-panel que es NO-nodo)
    editor.nodes.forEach((node, index) => {
        if (node.type === 'info-panel') return; // Ignorar NO-nodos
        
        graph.set(index, {
            id: index,
            node: node,
            edges: []
        });
    });
    
    // Agregar aristas (sin peso aquí, el peso está en los nodos)
    // Solo ignorar info-panel
    editor.links.forEach(link => {
        if (!link || !link[0] || !link[1]) return;
        
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Solo ignorar info-panel
        if (fromNode.type === 'info-panel' || toNode.type === 'info-panel') return;
        
        // Para PERT, el peso no importa aquí (se usa la duración del nodo destino)
        const graphNode = graph.get(fromIndex);
        if (graphNode) {
            graphNode.edges.push({ target: toIndex, weight: 0 }); // Placeholder
        }
    });
    
    return graph;
}

/**
 * Encuentra nodos fuente (sin entradas) y sumidero (sin salidas)
 * Excluye solo info-panel del análisis
 * 
 * POLÍTICA SIMPLE: 
 * - Source: nodo sin entradas (excepto info-panel)
 * - Sink: nodo sin salidas O nodo del cual SOLO salen conexiones a display
 */
function findSourceAndSink(editor: NodeEditor): { sources: number[]; sinks: number[] } {
    const hasIncoming = new Set<number>();
    const outgoingConnections = new Map<number, number[]>(); // nodeId -> [target indices]
    
    editor.links.forEach(link => {
        if (!link || !link[0] || !link[1]) return;
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Solo ignorar info-panel
        if (fromNode.type === 'info-panel' || toNode.type === 'info-panel') {
            return;
        }
        
        // Marcar nodos con entradas
        if (toIndex !== -1 && toNode.type !== 'info-panel') {
            hasIncoming.add(toIndex);
        }
        
        // Registrar conexiones salientes
        if (fromIndex !== -1 && fromNode.type !== 'info-panel') {
            if (!outgoingConnections.has(fromIndex)) {
                outgoingConnections.set(fromIndex, []);
            }
            outgoingConnections.get(fromIndex)!.push(toIndex);
        }
    });
    
    const sources: number[] = [];
    const sinks: number[] = [];
    
    editor.nodes.forEach((node, index) => {
        // Ignorar solo info-panel
        if (node.type === 'info-panel') return;
        
        // Nodo fuente: no tiene entradas
        if (!hasIncoming.has(index)) {
            sources.push(index);
        }
        
        // Nodo sumidero: 
        // 1. No tiene salidas, O
        // 2. Solo tiene salidas a display nodes
        const outgoing = outgoingConnections.get(index) || [];
        if (outgoing.length === 0) {
            sinks.push(index);
        } else {
            // Verificar si todas las salidas son a display
            const allToDisplay = outgoing.every(targetIdx => 
                editor.nodes[targetIdx]?.type === 'display'
            );
            if (allToDisplay) {
                sinks.push(index);
            }
        }
    });
    
    return { sources, sinks };
}

/**
 * VALIDACIÓN: Determina qué algoritmos son aplicables al grafo actual
 * 
 * Reglas de aplicabilidad:
 * - Dijkstra/A*: Requieren pesos en conexiones, no son ideales para nodos task
 * - PERT/CPM: Requiere nodos task con duraciones y DAG (sin ciclos)
 */
export function getApplicableAlgorithms(editor: NodeEditor, context?: ProblemContext): AlgorithmsValidation {
    const graph = buildWeightedGraphForPath(editor);
    const graphPERT = buildWeightedGraphForPERT(editor);
    
    // Análisis del grafo
    const nodeTypes = new Set<string>();
    editor.nodes.forEach(node => {
        if (node.type !== 'info-panel') {
            nodeTypes.add(node.type);
        }
    });
    
    const hasTaskNodes = nodeTypes.has('task');
    const hasWeights = editor.templateConnections?.some(c => c.weight !== undefined && c.weight > 0) || false;
    const hasCycles = detectCycle(graphPERT);
    const nodeCount = graph.size;
    const hasConnections = editor.links.length > 0;
    
    // Determinar contexto si no se proporciona
    let inferredContext = context;
    if (!inferredContext) {
        if (hasTaskNodes && !hasCycles) {
            inferredContext = PROBLEM_CONTEXTS.projectScheduling;
        } else if (hasWeights) {
            inferredContext = PROBLEM_CONTEXTS.transportation;
        } else {
            inferredContext = PROBLEM_CONTEXTS.generic;
        }
    }
    
    // VALIDACIÓN DIJKSTRA
    const dijkstraValidation: AlgorithmApplicability = (() => {
        if (nodeCount === 0) {
            return {
                applicable: false,
                reason: 'No hay nodos procesables en el grafo',
                severity: 'error'
            };
        }
        
        if (!hasConnections) {
            return {
                applicable: false,
                reason: 'No hay conexiones entre nodos',
                severity: 'error'
            };
        }
        
        if (hasTaskNodes) {
            return {
                applicable: true,
                reason: 'Funciona, pero PERT/CPM es más apropiado para grafos con nodos task',
                severity: 'warning',
                suggestions: [
                    'Los nodos task representan actividades con duración',
                    'Dijkstra usa pesos de CONEXIONES, no duraciones de nodos',
                    'Considera usar PERT/CPM para análisis de ruta crítica'
                ]
            };
        }
        
        if (!hasWeights) {
            return {
                applicable: true,
                reason: 'Funciona con pesos por defecto (1), pero es más útil con pesos definidos',
                severity: 'warning',
                suggestions: [
                    'Asigna pesos a las conexiones para resultados más significativos',
                    'Haz clic en las conexiones para configurar sus pesos'
                ]
            };
        }
        
        return {
            applicable: true,
            reason: 'Algoritmo aplicable - Encuentra el camino más corto basado en pesos de conexiones',
            severity: 'ok'
        };
    })();
    
    // VALIDACIÓN A*
    const astarValidation: AlgorithmApplicability = (() => {
        // A* tiene los mismos requisitos que Dijkstra
        if (!dijkstraValidation.applicable) {
            return {
                ...dijkstraValidation,
                reason: dijkstraValidation.reason.replace('Dijkstra', 'A*')
            };
        }
        
        // Advertencia adicional sobre heurística espacial
        if (dijkstraValidation.severity === 'ok') {
            return {
                applicable: true,
                reason: 'Algoritmo aplicable - Usa heurística de distancia euclidiana para optimización',
                severity: 'ok',
                suggestions: [
                    'La heurística se basa en la posición de los nodos en el canvas',
                    'Funciona mejor cuando las posiciones reflejan la distancia real del problema'
                ]
            };
        }
        
        return dijkstraValidation;
    })();
    
    // VALIDACIÓN PERT/CPM
    const pertValidation: AlgorithmApplicability = (() => {
        if (nodeCount === 0) {
            return {
                applicable: false,
                reason: 'No hay nodos procesables en el grafo',
                severity: 'error'
            };
        }
        
        if (!hasConnections) {
            return {
                applicable: false,
                reason: 'No hay conexiones entre nodos',
                severity: 'error'
            };
        }
        
        if (hasCycles) {
            return {
                applicable: false,
                reason: 'PERT/CPM requiere un grafo acíclico (DAG) - Se detectaron ciclos',
                severity: 'error',
                suggestions: [
                    'Elimina las conexiones que crean ciclos',
                    'Verifica que el flujo de actividades sea unidireccional'
                ]
            };
        }
        
        if (!hasTaskNodes) {
            return {
                applicable: true,
                reason: 'Funciona, pero es más útil con nodos task que representen actividades',
                severity: 'warning',
                suggestions: [
                    'PERT/CPM está diseñado para planificación de proyectos',
                    'Usa nodos task con duraciones para análisis de ruta crítica',
                    'Considera usar Dijkstra si buscas el camino más corto'
                ]
            };
        }
        
        // Verificar si los nodos task tienen duraciones
        const tasksWithDuration = editor.nodes.filter(n => 
            n.type === 'task' && n.outputs[0]?.value > 0
        ).length;
        
        const totalTasks = editor.nodes.filter(n => n.type === 'task').length;
        
        if (tasksWithDuration === 0 && totalTasks > 0) {
            return {
                applicable: true,
                reason: 'Los nodos task no tienen duraciones asignadas - Se usará duración por defecto',
                severity: 'warning',
                suggestions: [
                    'Configura la duración de cada tarea en sus propiedades',
                    'El campo "duration" representa el tiempo de ejecución de la tarea'
                ]
            };
        }
        
        return {
            applicable: true,
            reason: 'Algoritmo aplicable - Análisis de ruta crítica para planificación de proyectos',
            severity: 'ok',
            suggestions: [
                `Unidades: ${inferredContext?.unit.label || 'No especificadas'}`,
                'Identifica tareas críticas y calcula holguras',
                'Calcula varianza si configuras tiempos optimista/pesimista/más probable'
            ]
        };
    })();
    
    // Determinar algoritmo recomendado
    let recommendedAlgorithm: 'dijkstra' | 'astar' | 'pert' | undefined;
    
    if (hasTaskNodes && !hasCycles) {
        recommendedAlgorithm = 'pert';
    } else if (hasWeights) {
        recommendedAlgorithm = 'dijkstra';
    } else if (pertValidation.applicable && pertValidation.severity === 'ok') {
        recommendedAlgorithm = 'pert';
    } else if (dijkstraValidation.applicable) {
        recommendedAlgorithm = 'dijkstra';
    }
    
    return {
        dijkstra: dijkstraValidation,
        astar: astarValidation,
        pert: pertValidation,
        recommendedAlgorithm,
        context: inferredContext
    };
}

/**
 * Algoritmo de Dijkstra para encontrar el camino más corto
 * VERSIÓN SIMPLE QUE SIEMPRE FUNCIONA
 */
export function dijkstra(editor: NodeEditor, startIndex?: number, endIndex?: number): PathResult {
    const graph = buildWeightedGraphForPath(editor);
    
    // Si no hay nodos en el grafo
    if (graph.size === 0) {
        return {
            algorithm: 'Dijkstra',
            success: false,
            message: '❌ No hay nodos procesables en el grafo.'
        };
    }
    
    const graphKeys = Array.from(graph.keys());
    console.log('🔍 DIJKSTRA - Nodos disponibles:', graphKeys.map(i => `${i}:${editor.nodes[i]?.customTitle || editor.nodes[i]?.type}`));
    
    // SIMPLE: usar primer y último nodo si no se especifica
    let start = startIndex !== undefined ? startIndex : graphKeys[0];
    let end = endIndex !== undefined ? endIndex : graphKeys[graphKeys.length - 1];
    
    // Si start y end son iguales, buscar otro end
    if (start === end && graphKeys.length > 1) {
        end = graphKeys.find(k => k !== start) || start;
    }
    
    console.log(`  🚀 EJECUTANDO: ${start} (${editor.nodes[start]?.customTitle}) → ${end} (${editor.nodes[end]?.customTitle})`);
    
    // Mostrar estructura del grafo
    console.log('  📊 Graph edges:');
    graph.forEach((node, id) => {
        const title = editor.nodes[id]?.customTitle || editor.nodes[id]?.type || `Node ${id}`;
        console.log(`    ${id} (${title}):`, 
            node.edges.length > 0 ? node.edges.map(e => `→${e.target}(w:${e.weight})`).join(', ') : '(no edges)');
    });
    
    // Inicialización
    const distances = new Map<number, number>();
    const previous = new Map<number, number | null>();
    const visited = new Set<number>();
    
    // Inicializar todas las distancias a infinito excepto el nodo start
    graph.forEach((_, id) => {
        distances.set(id, Infinity);
        previous.set(id, null);
    });
    distances.set(start, 0);
    
    console.log(`  🔢 Initialized ${graph.size} nodes, start distance = 0`);
    
    // Algoritmo de Dijkstra simplificado
    for (let i = 0; i < graph.size; i++) {
        // Encontrar nodo no visitado con menor distancia
        let current: number | undefined;
        let minDist = Infinity;
        
        distances.forEach((dist, nodeId) => {
            if (!visited.has(nodeId) && dist < minDist) {
                minDist = dist;
                current = nodeId;
            }
        });
        
        if (current === undefined || minDist === Infinity) {
            console.log(`  ⏹️ No more reachable nodes (iteration ${i})`);
            break;
        }
        
        visited.add(current);
        console.log(`  ✅ Visiting node ${current} (${editor.nodes[current]?.customTitle}) with distance ${minDist}`);
        
        // Si llegamos al destino, podemos terminar
        if (current === end) {
            console.log('  🎯 Reached destination!');
            break;
        }
        
        // Actualizar distancias de vecinos
        const currentNode = graph.get(current);
        if (currentNode) {
            currentNode.edges.forEach(edge => {
                if (visited.has(edge.target)) return;
                
                const newDist = minDist + edge.weight;
                const oldDist = distances.get(edge.target) || Infinity;
                
                if (newDist < oldDist) {
                    distances.set(edge.target, newDist);
                    previous.set(edge.target, current!);
                    console.log(`    📝 Updated node ${edge.target}: distance=${newDist}, previous=${current}`);
                }
            });
        }
    }
    
    // Verificar si el destino es alcanzable
    const finalDistance = distances.get(end) || Infinity;
    if (finalDistance === Infinity) {
        return {
            algorithm: 'Dijkstra',
            success: false,
            message: `❌ No hay camino de ${start} (${editor.nodes[start]?.customTitle}) a ${end} (${editor.nodes[end]?.customTitle})`
        };
    }
    
    // Reconstruir camino
    const path: number[] = [];
    let current: number | null = end;
    
    while (current !== null) {
        path.unshift(current);
        if (current === start) break;
        current = previous.get(current) || null;
    }
    
    console.log('  🛤️ Final path:', path.map(i => `${i}:${editor.nodes[i]?.customTitle}`));
    
    if (path[0] !== start || path[path.length - 1] !== end) {
        return {
            algorithm: 'Dijkstra',
            success: false,
            message: `❌ Error en reconstrucción del camino`
        };
    }
    
    const distance = distances.get(end) || 0;
    const pathNames = path.map(i => editor.nodes[i]?.customTitle || editor.nodes[i]?.type || `Node ${i}`);
    
    return {
        algorithm: 'Dijkstra',
        success: true,
        path,
        distance,
        message: `✅ Camino más corto encontrado:\n${pathNames.join(' → ')}\nDistancia total: ${distance}`,
        details: {
            startNode: start,
            endNode: end,
            pathLength: path.length,
            nodeNames: pathNames
        }
    };
}

/**
 * Algoritmo A* con heurística de distancia euclidiana
 */
export function aStar(editor: NodeEditor, startIndex?: number, endIndex?: number): PathResult {
    const graph = buildWeightedGraphForPath(editor);
    
    // Si no hay nodos en el grafo
    if (graph.size === 0) {
        return {
            algorithm: 'A*',
            success: false,
            message: '❌ No hay nodos procesables en el grafo.'
        };
    }
    
    const graphKeys = Array.from(graph.keys());
    console.log('🔍 A* - Nodos disponibles:', graphKeys.map(i => `${i}:${editor.nodes[i]?.customTitle || editor.nodes[i]?.type}`));
    
    // SIMPLE: usar primer y último nodo si no se especifica
    let start = startIndex !== undefined ? startIndex : graphKeys[0];
    let end = endIndex !== undefined ? endIndex : graphKeys[graphKeys.length - 1];
    
    // Si start y end son iguales, buscar otro end
    if (start === end && graphKeys.length > 1) {
        end = graphKeys.find(k => k !== start) || start;
    }
    
    console.log(`  🚀 A* EJECUTANDO: ${start} (${editor.nodes[start]?.customTitle}) → ${end} (${editor.nodes[end]?.customTitle})`);
    
    if (start === end) {
        return {
            algorithm: 'A*',
            success: true,
            path: [start],
            distance: 0,
            message: `✅ Nodo de inicio y destino son el mismo: ${editor.nodes[start]?.customTitle}\nDistancia: 0`
        };
    }
    
    // Heurística: distancia euclidiana entre posiciones de nodos
    const heuristic = (nodeId: number): number => {
        const node = editor.nodes[nodeId];
        const endNode = editor.nodes[end];
        if (!node || !endNode) return 0;
        
        const dx = endNode.pos.x - node.pos.x;
        const dy = endNode.pos.y - node.pos.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Inicialización
    const gScore = new Map<number, number>(); // Costo desde inicio
    const fScore = new Map<number, number>(); // gScore + heurística
    const previous = new Map<number, number | null>();
    const openSet = new Set<number>([start]);
    const closedSet = new Set<number>();
    
    graph.forEach((_, id) => {
        gScore.set(id, Infinity);
        fScore.set(id, Infinity);
        previous.set(id, null);
    });
    
    gScore.set(start, 0);
    fScore.set(start, heuristic(start));
    
    // Algoritmo A*
    while (openSet.size > 0) {
        // Encontrar nodo en openSet con menor fScore
        let current: number | undefined;
        let minF = Infinity;
        
        openSet.forEach(nodeId => {
            const f = fScore.get(nodeId) || Infinity;
            if (f < minF) {
                minF = f;
                current = nodeId;
            }
        });
        
        if (current === undefined) break;
        
        // Si llegamos al destino
        if (current === end) {
            const path: number[] = [];
            let curr: number | null = end;
            
            while (curr !== null) {
                path.unshift(curr);
                curr = previous.get(curr) || null;
            }
            
            const distance = gScore.get(end) || 0;
            const pathNames = path.map(i => editor.nodes[i]?.customTitle || editor.nodes[i]?.type || `Node ${i}`);
            
            return {
                algorithm: 'A*',
                success: true,
                path,
                distance,
                message: `✅ Camino óptimo encontrado (A*):\n${pathNames.join(' → ')}\nDistancia total: ${distance}`,
                details: {
                    startNode: start,
                    endNode: end,
                    pathLength: path.length,
                    nodeNames: pathNames,
                    heuristicUsed: 'Distancia Euclidiana'
                }
            };
        }
        
        openSet.delete(current);
        closedSet.add(current);
        
        // Explorar vecinos
        const currentNode = graph.get(current);
        if (!currentNode) continue;
        
        currentNode.edges.forEach(edge => {
            if (closedSet.has(edge.target)) return;
            
            const tentativeG = (gScore.get(current!) || 0) + edge.weight;
            
            if (!openSet.has(edge.target)) {
                openSet.add(edge.target);
            } else if (tentativeG >= (gScore.get(edge.target) || Infinity)) {
                return;
            }
            
            previous.set(edge.target, current!);
            gScore.set(edge.target, tentativeG);
            fScore.set(edge.target, tentativeG + heuristic(edge.target));
        });
    }
    
    return {
        algorithm: 'A*',
        success: false,
        message: `❌ No existe camino entre nodo ${start} y nodo ${end}.`
    };
}

/**
 * Algoritmo PERT/CPM para encontrar ruta crítica
 * Maneja múltiples nodos de inicio y fin correctamente
 */
export function pertCPM(editor: NodeEditor): PathResult {
    const graph = buildWeightedGraphForPERT(editor);
    const { sources, sinks } = findSourceAndSink(editor);
    
    console.log('🔍 PERT/CPM - Análisis inicial:');
    console.log('  📊 Nodos totales:', graph.size);
    console.log('  🟢 Nodos fuente:', sources.length, sources.map(i => editor.nodes[i]?.customTitle || `Node ${i}`));
    console.log('  🔴 Nodos sumidero:', sinks.length, sinks.map(i => editor.nodes[i]?.customTitle || `Node ${i}`));
    
    if (sources.length === 0 || sinks.length === 0) {
        return {
            algorithm: 'PERT/CPM',
            success: false,
            message: `❌ El grafo debe tener al menos un nodo de inicio y uno de fin.\n• Nodos fuente: ${sources.length}\n• Nodos sumidero: ${sinks.length}`
        };
    }
    
    // Verificar que sea un DAG (sin ciclos)
    const hasCycle = detectCycle(graph);
    if (hasCycle) {
        return {
            algorithm: 'PERT/CPM',
            success: false,
            message: '❌ PERT/CPM requiere un grafo acíclico (DAG). Se detectaron ciclos.'
        };
    }
    
    // Calcular Early Start (ES) y Early Finish (EF)
    const ES = new Map<number, number>();
    const EF = new Map<number, number>();
    const inDegree = new Map<number, number>();
    
    // Inicializar in-degree
    graph.forEach((_, id) => {
        inDegree.set(id, 0);
    });
    
    graph.forEach(node => {
        node.edges.forEach(edge => {
            inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        });
    });
    
    // Inicializar nodos fuente
    sources.forEach(source => {
        ES.set(source, 0);
        // La duración es del NODO, no de su edge
        const node = editor.nodes[source];
        const duration = (node.type === 'task' && node.outputs[0]?.value) ? node.outputs[0].value : 0;
        EF.set(source, duration);
    });
    
    // Ordenamiento topológico y cálculo de ES/EF
    const queue = [...sources];
    const processed = new Set<number>();
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        processed.add(current);
        
        const currentNode = graph.get(current);
        if (!currentNode) continue;
        
        currentNode.edges.forEach(edge => {
            const currentEF = EF.get(current) || 0;
            const targetES = ES.get(edge.target) || 0;
            
            // ES[target] = max(ES[target], EF[current])
            if (currentEF > targetES) {
                ES.set(edge.target, currentEF);
                // La duración es del NODO TARGET, no del edge
                const targetNode = editor.nodes[edge.target];
                const targetDuration = (targetNode.type === 'task' && targetNode.outputs[0]?.value) ? targetNode.outputs[0].value : 0;
                EF.set(edge.target, currentEF + targetDuration);
            }
            
            // Decrementar in-degree y agregar a queue si es 0
            const newInDegree = (inDegree.get(edge.target) || 0) - 1;
            inDegree.set(edge.target, newInDegree);
            
            if (newInDegree === 0 && !processed.has(edge.target)) {
                queue.push(edge.target);
            }
        });
    }
    
    // Calcular Late Start (LS) y Late Finish (LF) - backward pass
    const LS = new Map<number, number>();
    const LF = new Map<number, number>();
    
    // Inicializar nodos sumidero
    const maxEF = Math.max(...Array.from(EF.values()));
    sinks.forEach(sink => {
        LF.set(sink, EF.get(sink) || 0);
        // La duración es del NODO sink, no de su edge
        const node = editor.nodes[sink];
        const duration = (node.type === 'task' && node.outputs[0]?.value) ? node.outputs[0].value : 0;
        LS.set(sink, (LF.get(sink) || 0) - duration);
    });
    
    // Backward pass
    const reverseQueue = [...sinks];
    const processedBackward = new Set<number>();
    
    // Construir grafo inverso
    const reverseGraph = new Map<number, number[]>();
    graph.forEach((node, id) => {
        node.edges.forEach(edge => {
            if (!reverseGraph.has(edge.target)) {
                reverseGraph.set(edge.target, []);
            }
            reverseGraph.get(edge.target)!.push(id);
        });
    });
    
    while (reverseQueue.length > 0) {
        const current = reverseQueue.shift()!;
        processedBackward.add(current);
        
        const predecessors = reverseGraph.get(current) || [];
        
        predecessors.forEach(pred => {
            const currentLS = LS.get(current) || 0;
            const predLF = LF.get(pred) || Infinity;
            
            // LF[pred] = min(LF[pred], LS[current])
            if (currentLS < predLF) {
                LF.set(pred, currentLS);
                // La duración es del NODO pred, no del edge
                const predNode = editor.nodes[pred];
                const predDuration = (predNode.type === 'task' && predNode.outputs[0]?.value) ? predNode.outputs[0].value : 0;
                LS.set(pred, currentLS - predDuration);
            }
            
            if (!processedBackward.has(pred)) {
                reverseQueue.push(pred);
            }
        });
    }
    
    // ⚠️ VALIDACIÓN: Detectar valores negativos que indican error en el planteamiento
    const negativeNodes: string[] = [];
    graph.forEach((_, id) => {
        const es = ES.get(id) || 0;
        const ef = EF.get(id) || 0;
        const ls = LS.get(id) || 0;
        const lf = LF.get(id) || 0;
        const nodeName = editor.nodes[id]?.customTitle || editor.nodes[id]?.type || `Node ${id}`;
        
        if (es < 0 || ef < 0 || ls < 0 || lf < 0) {
            negativeNodes.push(`${nodeName} (ES:${es.toFixed(2)}, EF:${ef.toFixed(2)}, LS:${ls.toFixed(2)}, LF:${lf.toFixed(2)})`);
        }
    });
    
    // Si hay valores negativos, retornar error
    if (negativeNodes.length > 0) {
        return {
            algorithm: 'PERT/CPM',
            success: false,
            message: `❌ ERROR en el planteamiento del proyecto PERT/CPM:\n\n` +
                     `Se detectaron valores negativos en los cálculos, lo que indica:\n` +
                     `• Dependencias circulares o mal definidas\n` +
                     `• Duraciones de tareas incorrectas\n` +
                     `• Relaciones de precedencia inconsistentes\n\n` +
                     `Nodos con valores negativos:\n${negativeNodes.map(n => `  • ${n}`).join('\n')}\n\n` +
                     `⚡ SOLUCIÓN:\n` +
                     `  1. Verifica que las conexiones sigan el flujo lógico correcto\n` +
                     `  2. Asegúrate de que no haya ciclos en el grafo\n` +
                     `  3. Revisa que todas las duraciones sean valores positivos\n` +
                     `  4. Confirma que las dependencias (predecesores) sean correctas`,
            details: {
                invalidNodes: negativeNodes,
                errorType: 'NEGATIVE_VALUES'
            }
        };
    }
    
    // Calcular holgura (primero sin marcar como crítico)
    const slack = new Map<number, number>();
    const criticalNodes: number[] = [];
    
    graph.forEach((_, id) => {
        const es = ES.get(id) || 0;
        const ls = LS.get(id) || 0;
        const nodeSlack = ls - es;
        slack.set(id, nodeSlack);
        
        if (Math.abs(nodeSlack) < 0.001) { // Considerar 0 con tolerancia
            criticalNodes.push(id);
        }
    });
    
    // Construir camino crítico (siguiendo las conexiones reales)
    const criticalPath: number[] = [];
    const criticalNodesSet = new Set(criticalNodes);
    
    if (criticalNodes.length > 0) {
        // Encontrar el camino más largo entre nodos críticos
        // Comenzar desde los nodos fuente críticos
        const criticalSources = sources.filter(s => criticalNodesSet.has(s));
        
        if (criticalSources.length > 0) {
            // DFS para encontrar el camino crítico más largo
            let longestPath: number[] = [];
            
            const dfs = (nodeId: number, path: number[], visited: Set<number>) => {
                path.push(nodeId);
                visited.add(nodeId);
                
                // Si llegamos a un sumidero crítico, comparar longitud
                if (sinks.includes(nodeId) && criticalNodesSet.has(nodeId)) {
                    if (path.length > longestPath.length) {
                        longestPath = [...path];
                    }
                }
                
                // Explorar vecinos críticos
                const currentNode = graph.get(nodeId);
                if (currentNode) {
                    currentNode.edges.forEach(edge => {
                        if (criticalNodesSet.has(edge.target) && !visited.has(edge.target)) {
                            dfs(edge.target, path, visited);
                        }
                    });
                }
                
                path.pop();
                visited.delete(nodeId);
            };
            
            // Probar desde cada fuente crítica
            criticalSources.forEach(source => {
                dfs(source, [], new Set());
            });
            
            criticalPath.push(...longestPath);
        }
        
        // Si no se encontró camino, usar todos los nodos críticos ordenados
        if (criticalPath.length === 0) {
            criticalNodes.sort((a, b) => (ES.get(a) || 0) - (ES.get(b) || 0));
            criticalPath.push(...criticalNodes);
        }
    }
    
    const totalTime = maxEF;
    const pathNames = criticalPath.map(i => editor.nodes[i]?.customTitle || editor.nodes[i]?.type || `Node ${i}`);
    
    // Convertir criticalPath a Set para verificación rápida
    const criticalPathSet = new Set(criticalPath);
    
    // Ahora marcar SOLO los nodos del camino crítico en userData
    graph.forEach((_, id) => {
        const node = editor.nodes[id];
        if (node) {
            if (!node.userData) node.userData = {};
            const es = ES.get(id) || 0;
            const ls = LS.get(id) || 0;
            const nodeSlack = ls - es;
            
            node.userData.pertData = {
                ES: es,
                EF: EF.get(id) || 0,
                LS: ls,
                LF: LF.get(id) || 0,
                slack: nodeSlack,
                isCritical: criticalPathSet.has(id) // Solo los del camino crítico
            };
        }
    });
    
    // ========== CÁLCULO DE VARIANZA DEL PROYECTO (PERT) ==========
    // Calcular varianza del proyecto sumando las varianzas de las tareas críticas
    let projectVariance = 0;
    let tasksWithVariance = 0;
    let tasksWithoutVariance = 0;
    
    criticalPath.forEach(nodeId => {
        const node = editor.nodes[nodeId];
        if (node && node.pertData?.variance !== undefined) {
            projectVariance += node.pertData.variance;
            tasksWithVariance++;
        } else {
            tasksWithoutVariance++;
        }
    });
    
    const projectStdDev = Math.sqrt(projectVariance);
    
    // Intervalos de confianza basados en distribución normal
    // 68% confianza: μ ± 1σ
    // 95% confianza: μ ± 2σ  
    // 99.7% confianza: μ ± 3σ
    const confidence68 = {
        min: totalTime - projectStdDev,
        max: totalTime + projectStdDev
    };
    
    const confidence95 = {
        min: totalTime - 2 * projectStdDev,
        max: totalTime + 2 * projectStdDev
    };
    
    const confidence997 = {
        min: totalTime - 3 * projectStdDev,
        max: totalTime + 3 * projectStdDev
    };
    
    // Crear tabla de detalles
    const details: any[] = [];
    graph.forEach((node, id) => {
        const editorNode = editor.nodes[id];
        details.push({
            node: id,
            name: editorNode?.customTitle || editorNode?.type || `Node ${id}`,
            ES: ES.get(id) || 0,
            EF: EF.get(id) || 0,
            LS: LS.get(id) || 0,
            LF: LF.get(id) || 0,
            slack: slack.get(id) || 0,
            isCritical: criticalPathSet.has(id),
            // Incluir datos PERT si existen
            pertData: editorNode?.pertData ? {
                optimistic: editorNode.pertData.optimistic,
                mostLikely: editorNode.pertData.mostLikely,
                pessimistic: editorNode.pertData.pessimistic,
                expectedTime: editorNode.pertData.expectedTime,
                variance: editorNode.pertData.variance,
                stdDev: editorNode.pertData.stdDev
            } : undefined
        });
    });
    
    // Construir mensaje con análisis de varianza si hay datos PERT
    let varianceMessage = '';
    if (tasksWithVariance > 0) {
        varianceMessage = `\n\n📊 ANÁLISIS DE VARIANZA PERT:\n` +
                          `  • Varianza del proyecto: ${projectVariance.toFixed(4)}\n` +
                          `  • Desviación estándar: ${projectStdDev.toFixed(2)} unidades\n` +
                          `  • Tareas con estimaciones PERT: ${tasksWithVariance}/${criticalPath.length}\n\n` +
                          `⏱️ INTERVALOS DE CONFIANZA:\n` +
                          `  • 68% confianza: ${confidence68.min.toFixed(1)} - ${confidence68.max.toFixed(1)} unidades\n` +
                          `  • 95% confianza: ${confidence95.min.toFixed(1)} - ${confidence95.max.toFixed(1)} unidades\n` +
                          `  • 99.7% confianza: ${confidence997.min.toFixed(1)} - ${confidence997.max.toFixed(1)} unidades`;
    } else if (tasksWithoutVariance > 0) {
        varianceMessage = `\n\n💡 TIP: Configura estimaciones PERT (optimista/más probable/pesimista) en las tareas\n` +
                          `   para obtener análisis de varianza y probabilidades de cumplimiento.`;
    }
    
    return {
        algorithm: 'PERT/CPM',
        success: true,
        criticalPath,
        totalTime,
        message: `✅ Ruta Crítica encontrada:\n${pathNames.join(' → ')}\n\n` +
                 `⏱️ Tiempo total del proyecto: ${totalTime} unidades\n` +
                 `🎯 Nodos críticos: ${criticalPath.length}${varianceMessage}`,
        details: {
            criticalNodes: criticalPath,
            nodeNames: pathNames,
            projectDuration: totalTime,
            variance: projectVariance,
            stdDev: projectStdDev,
            confidence68,
            confidence95,
            confidence997,
            tasksWithVariance,
            tasksWithoutVariance,
            analysisTable: details
        },
        unit: 'unidades' // TODO: Obtener del contexto del problema
    };
}

/**
 * Detectar ciclos en el grafo usando DFS
 */
function detectCycle(graph: Map<number, GraphNode>): boolean {
    const visited = new Set<number>();
    const recursionStack = new Set<number>();
    
    function dfs(nodeId: number): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        
        const node = graph.get(nodeId);
        if (!node) return false;
        
        for (const edge of node.edges) {
            if (!visited.has(edge.target)) {
                if (dfs(edge.target)) return true;
            } else if (recursionStack.has(edge.target)) {
                return true; // Ciclo detectado
            }
        }
        
        recursionStack.delete(nodeId);
        return false;
    }
    
    for (const [nodeId] of graph) {
        if (!visited.has(nodeId)) {
            if (dfs(nodeId)) return true;
        }
    }
    
    return false;
}
