-- Tabla principal para templates de workflow
CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT NOT NULL,      -- JSON string con nodos
    connections_data TEXT NOT NULL -- JSON string con conexiones
);

-- Puedes agregar más tablas aquí para usuarios, logs, etc.
