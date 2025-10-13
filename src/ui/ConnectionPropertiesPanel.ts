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

    // Mostrar información de la conexión con mejor formato
    const connectionInfo = document.getElementById('connectionInfo');
    if (connectionInfo) {
      connectionInfo.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="color: #4CAF50; font-size: 18px;">●</span>
            <div style="flex: 1;">
              <strong style="color: #4CAF50;">Origen:</strong><br>
              <span style="margin-left: 4px;">${fromNode.customTitle || fromNode.title}</span>
              <span style="opacity: 0.6; font-size: 0.9em;"> [Pin: ${fromPin.name || fromPin.index}]</span>
            </div>
          </div>
          <div style="text-align: center; margin: 8px 0; opacity: 0.5;">
            ⬇️
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #42A5F5; font-size: 18px;">●</span>
            <div style="flex: 1;">
              <strong style="color: #42A5F5;">Destino:</strong><br>
              <span style="margin-left: 4px;">${toNode.customTitle || toNode.title}</span>
              <span style="opacity: 0.6; font-size: 0.9em;"> [Pin: ${toPin.name || toPin.index}]</span>
            </div>
          </div>
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
        // Sin peso - eliminar el peso si existía
        if (this.editor.templateConnections[this.currentConnectionIndex].weight !== undefined) {
          delete this.editor.templateConnections[this.currentConnectionIndex].weight;
          console.log('ℹ️ Peso de conexión eliminado (sin peso)');
        }
      } else {
        const weight = parseFloat(weightValue);
        if (!isNaN(weight)) {
          if (weight >= 0) {
            this.editor.templateConnections[this.currentConnectionIndex].weight = weight;
            console.log('✅ Peso de conexión actualizado:', {
              connectionIndex: this.currentConnectionIndex,
              weight: weight,
              from: this.currentConnection[0].parent.title,
              to: this.currentConnection[1].parent.title
            });
          } else {
            alert('⚠️ El peso debe ser un número positivo o cero');
            return;
          }
        } else {
          alert('⚠️ El peso debe ser un número válido');
          return;
        }
      }

      // Recalcular después de cambiar el peso (útil para algoritmos que dependen del peso)
      this.editor.computeAll();
    }

    this.hide();
  }

  /**
   * Elimina la conexión actual
   */
  private deleteConnection() {
    if (!this.currentConnection || !this.editor || this.currentConnectionIndex < 0) return;

    const [fromPin, toPin] = this.currentConnection;
    const fromNode = fromPin.parent;
    const toNode = toPin.parent;
    
    const confirmMsg = `¿Eliminar esta conexión?\n\nDesde: ${fromNode.customTitle || fromNode.title}\nHasta: ${toNode.customTitle || toNode.title}`;
    
    if (confirm(confirmMsg)) {
      // Limpiar userData de los pins
      fromPin.userData = null;
      toPin.userData = null;
      
      // Eliminar la conexión
      this.editor.links[this.currentConnectionIndex] = [null, null];
      
      // Eliminar el peso asociado si existe
      if (this.editor.templateConnections && this.editor.templateConnections[this.currentConnectionIndex]) {
        delete this.editor.templateConnections[this.currentConnectionIndex];
      }
      
      // Recalcular para propagar cambios
      this.editor.computeAll();
      
      console.log('🗑️ Conexión eliminada:', {
        index: this.currentConnectionIndex,
        from: fromNode.title,
        to: toNode.title
      });
      
      this.hide();
    }
  }
}
