-- Templates de workflow para el sistema
-- Estructura profesional: todos los templates en esta carpeta


-- Mejoras aplicadas: JSON en una sola línea, transacción, índice, comentarios

BEGIN TRANSACTION;

-- Template: Comparador Simple
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  'Comparador Simple',
  'Compara dos números con operador mayor que',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-5},"data":{"value":15}},{"id":2,"type":"number","position":{"x":-10,"y":5},"data":{"value":10}},{"id":3,"type":"greater","position":{"x":0,"y":0}},{"id":4,"type":"display","position":{"x":10,"y":0}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":4,"pin":0}}]'
);

-- Template: Operación Lógica AND
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  'Operación Lógica AND',
  'Comparación de números y operación AND',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-7.5},"data":{"value":12}},{"id":2,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":8}},{"id":3,"type":"greater","position":{"x":-5,"y":-5}},{"id":4,"type":"boolean","position":{"x":-10,"y":5},"data":{"value":true}},{"id":5,"type":"and","position":{"x":5,"y":0}},{"id":6,"type":"display","position":{"x":10,"y":0}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":4,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":0}}]'
);

-- Template: Nodo Condicional
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  'Nodo Condicional',
  'Usa el nodo Condition con dos salidas',
  '[{"id":1,"type":"number","position":{"x":-10,"y":0},"data":{"value":15}},{"id":2,"type":"condition","position":{"x":0,"y":0}},{"id":3,"type":"display","position":{"x":10,"y":-4}},{"id":4,"type":"display","position":{"x":10,"y":4}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":2,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":0}}]'
);

-- Template: Operaciones Matemáticas
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  'Operaciones Matemáticas',
  'Demuestra nodos de suma, multiplicación y comparación',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-5},"data":{"value":10}},{"id":2,"type":"number","position":{"x":-10,"y":5},"data":{"value":5}},{"id":3,"type":"add","position":{"x":-5,"y":-2.5}},{"id":4,"type":"multiply","position":{"x":-5,"y":2.5}},{"id":5,"type":"greater","position":{"x":5,"y":0}},{"id":6,"type":"display","position":{"x":10,"y":0}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":1}},{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":4,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":0}}]'
);

-- Template: Manipulación de Strings
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  'Manipulación de Strings',
  'Demuestra concatenación y longitud de strings',
  '[{"id":1,"type":"string","position":{"x":-10,"y":-2.5},"data":{"value":"Hello"}},{"id":2,"type":"string","position":{"x":-10,"y":2.5},"data":{"value":" World!"}},{"id":3,"type":"concat","position":{"x":-5,"y":0}},{"id":4,"type":"length","position":{"x":5,"y":0}},{"id":5,"type":"display","position":{"x":10,"y":-1.25}},{"id":6,"type":"display","position":{"x":10,"y":1.25}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":4,"pin":0},"to":{"node":6,"pin":0}}]'
);

-- Template: TUTORIAL: Mi Primer Flujo
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '🚀 TUTORIAL: Mi Primer Flujo',
  'Ejemplo súper simple: dos números + suma + resultado',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":5}},{"id":2,"type":"number","position":{"x":-10,"y":2.5},"data":{"value":3}},{"id":3,"type":"add","position":{"x":0,"y":0}},{"id":4,"type":"display","position":{"x":10,"y":0}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":3,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":3,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":4,"pin":0}}]'
);

-- Template: Calculadora Completa
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '🧮 Calculadora Completa',
  'Sistema de cálculo con múltiples operaciones matemáticas',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-5},"data":{"value":20}},{"id":2,"type":"number","position":{"x":-10,"y":0},"data":{"value":5}},{"id":3,"type":"number","position":{"x":-10,"y":5},"data":{"value":3}},{"id":4,"type":"add","position":{"x":-5,"y":-2.5}},{"id":5,"type":"multiply","position":{"x":-5,"y":2.5}},{"id":6,"type":"subtract","position":{"x":0,"y":-1.25}},{"id":7,"type":"divide","position":{"x":0,"y":3.75}},{"id":8,"type":"display","position":{"x":10,"y":-1.25}},{"id":9,"type":"display","position":{"x":10,"y":3.75}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":1}},{"from":{"node":2,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":4,"pin":0},"to":{"node":6,"pin":0}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":7,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":7,"pin":1}},{"from":{"node":6,"pin":0},"to":{"node":8,"pin":0}},{"from":{"node":7,"pin":0},"to":{"node":9,"pin":0}}]'
);

