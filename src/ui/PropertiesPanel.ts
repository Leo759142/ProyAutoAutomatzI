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

    // Renderizar cada input como propiedad editable
    if (this.currentNode.inputs.length > 0) {
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
        input.dataset.pinType = 'input';
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

    // Renderizar outputs editables (para nodos de entrada y nodos especiales como Task)
    if (this.currentNode.outputs.length > 0) {
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
        input.dataset.pinType = 'output';
        // Usar índice desplazado para outputs para evitar conflictos
        this.inputElements.set(1000 + index, input);

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

    // ========== SECCIÓN PERT PARA NODOS TASK ==========
    // Renderizar campos de estimación PERT si es un nodo task
    if (this.currentNode && this.currentNode.type === 'task') {
      this.renderPertEstimations(inputPropertiesContainer);
    }
  }

  /**
   * Renderiza los campos de estimación PERT (optimista, más probable, pesimista)
   */
  private renderPertEstimations(container: HTMLElement) {
    if (!this.currentNode) return;

    const pertSection = document.createElement('div');
    pertSection.className = 'pert-estimation-section';
    pertSection.style.cssText = `
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid rgba(255, 255, 255, 0.1);
    `;

    const pertTitle = document.createElement('h4');
    pertTitle.innerHTML = '📊 Estimaciones PERT (Opcional)';
    pertTitle.style.cssText = `
      margin: 0 0 10px 0;
      color: #4CAF50;
      font-size: 14px;
      font-weight: 600;
    `;
    pertSection.appendChild(pertTitle);

    const pertDescription = document.createElement('p');
    pertDescription.textContent = 'Configura tres estimaciones de tiempo para análisis de varianza:';
    pertDescription.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 12px;
      opacity: 0.7;
      line-height: 1.4;
    `;
    pertSection.appendChild(pertDescription);

    // Inicializar pertData si no existe
    if (!this.currentNode.pertData) {
      this.currentNode.pertData = {};
    }

    const pertData = this.currentNode.pertData;

    // Campo Optimista
    const optimisticGroup = this.createPertField(
      'optimistic',
      '⚡ Tiempo Optimista (O):',
      pertData.optimistic,
      'Mejor escenario posible'
    );
    pertSection.appendChild(optimisticGroup);

    // Campo Más Probable
    const mostLikelyGroup = this.createPertField(
      'mostLikely',
      '🎯 Tiempo Más Probable (M):',
      pertData.mostLikely,
      'Escenario más realista'
    );
    pertSection.appendChild(mostLikelyGroup);

    // Campo Pesimista
    const pessimisticGroup = this.createPertField(
      'pessimistic',
      '🐌 Tiempo Pesimista (P):',
      pertData.pessimistic,
      'Peor escenario esperado'
    );
    pertSection.appendChild(pessimisticGroup);

    // Sección de valores calculados
    const calculatedSection = document.createElement('div');
    calculatedSection.className = 'pert-calculated';
    calculatedSection.style.cssText = `
      margin-top: 15px;
      padding: 10px;
      background: rgba(76, 175, 80, 0.1);
      border-radius: 6px;
      border-left: 3px solid #4CAF50;
    `;

    const calculatedTitle = document.createElement('div');
    calculatedTitle.innerHTML = '<strong>📐 Valores Calculados:</strong>';
    calculatedTitle.style.cssText = `
      margin-bottom: 8px;
      font-size: 13px;
      color: #4CAF50;
    `;
    calculatedSection.appendChild(calculatedTitle);

    // Calcular valores si hay datos completos
    this.updatePertCalculations(calculatedSection);

    pertSection.appendChild(calculatedSection);
    container.appendChild(pertSection);

    // Agregar listeners para recalcular cuando cambien los valores
    ['optimistic', 'mostLikely', 'pessimistic'].forEach(field => {
      const input = container.querySelector(`input[data-pert-field="${field}"]`) as HTMLInputElement;
      if (input) {
        input.addEventListener('input', () => {
          this.updatePertCalculations(calculatedSection);
        });
      }
    });
  }

  /**
   * Crea un campo de entrada PERT
   */
  private createPertField(fieldName: string, label: string, value: number | undefined, hint: string): HTMLElement {
    const group = document.createElement('div');
    group.className = 'property-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const inputDiv = document.createElement('div');
    inputDiv.className = 'property-input';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.1';
    input.value = value !== undefined ? value.toString() : '';
    input.placeholder = 'Ej: 5';
    input.dataset.pertField = fieldName;
    input.style.width = '100%';
    inputDiv.appendChild(input);

    const hintEl = document.createElement('div');
    hintEl.className = 'input-hint';
    hintEl.textContent = hint;
    inputDiv.appendChild(hintEl);

    group.appendChild(inputDiv);
    return group;
  }

  /**
   * Actualiza los cálculos PERT mostrados
   */
  private updatePertCalculations(container: HTMLElement) {
    // Obtener valores actuales de los inputs
    const optimisticInput = document.querySelector('input[data-pert-field="optimistic"]') as HTMLInputElement;
    const mostLikelyInput = document.querySelector('input[data-pert-field="mostLikely"]') as HTMLInputElement;
    const pessimisticInput = document.querySelector('input[data-pert-field="pessimistic"]') as HTMLInputElement;

    if (!optimisticInput || !mostLikelyInput || !pessimisticInput) return;

    const O = parseFloat(optimisticInput.value);
    const M = parseFloat(mostLikelyInput.value);
    const P = parseFloat(pessimisticInput.value);

    // Limpiar contenido previo (excepto el título)
    const title = container.querySelector('div:first-child');
    container.innerHTML = '';
    if (title) container.appendChild(title);

    if (!isNaN(O) && !isNaN(M) && !isNaN(P) && O >= 0 && M >= 0 && P >= 0) {
      // Validar que O <= M <= P
      if (O > M || M > P) {
        const warning = document.createElement('div');
        warning.innerHTML = '⚠️ <em>Se esperaba: Optimista ≤ Más Probable ≤ Pesimista</em>';
        warning.style.cssText = 'color: #FFA726; font-size: 12px; margin-top: 5px;';
        container.appendChild(warning);
        return;
      }

      // Fórmula PERT: TE = (O + 4M + P) / 6
      const expectedTime = (O + 4 * M + P) / 6;

      // Fórmula de varianza: σ² = ((P - O) / 6)²
      const variance = Math.pow((P - O) / 6, 2);

      // Desviación estándar: σ = √(varianza)
      const stdDev = Math.sqrt(variance);

      // Mostrar resultados
      const results = document.createElement('div');
      results.style.cssText = 'font-size: 12px; line-height: 1.8;';
      results.innerHTML = `
        <div><strong>Tiempo Esperado (TE):</strong> ${expectedTime.toFixed(2)} unidades</div>
        <div><strong>Varianza (σ²):</strong> ${variance.toFixed(4)}</div>
        <div><strong>Desviación Estándar (σ):</strong> ${stdDev.toFixed(2)} unidades</div>
        <div style="margin-top: 8px; opacity: 0.7; font-size: 11px;">
          <em>Fórmula: TE = (O + 4M + P) / 6</em><br>
          <em>Varianza: ((P - O) / 6)²</em>
        </div>
      `;
      container.appendChild(results);
    } else {
      const placeholder = document.createElement('div');
      placeholder.innerHTML = '<em>Completa los tres campos para ver los cálculos</em>';
      placeholder.style.cssText = 'opacity: 0.5; font-size: 12px; font-style: italic;';
      container.appendChild(placeholder);
    }
  }

  /**
   * Crea el elemento input apropiado según el tipo
   */
  private createInputElement(pinType: PinType, currentValue: any): HTMLInputElement {
    const input = document.createElement('input');

    switch (pinType) {
      case PinType.Number:
        input.type = 'text';
        input.inputMode = 'decimal';
        input.autocomplete = 'off';
        input.autocapitalize = 'none';
        input.spellcheck = false;
        input.placeholder = 'Ej: 5, 3.5 o 2/3';
        input.value = this.formatNumberValue(currentValue);
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
        return 'Ingresa un valor numérico (decimales o fracciones como 2/3)';
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

  private formatNumberValue(value: any): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const normalized = Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(6));
      return normalized.toString();
    }

    const stringValue = value.toString().trim();
    return stringValue;
  }

  private parseNumericValue(rawValue: string): number | null {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return null;
    }

    const normalized = trimmed.replace(',', '.');

    const mixedMatch = normalized.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1], 10);
      const numerator = parseInt(mixedMatch[2], 10);
      const denominator = parseInt(mixedMatch[3], 10);
      if (Number.isNaN(whole) || Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0) {
        return null;
      }
      const fraction = numerator / denominator;
      return whole >= 0 ? whole + fraction : whole - fraction;
    }

    const fractionMatch = normalized.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
    if (fractionMatch) {
      const numerator = parseFloat(fractionMatch[1]);
      const denominator = parseFloat(fractionMatch[2]);
      if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator === 0) {
        return null;
      }
      return numerator / denominator;
    }

    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
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

    // Procesar todos los elementos de input (tanto inputs como outputs)
    this.inputElements.forEach((inputElement, key) => {
      const pinType = inputElement.dataset.pinType;
      const pinIndex = parseInt(inputElement.dataset.pinIndex || '0');
      
      let pin = null;
      if (pinType === 'output') {
        // Es un output (key >= 1000)
        pin = this.currentNode!.outputs[pinIndex];
      } else {
        // Es un input
        pin = this.currentNode!.inputs[pinIndex];
      }
      
      if (!pin) return;
      
      // Aplicar el valor según el tipo
      switch (pin.type) {
        case PinType.Number:
          if (inputElement.value.trim() === '') {
            // Si el campo está vacío, NO modificar el valor
            break;
          }
          const parsedValue = this.parseNumericValue(inputElement.value);
          if (parsedValue !== null) {
            pin.value = parsedValue;
          }
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

    // ========== GUARDAR DATOS PERT PARA NODOS TASK ==========
    if (this.currentNode.type === 'task') {
      const optimisticInput = document.querySelector('input[data-pert-field="optimistic"]') as HTMLInputElement;
      const mostLikelyInput = document.querySelector('input[data-pert-field="mostLikely"]') as HTMLInputElement;
      const pessimisticInput = document.querySelector('input[data-pert-field="pessimistic"]') as HTMLInputElement;

      if (optimisticInput && mostLikelyInput && pessimisticInput) {
        const O = parseFloat(optimisticInput.value);
        const M = parseFloat(mostLikelyInput.value);
        const P = parseFloat(pessimisticInput.value);

        // Si hay valores válidos, guardarlos
        if (!isNaN(O) && !isNaN(M) && !isNaN(P) && O >= 0 && M >= 0 && P >= 0) {
          if (!this.currentNode.pertData) {
            this.currentNode.pertData = {};
          }
          
          this.currentNode.pertData.optimistic = O;
          this.currentNode.pertData.mostLikely = M;
          this.currentNode.pertData.pessimistic = P;

          console.log('📊 Datos PERT guardados:', {
            optimistic: O,
            mostLikely: M,
            pessimistic: P
          });
        } else if (optimisticInput.value === '' && mostLikelyInput.value === '' && pessimisticInput.value === '') {
          // Si todos los campos están vacíos, limpiar pertData
          if (this.currentNode.pertData) {
            delete this.currentNode.pertData.optimistic;
            delete this.currentNode.pertData.mostLikely;
            delete this.currentNode.pertData.pessimistic;
            delete this.currentNode.pertData.expectedTime;
            delete this.currentNode.pertData.variance;
            delete this.currentNode.pertData.stdDev;
          }
          console.log('🗑️ Datos PERT eliminados');
        }
      }
    }

    console.log('✅ Propiedades aplicadas:', {
      node: this.currentNode.title,
      description: this.currentNode.description,
      inputs: this.currentNode.inputs.map(p => ({ name: p.name, value: p.value })),
      outputs: this.currentNode.outputs.map(p => ({ name: p.name, value: p.value })),
      pertData: this.currentNode.pertData
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
