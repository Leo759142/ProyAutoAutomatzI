# 🚀 Deployment a GitHub Pages con Vite

## 📋 Pasos para configurar GitHub Pages

### 1. Habilitar GitHub Pages en tu repositorio

1. Ve a tu repositorio en GitHub: `https://github.com/Leo759142/ProyAutoAutomatzI`
2. Click en **Settings** (⚙️ Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source** (Fuente), selecciona:
   - **Source**: `GitHub Actions` (NO "Deploy from a branch")
   - Esto permitirá que el workflow automatizado funcione

### 2. Push de los archivos de configuración

```bash
# Agregar los archivos nuevos
git add .github/workflows/deploy.yml
git add vite.config.ts
git add package.json
git add DEPLOY_INSTRUCTIONS.md

# Commit
git commit -m "🚀 Configurar deployment a GitHub Pages con Vite"

# Push a tu rama (Comparativa o main)
git push origin Comparativa
```

### 3. El deployment se ejecutará automáticamente

Una vez que hagas push, GitHub Actions ejecutará automáticamente el workflow:

1. 📥 Descarga el código
2. 🟢 Instala Node.js y dependencias
3. 🔨 Ejecuta `npm run build` con Vite
4. 📤 Sube los archivos a GitHub Pages
5. 🚀 Despliega la aplicación

**Puedes ver el progreso en**: `https://github.com/Leo759142/ProyAutoAutomatzI/actions`

### 4. Accede a tu aplicación

Una vez completado el deployment, tu aplicación estará disponible en:

🌐 **URL**: `https://leo759142.github.io/ProyAutoAutomatzI/`

---

## 🛠️ Comandos útiles

### Desarrollo local
```bash
npm run dev
```
- Inicia servidor de desarrollo en `http://localhost:5173`
- Hot reload automático

### Build local
```bash
npm run build
```
- Genera archivos optimizados en `/dist`
- Minificación y tree-shaking

### Preview del build
```bash
npm run preview
```
- Previsualiza el build en `http://localhost:4173`
- Simula el entorno de producción

---

## 📁 Estructura de archivos

```
ProyAutoAutomatzI/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✨ Workflow de GitHub Actions
├── src/                        # Código fuente
├── dist/                       # Build de producción (generado)
├── index.html                  # HTML principal
├── vite.config.ts              # ✨ Configuración de Vite
├── package.json                # ✨ Scripts actualizados
└── tsconfig.json               # Configuración TypeScript
```

---

## 🔄 Re-deployment automático

Cada vez que hagas push a las ramas configuradas (`main` o `Comparativa`), la aplicación se re-desplegará automáticamente.

```bash
# Hacer cambios en tu código
git add .
git commit -m "✨ Nueva feature"
git push origin Comparativa

# ✅ GitHub Actions se encargará del resto
```

---

## 🐛 Troubleshooting

### El workflow falla con error de permisos

**Solución**: 
1. Ve a **Settings** → **Actions** → **General**
2. En **Workflow permissions**, selecciona:
   - ✅ **Read and write permissions**
3. Guarda los cambios

### La página muestra 404 o no carga recursos

**Solución**: Verifica que `vite.config.ts` tenga el `base` correcto:
```typescript
base: '/ProyAutoAutomatzI/',  // Debe coincidir con el nombre del repo
```

### Los estilos o scripts no cargan

**Causa**: Rutas absolutas en el código
**Solución**: Vite maneja automáticamente las rutas, pero verifica que uses rutas relativas o imports de módulos

---

## 📊 Monitoreo del deployment

- **Actions**: `https://github.com/Leo759142/ProyAutoAutomatzI/actions`
- **GitHub Pages**: `https://github.com/Leo759142/ProyAutoAutomatzI/settings/pages`
- **URL Live**: `https://leo759142.github.io/ProyAutoAutomatzI/`

---

## ✨ Características del setup

- ✅ Build optimizado con Vite
- ✅ Deploy automático con GitHub Actions
- ✅ Soporte TypeScript
- ✅ Minificación y tree-shaking
- ✅ Hot Module Replacement (HMR) en desarrollo
- ✅ Configuración lista para producción

---

## 🎯 Próximos pasos

1. ✅ Hacer push de los cambios
2. ✅ Habilitar GitHub Pages en Settings
3. ✅ Esperar a que termine el workflow (~2-3 min)
4. ✅ ¡Acceder a tu app en la URL de GitHub Pages!

**¡Listo! Tu aplicación estará en línea en minutos.** 🎉
