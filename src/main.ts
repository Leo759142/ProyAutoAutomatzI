import './style.css';
import { initCanvasUI } from './ui/canvas/initCanvasUI';
import { DatabaseService } from './services/DatabaseService';
import { defaultTemplates } from './templates/DefaultTemplates';
import { validateAllTemplates } from './utils/validateTemplates';
import { SessionManager } from './services/SessionManager';
import { auditLogPanel } from './ui/AuditLogPanel';
import { AlgorithmValidationUI } from './ui/AlgorithmValidationUI';
import { InfoPanel } from './ui/InfoPanel';

document.addEventListener('DOMContentLoaded', () => {
  // 🔍 VALIDAR TODOS LOS TEMPLATES ANTES DE CARGARLOS
  console.log('🔍 Validando templates antes de cargar...');
  const templatesValid = validateAllTemplates();
  
  if (!templatesValid) {
    console.error('❌ ADVERTENCIA: Algunos templates tienen errores. Revisa la consola.');
  }

  // Inicializar la UI modular del canvas
  const canvasUI = initCanvasUI();
  
  // Inicializar la UI de validación de algoritmos
  const algorithmUI = new AlgorithmValidationUI(canvasUI.editor);
  
  // Inicializar el panel de información con soporte Markdown
  const infoPanel = new InfoPanel();
  
  // Exponer infoPanel globalmente para otros módulos
  (window as any).infoPanel = infoPanel;
  
  // Inicializar base de datos y guardar templates por defecto
  const dbService = DatabaseService.getInstance();
  
  // Exponer dbService globalmente para SessionManager
  (window as any).dbService = dbService;
  
  // Inicializar el administrador de sesiones (autosave a templates)
  const sessionManager = SessionManager.getInstance();
  sessionManager.setNodeEditor(canvasUI.editor);

  dbService.initialize().then(async () => {
    const existingTemplates = await dbService.listTemplates();
    const existingNames = existingTemplates.map(t => t.name);
    
    console.log('Existing templates:', existingNames);
    console.log('Available default templates:', defaultTemplates.map(t => t.name));
    
    // 🔧 FORZAR ACTUALIZACIÓN: Eliminar templates por defecto existentes para recargarlos
    console.log('🔄 Actualizando templates por defecto...');
    for (const existing of existingTemplates) {
      const isDefaultTemplate = defaultTemplates.some(t => t.name === existing.name);
      if (isDefaultTemplate && existing.id) {
        try {
          await dbService.deleteTemplate(existing.id);
          console.log(`🗑️ Eliminado template antiguo: ${existing.name}`);
        } catch (error) {
          console.error(`Error eliminando template ${existing.name}:`, error);
        }
      }
    }
    
    // Cargar todos los templates por defecto (ahora con coordenadas corregidas)
    let addedCount = 0;
    for (const template of defaultTemplates) {
      try {
        await dbService.saveTemplate(template);
        addedCount++;
        console.log(`✅ Cargado template: ${template.name}`);
      } catch (error) {
        console.error(`Error cargando template ${template.name}:`, error);
      }
    }
    
    console.log(`✨ ${addedCount} templates actualizados con coordenadas corregidas`)

    // Cargar templates en la UI
    await loadTemplatesIntoUI();
  });

  // Función reutilizable para cargar templates en el select
  async function loadTemplatesIntoUI() {
    const dbService = DatabaseService.getInstance();
    const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
    if (!templateSelect) return;

    // Limpiar opciones existentes excepto la primera
    while (templateSelect.options.length > 1) {
      templateSelect.remove(1);
    }
    
    // Añadir templates desde la base de datos
    const templates = await dbService.listTemplates();
    console.log('Available templates:', templates.length);
    
    templates.forEach(template => {
      try {
        const option = document.createElement('option');
        option.value = template.id?.toString() || '';
        option.textContent = template.name;
        option.title = template.description || '';
        templateSelect.appendChild(option);
      } catch (error) {
        console.error('Error adding template:', template.name, error);
      }
    });
  }

  // Add event listeners for toolbar buttons
  const addNodeBtn = document.getElementById('addNode') as HTMLButtonElement;
  const clearCanvasBtn = document.getElementById('clearCanvas') as HTMLButtonElement;
  const centerViewBtn = document.getElementById('centerView') as HTMLButtonElement;
  const playButton = document.getElementById('playButton') as HTMLButtonElement;
  const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
  const nodeTypeSelect = document.getElementById('nodeTypeSelect') as HTMLSelectElement;
  const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
  const loadTemplateBtn = document.getElementById('loadTemplate') as HTMLButtonElement;
  const helpButton = document.getElementById('helpButton') as HTMLButtonElement;
  const helpPanel = document.getElementById('helpPanel') as HTMLElement;

  if (addNodeBtn) {
    addNodeBtn.addEventListener('click', () => {
      // Get center of canvas in world coordinates (0, 0)
      const x = canvasUI.editor.viewOffset.x;
      const y = canvasUI.editor.viewOffset.y;
      if (nodeTypeSelect && nodeTypeSelect.value) {
        canvasUI.editor.addNode(nodeTypeSelect.value, x, y);
      } else {
        canvasUI.editor.addNode('number', x, y);
      }
    });
  }

  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', () => {
      canvasUI.editor.clearCanvas();
    });
  }

  if (centerViewBtn) {
    centerViewBtn.addEventListener('click', () => {
      // CENTRAR la vista en el origen (0, 0)
      canvasUI.editor.viewOffset.x = 0;
      canvasUI.editor.viewOffset.y = 0;
      canvasUI.editor.scale = 1.0;
      console.log('🎯 Vista centrada en origen (0,0) con zoom 1.0');
    });
  }

  if (playButton) {
    playButton.addEventListener('click', () => {
      if (canvasUI.execution.isExecuting()) {
        // Si está ejecutando, pausar
        canvasUI.execution.pauseExecution();
        playButton.innerHTML = '<span>▶</span><span>Resume</span>';
        playButton.className = 'execution-button standby';
      } else {
        // Si está pausado o detenido, iniciar
        canvasUI.execution.startExecution();
        playButton.innerHTML = '<span>⏸</span><span>Pause</span>';
        playButton.className = 'execution-button play';
        if (stopButton) stopButton.disabled = false;
      }
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      canvasUI.execution.stopExecution();
      stopButton.disabled = true;
      playButton.innerHTML = '<span>▶</span><span>Play</span>';
      playButton.className = 'execution-button play';
      
      // Ocultar info de pasos
      const stepInfo = document.getElementById('stepInfo');
      if (stepInfo) stepInfo.style.display = 'none';
    });
  }

  // Control de modo de ejecución
  const executionModeSelect = document.getElementById('executionMode') as HTMLSelectElement;
  if (executionModeSelect) {
    executionModeSelect.addEventListener('change', () => {
      const mode = executionModeSelect.value as 'realtime' | 'step';
      canvasUI.execution.setExecutionMode(mode);
      
      // Mostrar/ocultar info de pasos
      const stepInfo = document.getElementById('stepInfo');
      if (stepInfo) {
        stepInfo.style.display = mode === 'step' ? 'inline-block' : 'none';
      }
    });
  }

  // Actualizar contador de pasos (solo en modo step)
  setInterval(() => {
    const executionMode = canvasUI.execution.getExecutionMode();
    if (executionMode === 'step' && canvasUI.execution.isExecuting()) {
      const stepCounter = document.getElementById('stepCounter');
      if (stepCounter) {
        const current = canvasUI.execution.getCurrentStep();
        const total = canvasUI.execution.getTotalSteps();
        // Display 1-based step counter (1, 2, 3...) instead of 0-based
        const displayCurrent = current > 0 ? current : (total > 0 ? 1 : 0);
        stepCounter.textContent = `${displayCurrent}/${total}`;
      }
    }
  }, 100);

  if (loadTemplateBtn && templateSelect) {
    loadTemplateBtn.addEventListener('click', async () => {
      const id = Number(templateSelect.value);
      if (!id) return;
      const template = await dbService.loadTemplate(id);
      if (template) {
        canvasUI.editor.loadWorkflowTemplate(template);
      }
    });
  }

  // Botón Guardar Template (sobrescribe el seleccionado)
  const saveTemplateBtn = document.getElementById('saveTemplate') as HTMLButtonElement;
  if (saveTemplateBtn && templateSelect) {
    saveTemplateBtn.addEventListener('click', async () => {
      const id = Number(templateSelect.value);
      if (!id) {
        alert('⚠️ Selecciona un template para sobrescribir.\nUsa "Guardar como" para crear uno nuevo.');
        return;
      }
      
      const template = await dbService.loadTemplate(id);
      if (!template) {
        alert('⚠️ No se pudo cargar el template seleccionado.');
        return;
      }
      
      // Serializar nodos y conexiones
      const nodesData = canvasUI.editor.nodes.map((node, index) => {
        const nodeData: any = {
          id: index + 1,
          type: node.type,
          position: { x: node.pos.x, y: node.pos.y },
          data: {}
        };

        // Guardar valor del output si existe (para nodos de entrada y Task)
        if (node.outputs.length > 0 && node.outputs[0].value !== undefined) {
          nodeData.data.value = node.outputs[0].value;
        }

        // Guardar valores de inputs si existen
        if (node.inputs.length > 0) {
          const inputValues: any[] = [];
          node.inputs.forEach(input => {
            if (input.value !== undefined) {
              inputValues.push(input.value);
            }
          });
          if (inputValues.length > 0) {
            nodeData.data.inputValues = inputValues;
          }
        }

        // Guardar título y descripción personalizados
        if (node.customTitle !== null) nodeData.data.customTitle = node.customTitle;
        if (node.customDescription !== null) nodeData.data.customDescription = node.customDescription;

        return nodeData;
      });
      
      const connectionsData = canvasUI.editor.links
        .map((link, index) => {
          if (!link || !link[0] || !link[1]) return null;
          const fromNodeIndex = canvasUI.editor.nodes.indexOf(link[0].parent);
          const toNodeIndex = canvasUI.editor.nodes.indexOf(link[1].parent);
          const conn: any = {
            from: { node: fromNodeIndex + 1, pin: link[0].index },
            to: { node: toNodeIndex + 1, pin: link[1].index }
          };
          // Incluir weight si existe en templateConnections
          if (canvasUI.editor.templateConnections && canvasUI.editor.templateConnections[index]?.weight !== undefined) {
            conn.weight = canvasUI.editor.templateConnections[index].weight;
          }
          return conn;
        })
        .filter(conn => conn !== null);
      
      // Actualizar el template existente (mantiene id, nombre y descripción original)
      const updatedTemplate = {
        name: template.name,
        description: template.description,
        problemDescription: template.problemDescription,
        nodes_data: JSON.stringify(nodesData),
        connections_data: JSON.stringify(connectionsData)
      };
      
      await dbService.updateTemplate(id, updatedTemplate);
      alert(`✅ Cambios guardados en "${template.name}"!`);
      
      // Recargar la lista de templates
      const templates = await dbService.listTemplates();
      templateSelect.innerHTML = '<option value="">📁 Template</option>';
      templates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id?.toString() || '';
        option.textContent = t.name;
        templateSelect.appendChild(option);
      });
      
      // Mantener el template seleccionado
      templateSelect.value = id.toString();
    });
  }

  // Botón Guardar Como (nuevo template)
  const saveAsTemplateBtn = document.getElementById('saveAsTemplate') as HTMLButtonElement;
  if (saveAsTemplateBtn) {
    saveAsTemplateBtn.addEventListener('click', async () => {
      const name = prompt('Nombre del nuevo template:', 'Mi Workflow');
      if (!name) return;
      
      const description = prompt('Descripción (opcional):', '');
      
      // Serializar nodos y conexiones
      const nodesData = canvasUI.editor.nodes.map((node, index) => {
        const nodeData: any = {
          id: index + 1,
          type: node.type,
          position: { x: node.pos.x, y: node.pos.y },
          data: {}
        };

        // Guardar valor del output si existe (para nodos de entrada y Task)
        if (node.outputs.length > 0 && node.outputs[0].value !== undefined) {
          nodeData.data.value = node.outputs[0].value;
        }

        // Guardar valores de inputs si existen
        if (node.inputs.length > 0) {
          const inputValues: any[] = [];
          node.inputs.forEach(input => {
            if (input.value !== undefined) {
              inputValues.push(input.value);
            }
          });
          if (inputValues.length > 0) {
            nodeData.data.inputValues = inputValues;
          }
        }

        // Guardar título y descripción personalizados
        if (node.customTitle !== null) nodeData.data.customTitle = node.customTitle;
        if (node.customDescription !== null) nodeData.data.customDescription = node.customDescription;

        return nodeData;
      });
      
      const connectionsData = canvasUI.editor.links
        .map((link, index) => {
          if (!link || !link[0] || !link[1]) return null;
          const fromNodeIndex = canvasUI.editor.nodes.indexOf(link[0].parent);
          const toNodeIndex = canvasUI.editor.nodes.indexOf(link[1].parent);
          const conn: any = {
            from: { node: fromNodeIndex + 1, pin: link[0].index },
            to: { node: toNodeIndex + 1, pin: link[1].index }
          };
          // Incluir weight si existe en templateConnections
          if (canvasUI.editor.templateConnections && canvasUI.editor.templateConnections[index]?.weight !== undefined) {
            conn.weight = canvasUI.editor.templateConnections[index].weight;
          }
          return conn;
        })
        .filter(conn => conn !== null);
      
      const template = {
        name,
        description: description || 'Template personalizado',
        nodes_data: JSON.stringify(nodesData),
        connections_data: JSON.stringify(connectionsData)
      };
      
      await dbService.saveTemplate(template);
      alert(`✅ Nuevo template "${name}" guardado exitosamente!`);
      
      // Recargar la lista de templates
      const templates = await dbService.listTemplates();
      templateSelect.innerHTML = '<option value="">📁 Template</option>';
      templates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id?.toString() || '';
        option.textContent = t.name;
        templateSelect.appendChild(option);
      });
    });
  }

  // Botón Eliminar Template
  const deleteTemplateBtn = document.getElementById('deleteTemplate') as HTMLButtonElement;
  if (deleteTemplateBtn && templateSelect) {
    deleteTemplateBtn.addEventListener('click', async () => {
      const id = Number(templateSelect.value);
      if (!id) {
        alert('⚠️ Selecciona un template primero');
        return;
      }
      
      const template = await dbService.loadTemplate(id);
      if (!template) return;
      
      const confirmDelete = confirm(`¿Eliminar el template "${template.name}"?`);
      if (!confirmDelete) return;
      
      await dbService.deleteTemplate(id);
      alert('✅ Template eliminado');
      
      // Recargar la lista de templates
      const templates = await dbService.listTemplates();
      templateSelect.innerHTML = '<option value="">📁 Template</option>';
      templates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id?.toString() || '';
        option.textContent = t.name;
        templateSelect.appendChild(option);
      });
      
      templateSelect.value = '';
    });
  }

  // Botón de ayuda - Ahora usa InfoPanel con Markdown
  if (helpButton) {
    helpButton.addEventListener('click', () => {
      // Contenido de ayuda en formato Markdown
      const helpContent = `
# 📚 Guía de Usuario - Node Editor

Bienvenido al **Node Editor Visual**, una herramienta avanzada para crear y ejecutar flujos de trabajo mediante nodos.

## 🎯 Conceptos Básicos

### ¿Qué es un Nodo?
Un **nodo** es una unidad de procesamiento que puede:
- 📥 Recibir datos de otros nodos
- ⚙️ Procesar información
- 📤 Enviar resultados a otros nodos

### Tipos de Nodos

| Tipo | Ícono | Descripción |
|------|-------|-------------|
| **Input** | 📥 | Nodos de entrada de datos |
| **Process** | ⚙️ | Nodos de procesamiento |
| **Output** | 📤 | Nodos de salida |
| **Condition** | 🔀 | Nodos de decisión |
| **Database** | 🗄️ | Nodos de base de datos |

---

## 🖱️ Controles del Canvas

### Navegación
- **Arrastrar**: Click + Arrastrar con botón derecho
- **Zoom**: Rueda del ratón o control deslizante
- **Selección**: Click en un nodo

### Conexiones
1. Click en el **puerto de salida** de un nodo (círculo derecho)
2. Arrastra hasta el **puerto de entrada** de otro nodo (círculo izquierdo)
3. Suelta para crear la conexión

> 💡 **Tip**: Las conexiones solo son válidas entre puertos compatibles

---

## 🔄 Ejecución de Flujos

### Modos de Ejecución

#### ⚡ Tiempo Real
Ejecuta todo el flujo instantáneamente.

\`\`\`
1. Selecciona "Tiempo Real" en el dropdown
2. Presiona el botón "Play"
3. Observa la ejecución en tiempo real
\`\`\`

#### 🐌 Paso a Paso
Ejecuta nodo por nodo, ideal para depuración.

\`\`\`
1. Selecciona "Paso a Paso"
2. Presiona "Play" para iniciar
3. Usa los controles para avanzar/retroceder
\`\`\`

---

## 🗺️ Algoritmos de Rutas

### Algoritmos Disponibles

#### 🔷 Dijkstra
- **Propósito**: Encontrar el camino más corto
- **Requisitos**: Grafo con pesos positivos
- **Ideal para**: Rutas de transporte, costos

#### ⭐ A* (A-Star)
- **Propósito**: Búsqueda heurística eficiente
- **Requisitos**: Posiciones de nodos definidas
- **Ideal para**: Mapas, navegación espacial

#### 📊 PERT/CPM
- **Propósito**: Gestión de proyectos
- **Requisitos**: Grafo acíclico dirigido (DAG)
- **Ideal para**: Planificación de tareas, cronogramas

---

## 🎨 Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| \`Ctrl + N\` | Nuevo nodo |
| \`Delete\` | Eliminar selección |
| \`Ctrl + Z\` | Deshacer |
| \`Ctrl + S\` | Guardar template |
| \`Space\` | Modo mover canvas |
| \`Esc\` | Cancelar conexión |

---

## 💾 Templates

Los **templates** son configuraciones predefinidas que puedes cargar:

1. Ve al dropdown de "Templates"
2. Selecciona un template
3. Click en "Cargar Template"
4. El canvas se poblará automáticamente

### Crear Tu Propio Template
1. Diseña tu flujo de nodos
2. Click en "Guardar como Template"
3. Dale un nombre y descripción
4. ¡Listo! Ahora está disponible en la base de datos

---

## 🐛 Solución de Problemas

### El flujo no se ejecuta
- ✅ Verifica que todos los nodos estén conectados correctamente
- ✅ Revisa que no haya ciclos (loops infinitos)
- ✅ Asegúrate de que los nodos de entrada tengan valores

### No puedo conectar dos nodos
- ✅ Solo puedes conectar salida → entrada
- ✅ Verifica compatibilidad de tipos de datos
- ✅ No se permiten conexiones duplicadas

### El algoritmo no está disponible
- ✅ Revisa el panel de validación
- ✅ Algunos algoritmos requieren estructuras específicas
- ✅ Lee las sugerencias del panel de validación

---

## 📖 Más Información

Para documentación detallada, consulta los archivos **.md** en la raíz del proyecto:

- 📄 \`QUICK_START.md\` - Inicio rápido
- 📄 \`ALGORITHM_VALIDATION_ANALYSIS.md\` - Análisis de algoritmos
- 📄 \`WEIGHT_EDITING_GUIDE.md\` - Edición de pesos

---

**¿Necesitas más ayuda?** Abre la consola del navegador (F12) para ver logs detallados.
`;
      
      infoPanel.showMarkdown(helpContent, 'Guía de Usuario', '📚');
    });
  }
  
  // Mantener compatibilidad con el panel de ayuda antiguo (si existe)
  if (helpPanel) {
    const closeHelp = document.getElementById('closeHelp');
    if (closeHelp) {
      closeHelp.addEventListener('click', () => {
        helpPanel.style.display = 'none';
      });
    }
  }

  // Botón Analizar Ruta Óptima
  const analyzeOptimalPathBtn = document.getElementById('analyzeOptimalPath') as HTMLButtonElement;
  if (analyzeOptimalPathBtn) {
    analyzeOptimalPathBtn.addEventListener('click', () => {
      analyzeOptimalPath(canvasUI.editor);
    });
  }

  // Botón de información de algoritmo
  const algorithmInfoBtn = document.getElementById('algorithmInfoButton') as HTMLButtonElement;
  if (algorithmInfoBtn) {
    algorithmInfoBtn.addEventListener('click', () => {
      const algorithmSelect = document.getElementById('pathAlgorithmSelect') as HTMLSelectElement;
      const selectedAlgorithm = algorithmSelect?.value;
      
      if (!selectedAlgorithm) {
        infoPanel.showInfo([{
          title: 'Selecciona un Algoritmo',
          icon: '🎯',
          markdown: 'Por favor, selecciona un algoritmo del menú desplegable para ver información detallada.'
        }]);
        return;
      }
      
      showAlgorithmInfo(selectedAlgorithm);
    });
  }

  // Botón Ejecutar Algoritmo de Ruta Óptima
  // NOTA: El evento ahora es manejado por AlgorithmValidationUI, pero mantenemos
  // la lógica de highlighting aquí para compatibilidad
  const pathAlgorithmSelect = document.getElementById('pathAlgorithmSelect') as HTMLSelectElement;
  
  // Actualizar validación cuando cambie la selección
  if (pathAlgorithmSelect) {
    pathAlgorithmSelect.addEventListener('change', () => {
      algorithmUI.updateValidation();
    });
  }
  
  // Monitorear cambios en el editor para actualizar validación
  // (por ejemplo, cuando se agregan/eliminan nodos o conexiones)
  const originalAddNode = canvasUI.editor.addNode.bind(canvasUI.editor);
  canvasUI.editor.addNode = function(...args) {
    const result = originalAddNode(...args);
    algorithmUI.updateValidation();
    return result;
  };
  
  const originalClearCanvas = canvasUI.editor.clearCanvas.bind(canvasUI.editor);
  canvasUI.editor.clearCanvas = function() {
    originalClearCanvas();
    algorithmUI.updateValidation();
  };

  // Botón Reset Highlights
  const resetHighlightsBtn = document.getElementById('resetHighlights') as HTMLButtonElement;
  if (resetHighlightsBtn) {
    resetHighlightsBtn.addEventListener('click', () => {
      // Limpiar todos los highlights de nodos
      canvasUI.editor.nodes.forEach(node => {
        if (node.userData) {
          // Remover datos de algoritmos
          delete node.userData.pathHighlight;
          delete node.userData.isInOptimalPath;
          delete node.userData.pertData;
          
          // Si userData está vacío, eliminarlo completamente
          if (Object.keys(node.userData).length === 0) {
            delete node.userData;
          }
        }
      });
      
      logAudit('✨ Resaltado de rutas óptimas limpiado');
      alert('✨ Resaltado de rutas óptimas limpiado correctamente');
    });
  }

  // Botón Reset Database
  const resetDatabaseBtn = document.getElementById('resetDatabase') as HTMLButtonElement;
  if (resetDatabaseBtn) {
    resetDatabaseBtn.addEventListener('click', async () => {
      const confirmReset = confirm(
        '⚠️ ADVERTENCIA: Esto eliminará TODOS los templates guardados y reiniciará la base de datos.\n\n' +
        'Esta acción es útil si los templates no se cargan correctamente debido a cambios en el schema.\n\n' +
        'Los templates por defecto se volverán a crear automáticamente.\n\n' +
        '¿Estás seguro de continuar?'
      );
      
      if (!confirmReset) return;
      
      try {
        // Limpiar localStorage
        localStorage.removeItem('workflowDb');
        
        // Reinicializar DatabaseService
        const dbService = DatabaseService.getInstance();
        await dbService.initialize();
        
        // Recargar templates (ahora solo estarán los por defecto)
        await loadTemplatesIntoUI();
        
        alert('✅ Base de datos reiniciada exitosamente.\nLos templates por defecto han sido restaurados.');
        
        logAudit('DATABASE_RESET: Manual reset by user');
      } catch (error) {
        console.error('Error al resetear la base de datos:', error);
        alert('❌ Error al resetear la base de datos. Ver consola para detalles.');
      }
    });
  }

});

