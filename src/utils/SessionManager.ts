import { logAudit } from '../main';

export interface CanvasSession {
  nodes: any[];
  links: any[];
  viewOffset: { x: number; y: number };
  scale: number;
  timestamp: number;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'canvas_session_data';
  private static readonly ENCRYPT_KEY = 'automatty_canvas_key';

  // Simple encryption using Base64 + XOR (no es Redis real, pero simula cifrado)
  private static encrypt(data: string): string {
    const key = this.ENCRYPT_KEY;
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  private static decrypt(encrypted: string): string {
    const key = this.ENCRYPT_KEY;
    const data = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  static saveSession(editor: any): void {
    try {
      const session: CanvasSession = {
        nodes: editor.nodes.map((node: any) => ({
          id: node.id,
          type: node.type,
          pos: { x: node.pos.x, y: node.pos.y },
          title: node.title,
          data: node.data || {},
          inputs: node.inputs?.map((pin: any) => ({
            name: pin.name,
            type: pin.type,
            userData: pin.userData
          })) || [],
          outputs: node.outputs?.map((pin: any) => ({
            name: pin.name,
            type: pin.type,
            userData: pin.userData
          })) || []
        })),
        links: editor.links.filter((link: any) => link !== null).map((link: any) => ({
          from: {
            nodeId: link[0]?.parent?.id,
            pinName: link[0]?.name
          },
          to: {
            nodeId: link[1]?.parent?.id,
            pinName: link[1]?.name
          }
        })),
        viewOffset: { x: editor.viewOffset.x, y: editor.viewOffset.y },
        scale: editor.scale,
        timestamp: Date.now()
      };

      const encrypted = this.encrypt(JSON.stringify(session));
      localStorage.setItem(this.SESSION_KEY, encrypted);
      logAudit(`💾 Sesión guardada (${session.nodes.length} nodos, ${session.links.length} conexiones)`);
    } catch (error) {
      logAudit(`❌ Error guardando sesión: ${error}`);
    }
  }

  static loadSession(): CanvasSession | null {
    try {
      const encrypted = localStorage.getItem(this.SESSION_KEY);
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      const session = JSON.parse(decrypted) as CanvasSession;
      logAudit(`📂 Sesión cargada (${session.nodes.length} nodos, ${session.links.length} conexiones)`);
      return session;
    } catch (error) {
      logAudit(`❌ Error cargando sesión: ${error}`);
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    logAudit('🗑️ Sesión eliminada');
  }

  static hasSession(): boolean {
    return localStorage.getItem(this.SESSION_KEY) !== null;
  }
}