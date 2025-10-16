/**
 * AlgorithmValidationUI.ts
 * Maneja la interfaz de usuario para validación de algoritmos y visualización de resultados
 */

import { NodeEditor } from '../core/NodeEditor';
import { getApplicableAlgorithms, PathResult, dijkstra, aStar, pertCPM } from '../algorithms/PathAlgorithms';
import { AlgorithmsValidation, PROBLEM_CONTEXTS, ProblemContext } from '../types/ProblemContext';

export class AlgorithmValidationUI {
    private editor: NodeEditor | null = null;
    private panel: HTMLElement;
    private currentValidation: AlgorithmsValidation | null = null;
    private currentContext: ProblemContext;

    constructor(editor?: NodeEditor) {
        this.editor = editor || null;
        this.panel = document.getElementById('algorithmPanel')!;
        this.currentContext = PROBLEM_CONTEXTS.generic;
        this.setupEventListeners();
        this.loadContextFromStorage();
    }

    /**
     * Establece el editor
     */
    public setEditor(editor: NodeEditor) {
        this.editor = editor;
    }

    /**
     * Configura los event listeners
     */
    private setupEventListeners() {
        // Botón cerrar panel
        const closeBtn = document.getElementById('closeAlgorithmPanel');
        closeBtn?.addEventListener('click', () => this.hidePanel());

        // Selector de contexto
        const contextSelect = document.getElementById('problemContextSelect') as HTMLSelectElement;
        contextSelect?.addEventListener('change', (e) => {
            const select = e.target as HTMLSelectElement;
            this.currentContext = PROBLEM_CONTEXTS[select.value] || PROBLEM_CONTEXTS.generic;
            this.saveContextToStorage();
            this.updateValidation();
        });

        // Selector de algoritmo
        const algorithmSelect = document.getElementById('pathAlgorithmSelect') as HTMLSelectElement;
        algorithmSelect?.addEventListener('change', () => {
            this.updateExecuteButtonStatus();
        });

        // Botón ejecutar
        const executeBtn = document.getElementById('executePathAlgorithm');
        executeBtn?.addEventListener('click', () => {
            this.executeSelectedAlgorithm();
        });

        // Botón analizar
        const analyzeBtn = document.getElementById('analyzeOptimalPath');
        analyzeBtn?.addEventListener('click', () => {
            this.showValidation();
        });
    }

    /**
     * Actualiza la validación de algoritmos
     */
    public updateValidation() {
        if (!this.editor) return;

        this.currentValidation = getApplicableAlgorithms(this.editor, this.currentContext);
        this.updateExecuteButtonStatus();
    }

    /**
     * Actualiza el estado del botón ejecutar según el algoritmo seleccionado
     */
    private updateExecuteButtonStatus() {
        if (!this.currentValidation) return;

        const algorithmSelect = document.getElementById('pathAlgorithmSelect') as HTMLSelectElement;
        const selectedAlgorithm = algorithmSelect?.value;
        const statusIcon = document.getElementById('algorithmStatusIcon');

        if (!selectedAlgorithm || !statusIcon) return;

        let validation;
        switch (selectedAlgorithm) {
            case 'dijkstra':
                validation = this.currentValidation.dijkstra;
                break;
            case 'astar':
                validation = this.currentValidation.astar;
                break;
            case 'pertcpm':
                validation = this.currentValidation.pert;
                break;
            default:
                statusIcon.textContent = '';
                return;
        }

        // Actualizar icono según severidad
        if (validation.severity === 'ok') {
            statusIcon.textContent = '✅';
            statusIcon.title = validation.reason;
        } else if (validation.severity === 'warning') {
            statusIcon.textContent = '⚠️';
            statusIcon.title = validation.reason;
        } else {
            statusIcon.textContent = '❌';
            statusIcon.title = validation.reason;
        }
    }

    /**
     * Muestra el panel con la validación actual
     */
    public showValidation() {
        if (!this.editor) return;

        this.updateValidation();
        this.renderValidation();
        this.panel.style.display = 'flex';
    }

    /**
     * Oculta el panel
     */
    public hidePanel() {
        this.panel.style.display = 'none';
    }