// Logger que registra tanto en consola como en el panel de auditoría
export function logAudit(msg: string) {
  console.log(`[Audit] ${msg}`);
  auditLogPanel.addLog(msg);
}

/**
 * Analiza las rutas óptimas y componentes conexas del grafo actual
 * Excluye "uninodos" (nodos aislados sin conexiones) del análisis
 */
function analyzeOptimalPath(editor: any) {
  logAudit('🔍 ========== ANÁLISIS DE RUTAS ÓPTIMAS ==========');
  
  const totalNodes = editor.nodes.length;
  const totalLinks = editor.links.filter((l: any) => l !== null).length;
  
  logAudit(`📊 Nodos totales: ${totalNodes}`);
  logAudit(`🔗 Conexiones totales: ${totalLinks}`);
  
  if (totalNodes === 0) {
    alert('⚠️ No hay nodos en el canvas para analizar.');
    return;
  }
  
  // Detectar componentes conexas
  const components = editor.findConnectedComponents();
  logAudit(`🔍 Componentes conexas detectadas: ${components.length}`);
  
  // Identificar uninodos (nodos sin conexiones)
  const uninodos: any[] = [];
  const nodosEnGrafos: any[] = [];
  
  components.forEach((component: any[], index: number) => {
    if (component.length === 1) {
      // Verificar si el nodo tiene conexiones
      const node = component[0];
      const hasConnections = editor.links.some((link: any) => 
        link && (link[0]?.parent === node || link[1]?.parent === node)
      );
      
      if (!hasConnections) {
        uninodos.push(node);
        logAudit(`  ⚪ Uninodo detectado: "${node.title}" (sin conexiones)`);
      } else {
        nodosEnGrafos.push(...component);
        logAudit(`  📦 Componente ${index + 1}: 1 nodo conectado - "${node.title}"`);
      }
    } else {
      nodosEnGrafos.push(...component);
      const nodeNames = component.map((n: any) => n.title).join(', ');
      logAudit(`  📦 Componente ${index + 1}: ${component.length} nodos - [${nodeNames}]`);
    }
  });
  
  logAudit(`\n📈 Resumen:`);
  logAudit(`  • Nodos en grafos: ${nodosEnGrafos.length}`);
  logAudit(`  • Uninodos (excluidos): ${uninodos.length}`);
  logAudit(`  • Componentes válidas: ${components.length - uninodos.length}`);
  
  // Analizar orden de ejecución para grafos válidos
  if (nodosEnGrafos.length > 0) {
    logAudit(`\n🎯 Orden de Ejecución Topológico:`);
    const executionOrder = editor.findExecutionOrder();
    const orderStr = executionOrder.map((n: any, i: number) => `${i+1}. ${n.title}`).join('\n  ');
    logAudit(`  ${orderStr}`);
  }
  
  // Detectar nodos fuente y sumidero
  const sourceNodes = nodosEnGrafos.filter((node: any) => {
    const hasInputs = editor.links.some((link: any) => 
      link && link[1] && link[1].parent === node
    );
    return !hasInputs && node.inputs.length > 0;
  });
  
  const sinkNodes = nodosEnGrafos.filter((node: any) => {
    const hasOutputs = editor.links.some((link: any) => 
      link && link[0] && link[0].parent === node
    );
    return !hasOutputs && node.outputs.length > 0;
  });
  
  logAudit(`\n🔵 Nodos Fuente (inicio): ${sourceNodes.length}`);
  sourceNodes.forEach((n: any) => logAudit(`  • ${n.title}`));
  
  logAudit(`\n🔴 Nodos Sumidero (fin): ${sinkNodes.length}`);
  sinkNodes.forEach((n: any) => logAudit(`  • ${n.title}`));
  
  // Análisis de rutas posibles
  if (sourceNodes.length > 0 && sinkNodes.length > 0) {
    logAudit(`\n🛤️ Rutas Potenciales:`);
    logAudit(`  • Rutas posibles: ${sourceNodes.length} fuentes × ${sinkNodes.length} sumideros = ${sourceNodes.length * sinkNodes.length}`);
    
    // Verificar si hay ruta óptima calculable
    const componentsWithPaths = components.filter((c: any[]) => c.length > 1);
    if (componentsWithPaths.length > 0) {
      logAudit(`\n✅ RUTAS ÓPTIMAS CALCULABLES`);
      logAudit(`  • Se pueden aplicar algoritmos: Dijkstra, A*, Bellman-Ford`);
      logAudit(`  • Componentes aptas: ${componentsWithPaths.length}`);
    } else {
      logAudit(`\n⚠️ NO HAY RUTAS ÓPTIMAS`);
      logAudit(`  • Motivo: Solo hay nodos aislados o uninodos`);
    }
  } else {
    logAudit(`\n⚠️ NO HAY RUTAS COMPLETAS`);
    if (sourceNodes.length === 0) {
      logAudit(`  • No hay nodos fuente (nodos sin entradas)`);
    }
    if (sinkNodes.length === 0) {
      logAudit(`  • No hay nodos sumidero (nodos sin salidas)`);
    }
  }
  
  logAudit('========================================\n');
  
  // Mostrar resumen en alerta
  const summary = `
🔍 ANÁLISIS DE RUTAS ÓPTIMAS

📊 Nodos: ${totalNodes} (${nodosEnGrafos.length} en grafos, ${uninodos.length} uninodos)
🔗 Conexiones: ${totalLinks}
📦 Componentes: ${components.length - uninodos.length} válidas

${nodosEnGrafos.length > 0 && sourceNodes.length > 0 && sinkNodes.length > 0
  ? '✅ Rutas óptimas CALCULABLES\n   Algoritmos disponibles: Dijkstra, A*, Bellman-Ford'
  : '⚠️ NO hay rutas óptimas calculables\n   ' + (uninodos.length === totalNodes ? 'Solo hay uninodos' : 'Falta estructura de grafo completa')
}

Ver consola y panel de auditoría para detalles completos.
  `.trim();
  
  alert(summary);
}

