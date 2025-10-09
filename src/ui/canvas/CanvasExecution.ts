// CanvasExecution.ts
// Controles de ejecución: play, pause, stop
import { NodeEditor } from '../../core/NodeEditor';

export class CanvasExecution {
  private editor: NodeEditor;
  private executionInterval: number | null = null;
  private executionPaused: boolean = false;

  constructor(editor: NodeEditor) {
    this.editor = editor;
  }

  isExecuting() {
    return this.editor.isRunning && !this.executionPaused;
  }

  startExecution() {
    this.editor.isRunning = true;
    this.executionPaused = false;
    if (!this.executionInterval) {
      this.executionInterval = window.setInterval(() => {
        if (this.editor.isRunning && !this.executionPaused) {
          this.editor.computeAll();
        }
      }, 100);
    }
  }

  pauseExecution() {
    this.executionPaused = true;
  }

  stopExecution() {
    this.editor.isRunning = false;
    this.executionPaused = false;
    if (this.executionInterval) {
      window.clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
  }
}
