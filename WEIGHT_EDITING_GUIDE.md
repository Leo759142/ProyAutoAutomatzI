# Guía de Edición de Pesos en Conexiones

## 🔧 Nueva Funcionalidad: Editar Pesos de Conexiones

### ¿Cómo editar pesos?
1. **Doble click** en cualquier línea de conexión (la línea amarilla/dorada entre nodos)
2. Aparecerá un prompt preguntando por el nuevo peso
3. Ingresa el valor numérico deseado (ejemplo: 5, 2.5, 10)
4. Presiona Enter para confirmar
5. El nuevo peso se mostrará automáticamente sobre la línea de conexión

### ✅ Características
- **Detección inteligente**: El doble click detecta automáticamente la conexión más cercana
- **Visualización inmediata**: Los pesos se muestran como números azules sobre las líneas
- **Compatibilidad con algoritmos**: Los algoritmos de Dijkstra, A* y PERT-CPM usarán automáticamente los pesos editados
- **Auditoría**: Todos los cambios de peso se registran en el log de auditoría

### 🎯 Casos de uso
- **Algoritmos de rutas**: Definir costos/distancias entre nodos para Dijkstra y A*
- **PERT-CPM**: Establecer duraciones de tareas para análisis de camino crítico
- **Grafos ponderados**: Crear redes con pesos específicos para análisis

### 📝 Notas importantes
- Los pesos por defecto son **1** si no se especifica
- Se pueden usar **números decimales** (ej: 2.5, 0.8)
- Para **eliminar conexiones**, usa **click derecho** en la línea o en los pines
- Los cambios se **guardan automáticamente** en la sesión actual

### 🔍 Resolución de problemas del canvas
- **Canvas aplastado**: Corregido - los info-panels ya no afectan el zoom del canvas
- **Info-panel desbordado**: Limitado a máximo 10 líneas con scroll visual
- **Responsividad**: Mejores proporciones en todos los niveles de zoom

### 🎮 Controles rápidos
- **Doble click en nodo**: Abrir panel de propiedades
- **Doble click en línea**: Editar peso de conexión
- **Click derecho en línea**: Eliminar conexión
- **Click derecho en pin**: Eliminar todas las conexiones del pin