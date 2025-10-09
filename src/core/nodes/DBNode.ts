import { Node } from '../Node';
import { DatabaseService } from '../DatabaseService';

export class DBNode extends Node {
  constructor(definition) {
    super(definition);
  }
  async compute() {
    const db = DatabaseService.getInstance();
    await db.initialize();
    // Ejemplo: guardar el valor en la tabla workflow_templates
    const val = this.inputs[0].value ?? 0;
    const name = `AutoNode_${Date.now()}`;
    const description = `Valor generado: ${val}`;
    const nodes_data = JSON.stringify([{ type: 'db', data: { value: val } }]);
    const connections_data = '[]';
    const result = await db.saveTemplate({ name, description, nodes_data, connections_data });
    this.outputs[0].value = name;
  }
}
