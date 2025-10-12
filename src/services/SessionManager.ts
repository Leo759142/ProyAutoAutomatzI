// SessionManager.ts
// Administrador de sesiones para el canvas con persistencia Redis

import { NodeEditor } from '../core/NodeEditor';
import { RedisService, SessionData } from './RedisService';
import { logAudit } from '../main';

export class SessionManager {
  private static instance: SessionManager;
  private redisService: RedisService;
  private nodeEditor: NodeEditor | null = null;
  private autoSaveInterval: number | null = null;

  private constructor() {
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public setNodeEditor(editor: NodeEditor): void {
    this.nodeEditor = editor;
    this.loadPreviousSession();
    this.startAutoSave();
  }

  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Auto-guardar cada 10 segundos
    this.autoSaveInterval = window.setInterval(() => {
      this.saveCurrentSession();
    }, 10000);
    
    logAudit('🔄 Auto-guardado iniciado (cada 10s)');
  }

  public async saveCurrentSession(): Promise<void> {
    if (!this.nodeEditor) return;

    try {
      // Solo guardar si hay nodos para evitar sobrescribir con datos vacíos
      if (this.nodeEditor.nodes.length === 0) {
        logAudit('ℹ️ No hay nodos que guardar');
        return;
      }

      const sessionData: SessionData = {
        nodes: this.nodeEditor.nodes.map((node, index) => ({
          id: (node as any).id || `node_${index}`,
          type: node.type,
          pos: { x: node.pos.x, y: node.pos.y },
          data: {
            ...(((node as any).value !== undefined) ? { value: (node as any).value } : {}),
            ...(node.customTitle !== null ? { customTitle: node.customTitle } : {}),
            ...(node.customDescription !== null ? { customDescription: node.customDescription } : {})
          }
        })),
        connections: this.nodeEditor.links
          .map((link, index) => {
            if (!link || !link[0] || !link[1]) return null;
            return {
              from: { node: (link[0].parent as any).id || index.toString(), pin: link[0].name },
              to: { node: (link[1].parent as any).id || index.toString(), pin: link[1].name }
            };
          })
          .filter(conn => conn !== null),
        viewOffset: { x: this.nodeEditor.viewOffset.x, y: this.nodeEditor.viewOffset.y },
        scale: this.nodeEditor.scale,
        timestamp: Date.now()
      };

      await this.redisService.saveSession(sessionData);
      logAudit(`💾 Sesión guardada: ${sessionData.nodes.length} nodos, ${sessionData.connections.length} conexiones`);
    } catch (error) {
      logAudit(`❌ Error guardando sesión: ${error}`);
      console.error('Error guardando sesión:', error);
    }
  }

  public async loadPreviousSession(): Promise<void> {
    if (!this.nodeEditor) return;

    try {
      const sessionData = await this.redisService.loadSession();
      if (sessionData && sessionData.nodes.length > 0) {
        logAudit(`🔄 Cargando sesión: ${sessionData.nodes.length} nodos`);
        
        // Cargar como template usando el método correcto
        this.nodeEditor.loadWorkflowTemplate({
          nodes_data: JSON.stringify(sessionData.nodes),
          connections_data: JSON.stringify(sessionData.connections)
        });
        
        // Restaurar vista
        this.nodeEditor.viewOffset.x = sessionData.viewOffset.x;
        this.nodeEditor.viewOffset.y = sessionData.viewOffset.y;
        this.nodeEditor.scale = sessionData.scale;
        
        logAudit('✅ Sesión previa restaurada');
      } else {
        logAudit('ℹ️ No hay sesión previa que cargar');
      }
    } catch (error) {
      logAudit(`❌ Error cargando sesión: ${error}`);
    }
  }

  public async clearSession(): Promise<void> {
    await this.redisService.clearSession();
    logAudit('🗑️ Sesión eliminada');
  }

  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      logAudit('⏹️ Auto-guardado detenido');
    }
  }
}