-- Template: Sistema de Decisión Lógica
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '🔀 Sistema de Decisión Lógica',
  'Flujo completo con comparaciones, lógica AND/OR y múltiples salidas',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-7.5},"data":{"value":25}},{"id":2,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":18}},{"id":3,"type":"number","position":{"x":-10,"y":2.5},"data":{"value":30}},{"id":4,"type":"number","position":{"x":-10,"y":7.5},"data":{"value":20}},{"id":5,"type":"greater","position":{"x":-5,"y":-5}},{"id":6,"type":"greater","position":{"x":-5,"y":5}},{"id":7,"type":"and","position":{"x":0,"y":-2.5}},{"id":8,"type":"or","position":{"x":0,"y":2.5}},{"id":9,"type":"not","position":{"x":5,"y":0}},{"id":10,"type":"display","position":{"x":10,"y":-2.5}},{"id":11,"type":"display","position":{"x":10,"y":2.5}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":3,"pin":0},"to":{"node":6,"pin":0}},{"from":{"node":4,"pin":0},"to":{"node":6,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":7,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":7,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":8,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":8,"pin":1}},{"from":{"node":7,"pin":0},"to":{"node":9,"pin":0}},{"from":{"node":9,"pin":0},"to":{"node":10,"pin":0}},{"from":{"node":8,"pin":0},"to":{"node":11,"pin":0}}]'
);

-- Template: Análisis de Datos con Strings
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '📊 Análisis de Datos con Strings',
  'Combina strings y obtiene información estadística',
  '[{"id":1,"type":"string","position":{"x":-10,"y":-5},"data":{"value":"Node"}},{"id":2,"type":"string","position":{"x":-10,"y":0},"data":{"value":"Editor"}},{"id":3,"type":"string","position":{"x":-10,"y":5},"data":{"value":"2025"}},{"id":4,"type":"concat","position":{"x":-5,"y":-2.5}},{"id":5,"type":"concat","position":{"x":5,"y":0}},{"id":6,"type":"length","position":{"x":10,"y":-2.5}},{"id":7,"type":"display","position":{"x":10,"y":2.5}},{"id":8,"type":"display","position":{"x":10,"y":0}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":1}},{"from":{"node":4,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":0}},{"from":{"node":5,"pin":0},"to":{"node":7,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":8,"pin":0}}]'
);

-- Template: Sistema de Validación Complejo
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '🎲 Sistema de Validación Complejo',
  'Validación multi-nivel con condiciones anidadas y resultados múltiples',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-7.5},"data":{"value":42}},{"id":2,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":10}},{"id":3,"type":"number","position":{"x":-10,"y":2.5},"data":{"value":100}},{"id":4,"type":"condition","position":{"x":-5,"y":-5}},{"id":5,"type":"greater","position":{"x":-5,"y":2.5}},{"id":6,"type":"boolean","position":{"x":-10,"y":7.5},"data":{"value":true}},{"id":7,"type":"and","position":{"x":0,"y":-2.5}},{"id":8,"type":"or","position":{"x":0,"y":5}},{"id":9,"type":"equals","position":{"x":5,"y":0}},{"id":10,"type":"display","position":{"x":10,"y":-3.75}},{"id":11,"type":"display","position":{"x":10,"y":0}},{"id":12,"type":"display","position":{"x":10,"y":3.75}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":1,"pin":0},"to":{"node":5,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":5,"pin":1}},{"from":{"node":4,"pin":0},"to":{"node":7,"pin":0}},{"from":{"node":5,"pin":0},"to":{"node":7,"pin":1}},{"from":{"node":4,"pin":1},"to":{"node":8,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":8,"pin":1}},{"from":{"node":7,"pin":0},"to":{"node":9,"pin":0}},{"from":{"node":8,"pin":0},"to":{"node":9,"pin":1}},{"from":{"node":7,"pin":0},"to":{"node":10,"pin":0}},{"from":{"node":8,"pin":0},"to":{"node":11,"pin":0}},{"from":{"node":9,"pin":0},"to":{"node":12,"pin":0}}]'
);

