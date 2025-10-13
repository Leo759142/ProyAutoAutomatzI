# 🚀 GUÍA RÁPIDA: Deploy a GitHub Pages

## ✅ Archivos creados/modificados

- ✅ `vite.config.ts` - Configuración de Vite con base URL
- ✅ `.github/workflows/deploy.yml` - Workflow de GitHub Actions
- ✅ `package.json` - Scripts actualizados
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `DEPLOY_INSTRUCTIONS.md` - Documentación completa
- ✅ Build probado localmente ✓

---

## 📝 PASOS A SEGUIR (Copiar y pegar)

### 1️⃣ Hacer commit y push de los cambios

```bash
# Agregar todos los archivos nuevos
git add .github/workflows/deploy.yml
git add vite.config.ts
git add package.json
git add .gitignore
git add DEPLOY_INSTRUCTIONS.md
git add QUICK_START.md

# Commit
git commit -m "🚀 Configurar deployment automático a GitHub Pages con Vite"

# Push (ajusta la rama si es necesario)
git push origin Comparativa
```

### 2️⃣ Configurar GitHub Pages (IMPORTANTE)

1. Ve a: `https://github.com/Leo759142/ProyAutoAutomatzI/settings/pages`

2. En **"Source"** (Fuente), selecciona:
   ```
   ⚙️ Source: GitHub Actions
   ```
   (NO selecciones "Deploy from a branch")

3. Guarda los cambios

### 3️⃣ Esperar el deployment

El workflow se ejecutará automáticamente:
- Monitorea el progreso en: `https://github.com/Leo759142/ProyAutoAutomatzI/actions`
- Tarda aproximadamente 2-3 minutos

### 4️⃣ ¡Acceder a tu aplicación!

Una vez completado, tu app estará disponible en:

```
🌐 https://leo759142.github.io/ProyAutoAutomatzI/
```

---

## 🔄 Actualizaciones futuras

Cada vez que hagas push, se re-desplegará automáticamente:

```bash
# Hacer cambios en tu código
git add .
git commit -m "✨ Nuevas mejoras"
git push origin Comparativa

# ✅ GitHub Actions se encarga del deployment
```

---

## 🛠️ Comandos locales útiles

```bash
# Desarrollo local con hot reload
npm run dev
# → http://localhost:5173

# Build de producción
npm run build
# → Genera archivos en /dist

# Preview del build
npm run preview
# → http://localhost:4173
```

---

## ⚠️ Troubleshooting

### Error: "Workflow permissions"

**Solución**:
1. Ve a `Settings` → `Actions` → `General`
2. En "Workflow permissions", selecciona:
   - ✅ **Read and write permissions**
3. Guarda

### La página no carga correctamente

**Verifica** que `vite.config.ts` tenga:
```typescript
base: '/ProyAutoAutomatzI/',  // ← Nombre exacto del repo
```

---

## 📊 URLs importantes

- **Repositorio**: `https://github.com/Leo759142/ProyAutoAutomatzI`
- **Actions**: `https://github.com/Leo759142/ProyAutoAutomatzI/actions`
- **Settings Pages**: `https://github.com/Leo759142/ProyAutoAutomatzI/settings/pages`
- **App Live**: `https://leo759142.github.io/ProyAutoAutomatzI/`

---

## ✨ ¡Eso es todo!

Sigue los 4 pasos y tu aplicación estará en línea en minutos. 🎉
