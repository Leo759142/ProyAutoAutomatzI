import initSqlJs, { Database } from 'sql.js';

export interface WorkflowTemplate {
    id?: number;
    name: string;
    description: string;
    nodes_data: string;
    connections_data: string;
}

export interface NodePreset {
    id?: number;
    name: string;
    description: string;
    node_type: string;
    node_data: string; // JSON
    category?: string;
}

export interface ExecutionConfig {
    id?: number;
    name: string;
    description: string;
    config_data: string; // JSON
}

export class DatabaseService {
    private db: Database | null = null;
    private static instance: DatabaseService | null = null;
    private initialized = false;

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    private constructor() {}

    async initialize() {
        if (this.initialized) return;

        try {
            // Inicializar SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });

            // Intentar cargar datos existentes de LocalStorage
            const savedData = localStorage.getItem('workflowDb');
            if (savedData) {
                try {
                    const binaryArray = new Uint8Array(savedData.split(',').map(Number));
                    this.db = new SQL.Database(binaryArray);
                } catch (e) {
                    console.warn('Error loading from localStorage, creating new DB');
                    this.db = new SQL.Database();
                }
            } else {
                this.db = new SQL.Database();
            }

            // Asegurar que la tabla existe
            this.db.run(`
                CREATE TABLE IF NOT EXISTS workflow_templates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    nodes_data TEXT,
                    connections_data TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            this.initialized = true;
            
            // Guardar el estado inicial
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    private saveToLocalStorage() {
        if (!this.db) return;
        const data = this.db.export();
        const binaryArray = Array.from(data);
        localStorage.setItem('workflowDb', binaryArray.toString());
    }

    async saveTemplate(template: WorkflowTemplate) {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.run(
            `INSERT INTO workflow_templates (name, description, nodes_data, connections_data) 
             VALUES (?, ?, ?, ?)`,
            [template.name, template.description, template.nodes_data, template.connections_data]
        );

        this.saveToLocalStorage();
        return result;
    }

    async loadTemplate(id: number): Promise<WorkflowTemplate | undefined> {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.exec(
            'SELECT * FROM workflow_templates WHERE id = ?',
            [id]
        );

        if (result.length === 0 || result[0].values.length === 0) return undefined;

        const row = result[0].values[0];
        return {
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            nodes_data: row[3] as string,
            connections_data: row[4] as string
        };
    }

    async listTemplates(): Promise<WorkflowTemplate[]> {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.exec(
            'SELECT * FROM workflow_templates ORDER BY created_at DESC'
        );

        if (result.length === 0) return [];

        return result[0].values.map(row => ({
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            nodes_data: row[3] as string,
            connections_data: row[4] as string
        }));
    }

    // ===== CRUD para Node Presets =====
    async saveNodePreset(preset: NodePreset) {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.run(
            `INSERT INTO node_presets (name, description, node_type, node_data, category) 
             VALUES (?, ?, ?, ?, ?)`,
            [preset.name, preset.description, preset.node_type, preset.node_data, preset.category || 'custom']
        );

        this.saveToLocalStorage();
        return result;
    }

    async loadNodePreset(id: number): Promise<NodePreset | undefined> {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.exec(
            'SELECT * FROM node_presets WHERE id = ?',
            [id]
        );

        if (result.length === 0 || result[0].values.length === 0) return undefined;

        const row = result[0].values[0];
        return {
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            node_type: row[3] as string,
            node_data: row[4] as string,
            category: row[5] as string
        };
    }

    async listNodePresets(category?: string): Promise<NodePreset[]> {
        if (!this.db) throw new Error('Database not initialized');
        
        const query = category 
            ? 'SELECT * FROM node_presets WHERE category = ? ORDER BY name'
            : 'SELECT * FROM node_presets ORDER BY category, name';
        
        const params = category ? [category] : [];
        const result = this.db.exec(query, params);
        
        if (result.length === 0) return [];

        return result[0].values.map(row => ({
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            node_type: row[3] as string,
            node_data: row[4] as string,
            category: row[5] as string
        }));
    }

    async deleteNodePreset(id: number) {
        if (!this.db) throw new Error('Database not initialized');
        
        this.db.run('DELETE FROM node_presets WHERE id = ?', [id]);
        this.saveToLocalStorage();
    }

    // ===== CRUD para Execution Configs =====
    async saveExecutionConfig(config: ExecutionConfig) {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.run(
            `INSERT INTO execution_configs (name, description, config_data) 
             VALUES (?, ?, ?)`,
            [config.name, config.description, config.config_data]
        );

        this.saveToLocalStorage();
        return result;
    }

    async loadExecutionConfig(id: number): Promise<ExecutionConfig | undefined> {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.exec(
            'SELECT * FROM execution_configs WHERE id = ?',
            [id]
        );

        if (result.length === 0 || result[0].values.length === 0) return undefined;

        const row = result[0].values[0];
        return {
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            config_data: row[3] as string
        };
    }

    async listExecutionConfigs(): Promise<ExecutionConfig[]> {
        if (!this.db) throw new Error('Database not initialized');
        
        const result = this.db.exec('SELECT * FROM execution_configs ORDER BY name');
        
        if (result.length === 0) return [];

        return result[0].values.map(row => ({
            id: row[0] as number,
            name: row[1] as string,
            description: row[2] as string,
            config_data: row[3] as string
        }));
    }
}