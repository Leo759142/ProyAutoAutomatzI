
import './style.css';
import { initCanvasUI } from './ui/canvas/initCanvasUI';
import { DatabaseService } from './services/DatabaseService';
import { defaultTemplates } from './templates/DefaultTemplates';
import { validateAllTemplates } from './utils/validateTemplates';

document.addEventListener('DOMContentLoaded', () => {
  // 🔍 VALIDAR TODOS LOS TEMPLATES ANTES DE CARGARLOS
  console.log('🔍 Validando templates antes de cargar...');
  const templatesValid = validateAllTemplates();
  
  if (!templatesValid) {
    console.error('❌ ADVERTENCIA: Algunos templates tienen errores. Revisa la consola.');
  }

  // Inicializar la UI modular del canvas
  const canvasUI = initCanvasUI();

  // Inicializar base de datos y guardar templates por defecto
  const dbService = DatabaseService.getInstance();
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

    // Actualizar el select de templates con los datos de la base de datos
    const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
    if (templateSelect) {
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
  });

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
        stepCounter.textContent = `${current}/${total}`;
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

  // Botón de ayuda
  if (helpButton && helpPanel) {
    const closeHelp = document.getElementById('closeHelp');
    
    helpButton.addEventListener('click', () => {
      const isVisible = helpPanel.style.display !== 'none';
      helpPanel.style.display = isVisible ? 'none' : 'block';
      helpButton.textContent = isVisible ? '❓ Ayuda' : '✖️ Cerrar';
    });
    
    if (closeHelp) {
      closeHelp.addEventListener('click', () => {
        helpPanel.style.display = 'none';
        helpButton.textContent = '❓ Ayuda';
      });
    }
  }
});