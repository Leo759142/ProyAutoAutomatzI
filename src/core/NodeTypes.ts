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
        compute: (inputs: any[]) => [inputs[0] && inputs[1]]
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
        compute: (inputs: any[]) => [inputs[0] || inputs[1]]
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
    }
};