    /**
     * Renderiza la validación de algoritmos
     */
    private renderValidation() {
        if (!this.currentValidation) return;

        const validationResults = document.getElementById('validationResults');
        if (!validationResults) return;

        // Limpiar contenido previo
        validationResults.innerHTML = '';

        // Mostrar contexto actual
        const contextInfo = document.createElement('div');
        contextInfo.style.cssText = 'margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;';
        contextInfo.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">📦 Contexto del Problema</div>
            <div style="font-size: 13px; opacity: 0.9;">${this.currentContext.description}</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">
                Unidad: <strong>${this.currentContext.unit.label}</strong> (${this.currentContext.unit.shortLabel})
            </div>
        `;
        validationResults.appendChild(contextInfo);

        // Renderizar cada algoritmo
        this.renderAlgorithmValidation(validationResults, 'dijkstra', '🔷 Dijkstra', this.currentValidation.dijkstra);
        this.renderAlgorithmValidation(validationResults, 'astar', '⭐ A*', this.currentValidation.astar);
        this.renderAlgorithmValidation(validationResults, 'pertcpm', '📊 PERT/CPM', this.currentValidation.pert);

        // Mostrar algoritmo recomendado
        if (this.currentValidation.recommendedAlgorithm) {
            const recommendedDiv = document.createElement('div');
            recommendedDiv.style.cssText = 'margin-top: 20px; padding: 12px; background: rgba(76, 175, 80, 0.2); border: 2px solid #4CAF50; border-radius: 8px; text-align: center;';
            
            let algorithmName = '';
            switch (this.currentValidation.recommendedAlgorithm) {
                case 'dijkstra': algorithmName = '🔷 Dijkstra'; break;
                case 'astar': algorithmName = '⭐ A*'; break;
                case 'pert': algorithmName = '📊 PERT/CPM'; break;
            }
            
            recommendedDiv.innerHTML = `
                <div style="font-weight: 600; color: #4CAF50; margin-bottom: 4px;">🎯 Algoritmo Recomendado</div>
                <div style="font-size: 18px; font-weight: 700;">${algorithmName}</div>
            `;
            validationResults.appendChild(recommendedDiv);
        }
    }

    /**
     * Renderiza la validación de un algoritmo específico
     */
    private renderAlgorithmValidation(
        container: HTMLElement,
        algorithmId: string,
        algorithmName: string,
        validation: any
    ) {
        const isRecommended = this.currentValidation?.recommendedAlgorithm === algorithmId.replace('pertcpm', 'pert');
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `validation-item ${validation.severity}`;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'validation-item-header';

        let statusIcon = '';
        switch (validation.severity) {
            case 'ok': statusIcon = '✅'; break;
            case 'warning': statusIcon = '⚠️'; break;
            case 'error': statusIcon = '❌'; break;
        }

        headerDiv.innerHTML = `
            <span class="icon">${algorithmName.split(' ')[0]}</span>
            <span class="name">${algorithmName.split(' ').slice(1).join(' ')}</span>
            ${isRecommended ? '<span class="recommended-badge">RECOMENDADO</span>' : ''}
            <span class="status">${statusIcon}</span>
        `;

        const reasonDiv = document.createElement('div');
        reasonDiv.className = 'reason';
        reasonDiv.textContent = validation.reason;

        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(reasonDiv);

        // Sugerencias si existen
        if (validation.suggestions && validation.suggestions.length > 0) {
            const suggestionsUl = document.createElement('ul');
            suggestionsUl.className = 'suggestions';
            validation.suggestions.forEach((suggestion: string) => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionsUl.appendChild(li);
            });
            itemDiv.appendChild(suggestionsUl);
        }

        container.appendChild(itemDiv);
    }

    /**
     * Ejecuta el algoritmo seleccionado
     */
    private executeSelectedAlgorithm() {
        if (!this.editor) {
            alert('⚠️ No hay editor disponible');
            return;
        }

        const algorithmSelect = document.getElementById('pathAlgorithmSelect') as HTMLSelectElement;
        const selectedAlgorithm = algorithmSelect?.value;

        if (!selectedAlgorithm) {
            alert('⚠️ Selecciona un algoritmo primero');
            return;
        }

        // Actualizar validación
        this.updateValidation();

        let result: PathResult | null = null;

        switch (selectedAlgorithm) {
            case 'dijkstra':
                if (!this.currentValidation?.dijkstra.applicable) {
                    alert(`❌ Dijkstra no es aplicable:\n${this.currentValidation?.dijkstra.reason}`);
                    return;
                }
                result = dijkstra(this.editor);
                break;

            case 'astar':
                if (!this.currentValidation?.astar.applicable) {
                    alert(`❌ A* no es aplicable:\n${this.currentValidation?.astar.reason}`);
                    return;
                }
                result = aStar(this.editor);
                break;

            case 'pertcpm':
                if (!this.currentValidation?.pert.applicable) {
                    alert(`❌ PERT/CPM no es aplicable:\n${this.currentValidation?.pert.reason}`);
                    return;
                }
                result = pertCPM(this.editor);
                break;
        }

        if (result) {
            this.showResults(result, selectedAlgorithm);
        }
    }

    /**
     * Muestra los resultados del algoritmo ejecutado
     */
    private showResults(result: PathResult, algorithmType: string) {
        this.panel.style.display = 'flex';

        // Ocultar secciones
        const validationSection = document.getElementById('validationSection')!;
        const pertResultsSection = document.getElementById('pertResultsSection')!;
        const pathResultsSection = document.getElementById('pathResultsSection')!;

        validationSection.style.display = 'none';

        if (algorithmType === 'pertcpm') {
            pertResultsSection.style.display = 'block';
            pathResultsSection.style.display = 'none';
            this.renderPertResults(result);
        } else {
            pertResultsSection.style.display = 'none';
            pathResultsSection.style.display = 'block';
            this.renderPathResults(result);
        }

        // Actualizar título
        const title = document.getElementById('algorithmPanelTitle')!;
        title.textContent = `📊 Resultados: ${result.algorithm}`;
    }

    /**
     * Renderiza resultados PERT con intervalos de confianza
     */
    private renderPertResults(result: PathResult) {
        const container = document.getElementById('pertResults')!;
        container.innerHTML = '';

        if (!result.success) {
            container.innerHTML = `<div style="color: #F44336;">${result.message}</div>`;
            return;
        }

        // Ruta crítica
        if (result.details?.nodeNames) {
            const criticalPathDiv = document.createElement('div');
            criticalPathDiv.className = 'critical-path-display';
            criticalPathDiv.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 8px;">🎯 Ruta Crítica:</div>
                <div class="path">${result.details.nodeNames.join(' → ')}</div>
            `;
            container.appendChild(criticalPathDiv);
        }