-- Template: PERT/CPM: Gestión de Proyecto
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '📊 PERT/CPM: Gestión de Proyecto',
  'Diagrama PERT/CPM para calcular ruta crítica de un proyecto de desarrollo de software',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":5}},{"id":2,"type":"number","position":{"x":-10,"y":-1.25},"data":{"value":3}},{"id":3,"type":"number","position":{"x":-10,"y":0},"data":{"value":2}},{"id":4,"type":"add","position":{"x":-7.5,"y":-2}},{"id":5,"type":"number","position":{"x":-5,"y":-1.25},"data":{"value":8}},{"id":6,"type":"add","position":{"x":-2.5,"y":-1.75}},{"id":7,"type":"add","position":{"x":-7.5,"y":0.75}},{"id":8,"type":"number","position":{"x":-5,"y":1.25},"data":{"value":6}},{"id":9,"type":"add","position":{"x":-2.5,"y":1}},{"id":10,"type":"greater","position":{"x":1,"y":-0.5}},{"id":11,"type":"number","position":{"x":3.5,"y":-1.25},"data":{"value":4}},{"id":12,"type":"number","position":{"x":3.5,"y":0},"data":{"value":3}},{"id":13,"type":"add","position":{"x":6,"y":-0.5}},{"id":14,"type":"number","position":{"x":8.5,"y":-0.5},"data":{"value":2}},{"id":15,"type":"add","position":{"x":10,"y":-0.5}},{"id":16,"type":"display","position":{"x":1,"y":-2.5}},{"id":17,"type":"display","position":{"x":1,"y":1.25}},{"id":18,"type":"display","position":{"x":3.5,"y":-2.5}},{"id":19,"type":"display","position":{"x":11,"y":-0.5}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":1}},{"from":{"node":4,"pin":0},"to":{"node":6,"pin":0}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":1}},{"from":{"node":6,"pin":0},"to":{"node":16,"pin":0}},{"from":{"node":1,"pin":0},"to":{"node":7,"pin":0}},{"from":{"node":3,"pin":0},"to":{"node":7,"pin":1}},{"from":{"node":7,"pin":0},"to":{"node":9,"pin":0}},{"from":{"node":8,"pin":0},"to":{"node":9,"pin":1}},{"from":{"node":9,"pin":0},"to":{"node":17,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":10,"pin":0}},{"from":{"node":9,"pin":0},"to":{"node":10,"pin":1}},{"from":{"node":10,"pin":0},"to":{"node":18,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":13,"pin":0}},{"from":{"node":11,"pin":0},"to":{"node":13,"pin":1}},{"from":{"node":13,"pin":0},"to":{"node":15,"pin":0}},{"from":{"node":14,"pin":0},"to":{"node":15,"pin":1}},{"from":{"node":15,"pin":0},"to":{"node":19,"pin":0}}]'
);

-- Template: PERT/CPM: Construcción Casa
INSERT INTO workflow_templates (name, description, nodes_data, connections_data) VALUES (
  '🏗️ PERT/CPM: Construcción Casa',
  'Proyecto de construcción con múltiples dependencias y rutas paralelas',
  '[{"id":1,"type":"number","position":{"x":-10,"y":-2.5},"data":{"value":7}},{"id":2,"type":"number","position":{"x":-10,"y":0},"data":{"value":10}},{"id":3,"type":"number","position":{"x":-10,"y":2.5},"data":{"value":5}},{"id":4,"type":"add","position":{"x":-7.5,"y":-1.25}},{"id":5,"type":"number","position":{"x":-5,"y":-1.25},"data":{"value":15}},{"id":6,"type":"add","position":{"x":-2.5,"y":-1.25}},{"id":7,"type":"number","position":{"x":0,"y":-2.5},"data":{"value":8}},{"id":8,"type":"number","position":{"x":0,"y":0},"data":{"value":6}},{"id":9,"type":"number","position":{"x":0,"y":2.5},"data":{"value":4}},{"id":10,"type":"add","position":{"x":5,"y":-2.5}},{"id":11,"type":"add","position":{"x":5,"y":0}},{"id":12,"type":"add","position":{"x":5,"y":2.5}},{"id":13,"type":"greater","position":{"x":7.5,"y":-1.25}},{"id":14,"type":"greater","position":{"x":10,"y":0}},{"id":15,"type":"number","position":{"x":7.5,"y":2.5},"data":{"value":12}},{"id":16,"type":"add","position":{"x":10,"y":1.25}},{"id":17,"type":"display","position":{"x":-2.5,"y":-5}},{"id":18,"type":"display","position":{"x":7.5,"y":-5}},{"id":19,"type":"display","position":{"x":10,"y":-2.5}},{"id":20,"type":"display","position":{"x":12.5,"y":1.25}}]',
  '[{"from":{"node":1,"pin":0},"to":{"node":4,"pin":0}},{"from":{"node":2,"pin":0},"to":{"node":4,"pin":1}},{"from":{"node":4,"pin":0},"to":{"node":6,"pin":0}},{"from":{"node":5,"pin":0},"to":{"node":6,"pin":1}},{"from":{"node":6,"pin":0},"to":{"node":17,"pin":0}},{"from":{"node":6,"pin":0},"to":{"node":10,"pin":0}},{"from":{"node":7,"pin":0},"to":{"node":10,"pin":1}},{"from":{"node":6,"pin":0},"to":{"node":11,"pin":0}},{"from":{"node":8,"pin":0},"to":{"node":11,"pin":1}},{"from":{"node":6,"pin":0},"to":{"node":12,"pin":0}},{"from":{"node":9,"pin":0},"to":{"node":12,"pin":1}},{"from":{"node":10,"pin":0},"to":{"node":13,"pin":0}},{"from":{"node":11,"pin":0},"to":{"node":13,"pin":1}},{"from":{"node":13,"pin":0},"to":{"node":18,"pin":0}},{"from":{"node":13,"pin":0},"to":{"node":14,"pin":0}},{"from":{"node":12,"pin":0},"to":{"node":14,"pin":1}},{"from":{"node":14,"pin":0},"to":{"node":19,"pin":0}},{"from":{"node":14,"pin":0},"to":{"node":16,"pin":0}},{"from":{"node":15,"pin":0},"to":{"node":16,"pin":1}},{"from":{"node":16,"pin":0},"to":{"node":20,"pin":0}}]'
);

COMMIT;

-- Índice para búsquedas rápidas por nombre
CREATE INDEX IF NOT EXISTS idx_template_name ON workflow_templates(name);
