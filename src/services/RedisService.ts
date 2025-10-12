// RedisService.ts
// Servicio para persistencia en Redis con cifrado

export interface SessionData {
  nodes: any[];
  connections: any[];
  viewOffset: { x: number; y: number };
  scale: number;
  timestamp: number;
}

export class RedisService {
  private static instance: RedisService;
  private sessionKey: string;
  private encryptionKey: string;

  private constructor() {
    // Generar una clave de sesión única basada en timestamp y random
    this.sessionKey = `canvas_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Clave de cifrado (en producción debería venir de variables de entorno)
    this.encryptionKey = 'canvas_encryption_key_2025';
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Simulación de cifrado simple (en producción usar crypto real)
  private encrypt(data: string): string {
    try {
      // Convertir a UTF-8 primero usando TextEncoder
      const utf8Encoder = new TextEncoder();
      const utf8Data = utf8Encoder.encode(data);
      
      // Cifrado XOR simple para demo (NO usar en producción)
      let encrypted = '';
      for (let i = 0; i < utf8Data.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        const dataChar = utf8Data[i];
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      // Base64 encode (ahora seguro porque solo tiene caracteres Latin1)
      return btoa(encrypted);
    } catch (error) {
      console.error('Error en encrypt:', error);
      // Fallback: retornar data sin cifrar pero en base64
      return btoa(unescape(encodeURIComponent(data)));
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData); // Base64 decode
      
      // Descifrar XOR
      const decryptedBytes: number[] = [];
      for (let i = 0; i < data.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        const dataChar = data.charCodeAt(i);
        decryptedBytes.push(dataChar ^ keyChar);
      }
      
      // Convertir de UTF-8 a string usando TextDecoder
      const utf8Decoder = new TextDecoder();
      const uint8Array = new Uint8Array(decryptedBytes);
      return utf8Decoder.decode(uint8Array);
    } catch (error) {
      console.error('Error decryptando datos:', error);
      // Fallback: intentar decodificar sin descifrar
      try {
        return decodeURIComponent(escape(atob(encryptedData)));
      } catch {
        return '';
      }
    }
  }

  // Simular conexión Redis usando localStorage por ahora
  async saveSession(sessionData: SessionData): Promise<void> {
    try {
      const jsonData = JSON.stringify(sessionData);
      const encryptedData = this.encrypt(jsonData);
      
      // Simular Redis con localStorage
      localStorage.setItem(`redis:${this.sessionKey}`, encryptedData);
      localStorage.setItem('redis:current_session', this.sessionKey);
      
      console.log(`✅ Redis: Sesión guardada: ${this.sessionKey}`);
      console.log(`📊 Redis: Datos: ${sessionData.nodes.length} nodos, ${sessionData.connections.length} conexiones`);
      
      // Verificar que se guardó correctamente
      const saved = localStorage.getItem(`redis:${this.sessionKey}`);
      if (!saved) {
        throw new Error('No se pudo guardar en localStorage');
      }
    } catch (error) {
      console.error('Error guardando sesión en Redis:', error);
      throw error;
    }
  }

  async loadSession(): Promise<SessionData | null> {
    try {
      const currentSessionKey = localStorage.getItem('redis:current_session');
      if (!currentSessionKey) {
        console.log('Redis: No hay sesión previa');
        return null;
      }

      const encryptedData = localStorage.getItem(`redis:${currentSessionKey}`);
      if (!encryptedData) {
        console.log('Redis: No se encontraron datos de sesión');
        return null;
      }

      const jsonData = this.decrypt(encryptedData);
      if (!jsonData) {
        console.error('Redis: Error descifrando datos de sesión');
        return null;
      }

      const sessionData = JSON.parse(jsonData) as SessionData;
      this.sessionKey = currentSessionKey;
      
      console.log(`✅ Redis: Sesión cargada: ${currentSessionKey}`);
      console.log(`📊 Redis: Datos: ${sessionData.nodes.length} nodos, ${sessionData.connections.length} conexiones`);
      console.log('📋 Redis: SessionData completa:', sessionData);
      
      return sessionData;
    } catch (error) {
      console.error('Redis: Error cargando sesión:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      const currentSessionKey = localStorage.getItem('redis:current_session');
      if (currentSessionKey) {
        localStorage.removeItem(`redis:${currentSessionKey}`);
        localStorage.removeItem('redis:current_session');
        console.log(`🗑️ Sesión eliminada: ${currentSessionKey}`);
      }
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }

  getSessionKey(): string {
    return this.sessionKey;
  }
}