
import './style.css';
import { initCanvasUI } from './ui/canvas/initCanvasUI';
import { DatabaseService } from './services/DatabaseService';
import { defaultTemplates } from './templates/DefaultTemplates';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar la UI modular del canvas
  const canvasUI = initCanvasUI();

  // Inicializar base de datos y guardar templates por defecto
  const dbService = DatabaseService.getInstance();
  dbService.initialize().then(async () => {
    const templates = await dbService.listTemplates();
    if (templates.length === 0) {
      console.log('Loading default templates...');
      try {
        for (const template of defaultTemplates) {
          await dbService.saveTemplate(template);
        }
        console.log('Default templates loaded successfully');
      } catch (error) {
        console.error('Error loading default templates:', error);
      }
    }

    // Actualizar el select de templates con los datos de la base de datos
    const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
    if (templateSelect) {
      // Limpiar opciones existentes excepto la primera
      while (templateSelect.options.length > 1) {
        templateSelect.remove(1);
      }
      
      // Añadir templates desde la base de datos agrupados por categoría
      const templates = await dbService.listTemplates();
      console.log('Available templates:', templates.length);

      const groups: { [key: string]: HTMLOptGroupElement } = {};
      
      templates.forEach(template => {
        try {
          const nodesData = JSON.parse(template.nodes_data);
          const category = nodesData[0]?.type?.split('/')[0] || 'General';
          
          if (!groups[category]) {
            groups[category] = document.createElement('optgroup');
            groups[category].label = category;
            templateSelect.appendChild(groups[category]);
          }

          const option = document.createElement('option');
          option.value = template.id?.toString() || '';
          option.textContent = template.name;
          option.title = template.description || '';
          groups[category].appendChild(option);
        } catch (error) {
          console.error('Error parsing template:', template.name, error);
        }
      });
    }
  });

  // Add event listeners for toolbar buttons
  const addNodeBtn = document.getElementById('addNode') as HTMLButtonElement;
  const clearCanvasBtn = document.getElementById('clearCanvas') as HTMLButtonElement;
  const playButton = document.getElementById('playButton') as HTMLButtonElement;
  const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
  const nodeTypeSelect = document.getElementById('nodeTypeSelect') as HTMLSelectElement;
  const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
  const loadTemplateBtn = document.getElementById('loadTemplate') as HTMLButtonElement;

  if (addNodeBtn) {
    addNodeBtn.addEventListener('click', () => {
      // Get center of canvas in screen coordinates
      const canvas = document.getElementById('nodeCanvas') as HTMLCanvasElement;
      const centerScreen = {
        x: canvas.width / 2,
        y: canvas.height / 2
      };
      // Convert to world coordinates using canvasUI.screenToWorld
      const centerWorld = canvasUI.screenToWorld(centerScreen);
      if (nodeTypeSelect && nodeTypeSelect.value) {
        canvasUI.editor.addNode(nodeTypeSelect.value, centerWorld.x, centerWorld.y);
      } else {
        canvasUI.editor.addNode('number', centerWorld.x, centerWorld.y);
      }
    });
  }

  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', () => {
      canvasUI.editor.clearCanvas();
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
    });
  }

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
});