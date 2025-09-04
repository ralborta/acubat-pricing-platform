# 🚀 Deploy en Railway - AcuBat Pricing Platform

## ✅ **SISTEMA LISTO PARA RAILWAY**

### **Configuración Completada:**
- ✅ **MongoDB removido** - Sin problemas de conexión
- ✅ **localStorage implementado** - Configuración persistente
- ✅ **Build exitoso** - Sin errores de compilación
- ✅ **Archivos de configuración** - railway.json, nixpacks.toml, server.js

## 🚀 **PASOS PARA DEPLOY EN RAILWAY:**

### **1. Crear Nuevo Proyecto en Railway**
1. Ir a [railway.app](https://railway.app)
2. Hacer clic en "New Project"
3. Seleccionar "Deploy from GitHub repo"
4. Conectar con el repositorio: `ralborta/acubat-pricing-platform`

### **2. Configurar Variables de Entorno**
En Railway Dashboard → Variables:
```
NODE_ENV=production
JWT_SECRET=acubat_jwt_secret_super_seguro_para_railway_2025
```

### **3. Deploy Automático**
- Railway detectará automáticamente los archivos de configuración
- Usará `railway.json` y `nixpacks.toml`
- Ejecutará `npm run build` y `npm start`

## 🎯 **FUNCIONALIDADES DISPONIBLES:**

### **✅ Sistema de Pricing**
- API `/api/pricing/procesar-archivo` - Procesamiento de archivos
- Configuración dinámica de markups, IVA, comisiones
- Análisis con IA

### **✅ Convertidor PDF a Excel**
- API `/api/pdf-to-excel` - Conversión automática
- Interfaz web para drag & drop

### **✅ Sistema de CronTab**
- API `/api/schedules` - Programación de tareas
- Almacenamiento de archivos

### **✅ Frontend Completo**
- Dashboard principal (`/`)
- Carga de archivos (`/carga`)
- Configuración (`/configuracion`)
- Simulaciones (`/simulaciones`)

## 🔧 **ARCHIVOS DE CONFIGURACIÓN:**

### **railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### **nixpacks.toml**
```toml
[phases.setup]
nixPkgs = ['nodejs', 'npm']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

### **server.js**
- Servidor Next.js optimizado para Railway
- Manejo de errores
- Logs informativos

## 🎉 **RESULTADO ESPERADO:**

- ✅ **Deploy exitoso** sin errores de MongoDB
- ✅ **Todas las funcionalidades** operativas
- ✅ **Configuración persistente** con localStorage
- ✅ **APIs funcionando** correctamente
- ✅ **Frontend accesible** desde la URL de Railway

## 🆘 **SOLUCIÓN DE PROBLEMAS:**

### **Si hay errores de build:**
1. Verificar que no hay referencias a MongoDB
2. Revisar logs en Railway Dashboard
3. Verificar variables de entorno

### **Si las APIs no funcionan:**
1. Verificar que `server.js` está configurado correctamente
2. Revisar logs de la aplicación
3. Verificar que las rutas están correctas

## 📞 **SOPORTE:**

- **Logs:** Railway Dashboard → Deployments → Logs
- **Variables:** Railway Dashboard → Variables
- **Dominio:** Railway Dashboard → Settings → Domains
