// CanvasExecution.ts
// Controles de ejecución: play, pause, stop con simulación paso a paso
import { NodeEditor } from '../../core/NodeEditor';

export type ExecutionMode = 'realtime' | 'step';

export class CanvasExecution {
  private editor: NodeEditor;
  private executionInterval: number | null = null;
  private executionPaused: boolean = false;
  private executionMode: ExecutionMode = 'realtime';
  private currentStepIndex: number = 0;
  private executionOrder: any[] = [];
  private stepHighlightTimeout: number | null = null;

  constructor(editor: NodeEditor) {
    this.editor = editor;
  }

  isExecuting() {
    return this.editor.isRunning && !this.executionPaused;
  }

  setExecutionMode(mode: ExecutionMode) {
    this.executionMode = mode;
    if (this.editor.isRunning) {
      this.stopExecution();
      this.startExecution();
    }
  }

  getExecutionMode(): ExecutionMode {
    return this.executionMode;
  }

  startExecution() {
    this.editor.isRunning = true;
    this.executionPaused = false;
    this.currentStepIndex = 0;
    
    if (this.executionMode === 'step') {
      this.executionOrder = this.editor.findExecutionOrder();
      this.executeNextStep();
    } else {
      // Modo tiempo real (original)
      if (!this.executionInterval) {
        this.executionInterval = window.setInterval(() => {
          if (this.editor.isRunning && !this.executionPaused) {
            this.editor.computeAll();
          }
        }, 100);
      }
    }
  }

  private executeNextStep() {
    if (!this.editor.isRunning || this.executionPaused) return;
    
    if (this.currentStepIndex < this.executionOrder.length) {
      const node = this.executionOrder[this.currentStepIndex];
      
      // Resaltar el nodo actual
      this.highlightNode(node);
      
      // Ejecutar solo este nodo
      this.editor.computeSingleNode(node);
      
      this.currentStepIndex++;
      
      // Programar el siguiente paso después de 1 segundo
      this.executionInterval = window.setTimeout(() => {
        this.executeNextStep();
      }, 1000);
    } else {
      // Reiniciar el ciclo
      this.currentStepIndex = 0;
      this.executeNextStep();
    }
  }

  private highlightNode(node: any) {
    // Limpiar highlight anterior
    if (this.stepHighlightTimeout) {
      clearTimeout(this.stepHighlightTimeout);
    }
    
    // Resaltar nodo actual
    node.stepHighlight = true;
    
    // Quitar highlight después de 0.8 segundos
    this.stepHighlightTimeout = window.setTimeout(() => {
      node.stepHighlight = false;
    }, 800);
  }

  pauseExecution() {
    this.executionPaused = true;
    if (this.executionInterval) {
      clearTimeout(this.executionInterval);
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
  }

  stopExecution() {
    this.editor.isRunning = false;
    this.executionPaused = false;
    this.currentStepIndex = 0;
    
    // Limpiar highlights de nodos
    this.editor.nodes.forEach(node => {
      node.stepHighlight = false;
    });
    
    if (this.executionInterval) {
      clearTimeout(this.executionInterval);
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
    
    if (this.stepHighlightTimeout) {
      clearTimeout(this.stepHighlightTimeout);
      this.stepHighlightTimeout = null;
    }
  }

  getCurrentStep(): number {
    return this.currentStepIndex;
  }

  getTotalSteps(): number {
    return this.executionOrder.length;
  }
}
