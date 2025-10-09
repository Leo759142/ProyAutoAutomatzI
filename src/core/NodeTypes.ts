import { NodeDefinition, PinType, PinMode } from '../types/types';

export const NodeTypes: { [key: string]: NodeDefinition } = {
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
        compute: () => [0]
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
        compute: () => [false]
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
