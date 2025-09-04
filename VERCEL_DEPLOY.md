# 🚀 Deploy en Vercel - AcuBat Pricing Platform

## ✅ **STACK CORRECTO:**

- **Vercel** = Frontend (Next.js) + APIs
- **Railway** = Backend específico (si es necesario)

## 🚀 **DEPLOY EN VERCEL:**

### **PASO 1: Conectar con Vercel**
1. Ir a [vercel.com](https://vercel.com)
2. Iniciar sesión con GitHub
3. Hacer clic en "New Project"
4. Seleccionar repositorio: `ralborta/acubat-pricing-platform`

### **PASO 2: Configuración Automática**
Vercel detectará automáticamente:
- ✅ **Framework:** Next.js
- ✅ **Build Command:** `npm run build`
- ✅ **Output Directory:** `.next`
- ✅ **Install Command:** `npm install`

### **PASO 3: Variables de Entorno**
En Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
JWT_SECRET=acubat_jwt_secret_super_seguro_para_vercel_2025
```

### **PASO 4: Deploy**
1. Hacer clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. Obtener URL del deploy

## 🎯 **FUNCIONALIDADES EN VERCEL:**

### **✅ Frontend:**
- Dashboard principal (`/`)
- Carga de archivos (`/carga`)
- Configuración (`/configuracion`)
- Simulaciones (`/simulaciones`)

### **✅ APIs (Serverless Functions):**
- `/api/config` - Configuración del sistema
- `/api/pricing/procesar-archivo` - Procesamiento de archivos
- `/api/pdf-to-excel` - Conversión PDF a Excel
- `/api/schedules` - Sistema de CronTab
- `/api/upload-file` - Carga de archivos

## 🔧 **CONFIGURACIÓN ACTUAL:**

### **vercel.json:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev:frontend",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🎉 **VENTAJAS DE VERCEL:**

- ✅ **Deploy automático** desde GitHub
- ✅ **Serverless functions** para APIs
- ✅ **CDN global** para frontend
- ✅ **HTTPS automático**
- ✅ **Dominio personalizado**
- ✅ **Sin configuración de servidor**

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### **Si hay errores de build:**
1. Verificar que no hay referencias a MongoDB
2. Revisar logs en Vercel Dashboard
3. Verificar variables de entorno

### **Si las APIs no funcionan:**
1. Verificar que las rutas están en `app/api/`
2. Revisar logs de las functions
3. Verificar que no hay dependencias de servidor

## 📞 **SOPORTE:**

- **Logs:** Vercel Dashboard → Functions → Logs
- **Variables:** Vercel Dashboard → Settings → Environment Variables
- **Dominio:** Vercel Dashboard → Settings → Domains