        // Estadísticas principales
        const stats = [
            { label: '⏱️ Tiempo del Proyecto', value: `${result.totalTime} ${this.currentContext.unit.shortLabel}` },
            { label: '🎯 Nodos Críticos', value: result.criticalPath?.length || 0 }
        ];

        if (result.details?.variance !== undefined && result.details.variance > 0) {
            stats.push(
                { label: '📊 Varianza', value: result.details.variance.toFixed(4) },
                { label: '📏 Desviación Estándar', value: `${result.details.stdDev.toFixed(2)} ${this.currentContext.unit.shortLabel}` }
            );
        }

        stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'pert-stat';
            statDiv.innerHTML = `
                <span class="label">${stat.label}</span>
                <span class="value">${stat.value}</span>
            `;
            container.appendChild(statDiv);
        });

        // Intervalos de confianza si hay varianza
        if (result.details?.variance && result.details.variance > 0) {
            const confidenceChart = document.getElementById('confidenceChart')!;
            confidenceChart.style.display = 'block';
            this.renderConfidenceIntervals(result);
        } else {
            const confidenceChart = document.getElementById('confidenceChart')!;
            confidenceChart.style.display = 'none';

            // Mostrar tip
            const tipDiv = document.createElement('div');
            tipDiv.style.cssText = 'margin-top: 16px; padding: 12px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid #FFC107; border-radius: 6px; font-size: 13px;';
            tipDiv.innerHTML = `
                💡 <strong>Tip:</strong> Configura estimaciones PERT (Optimista/Más Probable/Pesimista) en los nodos task para obtener análisis de varianza e intervalos de confianza.
            `;
            container.appendChild(tipDiv);
        }
    }

    /**
     * Renderiza los intervalos de confianza con visualización gráfica
     */
    private renderConfidenceIntervals(result: PathResult) {
        const canvas = document.getElementById('confidenceCanvas') as HTMLCanvasElement;
        const detailsContainer = document.getElementById('confidenceDetails')!;

        if (!canvas || !result.details) return;

        const ctx = canvas.getContext('2d')!;
        const width = canvas.width;
        const height = canvas.height;

        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);

        const mean = result.totalTime!;
        const stdDev = result.details.stdDev;
        const unit = this.currentContext.unit.shortLabel;

        // Calcular rangos
        const minValue = Math.max(0, mean - 3.5 * stdDev);
        const maxValue = mean + 3.5 * stdDev;
        const range = maxValue - minValue;

        // Función para convertir valor a coordenada X
        const valueToX = (value: number) => {
            return ((value - minValue) / range) * (width - 40) + 20;
        };

        // Dibujar curva normal
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 20; x < width - 20; x++) {
            const value = minValue + ((x - 20) / (width - 40)) * range;
            const z = (value - mean) / stdDev;
            const y = height - 40 - (Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI)) * 80;
            
            if (x === 20) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Dibujar intervalos de confianza
        const intervals = [
            { confidence: 68, color: 'rgba(76, 175, 80, 0.3)', min: result.details.confidence68.min, max: result.details.confidence68.max },
            { confidence: 95, color: 'rgba(255, 193, 7, 0.3)', min: result.details.confidence95.min, max: result.details.confidence95.max },
            { confidence: 99.7, color: 'rgba(255, 87, 34, 0.3)', min: result.details.confidence997.min, max: result.details.confidence997.max }
        ];

        intervals.forEach((interval, index) => {
            const xMin = valueToX(interval.min);
            const xMax = valueToX(interval.max);
            const y = height - 25 - (index * 8);

            ctx.fillStyle = interval.color;
            ctx.fillRect(xMin, y - 4, xMax - xMin, 8);

            ctx.strokeStyle = interval.color.replace('0.3', '0.8');
            ctx.lineWidth = 2;
            ctx.strokeRect(xMin, y - 4, xMax - xMin, 8);
        });

        // Dibujar línea de la media
        const xMean = valueToX(mean);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(xMean, 30);
        ctx.lineTo(xMean, height - 30);
        ctx.stroke();
        ctx.setLineDash([]);

        // Etiqueta de la media
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`μ = ${mean.toFixed(1)}`, xMean, 20);

        // Renderizar detalles de intervalos
        detailsContainer.innerHTML = '';
        
        const intervalsData = [
            { percentage: '68%', class: 'c68', min: result.details.confidence68.min, max: result.details.confidence68.max },
            { percentage: '95%', class: 'c95', min: result.details.confidence95.min, max: result.details.confidence95.max },
            { percentage: '99.7%', class: 'c997', min: result.details.confidence997.min, max: result.details.confidence997.max }
        ];

        intervalsData.forEach((interval: any) => {
            const div = document.createElement('div');
            div.className = `confidence-interval ${interval.class}`;
            div.innerHTML = `
                <div class="percentage">${interval.percentage} confianza</div>
                <div class="range">${interval.min.toFixed(1)} - ${interval.max.toFixed(1)} ${unit}</div>
            `;
            detailsContainer.appendChild(div);
        });
    }

    /**
     * Renderiza resultados de Dijkstra/A*
     */
    private renderPathResults(result: PathResult) {
        const container = document.getElementById('pathResults')!;
        container.innerHTML = '';

        if (!result.success) {
            container.innerHTML = `<div style="color: #F44336;">${result.message}</div>`;
            return;
        }

        // Camino encontrado
        if (result.details?.nodeNames) {
            const pathDiv = document.createElement('div');
            pathDiv.className = 'path-display';
            pathDiv.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 8px;">🗺️ Camino Óptimo:</div>
                <div class="path">${result.details.nodeNames.join(' → ')}</div>
            `;
            container.appendChild(pathDiv);
        }

        // Estadísticas
        const stats = [
            { label: '📏 Distancia/Costo Total', value: `${result.distance} ${this.currentContext.unit.shortLabel}` },
            { label: '🔢 Nodos en el camino', value: result.path?.length || 0 }
        ];

        stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'pert-stat';
            statDiv.innerHTML = `
                <span class="label">${stat.label}</span>
                <span class="value">${stat.value}</span>
            `;
            container.appendChild(statDiv);
        });
    }

    /**
     * Guarda el contexto en sessionStorage
     */
    private saveContextToStorage() {
        const contextSelect = document.getElementById('problemContextSelect') as HTMLSelectElement;
        if (contextSelect) {
            sessionStorage.setItem('problemContext', contextSelect.value);
        }
    }

    /**
     * Carga el contexto desde sessionStorage
     */
    private loadContextFromStorage() {
        const savedContext = sessionStorage.getItem('problemContext');
        if (savedContext) {
            const contextSelect = document.getElementById('problemContextSelect') as HTMLSelectElement;
            if (contextSelect) {
                contextSelect.value = savedContext;
                this.currentContext = PROBLEM_CONTEXTS[savedContext] || PROBLEM_CONTEXTS.generic;
            }
        }
    }
}
