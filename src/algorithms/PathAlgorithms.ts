import { Node } from '../core/Node';
import { NodeEditor } from '../core/NodeEditor';

export interface PathResult {
    algorithm: string;
    success: boolean;
    path?: number[];
    distance?: number;
    criticalPath?: number[];
    totalTime?: number;
    message: string;
    details?: any;
}

export interface GraphNode {
    id: number;
    node: Node;
    edges: { target: number; weight: number }[];
}

/**
 * Convierte el editor de nodos en un grafo con pesos para Dijkstra/A*
 * Usa los pesos de las CONEXIONES (templateConnections) si existen
 */
function buildWeightedGraphForPath(editor: NodeEditor): Map<number, GraphNode> {
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
    
    // Agregar aristas con pesos de las CONEXIONES
    editor.links.forEach((link, linkIndex) => {
        if (!link || !link[0] || !link[1]) return;
        
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Ignorar conexiones con info-panel
        if (fromNode.type === 'info-panel' || toNode.type === 'info-panel') return;
        
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
    editor.links.forEach(link => {
        if (!link || !link[0] || !link[1]) return;
        
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        if (fromIndex === -1 || toIndex === -1) return;
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Ignorar conexiones con info-panel
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
 * Encuentra nodos fuente (sin entradas) y sumidero (sin salidas significativas)
 * Excluye info-panel y display nodes
 * Un nodo es sumidero si solo se conecta a display nodes
 */
function findSourceAndSink(editor: NodeEditor): { sources: number[]; sinks: number[] } {
    const hasIncoming = new Set<number>();
    const hasOutgoing = new Set<number>(); // Cualquier salida
    
    editor.links.forEach(link => {
        if (!link || !link[0] || !link[1]) return;
        const fromIndex = editor.nodes.indexOf(link[0].parent);
        const toIndex = editor.nodes.indexOf(link[1].parent);
        
        const fromNode = link[0].parent;
        const toNode = link[1].parent;
        
        // Ignorar conexiones con info-panel
        if (fromNode.type === 'info-panel' || toNode.type === 'info-panel') return;
        
        // Marcar nodos con entradas
        if (toIndex !== -1 && toNode.type !== 'display') {
            hasIncoming.add(toIndex);
        }
        
        // Marcar CUALQUIER nodo con salidas (incluso a display)
        if (fromIndex !== -1 && fromNode.type !== 'display') {
            hasOutgoing.add(fromIndex);
        }
    });
    
    const sources: number[] = [];
    const sinks: number[] = [];
    
    editor.nodes.forEach((node, index) => {
        // Ignorar info-panel y display nodes
        if (node.type === 'info-panel' || node.type === 'display') return;
        
        // Nodo fuente: no tiene entradas
        if (!hasIncoming.has(index)) {
            sources.push(index);
        }
        
        // Nodo sumidero: no tiene salidas O solo tiene salida a display
        // Para detectar correctamente, buscamos nodos que tengan salidas pero NO a otros nodos procesables
        if (!hasOutgoing.has(index)) {
            sinks.push(index);
        } else {
            // Verificar si TODAS sus salidas son a display
            const outgoingLinks = editor.links.filter(link => 
                link && link[0] && link[0].parent === node
            );
            const allToDisplay = outgoingLinks.every(link => 
                link[1] && link[1].parent.type === 'display'
            );
            if (allToDisplay && outgoingLinks.length > 0) {
                sinks.push(index);
            }
        }
    });
    
    return { sources, sinks };
}

/**
 * Algoritmo de Dijkstra para encontrar el camino más corto
 */
export function dijkstra(editor: NodeEditor, startIndex?: number, endIndex?: number): PathResult {
    const graph = buildWeightedGraphForPath(editor);
    const { sources, sinks } = findSourceAndSink(editor);
    
    console.log('🔍 DIJKSTRA DEBUG:');
    console.log('  📊 Graph size:', graph.size);
    console.log('  📊 Graph keys:', Array.from(graph.keys()));
    console.log('  🟢 Sources:', sources);
    console.log('  🔴 Sinks:', sinks);
    
    // Si no se especifica inicio/fin, usar primer source y primer sink
    const start = startIndex !== undefined ? startIndex : sources[0];
    const end = endIndex !== undefined ? endIndex : sinks[0];
    
    console.log('  🎯 Start index:', start, '→', editor.nodes[start]?.customTitle);
    console.log('  🏁 End index:', end, '→', editor.nodes[end]?.customTitle);
    console.log('  ✅ Start in graph?', graph.has(start));
    console.log('  ✅ End in graph?', graph.has(end));
    
    if (start === undefined || end === undefined) {
        return {
            algorithm: 'Dijkstra',
            success: false,
            message: '❌ No se encontraron nodos de inicio o fin válidos.'
        };
    }
    
    // Mostrar estructura del grafo
    console.log('  📊 Graph edges:');
    graph.forEach((node, id) => {
        if (node.edges.length > 0) {
            console.log(`    ${id} (${editor.nodes[id]?.customTitle}):`, 
                node.edges.map(e => `→${e.target}(w:${e.weight})`).join(', '));
        }
    });
    
    // Inicialización
    const distances = new Map<number, number>();
    const previous = new Map<number, number | null>();
    const unvisited = new Set<number>();
    
    graph.forEach((_, id) => {
        distances.set(id, Infinity);
        previous.set(id, null);
        unvisited.add(id);
    });
    distances.set(start, 0);
    
    // Algoritmo de Dijkstra
    while (unvisited.size > 0) {
        // Encontrar nodo no visitado con menor distancia
        let current: number | undefined;
        let minDist = Infinity;
        
        unvisited.forEach(nodeId => {
            const dist = distances.get(nodeId) || Infinity;
            if (dist < minDist) {
                minDist = dist;
                current = nodeId;
            }
        });
        
        if (current === undefined || minDist === Infinity) break;
        
        unvisited.delete(current);
        
        // Si llegamos al destino, podemos terminar
        if (current === end) break;
        
        // Actualizar distancias de vecinos
        const currentNode = graph.get(current);
        if (!currentNode) continue;
        
        currentNode.edges.forEach(edge => {
            if (!unvisited.has(edge.target)) return;
            
            const newDist = (distances.get(current!) || 0) + edge.weight;
            const oldDist = distances.get(edge.target) || Infinity;
            
            if (newDist < oldDist) {
                distances.set(edge.target, newDist);
                previous.set(edge.target, current!);
            }
        });
    }
    
    // Reconstruir camino
    const path: number[] = [];
    let current: number | null = end;
    
    while (current !== null) {
        path.unshift(current);
        current = previous.get(current) || null;
    }
    
    // Verificar si se encontró camino
    if (path[0] !== start) {
        return {
            algorithm: 'Dijkstra',
            success: false,
            message: `❌ No existe camino entre nodo ${start} y nodo ${end}.`
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
    const { sources, sinks } = findSourceAndSink(editor);
    
    const start = startIndex !== undefined ? startIndex : sources[0];
    const end = endIndex !== undefined ? endIndex : sinks[0];
    
    if (start === undefined || end === undefined) {
        return {
            algorithm: 'A*',
            success: false,
            message: '❌ No se encontraron nodos de inicio o fin válidos.'
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
    
    // Crear tabla de detalles
    const details: any[] = [];
    graph.forEach((node, id) => {
        details.push({
            node: id,
            name: editor.nodes[id]?.customTitle || editor.nodes[id]?.type || `Node ${id}`,
            ES: ES.get(id) || 0,
            EF: EF.get(id) || 0,
            LS: LS.get(id) || 0,
            LF: LF.get(id) || 0,
            slack: slack.get(id) || 0,
            isCritical: criticalPathSet.has(id) // Solo los del camino crítico
        });
    });
    
    return {
        algorithm: 'PERT/CPM',
        success: true,
        criticalPath,
        totalTime,
        message: `✅ Ruta Crítica encontrada:\n${pathNames.join(' → ')}\n\nTiempo total del proyecto: ${totalTime}\nNodos críticos: ${criticalPath.length}`,
        details: {
            criticalNodes: criticalPath,
            nodeNames: pathNames,
            projectDuration: totalTime,
            analysisTable: details
        }
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
