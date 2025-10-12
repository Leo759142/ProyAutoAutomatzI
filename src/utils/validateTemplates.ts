// Script de validación de templates
// Verifica que todos los templates estén bien formados antes de guardarlos en SQLite

import { defaultTemplates } from '../templates/DefaultTemplates';
import { NodeTypes } from '../core/NodeTypes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTemplate(template: any, index: number): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  console.log(`\n🔍 ========== VALIDANDO TEMPLATE ${index + 1}: "${template.name}" ==========`);

  // 1. Validar estructura básica
  if (!template.name) {
    result.errors.push('Template no tiene nombre');
    result.valid = false;
  }

  if (!template.nodes_data) {
    result.errors.push('Template no tiene nodes_data');
    result.valid = false;
    return result;
  }

  if (!template.connections_data) {
    result.errors.push('Template no tiene connections_data');
    result.valid = false;
    return result;
  }

  // 2. Parse JSON
  let nodesData: any[];
  let connectionsData: any[];

  try {
    nodesData = JSON.parse(template.nodes_data);
  } catch (error) {
    result.errors.push(`nodes_data no es JSON válido: ${error}`);
    result.valid = false;
    return result;
  }

  try {
    connectionsData = JSON.parse(template.connections_data);
  } catch (error) {
    result.errors.push(`connections_data no es JSON válido: ${error}`);
    result.valid = false;
    return result;
  }

  console.log(`  📦 ${nodesData.length} nodos, 🔗 ${connectionsData.length} conexiones`);

  // 3. Validar nodos
  const nodeIds = new Set<number>();
  const nodeTypeCount: { [key: string]: number } = {};

  nodesData.forEach((node, i) => {
    // Validar ID
    if (!node.id) {
      result.errors.push(`Nodo ${i + 1} no tiene ID`);
      result.valid = false;
    } else if (nodeIds.has(node.id)) {
      result.errors.push(`ID duplicado: ${node.id}`);
      result.valid = false;
    } else {
      nodeIds.add(node.id);
    }

    // Validar tipo
    if (!node.type) {
      result.errors.push(`Nodo ${node.id || i + 1} no tiene tipo`);
      result.valid = false;
    } else if (!NodeTypes[node.type]) {
      result.errors.push(`Nodo ${node.id}: tipo "${node.type}" no existe en NodeTypes`);
      result.valid = false;
    } else {
      nodeTypeCount[node.type] = (nodeTypeCount[node.type] || 0) + 1;
    }

    // Validar posición
    if (!node.position) {
      result.warnings.push(`Nodo ${node.id} no tiene posición definida`);
    } else {
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        result.errors.push(`Nodo ${node.id}: posición inválida`);
        result.valid = false;
      }
    }

    // Validar data (opcional pero común)
    if (node.data && node.data.value !== undefined) {
      // OK, tiene valor inicial
    }
  });

  console.log(`  📊 Tipos de nodos:`, nodeTypeCount);

  // 4. Validar conexiones
  const validNodeTypes = Object.keys(NodeTypes);
  
  connectionsData.forEach((conn, i) => {
    // Validar estructura
    if (!conn.from || !conn.to) {
      result.errors.push(`Conexión ${i + 1}: estructura inválida (falta from o to)`);
      result.valid = false;
      return;
    }

    // Validar que los nodos existan
    if (!nodeIds.has(conn.from.node)) {
      result.errors.push(`Conexión ${i + 1}: nodo origen ${conn.from.node} no existe`);
      result.valid = false;
    }

    if (!nodeIds.has(conn.to.node)) {
      result.errors.push(`Conexión ${i + 1}: nodo destino ${conn.to.node} no existe`);
      result.valid = false;
    }

    // Validar pins
    if (typeof conn.from.pin !== 'number' || conn.from.pin < 0) {
      result.errors.push(`Conexión ${i + 1}: pin de origen inválido (${conn.from.pin})`);
      result.valid = false;
    }

    if (typeof conn.to.pin !== 'number' || conn.to.pin < 0) {
      result.errors.push(`Conexión ${i + 1}: pin de destino inválido (${conn.to.pin})`);
      result.valid = false;
    }

    // Validar que los pins existan en los nodos
    const fromNode = nodesData.find(n => n.id === conn.from.node);
    const toNode = nodesData.find(n => n.id === conn.to.node);

    if (fromNode && NodeTypes[fromNode.type]) {
      const nodeType = NodeTypes[fromNode.type];
      if (conn.from.pin >= nodeType.outputs.length) {
        result.errors.push(
          `Conexión ${i + 1}: nodo ${conn.from.node} (${fromNode.type}) no tiene output pin ${conn.from.pin} (tiene ${nodeType.outputs.length})`
        );
        result.valid = false;
      }
    }

    if (toNode && NodeTypes[toNode.type]) {
      const nodeType = NodeTypes[toNode.type];
      if (conn.to.pin >= nodeType.inputs.length) {
        result.errors.push(
          `Conexión ${i + 1}: nodo ${conn.to.node} (${toNode.type}) no tiene input pin ${conn.to.pin} (tiene ${nodeType.inputs.length})`
        );
        result.valid = false;
      }
    }
  });

  // 5. Resumen
  if (result.valid) {
    console.log(`  ✅ Template válido`);
  } else {
    console.log(`  ❌ Template INVÁLIDO: ${result.errors.length} errores`);
  }

  if (result.warnings.length > 0) {
    console.log(`  ⚠️ ${result.warnings.length} advertencias`);
  }

  result.errors.forEach(err => console.log(`    ❌ ${err}`));
  result.warnings.forEach(warn => console.log(`    ⚠️ ${warn}`));

  return result;
}

export function validateAllTemplates(): boolean {
  console.log('\n🔍 ========================================');
  console.log('🔍 VALIDACIÓN DE TODOS LOS TEMPLATES');
  console.log('🔍 ========================================\n');

  let allValid = true;
  const results: { name: string; result: ValidationResult }[] = [];

  defaultTemplates.forEach((template, index) => {
    const result = validateTemplate(template, index);
    results.push({ name: template.name, result });
    if (!result.valid) {
      allValid = false;
    }
  });

  console.log('\n📊 ========================================');
  console.log('📊 RESUMEN DE VALIDACIÓN');
  console.log('📊 ========================================\n');
  console.log(`Total de templates: ${defaultTemplates.length}`);
  console.log(`✅ Válidos: ${results.filter(r => r.result.valid).length}`);
  console.log(`❌ Inválidos: ${results.filter(r => !r.result.valid).length}`);

  if (!allValid) {
    console.log('\n❌ TEMPLATES INVÁLIDOS:');
    results
      .filter(r => !r.result.valid)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.result.errors.length} errores`);
      });
  } else {
    console.log('\n✅ TODOS LOS TEMPLATES SON VÁLIDOS');
  }

  return allValid;
}

// Ejecutar validación si se importa este módulo
if (typeof window !== 'undefined') {
  (window as any).validateTemplates = validateAllTemplates;
  console.log('💡 Ejecuta validateTemplates() en la consola para validar todos los templates');
}
