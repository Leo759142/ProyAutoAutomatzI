// PropertiesPanel.ts
// Panel para editar propiedades de los nodos (valores de inputs)

import { Node } from '../core/Node';
import { PinType } from '../types/types';
import { NodeEditor } from '../core/NodeEditor';

export class PropertiesPanel {
  private panel: HTMLElement;
  private currentNode: Node | null = null;
  private inputElements: Map<number, HTMLInputElement> = new Map();
  private editor: NodeEditor | null = null;

  constructor(editor?: NodeEditor) {
    this.panel = document.getElementById('propertiesPanel')!;
    this.editor = editor || null;
    this.setupEventListeners();
  }
  
  /**
   * Establece el editor para poder ejecutar computeAll después de aplicar cambios
   */
  public setEditor(editor: NodeEditor) {
    this.editor = editor;
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

    // Mostrar título editable
    const nodeTypeDisplay = document.getElementById('nodeTypeDisplay');
    if (nodeTypeDisplay) {
      // Limpiar y crear input editable para el título
      nodeTypeDisplay.innerHTML = '';
      
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.id = 'nodeTitleInput';
      titleInput.className = 'title-input';
      titleInput.placeholder = 'Título del nodo';
      titleInput.value = this.currentNode.title;
      
      if (this.currentNode.subtitle) {
        titleInput.placeholder += ` (${this.currentNode.subtitle})`;
      }
      
      nodeTypeDisplay.appendChild(titleInput);
    }

    // Mostrar descripción editable
    const nodeDescriptionGroup = document.getElementById('nodeDescriptionGroup');
    const nodeDescriptionContainer = document.getElementById('nodeDescription');
    if (nodeDescriptionContainer && nodeDescriptionGroup) {
      // Limpiar contenido anterior
      nodeDescriptionContainer.innerHTML = '';
      
      // Crear textarea editable para la descripción
      const descriptionTextarea = document.createElement('textarea');
      descriptionTextarea.id = 'nodeDescriptionTextarea';
      descriptionTextarea.className = 'description-textarea';
      descriptionTextarea.placeholder = 'Añade una descripción personalizada...';
      descriptionTextarea.value = this.currentNode.description || '';
      descriptionTextarea.rows = 3;
      
      nodeDescriptionContainer.appendChild(descriptionTextarea);
      nodeDescriptionGroup.style.display = 'block';
    }

    // Contenedor de inputs
    const inputPropertiesContainer = document.getElementById('inputProperties');
    if (!inputPropertiesContainer) return;

    inputPropertiesContainer.innerHTML = '';

    // Agregar controles +/- para nodos multi-input
    const multiInputTypes = ['add', 'multiply', 'and', 'or', 'concat', 'max', 'min'];
    if (multiInputTypes.includes(this.currentNode.type)) {
      this.renderPinControls(inputPropertiesContainer);
    }

    // Si el nodo no tiene inputs, mostrar OUTPUT editable (para nodos de entrada)
    if (this.currentNode.inputs.length === 0 && this.currentNode.outputs.length > 0) {
      this.currentNode.outputs.forEach((pin, index) => {
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

    // Guardar el título personalizado
    const titleInput = document.getElementById('nodeTitleInput') as HTMLInputElement;
    if (titleInput) {
      const newTitle = titleInput.value.trim();
      // Si está vacío, resetear a null para usar el título por defecto
      this.currentNode.customTitle = newTitle || null;
    }

    // Guardar la descripción personalizada
    const descriptionTextarea = document.getElementById('nodeDescriptionTextarea') as HTMLTextAreaElement;
    if (descriptionTextarea) {
      const newDescription = descriptionTextarea.value.trim();
      // Si está vacío, resetear a null para usar la descripción por defecto
      this.currentNode.customDescription = newDescription || null;
    }

    if (this.currentNode!.inputs.length === 0 && this.currentNode!.outputs.length > 0) {
      // Editar OUTPUT si no hay inputs
      this.inputElements.forEach((inputElement, pinIndex) => {
        const pin = this.currentNode!.outputs[pinIndex];
        if (!pin) return;
        switch (pin.type) {
          case PinType.Number:
            if (inputElement.value.trim() === '') {
              // Si el campo está vacío, NO modificar el valor
              break;
            }
            const numValue = parseFloat(inputElement.value);
            pin.value = isNaN(numValue) ? pin.value : numValue;
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
    } else {
      // Editar inputs normalmente
      this.inputElements.forEach((inputElement, pinIndex) => {
        const pin = this.currentNode!.inputs[pinIndex];
        if (!pin) return;
        switch (pin.type) {
          case PinType.Number:
            if (inputElement.value.trim() === '') {
              // Si el campo está vacío, NO modificar el valor
              break;
            }
            const numValue = parseFloat(inputElement.value);
            pin.value = isNaN(numValue) ? pin.value : numValue;
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
    }

    console.log('✅ Propiedades aplicadas:', {
      node: this.currentNode.title,
      description: this.currentNode.description,
      inputs: this.currentNode.inputs.map(p => ({ name: p.name, value: p.value })),
      outputs: this.currentNode.outputs.map(p => ({ name: p.name, value: p.value }))
    });

    // ✅ FIX: Ejecutar computeAll para propagar los cambios inmediatamente
    if (this.editor) {
      console.log('🔄 Propagando cambios a nodos conectados...');
      this.editor.computeAll();
    }

    this.hide();
  }

  /**
   * Renderiza controles +/- para añadir/quitar inputs dinámicamente
   */
  private renderPinControls(container: HTMLElement) {
    if (!this.currentNode) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
      display: flex;
      gap: 10px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      margin-bottom: 15px;
      align-items: center;
    `;

    // Botón + (Añadir input)
    const addButton = document.createElement('button');
    addButton.textContent = '➕ Añadir Input';
    addButton.style.cssText = `
      flex: 1;
      padding: 8px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    `;
    addButton.onclick = () => {
      if (this.currentNode) {
        this.currentNode.addExtraInputs(this.currentNode.inputs.length + 1);
        this.renderProperties(); // Refrescar la UI
        console.log(`✅ Input añadido. Total inputs: ${this.currentNode.inputs.length}`);
      }
    };

    // Botón - (Quitar input)
    const removeButton = document.createElement('button');
    removeButton.textContent = '➖ Quitar Input';
    removeButton.disabled = this.currentNode.inputs.length <= 2;
    removeButton.style.cssText = `
      flex: 1;
      padding: 8px;
      background: ${this.currentNode.inputs.length <= 2 ? '#6c757d' : '#dc3545'};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: ${this.currentNode.inputs.length <= 2 ? 'not-allowed' : 'pointer'};
      font-weight: 600;
      opacity: ${this.currentNode.inputs.length <= 2 ? '0.5' : '1'};
    `;
    removeButton.onclick = () => {
      if (this.currentNode && this.currentNode.removeLastInput()) {
        this.renderProperties(); // Refrescar la UI
      }
    };

    // Info de inputs actuales
    const infoSpan = document.createElement('span');
    infoSpan.textContent = `${this.currentNode.inputs.length} inputs`;
    infoSpan.style.cssText = `
      color: #aaa;
      font-size: 12px;
      white-space: nowrap;
    `;

    controlsDiv.appendChild(addButton);
    controlsDiv.appendChild(removeButton);
    controlsDiv.appendChild(infoSpan);

    container.appendChild(controlsDiv);
  }

  /**
   * Obtiene el nodo actualmente en edición
   */
  public getCurrentNode(): Node | null {
    return this.currentNode;
  }
}
