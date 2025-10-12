import { NodeDefinition, PinType, PinMode } from '../types/types';

export const NodeTypes: { [key: string]: NodeDefinition } = {
    "condition": {
        type: "condition",
        category: "logic",
        title: "Condition (>10)",
        inputs: [{
            name: "value",
            type: PinType.Number,
            mode: PinMode.Input,
            defaultValue: 0
        }],
        outputs: [
            { name: "true", type: PinType.Boolean, mode: PinMode.Output },
            { name: "false", type: PinType.Boolean, mode: PinMode.Output }
        ],
        compute: (inputs: any[]) => [inputs[0] > 10, inputs[0] <= 10]
    },
    "number": {
        type: "number",
        category: "input",
        title: "Number",
        inputs: [],
        outputs: [{
            name: "value",
            type: PinType.Number,
            mode: PinMode.Output,
            defaultValue: 0
        }],
        compute: (inputs: any[], node: any) => {
            // Mantener el valor actual del output, no sobrescribir
            return [node.outputs[0].value];
        }
    },

    "boolean": {
        type: "boolean",
        category: "input",
        title: "Boolean",
        inputs: [],
        outputs: [{
            name: "value",
            type: PinType.Boolean,
            mode: PinMode.Output,
            defaultValue: false
        }],
        compute: (inputs: any[], node: any) => {
            // Mantener el valor actual del output, no sobrescribir
            return [node.outputs[0].value];
        }
    },

    "display": {
        type: "display",
        category: "output",
        title: "Display",
        inputs: [{
            name: "value",
            type: PinType.Custom,
            mode: PinMode.Input
        }],
        outputs: [],
        compute: (inputs: any[]) => []
    },

    "and": {
        type: "and",
        category: "logic",
        title: "AND",
        inputs: [
            {
                name: "A",
                type: PinType.Boolean,
                mode: PinMode.Input,
                defaultValue: false
            },
            {
                name: "B",
                type: PinType.Boolean,
                mode: PinMode.Input,
                defaultValue: false
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Boolean,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            // Soporta inputs dinámicos: si hay más de 2, evalúa todos con AND
            if (inputs.length > 2) {
                return [inputs.every(val => val ?? false)];
            }
            return [inputs[0] && inputs[1]];
        }
    },

    "or": {
        type: "or",
        category: "logic",
        title: "OR",
        inputs: [
            {
                name: "A",
                type: PinType.Boolean,
                mode: PinMode.Input,
                defaultValue: false
            },
            {
                name: "B",
                type: PinType.Boolean,
                mode: PinMode.Input,
                defaultValue: false
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Boolean,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            // Soporta inputs dinámicos: si hay más de 2, evalúa todos con OR
            if (inputs.length > 2) {
                return [inputs.some(val => val ?? false)];
            }
            return [inputs[0] || inputs[1]];
        }
    },

    "not": {
        type: "not",
        category: "logic",
        title: "NOT",
        inputs: [{
            name: "input",
            type: PinType.Boolean,
            mode: PinMode.Input,
            defaultValue: false
        }],
        outputs: [{
            name: "result",
            type: PinType.Boolean,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => [!inputs[0]]
    },

    "greater": {
        type: "greater",
        category: "comparison",
        title: ">",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Boolean,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => [inputs[0] > inputs[1]]
    },

    "equals": {
        type: "equals",
        category: "comparison",
        title: "==",
        inputs: [
            {
                name: "A",
                type: PinType.Custom,
                mode: PinMode.Input
            },
            {
                name: "B",
                type: PinType.Custom,
                mode: PinMode.Input
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Boolean,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => [inputs[0] === inputs[1]]
    },

    // ===== NODOS MATEMÁTICOS =====
    "add": {
        type: "add",
        category: "math",
        title: "Add (+)",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            // Soporta inputs dinámicos: si hay más de 2, los suma todos
            if (inputs.length > 2) {
                return [inputs.reduce((sum, val) => sum + (val ?? 0), 0)];
            }
            return [(inputs[0] ?? 0) + (inputs[1] ?? 0)];
        }
    },

    "subtract": {
        type: "subtract",
        category: "math",
        title: "Subtract (-)",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => [(inputs[0] ?? 0) - (inputs[1] ?? 0)]
    },

    "multiply": {
        type: "multiply",
        category: "math",
        title: "Multiply (×)",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 1
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 1
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            // Soporta inputs dinámicos: si hay más de 2, los multiplica todos
            if (inputs.length > 2) {
                return [inputs.reduce((product, val) => product * (val ?? 1), 1)];
            }
            return [(inputs[0] ?? 1) * (inputs[1] ?? 1)];
        }
    },

    "divide": {
        type: "divide",
        category: "math",
        title: "Divide (÷)",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 1
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 1
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            const a = inputs[0] ?? 1;
            const b = inputs[1] ?? 1;
            return [b !== 0 ? a / b : 0]; // Evitar división por cero
        }
    },

    "modulo": {
        type: "modulo",
        category: "math",
        title: "Modulo (%)",
        inputs: [
            {
                name: "A",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 0
            },
            {
                name: "B",
                type: PinType.Number,
                mode: PinMode.Input,
                defaultValue: 1
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            const a = inputs[0] ?? 0;
            const b = inputs[1] ?? 1;
            return [b !== 0 ? a % b : 0]; // Evitar módulo por cero
        }
    },

    // ===== NODOS DE STRINGS =====
    "string": {
        type: "string",
        category: "input",
        title: "String",
        inputs: [],
        outputs: [{
            name: "value",
            type: PinType.Custom,
            mode: PinMode.Output,
            defaultValue: "Hello"
        }],
        compute: (inputs: any[], node: any) => {
            // Mantener el valor actual del output, no sobrescribir
            return [node.outputs[0].value];
        }
    },

    "concat": {
        type: "concat",
        category: "string",
        title: "Concat",
        inputs: [
            {
                name: "A",
                type: PinType.Custom,
                mode: PinMode.Input,
                defaultValue: ""
            },
            {
                name: "B",
                type: PinType.Custom,
                mode: PinMode.Input,
                defaultValue: ""
            }
        ],
        outputs: [{
            name: "result",
            type: PinType.Custom,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            // Soporta inputs dinámicos: si hay más de 2, concatena todos
            if (inputs.length > 2) {
                return [inputs.map(val => (val ?? "").toString()).join("")];
            }
            const a = inputs[0] ?? "";
            const b = inputs[1] ?? "";
            return [a.toString() + b.toString()];
        }
    },

    "length": {
        type: "length",
        category: "string",
        title: "Length",
        inputs: [{
            name: "text",
            type: PinType.Custom,
            mode: PinMode.Input,
            defaultValue: ""
        }],
        outputs: [{
            name: "length",
            type: PinType.Number,
            mode: PinMode.Output
        }],
        compute: (inputs: any[]) => {
            const text = inputs[0] ?? "";
            return [text.toString().length];
        }
    }
};
