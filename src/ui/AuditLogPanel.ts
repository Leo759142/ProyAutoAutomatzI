import './auditLog.css';

export class AuditLogPanel {
  public container: HTMLDivElement;
  private logList: HTMLUListElement;
  private toggleButton: HTMLButtonElement;
  private inputField: HTMLInputElement;
  private isOpen: boolean = false;
  private logs: string[] = [];

  constructor() {
    // Crear contenedor del panel
    this.container = document.createElement('div');
    this.container.className = 'audit-log-panel';
    this.container.style.display = 'none';
    this.container.style.bottom = '15vh';
    this.container.style.overflowY = 'hidden';

    // Crear lista de logs
    this.logList = document.createElement('ul');
    this.logList.className = 'audit-log-list';
    this.container.appendChild(this.logList);

    // Crear input integrado en el panel
    const inputContainer = document.createElement('div');
    inputContainer.className = 'audit-log-input-container';

    this.inputField = document.createElement('input');
    this.inputField.className = 'audit-log-input';
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Escribe un mensaje o comando (/help)...';
    this.inputField.autocomplete = 'off';
    this.inputField.onkeydown = (e) => {
      if (e.key === 'Enter') {
        this.sendLog();
      }
    };

    const sendButton = document.createElement('button');
    sendButton.className = 'audit-log-send';
    sendButton.textContent = 'Enviar';
    sendButton.onclick = () => this.sendLog();

    inputContainer.appendChild(this.inputField);
    inputContainer.appendChild(sendButton);
    this.container.appendChild(inputContainer);

    // Botón de descarga dentro del panel
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '💾 Descargar';
    downloadBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #0078d4;
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      z-index: 10;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#106ebe';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#0078d4';
    downloadBtn.onclick = () => this.downloadLog();
    this.container.appendChild(downloadBtn);

    // Botón toggle (flotante)
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'audit-log-toggle';
    this.toggleButton.innerHTML = '📝 Log';
    this.toggleButton.onclick = () => this.togglePanel();

    // Agregar al DOM
    document.body.appendChild(this.toggleButton);
    document.body.appendChild(this.container);
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'block' : 'none';
    this.toggleButton.classList.toggle('active', this.isOpen);
  }

  public addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `${timestamp} - ${message}`;
    this.logs.push(logMsg);

    const item = document.createElement('li');
    item.textContent = logMsg;
    this.logList.appendChild(item);

    // Auto-scroll
    this.logList.scrollTop = this.logList.scrollHeight;

    // También en consola
    console.log('[Audit]', message);
  }

  clear() {
    this.logList.innerHTML = '';
    this.logs = [];
  }

  private sendLog() {
    const value = this.inputField.value.trim();
    if (value) {
      if (value.startsWith('/clear')) {
        this.clear();
        this.addLog('[Sistema] Log limpiado');
      } else if (value.startsWith('/export')) {
        const content = this.logs.join('\n');
        navigator.clipboard.writeText(content);
        this.addLog('[Sistema] Log exportado al portapapeles');
      } else if (value.startsWith('/help')) {
        this.addLog('[Comandos disponibles]');
        this.addLog('/clear - Limpiar el log');
        this.addLog('/export - Copiar log al portapapeles');
        this.addLog('/help - Mostrar esta ayuda');
      } else {
        this.addLog(`[Manual] ${value}`);
      }
      this.inputField.value = '';
    }
  }

  private downloadLog() {
    const content = this.logs.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Singleton instance
export const auditLogPanel = new AuditLogPanel();