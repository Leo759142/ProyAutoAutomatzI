CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT,
    connections_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para nodos individuales
CREATE TABLE IF NOT EXISTS node_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    node_type TEXT NOT NULL,
    node_data TEXT, -- JSON con configuración del nodo
    category TEXT DEFAULT 'custom',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para configuraciones de ejecución personalizadas
CREATE TABLE IF NOT EXISTS execution_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    config_data TEXT, -- JSON con configuración de ejecución
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
