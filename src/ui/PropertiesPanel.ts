// PropertiesPanel.ts
// Panel para editar propiedades de los nodos (valores de inputs)

import { Node } from '../core/Node';
import { PinType } from '../types/types';

export class PropertiesPanel {
  private panel: HTMLElement;
  private currentNode: Node | null = null;
  private inputElements: Map<number, HTMLInputElement> = new Map();

  constructor() {
    this.panel = document.getElementById('propertiesPanel')!;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Botón cerrar
    const closeBtn = document.getElementById('closeProperties');
    closeBtn?.addEventListener('click', () => this.hide());

    // Botón aplicar cambios
    const applyBtn = document.getElementById('applyProperties');
    applyBtn?.addEventListener('click', () => this.applyChanges());

    // Botón cancelar
    const cancelBtn = document.getElementById('cancelProperties');
    cancelBtn?.addEventListener('click', () => this.hide());

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  /**
   * Muestra el panel con las propiedades del nodo
   */
  public show(node: Node) {
    this.currentNode = node;
    this.inputElements.clear();
    this.renderProperties();
    this.panel.style.display = 'flex';
  }

  /**
   * Oculta el panel
   */
  public hide() {
    this.panel.style.display = 'none';
    this.currentNode = null;
    this.inputElements.clear();
  }

  /**
   * Verifica si el panel está visible
   */
  public isVisible(): boolean {
    return this.panel.style.display !== 'none';
  }

  /**
   * Renderiza las propiedades del nodo actual
   */
  private renderProperties() {
    if (!this.currentNode) return;

    // Mostrar tipo de nodo
    const nodeTypeDisplay = document.getElementById('nodeTypeDisplay');
    if (nodeTypeDisplay) {
      nodeTypeDisplay.textContent = `${this.currentNode.title} (${this.currentNode.type})`;
    }

    // Contenedor de inputs
    const inputPropertiesContainer = document.getElementById('inputProperties');
    if (!inputPropertiesContainer) return;

    inputPropertiesContainer.innerHTML = '';

    // Si el nodo no tiene inputs, mostrar mensaje
    if (this.currentNode.inputs.length === 0) {
      inputPropertiesContainer.innerHTML = `
        <div class="property-group">
          <p style="text-align: center; color: rgba(255,255,255,0.5); font-style: italic;">
            Este nodo no tiene propiedades editables.
          </p>
        </div>
      `;
      return;
    }

    // Renderizar cada input como propiedad editable
    this.currentNode.inputs.forEach((pin, index) => {
      const propertyGroup = document.createElement('div');
      propertyGroup.className = 'property-group';

      const label = document.createElement('label');
      label.textContent = `${pin.name}:`;
      propertyGroup.appendChild(label);

      const inputDiv = document.createElement('div');
      inputDiv.className = 'property-input';

      // Crear input según el tipo de pin
      const input = this.createInputElement(pin.type, pin.value);
      input.dataset.pinIndex = index.toString();
      this.inputElements.set(index, input);

      inputDiv.appendChild(input);

      // Agregar hint según el tipo
      const hint = document.createElement('div');
      hint.className = 'input-hint';
      hint.textContent = this.getHintForType(pin.type);
      inputDiv.appendChild(hint);

      propertyGroup.appendChild(inputDiv);
      inputPropertiesContainer.appendChild(propertyGroup);
    });
  }

  /**
   * Crea el elemento input apropiado según el tipo
   */
  private createInputElement(pinType: PinType, currentValue: any): HTMLInputElement {
    const input = document.createElement('input');

    switch (pinType) {
      case PinType.Number:
        input.type = 'number';
        input.value = currentValue?.toString() || '0';
        input.step = 'any'; // Permite decimales
        break;

      case PinType.Boolean:
        input.type = 'checkbox';
        input.checked = Boolean(currentValue);
        break;

      case PinType.String:
      case PinType.Custom:
        input.type = 'text';
        input.value = currentValue?.toString() || '';
        break;

      default:
        input.type = 'text';
        input.value = currentValue?.toString() || '';
    }

    return input;
  }

  /**
   * Obtiene un hint descriptivo según el tipo
   */
  private getHintForType(pinType: PinType): string {
    switch (pinType) {
      case PinType.Number:
        return 'Ingresa un número (entero o decimal)';
      case PinType.Boolean:
        return 'Activa/desactiva el checkbox';
      case PinType.String:
        return 'Ingresa texto';
      case PinType.Custom:
        return 'Ingresa cualquier valor';
      default:
        return '';
    }
  }

  /**
   * Aplica los cambios al nodo
   */
  private applyChanges() {
    if (!this.currentNode) return;

    this.inputElements.forEach((inputElement, pinIndex) => {
      const pin = this.currentNode!.inputs[pinIndex];
      if (!pin) return;

      // Actualizar el valor según el tipo
      switch (pin.type) {
        case PinType.Number:
          const numValue = parseFloat(inputElement.value);
          pin.value = isNaN(numValue) ? 0 : numValue;
          break;

        case PinType.Boolean:
          pin.value = (inputElement as HTMLInputElement).checked;
          break;

        case PinType.String:
        case PinType.Custom:
          pin.value = inputElement.value;
          break;
      }
    });

    console.log('✅ Propiedades aplicadas:', {
      node: this.currentNode.title,
      inputs: this.currentNode.inputs.map(p => ({ name: p.name, value: p.value }))
    });

    this.hide();
  }

  /**
   * Obtiene el nodo actualmente en edición
   */
  public getCurrentNode(): Node | null {
    return this.currentNode;
  }
}
