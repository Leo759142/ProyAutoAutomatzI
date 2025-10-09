import initSqlJs, { Database } from 'sql.js';

export interface WorkflowTemplate {
    id?: number;
    name: string;
    description: string;
    nodes_data: string;
    connections_data: string;
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
}