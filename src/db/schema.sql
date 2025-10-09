CREATE TABLE IF NOT EXISTS workflow_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    nodes_data TEXT,
    connections_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
