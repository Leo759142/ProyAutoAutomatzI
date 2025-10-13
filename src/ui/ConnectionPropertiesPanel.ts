// ConnectionPropertiesPanel.ts
// Panel para editar propiedades de las conexiones (peso/weight)

import { NodeEditor } from '../core/NodeEditor';
import { Pin } from '../core/Node';

export class ConnectionPropertiesPanel {
  private panel: HTMLElement;
  private currentConnection: [Pin, Pin] | null = null;
  private currentConnectionIndex: number = -1;
  private editor: NodeEditor | null = null;

  constructor(editor?: NodeEditor) {
    this.panel = document.getElementById('connectionPropertiesPanel')!;
    this.editor = editor || null;
    this.setupEventListeners();
  }
  
  /**
   * Establece el editor
   */
  public setEditor(editor: NodeEditor) {
    this.editor = editor;
  }

  private setupEventListeners() {
    // Botón cerrar
    const closeBtn = document.getElementById('closeConnectionProperties');
    closeBtn?.addEventListener('click', () => this.hide());

    // Botón aplicar cambios
    const applyBtn = document.getElementById('applyConnectionProperties');
    applyBtn?.addEventListener('click', () => this.applyChanges());

    // Botón cancelar
    const cancelBtn = document.getElementById('cancelConnectionProperties');
    cancelBtn?.addEventListener('click', () => this.hide());

    // Botón eliminar conexión
    const deleteBtn = document.getElementById('deleteConnection');
    deleteBtn?.addEventListener('click', () => this.deleteConnection());

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  /**
   * Muestra el panel con las propiedades de la conexión
   */
  public show(connection: [Pin, Pin], connectionIndex: number) {
    this.currentConnection = connection;
    this.currentConnectionIndex = connectionIndex;
    this.renderProperties();
    this.panel.style.display = 'flex';
  }

  /**
   * Oculta el panel
   */
  public hide() {
    this.panel.style.display = 'none';
    this.currentConnection = null;
    this.currentConnectionIndex = -1;
  }

  /**
   * Verifica si el panel está visible
   */
  public isVisible(): boolean {
    return this.panel.style.display !== 'none';
  }

  /**
   * Renderiza las propiedades de la conexión actual
   */
  private renderProperties() {
    if (!this.currentConnection || !this.editor) return;

    const [fromPin, toPin] = this.currentConnection;
    const fromNode = fromPin.parent;
    const toNode = toPin.parent;

    // Obtener índices de nodos
    const fromIndex = this.editor.nodes.indexOf(fromNode);
    const toIndex = this.editor.nodes.indexOf(toNode);

    // Mostrar información de la conexión
    const connectionInfo = document.getElementById('connectionInfo');
    if (connectionInfo) {
      connectionInfo.innerHTML = `
        <div style="margin-bottom: 12px;">
          <strong>Desde:</strong> ${fromNode.customTitle || fromNode.title} [Pin ${fromPin.index}]<br>
          <strong>Hasta:</strong> ${toNode.customTitle || toNode.title} [Pin ${toPin.index}]
        </div>
      `;
    }

    // Obtener peso actual de la conexión (de templateConnections si existe)
    let currentWeight: number | undefined = undefined;
    if (this.editor.templateConnections && this.currentConnectionIndex >= 0) {
      const templateConn = this.editor.templateConnections[this.currentConnectionIndex];
      if (templateConn && templateConn.weight !== undefined) {
        currentWeight = templateConn.weight;
      }
    }

    // Crear input para el peso
    const weightInput = document.getElementById('connectionWeightInput') as HTMLInputElement;
    if (weightInput) {
      weightInput.value = currentWeight !== undefined ? currentWeight.toString() : '';
      weightInput.placeholder = 'Sin peso (opcional)';
    }
  }

  /**
   * Aplica los cambios a la conexión
   */
  private applyChanges() {
    if (!this.currentConnection || !this.editor || this.currentConnectionIndex < 0) return;

    const weightInput = document.getElementById('connectionWeightInput') as HTMLInputElement;
    
    if (weightInput) {
      const weightValue = weightInput.value.trim();
      
      // Inicializar templateConnections si no existe
      if (!this.editor.templateConnections) {
        this.editor.templateConnections = [];
      }

      // Asegurar que el array tenga el tamaño correcto
      while (this.editor.templateConnections.length <= this.currentConnectionIndex) {
        this.editor.templateConnections.push({});
      }

      // Actualizar el peso
      if (weightValue === '') {
        // Sin peso
        delete this.editor.templateConnections[this.currentConnectionIndex].weight;
      } else {
        const weight = parseFloat(weightValue);
        if (!isNaN(weight) && weight > 0) {
          this.editor.templateConnections[this.currentConnectionIndex].weight = weight;
        } else {
          alert('⚠️ El peso debe ser un número positivo');
          return;
        }
      }

      console.log('✅ Peso de conexión actualizado:', {
        connectionIndex: this.currentConnectionIndex,
        weight: this.editor.templateConnections[this.currentConnectionIndex].weight
      });
    }

    this.hide();
  }

  /**
   * Elimina la conexión actual
   */
  private deleteConnection() {
    if (!this.currentConnection || !this.editor || this.currentConnectionIndex < 0) return;

    const [fromPin, toPin] = this.currentConnection;
    
    if (confirm('¿Eliminar esta conexión?')) {
      // Limpiar userData de los pins
      fromPin.userData = null;
      toPin.userData = null;
      
      // Eliminar la conexión
      this.editor.links[this.currentConnectionIndex] = [null, null];
      
      // Eliminar el peso asociado si existe
      if (this.editor.templateConnections && this.editor.templateConnections[this.currentConnectionIndex]) {
        delete this.editor.templateConnections[this.currentConnectionIndex];
      }
      
      // Recalcular
      this.editor.computeAll();
      
      console.log('🗑️ Conexión eliminada:', this.currentConnectionIndex);
      this.hide();
    }
  }
}
