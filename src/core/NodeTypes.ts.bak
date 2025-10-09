import { NodeDefinition, PinType, PinMode } from '../types/types';

export const NodeTypes: { [key: string]: NodeDefinition } = {
  // Nodo de entrada numérica
  'number': {
    type: 'number',
    category: 'input',
    title: 'Number',
    inputs: [],
    outputs: [{
      name: 'value',
      type: PinType.Number,
      mode: PinMode.Output,
      defaultValue: 0
    }],
    compute: () => [0] // El valor real se actualiza por la UI
  },

  // Nodo de entrada booleana
  'boolean': {
    type: 'boolean',
    category: 'input',
    title: 'Boolean',
    inputs: [],
    outputs: [{
      name: 'value',
      type: PinType.Boolean,
      mode: PinMode.Output,
      defaultValue: false
    }],
    compute: () => [false] // El valor real se actualiza por la UI
  },

  // Nodo de visualización
  'display': {
    type: 'display',
    category: 'output',
    title: 'Display',
    inputs: [{
      name: 'value',
      type: PinType.Custom, // Acepta cualquier tipo
      mode: PinMode.Input
    }],
    outputs: [],
    compute: (inputs: any[]) => [] // Solo muestra el valor, no produce salidas
  },

  // Operación AND
  'and': {
    type: 'and',
    category: 'logic',
    title: 'AND',
    inputs: [
      {
        name: 'A',
        type: PinType.Boolean,
        mode: PinMode.Input,
        defaultValue: false
      },
      {
        name: 'B',
        type: PinType.Boolean,
        mode: PinMode.Input,
        defaultValue: false
      }
    ],
    outputs: [{
      name: 'result',
      type: PinType.Boolean,
      mode: PinMode.Output
    }],
    compute: (inputs: any[]) => [inputs[0] && inputs[1]]
  },

  // Operación OR
  'or': {
    type: 'or',
    category: 'logic',
    title: 'OR',
    inputs: [
      {
        name: 'A',
        type: PinType.Boolean,
        mode: PinMode.Input,
        defaultValue: false
      },
      {
        name: 'B',
        type: PinType.Boolean,
        mode: PinMode.Input,
        defaultValue: false
      }
    ],
    outputs: [{
      name: 'result',
      type: PinType.Boolean,
      mode: PinMode.Output
    }],
    compute: (inputs: any[]) => [inputs[0] || inputs[1]]
  },

  // Operación NOT
  'not': {
    type: 'not',
    category: 'logic',
    title: 'NOT',
    inputs: [{
      name: 'input',
      type: PinType.Boolean,
      mode: PinMode.Input,
      defaultValue: false
    }],
    outputs: [{
      name: 'result',
      type: PinType.Boolean,
      mode: PinMode.Output
    }],
    compute: (inputs: any[]) => [!inputs[0]]
  },

  // Comparación mayor que
  'greater': {
    type: 'greater',
    category: 'comparison',
    title: '>',
    inputs: [
      {
        name: 'A',
        type: PinType.Number,
        mode: PinMode.Input,
        defaultValue: 0
      },
      {
        name: 'B',
        type: PinType.Number,
        mode: PinMode.Input,
        defaultValue: 0
      }
    ],
    outputs: [{
      name: 'result',
      type: PinType.Boolean,
      mode: PinMode.Output
    }],
    compute: (inputs: any[]) => [inputs[0] > inputs[1]]
  },

  // Comparación igual
  'equals': {
    type: 'equals',
    category: 'comparison',
    title: '==',
    inputs: [
      {
        name: 'A',
        type: PinType.Custom,
        mode: PinMode.Input
      },
      {
        name: 'B',
        type: PinType.Custom,
        mode: PinMode.Input
      }
    ],
    outputs: [{
      name: 'result',
      type: PinType.Boolean,
      mode: PinMode.Output
    }],
    compute: (inputs: any[]) => [inputs[0] === inputs[1]]
  },
  'input/number': {
    type: 'input/number',
    category: 'Input',
    title: 'Number Input',
    inputs: [],
    outputs: [
      { 
        name: 'Value', 
        type: PinType.Number, 
        mode: PinMode.Output,
        defaultValue: 0 
      }
    ]
  },

  'output/display': {
    type: 'output/display',
    category: 'Output',
    title: 'Display',
    inputs: [
      { 
        name: 'Value', 
        type: PinType.Number, 
        mode: PinMode.Input 
      }
    ],
    outputs: [],
    compute: (inputs: any[]) => {
      // Solo muestra el valor
      return [];
    }
  },

  'math/add': {
    type: 'math/add',
    category: 'Math',
    title: 'Add (+)',
    inputs: [
      { 
        name: 'A', 
        type: PinType.Number, 
        mode: PinMode.Input,
        defaultValue: 0 
      },
      { 
        name: 'B', 
        type: PinType.Number, 
        mode: PinMode.Input,
        defaultValue: 0 
      }
    ],
    outputs: [
      { 
        name: 'Result', 
        type: PinType.Number, 
        mode: PinMode.Output 
      }
    ],
    compute: (inputs: any[]) => {
      const a = Number(inputs[0]) || 0;
      const b = Number(inputs[1]) || 0;
      return [a + b];
    }
  },

  'math/multiply': {
    type: 'math/multiply',
    category: 'Math',
    title: 'Multiply',
    inputs: [
      { name: 'A', type: PinType.Number, mode: PinMode.Input },
      { name: 'B', type: PinType.Number, mode: PinMode.Input }
    ],
    outputs: [
      { name: 'Result', type: PinType.Number, mode: PinMode.Output }
    ],
    compute: (inputs: any[]) => [inputs[0] * inputs[1]]
  },

  // Logic Operations
  'logic/and': {
    type: 'logic/and',
    category: 'Logic',
    title: 'AND',
    inputs: [
      { name: 'A', type: PinType.Boolean, mode: PinMode.Input },
      { name: 'B', type: PinType.Boolean, mode: PinMode.Input }
    ],
    outputs: [
      { name: 'Result', type: PinType.Boolean, mode: PinMode.Output }
    ],
    compute: (inputs: any[]) => [inputs[0] && inputs[1]]
  },

  'logic/or': {
    type: 'logic/or',
    category: 'Logic',
    title: 'OR',
    inputs: [
      { name: 'A', type: PinType.Boolean, mode: PinMode.Input },
      { name: 'B', type: PinType.Boolean, mode: PinMode.Input }
    ],
    outputs: [
      { name: 'Result', type: PinType.Boolean, mode: PinMode.Output }
    ],
    compute: (inputs: any[]) => [inputs[0] || inputs[1]]
  },

  // Data Operations
  'data/number': {
    type: 'data/number',
    category: 'Data',
    title: 'Number',
    inputs: [],
    outputs: [
      { name: 'Value', type: PinType.Number, mode: PinMode.Output, defaultValue: 0 }
    ]
  },

  'data/string': {
    type: 'data/string',
    category: 'Data',
    title: 'String',
    inputs: [],
    outputs: [
      { name: 'Value', type: PinType.String, mode: PinMode.Output, defaultValue: '' }
    ]
  },

  // Vector Operations
  'vector/create': {
    type: 'vector/create',
    category: 'Vector',
    title: 'Create Vector',
    inputs: [
      { name: 'X', type: PinType.Number, mode: PinMode.Input },
      { name: 'Y', type: PinType.Number, mode: PinMode.Input }
    ],
    outputs: [
      { name: 'Vector', type: PinType.Vector, mode: PinMode.Output }
    ]
  },

  'vector/length': {
    type: 'vector/length',
    category: 'Vector',
    title: 'Vector Length',
    inputs: [
      { name: 'Vector', type: PinType.Vector, mode: PinMode.Input }
    ],
    outputs: [
      { name: 'Length', type: PinType.Number, mode: PinMode.Output }
    ]
  }
};