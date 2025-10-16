import { Vec2, PinType, PinMode, NodeDefinition, PinDefinition } from '../types/types';
import { NodeTypes } from './NodeTypes';
import { DraggableNode } from './DraggableNode';

export class Pin {
  pos: Vec2 = new Vec2();
  isSet: boolean = false;
  userData: any = null;
  value: any;

  constructor(
    public parent: Node,
    public definition: PinDefinition,
    public index: number
  ) {
    this.value = definition.defaultValue;
  }

  get isInput(): boolean {
    return this.definition.mode === PinMode.Input;
  }

  get name(): string {
    return this.definition.name;
  }

  get type(): PinType {
    return this.definition.type;
  }
}

/**
 * Datos PERT para nodos task
 */
export interface PertData {
  optimistic?: number;      // Tiempo optimista (O)
  mostLikely?: number;      // Tiempo más probable (M)
  pessimistic?: number;     // Tiempo pesimista (P)
  expectedTime?: number;    // Tiempo esperado calculado: (O + 4M + P) / 6
  variance?: number;        // Varianza calculada: ((P - O) / 6)²
  stdDev?: number;          // Desviación estándar: √variance
}

export class Node {
  pos: Vec2 = new Vec2();
  selected: boolean = false;
  userData: any = null;
  inputs: Pin[] = [];
  outputs: Pin[] = [];
  size: Vec2;
  private draggable: DraggableNode;
  // Animación para ConditionNode
  public highlightUntil: number = 0;
  // Highlight para ejecución paso a paso
  public stepHighlight: boolean = false;
  // Título personalizado editable por el usuario
  public customTitle: string | null = null;
  // Descripción personalizada editable por el usuario
  public customDescription: string | null = null;
  // Datos PERT para análisis de varianza (solo para nodos task)
  public pertData?: PertData;

  constructor(private definition: NodeDefinition) {
  // Tamaño base aumentado para mejor visibilidad
  this.size = new Vec2(3.5, Math.max(2.0, Math.max(definition.inputs.length, definition.outputs.length) * 1.0));
    
    // Initialize pins
    definition.inputs.forEach((pinDef, index) => {
      this.inputs.push(new Pin(this, pinDef, index));
    });

    definition.outputs.forEach((pinDef, index) => {
      this.outputs.push(new Pin(this, pinDef, index));
    });

    // Initialize draggable behavior
    this.draggable = new DraggableNode(this.pos, (newPos: Vec2) => {
      this.pos = newPos;
    });
  }

  setPosition(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
  }

  startDrag(mouseX: number, mouseY: number) {
    this.draggable.startDrag(mouseX, mouseY);
  }

  drag(mouseX: number, mouseY: number, bounds?: { min: Vec2, max: Vec2 }) {
    this.draggable.drag(mouseX, mouseY, bounds);
  }

  endDrag() {
    this.draggable.endDrag();
  }

  get title(): string {
    // Si hay un título personalizado, usarlo; sino, usar el del template
    return this.customTitle !== null ? this.customTitle : this.definition.title;
  }

  get subtitle(): string | undefined {
    return this.definition.subtitle;
  }

  get description(): string | undefined {
    // Si hay una descripción personalizada, usarla; sino, usar la del template
    return this.customDescription !== null ? this.customDescription : this.definition.description;
  }

  get type(): string {
    return this.definition.type;
  }

  compute() {
    if (this.definition.compute) {
      const inputValues = this.inputs.map(pin => pin.value);
      const outputValues = this.definition.compute(inputValues, this);
      // Solo actualizar outputs si hay valores retornados
      if (outputValues && outputValues.length > 0) {
        this.outputs.forEach((pin, index) => {
          if (index < outputValues.length && outputValues[index] !== undefined) {
            pin.value = outputValues[index];
          }
        });
      }
    }
  }

  /**
   * Añade pins de input adicionales al nodo (para operadores multi-input)
   * @param count - Número total de inputs que debe tener el nodo
   */
  public addExtraInputs(count: number) {
    const currentInputs = this.inputs.length;
    if (count <= currentInputs) return; // Ya tiene suficientes
    
    // Obtener el último input como plantilla
    const lastInput = this.definition.inputs[this.definition.inputs.length - 1];
    if (!lastInput) return;
    
    // Nombres de letras para inputs adicionales
    const letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    
    // Añadir inputs adicionales
    for (let i = currentInputs; i < count; i++) {
      const letterIndex = i - 2; // C es el índice 0 (después de A y B)
      const newPinDef: PinDefinition = {
        name: letterIndex < letters.length ? letters[letterIndex] : `In${i}`,
        type: lastInput.type,
        mode: PinMode.Input,
        defaultValue: lastInput.defaultValue
      };
      this.inputs.push(new Pin(this, newPinDef, i));
    }
    
    // Ajustar tamaño del nodo
    this.size = new Vec2(3.5, Math.max(2.0, Math.max(this.inputs.length, this.outputs.length) * 1.0));
  }

  /**
   * Elimina el último pin de input si no está conectado
   * @returns true si se eliminó, false si no se pudo eliminar
   */
  public removeLastInput(): boolean {
    // No permitir eliminar si solo quedan 2 inputs (mínimo)
    if (this.inputs.length <= 2) {
      console.warn('⚠️ No se puede eliminar: el nodo debe tener al menos 2 inputs');
      return false;
    }
    
    const lastPin = this.inputs[this.inputs.length - 1];
    
    // Verificar si el pin está conectado
    if (lastPin.userData !== null && lastPin.userData !== undefined) {
      console.warn('⚠️ No se puede eliminar: el pin está conectado');
      return false;
    }
    
    // Eliminar el pin
    this.inputs.pop();
    
    // Ajustar tamaño del nodo
    this.size = new Vec2(3.5, Math.max(2.0, Math.max(this.inputs.length, this.outputs.length) * 1.0));
    
    console.log(`✅ Pin eliminado. Inputs restantes: ${this.inputs.length}`);
    return true;
  }

  static create(type: string, x: number, y: number, extraInputs?: number): Node | null {
    // Búsqueda directa del tipo
    const definition = NodeTypes[type];
    
    if (!definition) {
      console.warn(`No se encontró definición para el tipo de nodo: ${type}`);
      console.log('Tipos disponibles:', Object.keys(NodeTypes));
      return null;
    }

    const node = new Node(definition);
    node.setPosition(x, y);
    
    // Si se especifican inputs extras, agregarlos
    if (extraInputs && extraInputs > definition.inputs.length) {
      node.addExtraInputs(extraInputs);
    }
    
    return node;
  }
}