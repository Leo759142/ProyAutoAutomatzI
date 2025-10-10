// ExecutionPlugin.ts
// Sistema de plugins para lógica de ejecución personalizable

export interface ExecutionPlugin {
  name: string;
  description: string;
  version: string;
  
  // Configuración del plugin
  config?: {
    interval?: number; // ms entre ejecuciones
    maxIterations?: number; // máximo de iteraciones antes de parar
    timeout?: number; // timeout por nodo en ms
  };
  
  // Hooks del ciclo de ejecución
  beforeExecution?: (nodes: any[], context: ExecutionContext) => void;
  afterExecution?: (nodes: any[], context: ExecutionContext) => void;
  
  beforeNodeExecution?: (node: any, context: ExecutionContext) => boolean; // return false to skip
  afterNodeExecution?: (node: any, result: any, context: ExecutionContext) => void;
  
  onError?: (error: Error, node: any, context: ExecutionContext) => void;
  
  // Transformaciones de datos
  transformInput?: (value: any, pin: any, context: ExecutionContext) => any;
  transformOutput?: (value: any, pin: any, context: ExecutionContext) => any;
  
  // Condiciones personalizadas
  shouldContinueExecution?: (iteration: number, context: ExecutionContext) => boolean;
}

export interface ExecutionContext {
  iteration: number;
  startTime: number;
  nodeExecutionCount: Map<any, number>;
  executionMode: 'realtime' | 'step';
  customData: Map<string, any>;
  
  // Utilidades
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
  emit: (event: string, data: any) => void;
}

export class ExecutionPluginManager {
  private plugins: Map<string, ExecutionPlugin> = new Map();
  private activePlugins: string[] = [];
  private context: ExecutionContext;
  
  constructor() {
    this.context = {
      iteration: 0,
      startTime: 0,
      nodeExecutionCount: new Map(),
      executionMode: 'realtime',
      customData: new Map(),
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        console[level](`[ExecutionPlugin] ${message}`);
      },
      emit: (event: string, data: any) => {
        window.dispatchEvent(new CustomEvent(`execution.${event}`, { detail: data }));
      }
    };
  }
  
  registerPlugin(plugin: ExecutionPlugin) {
    this.plugins.set(plugin.name, plugin);
    this.context.log(`Plugin "${plugin.name}" v${plugin.version} registered`);
  }
  
  activatePlugin(pluginName: string) {
    if (this.plugins.has(pluginName) && !this.activePlugins.includes(pluginName)) {
      this.activePlugins.push(pluginName);
      this.context.log(`Plugin "${pluginName}" activated`);
    }
  }
  
  deactivatePlugin(pluginName: string) {
    const index = this.activePlugins.indexOf(pluginName);
    if (index !== -1) {
      this.activePlugins.splice(index, 1);
      this.context.log(`Plugin "${pluginName}" deactivated`);
    }
  }
  
  getActivePlugins(): ExecutionPlugin[] {
    return this.activePlugins.map(name => this.plugins.get(name)!).filter(Boolean);
  }
  
  updateContext(updates: Partial<ExecutionContext>) {
    Object.assign(this.context, updates);
  }
  
  getContext(): ExecutionContext {
    return this.context;
  }
  
  // Métodos para invocar hooks
  async executeBeforeExecution(nodes: any[]) {
    for (const plugin of this.getActivePlugins()) {
      if (plugin.beforeExecution) {
        try {
          plugin.beforeExecution(nodes, this.context);
        } catch (error) {
          this.context.log(`Error in beforeExecution for plugin ${plugin.name}: ${error}`, 'error');
        }
      }
    }
  }
  
  async executeAfterExecution(nodes: any[]) {
    for (const plugin of this.getActivePlugins()) {
      if (plugin.afterExecution) {
        try {
          plugin.afterExecution(nodes, this.context);
        } catch (error) {
          this.context.log(`Error in afterExecution for plugin ${plugin.name}: ${error}`, 'error');
        }
      }
    }
  }
  
  async executeBeforeNodeExecution(node: any): Promise<boolean> {
    for (const plugin of this.getActivePlugins()) {
      if (plugin.beforeNodeExecution) {
        try {
          const shouldContinue = plugin.beforeNodeExecution(node, this.context);
          if (!shouldContinue) return false;
        } catch (error) {
          this.context.log(`Error in beforeNodeExecution for plugin ${plugin.name}: ${error}`, 'error');
          if (plugin.onError) plugin.onError(error as Error, node, this.context);
        }
      }
    }
    return true;
  }
  
  async executeAfterNodeExecution(node: any, result: any) {
    for (const plugin of this.getActivePlugins()) {
      if (plugin.afterNodeExecution) {
        try {
          plugin.afterNodeExecution(node, result, this.context);
        } catch (error) {
          this.context.log(`Error in afterNodeExecution for plugin ${plugin.name}: ${error}`, 'error');
          if (plugin.onError) plugin.onError(error as Error, node, this.context);
        }
      }
    }
  }
  
  transformInput(value: any, pin: any): any {
    let transformedValue = value;
    for (const plugin of this.getActivePlugins()) {
      if (plugin.transformInput) {
        try {
          transformedValue = plugin.transformInput(transformedValue, pin, this.context);
        } catch (error) {
          this.context.log(`Error in transformInput for plugin ${plugin.name}: ${error}`, 'error');
        }
      }
    }
    return transformedValue;
  }
  
  transformOutput(value: any, pin: any): any {
    let transformedValue = value;
    for (const plugin of this.getActivePlugins()) {
      if (plugin.transformOutput) {
        try {
          transformedValue = plugin.transformOutput(transformedValue, pin, this.context);
        } catch (error) {
          this.context.log(`Error in transformOutput for plugin ${plugin.name}: ${error}`, 'error');
        }
      }
    }
    return transformedValue;
  }
  
  shouldContinueExecution(): boolean {
    for (const plugin of this.getActivePlugins()) {
      if (plugin.shouldContinueExecution) {
        try {
          if (!plugin.shouldContinueExecution(this.context.iteration, this.context)) {
            return false;
          }
        } catch (error) {
          this.context.log(`Error in shouldContinueExecution for plugin ${plugin.name}: ${error}`, 'error');
        }
      }
    }
    return true;
  }
}