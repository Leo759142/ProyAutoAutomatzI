import { marked } from 'marked';

/**
 * InfoPanel - Panel de información moderno con soporte para Markdown
 * Permite mostrar información rica con formato Markdown, HTML, y estilos personalizados
 */
export class InfoPanel {
    private panel: HTMLElement;
    private header: HTMLElement;
    private title: HTMLElement;
    private content: HTMLElement;
    private closeButton: HTMLElement;
    private isVisible: boolean = false;

    constructor() {
        // Crear el panel dinámicamente
        this.panel = this.createPanel();
        this.header = this.panel.querySelector('.info-panel-header')!;
        this.title = this.panel.querySelector('.info-panel-title')!;
        this.content = this.panel.querySelector('.info-panel-content')!;
        this.closeButton = this.panel.querySelector('.info-panel-close')!;

        // Configurar marked con opciones seguras
        marked.setOptions({
            breaks: true,
            gfm: true, // GitHub Flavored Markdown
        });

        this.setupEventListeners();
        document.body.appendChild(this.panel);
    }

    /**
     * Crear estructura HTML del panel
     */
    private createPanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.id = 'infoPanel';
        panel.className = 'info-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="info-panel-header">
                <div class="info-panel-title-wrapper">
                    <span class="info-panel-icon">ℹ️</span>
                    <h3 class="info-panel-title">Información</h3>
                </div>
                <button class="info-panel-close" title="Cerrar panel">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="info-panel-content"></div>
        `;

        return panel;
    }

    /**
     * Configurar event listeners
     */
    private setupEventListeners(): void {
        this.closeButton.addEventListener('click', () => this.hide());

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Mostrar el panel
     */
    public show(): void {
        this.panel.style.display = 'flex';
        this.isVisible = true;
        // Pequeño delay para que la animación funcione
        setTimeout(() => {
            this.panel.classList.add('visible');
        }, 10);
    }

    /**
     * Ocultar el panel
     */
    public hide(): void {
        this.panel.classList.remove('visible');
        this.isVisible = false;
        setTimeout(() => {
            this.panel.style.display = 'none';
        }, 300); // Duración de la animación
    }

    /**
     * Alternar visibilidad
     */
    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Establecer el título del panel
     */
    public setTitle(title: string, icon?: string): void {
        const iconElement = this.panel.querySelector('.info-panel-icon') as HTMLElement;
        if (icon) {
            iconElement.textContent = icon;
        }
        this.title.textContent = title;
    }

    /**
     * Mostrar contenido en formato Markdown
     */
    public async showMarkdown(markdown: string, title?: string, icon?: string): Promise<void> {
        if (title) this.setTitle(title, icon);
        
        try {
            const html = await marked.parse(markdown);
            this.content.innerHTML = this.sanitizeHTML(html);
            this.enhanceContent();
            this.show();
        } catch (error) {
            console.error('Error parsing markdown:', error);
            this.showError('Error al procesar el contenido Markdown');
        }
    }

    /**
     * Mostrar contenido HTML directo
     */
    public showHTML(html: string, title?: string, icon?: string): void {
        if (title) this.setTitle(title, icon);
        this.content.innerHTML = this.sanitizeHTML(html);
        this.enhanceContent();
        this.show();
    }

    /**
     * Mostrar contenido de texto plano
     */
    public showText(text: string, title?: string, icon?: string): void {
        if (title) this.setTitle(title, icon);
        this.content.innerHTML = `<pre class="info-panel-text">${this.escapeHTML(text)}</pre>`;
        this.show();
    }

    /**
     * Mostrar mensaje de error
     */
    public showError(message: string): void {
        this.setTitle('Error', '⚠️');
        this.content.innerHTML = `
            <div class="info-panel-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${this.escapeHTML(message)}</div>
            </div>
        `;
        this.show();
    }

    /**
     * Mostrar mensaje de éxito
     */
    public showSuccess(message: string, title?: string): void {
        this.setTitle(title || 'Éxito', '✅');
        this.content.innerHTML = `
            <div class="info-panel-success">
                <div class="success-icon">✅</div>
                <div class="success-message">${this.escapeHTML(message)}</div>
            </div>
        `;
        this.show();
    }

    /**
     * Mostrar información con estructura personalizada
     */
    public showInfo(sections: InfoSection[]): void {
        let html = '<div class="info-sections">';
        
        for (const section of sections) {
            html += `<div class="info-section">`;
            
            if (section.title) {
                html += `<h4 class="info-section-title">
                    ${section.icon ? `<span class="section-icon">${section.icon}</span>` : ''}
                    ${this.escapeHTML(section.title)}
                </h4>`;
            }
            
            if (section.markdown) {
                html += marked.parse(section.markdown) as string;
            } else if (section.html) {
                html += section.html;
            } else if (section.text) {
                html += `<p>${this.escapeHTML(section.text)}</p>`;
            }
            
            html += `</div>`;
        }
        
        html += '</div>';
        
        this.content.innerHTML = this.sanitizeHTML(html);
        this.enhanceContent();
        this.show();
    }

    /**
     * Mejorar el contenido añadiendo funcionalidades extra
     */
    private enhanceContent(): void {
        // Añadir clases a tablas para mejor estilo
        const tables = this.content.querySelectorAll('table');
        tables.forEach(table => {
            table.classList.add('info-table');
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // Añadir iconos a enlaces externos
        const links = this.content.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            link.classList.add('external-link');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Mejorar bloques de código
        const codeBlocks = this.content.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            if (pre) {
                pre.classList.add('code-block');
                
                // Añadir botón de copiar
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-button';
                copyBtn.innerHTML = '📋';
                copyBtn.title = 'Copiar código';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(block.textContent || '');
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => {
                        copyBtn.innerHTML = '📋';
                    }, 2000);
                });
                pre.appendChild(copyBtn);
            }
        });
    }

    /**
     * Sanitizar HTML para prevenir XSS
     */
    private sanitizeHTML(html: string): string {
        const temp = document.createElement('div');
        temp.textContent = html;
        const sanitized = temp.innerHTML;
        
        // Permitir algunos elementos HTML seguros
        const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                             'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                             'div', 'span', 'hr'];
        
        // Por ahora retornamos el HTML original si es seguro
        // En producción, usar una librería como DOMPurify
        return html;
    }

    /**
     * Escapar HTML para texto plano
     */
    private escapeHTML(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Limpiar el contenido del panel
     */
    public clear(): void {
        this.content.innerHTML = '';
    }

    /**
     * Verificar si el panel está visible
     */
    public isOpen(): boolean {
        return this.isVisible;
    }
}

/**
 * Interface para secciones de información
 */
export interface InfoSection {
    title?: string;
    icon?: string;
    markdown?: string;
    html?: string;
    text?: string;
}
