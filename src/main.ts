import './style.css';
import { CanvasManager } from './ui/CanvasManager';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the canvas manager
  const manager = new CanvasManager();

  // Add event listeners for toolbar buttons
  const addNodeBtn = document.getElementById('addNode') as HTMLButtonElement;
  const clearCanvasBtn = document.getElementById('clearCanvas') as HTMLButtonElement;
  const playButton = document.getElementById('playButton') as HTMLButtonElement;
  const stopButton = document.getElementById('stopButton') as HTMLButtonElement;
  const nodeTypeSelect = document.getElementById('nodeTypeSelect') as HTMLSelectElement;

  if (addNodeBtn) {
    addNodeBtn.addEventListener('click', () => {
      if (nodeTypeSelect && nodeTypeSelect.value) {
        manager.triggerAddNode(nodeTypeSelect.value);
      } else {
        manager.triggerAddNode();
      }
    });
  }

  if (clearCanvasBtn) {
    clearCanvasBtn.addEventListener('click', () => {
      manager.triggerClearCanvas();
    });
  }

  if (playButton) {
    playButton.addEventListener('click', () => {
      manager.startExecution();
      playButton.disabled = true;
      if (stopButton) stopButton.disabled = false;
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      manager.stopExecution();
      stopButton.disabled = true;
      if (playButton) playButton.disabled = false;
    });
  }
});