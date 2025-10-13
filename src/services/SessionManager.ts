// SessionManager.ts
// Administrador de sesiones para el canvas (sin Redis, solo autosave a templates)

import { NodeEditor } from '../core/NodeEditor';
import { logAudit } from '../main';

export class SessionManager {
  private static instance: SessionManager;
  private nodeEditor: NodeEditor | null = null;
  private autoSaveInterval: number | null = null;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public setNodeEditor(editor: NodeEditor): void {
    this.nodeEditor = editor;
    this.startAutoSave();
  }

  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Auto-guardar cada 30 segundos SOLO si hay un template seleccionado
    this.autoSaveInterval = window.setInterval(() => {
      this.saveCurrentSession();
    }, 30000);
    
    logAudit('🔄 Auto-guardado iniciado (cada 30s, solo con template seleccionado)');
  }

  public async saveCurrentSession(): Promise<void> {
    if (!this.nodeEditor) return;

    try {
      // Solo autosave si hay un template seleccionado
      const templateSelect = document.getElementById('templateSelect') as HTMLSelectElement;
      if (!templateSelect || !templateSelect.value) {
        return; // No logear si no hay template seleccionado (ruido innecesario)
      }

      // Solo guardar si hay nodos
      if (this.nodeEditor.nodes.length === 0) {
        return;
      }

      const templateId = Number(templateSelect.value);
      if (!templateId) return;

      // Obtener DatabaseService desde window (expuesto en main.ts)
      const dbService = (window as any).dbService;
      if (!dbService) {
        console.error('DatabaseService no disponible para autosave');
        return;
      }

      // Preparar datos de nodos
      const nodesData = this.nodeEditor.nodes.map((node, index) => ({
        id: index + 1,
        type: node.type,
        position: { x: node.pos.x, y: node.pos.y },
        data: {
          ...(node.outputs.length > 0 && node.outputs[0].value !== undefined ? { value: node.outputs[0].value } : {}),
          ...(node.customTitle !== null ? { customTitle: node.customTitle } : {}),
          ...(node.customDescription !== null ? { customDescription: node.customDescription } : {})
        }
      }));

      // Preparar datos de conexiones
      const connectionsData = this.nodeEditor.links
        .map((link) => {
          if (!link || !link[0] || !link[1]) return null;
          const fromNodeIndex = this.nodeEditor!.nodes.indexOf(link[0].parent);
          const toNodeIndex = this.nodeEditor!.nodes.indexOf(link[1].parent);
          return {
            from: { node: fromNodeIndex + 1, pin: link[0].index },
            to: { node: toNodeIndex + 1, pin: link[1].index }
          };
        })
        .filter(conn => conn !== null);

      // Cargar template actual para mantener nombre/descripción
      const template = await dbService.loadTemplate(templateId);
      if (!template) return;

      // Actualizar template con el contenido actual del canvas
      await dbService.updateTemplate(templateId, {
        name: template.name,
        description: template.description,
        problemDescription: template.problemDescription,
        nodes_data: JSON.stringify(nodesData),
        connections_data: JSON.stringify(connectionsData)
      });

      logAudit(`💾 Autosave: "${template.name}" actualizado (${nodesData.length} nodos)`);
    } catch (error) {
      console.error('Error en autosave:', error);
    }
  }

  public async loadPreviousSession(): Promise<void> {
    // No-op: Sin Redis, no hay sesión previa que cargar
    // Los templates se cargan manualmente desde el selector
  }

  public async clearSession(): Promise<void> {
    // No-op: Sin Redis, no hay sesión que limpiar
  }

  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      logAudit('⏹️ Auto-guardado detenido');
    }
  }
}