// Mostrar información detallada de algoritmos en el InfoPanel
function showAlgorithmInfo(algorithm: string) {
  const infoPanel = (window as any).infoPanel;
  if (!infoPanel) return;

  if (algorithm === 'dijkstra') {
    infoPanel.showMarkdown(`
# 🔷 Dijkstra

El algoritmo de **Dijkstra** encuentra el camino más corto entre dos nodos en un grafo con pesos positivos.

- **Ventajas:**
  - Garantiza el camino más corto
  - Rápido en grafos pequeños/medianos
- **Limitaciones:**
  - No soporta pesos negativos
  - No usa heurística

## Requisitos
- Grafo dirigido o no dirigido
- Pesos positivos en todas las aristas

## Uso típico
- Rutas de transporte
- Optimización de costos

## Referencias
- [Wikipedia: Dijkstra](https://es.wikipedia.org/wiki/Algoritmo_de_Dijkstra)
`,'Dijkstra','🔷');
  } else if (algorithm === 'astar') {
    infoPanel.showMarkdown(`
# ⭐ A* (A-Star)

El algoritmo **A\*** combina búsqueda de costo y heurística para encontrar rutas óptimas de forma eficiente.

- **Ventajas:**
  - Muy eficiente en mapas espaciales
  - Permite heurísticas personalizadas
- **Limitaciones:**
  - Requiere posiciones (coordenadas) de nodos
  - La heurística debe ser admisible

## Requisitos
- Grafo con posiciones conocidas
- Heurística definida (por ejemplo, distancia Euclídea)

## Uso típico
- Navegación en mapas
- Juegos y robótica

## Referencias
- [Wikipedia: A*](https://es.wikipedia.org/wiki/Algoritmo_A*)
`,'A*','⭐');
  } else if (algorithm === 'pertcpm') {
    infoPanel.showMarkdown(`
# 📊 PERT/CPM

**PERT** (Program Evaluation and Review Technique) y **CPM** (Critical Path Method) son algoritmos para planificación y gestión de proyectos.

- **Ventajas:**
  - Permite estimar tiempos y riesgos
  - Identifica la ruta crítica
- **Limitaciones:**
  - Solo funciona en grafos acíclicos dirigidos (DAG)
  - Requiere estimaciones optimista, probable y pesimista

## Requisitos
- Grafo acíclico dirigido
- Tareas con estimaciones O/M/P

## Uso típico
- Cronogramas de proyectos
- Gestión de tareas complejas

## Referencias
- [Wikipedia: PERT](https://es.wikipedia.org/wiki/PERT)
- [Wikipedia: CPM](https://es.wikipedia.org/wiki/Método_de_la_ruta_crítica)
`,'PERT/CPM','📊');
  } else {
    infoPanel.showInfo([{
      title: 'Algoritmo no reconocido',
      icon: '❓',
      markdown: 'No se encontró información para el algoritmo seleccionado.'
    }]);
  }
}