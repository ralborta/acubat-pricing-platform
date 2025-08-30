# 🚀 AcuBat - Plataforma de Pricing

Una plataforma completa y moderna para la gestión y análisis de precios en call centers, con capacidades avanzadas de simulación y reglas de pricing.

## ✨ Características Principales

- **Dashboard Intuitivo**: Vista general con métricas clave y gráficos interactivos
- **Gestión de Productos**: Sistema completo de productos con análisis de márgenes
- **Simulaciones Avanzadas**: Motor de simulación para análisis de pricing
- **Sistema de Reglas**: Rulesets configurables para automatización de precios
- **Autenticación Segura**: JWT con roles y permisos granulares
- **API REST Completa**: Backend robusto con Node.js y MongoDB
- **Frontend Moderno**: React con TypeScript y Tailwind CSS
- **Gráficos Interactivos**: Chart.js para visualización de datos
- **Responsive Design**: Interfaz adaptativa para todos los dispositivos

## 🏗️ Arquitectura del Sistema

```
AcuBat/
├── app/                    # Frontend Next.js
│   ├── components/        # Componentes React
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página del dashboard
├── server/                # Backend Node.js
│   ├── config/           # Configuración de BD
│   ├── middleware/       # Middleware de auth
│   ├── models/           # Modelos de MongoDB
│   └── routes/           # Rutas de la API
├── package.json           # Dependencias del proyecto
├── tailwind.config.js     # Configuración de Tailwind
└── README.md             # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- MongoDB 5+
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd acubat-pricing-platform
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Base de Datos MongoDB
MONGODB_URI=mongodb://localhost:27017/acubat_pricing

# JWT Secret
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Configuración de Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar MongoDB

Asegúrate de que MongoDB esté ejecutándose:

```bash
# En macOS con Homebrew
brew services start mongodb-community

# En Ubuntu/Debian
sudo systemctl start mongod

# En Windows
net start MongoDB
```

### 5. Ejecutar el Sistema

#### Desarrollo (Frontend + Backend simultáneamente)
```bash
npm run dev
```

#### Solo Frontend
```bash
npm run dev:frontend
```

#### Solo Backend
```bash
npm run dev:backend
```

#### Producción
```bash
npm run build
npm run start
npm run start:backend
```

## 🌐 Acceso al Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔐 Autenticación

### Crear Usuario Administrador

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@acubat.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Iniciar Sesión

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acubat.com",
    "password": "admin123"
  }'
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener perfil
- `PUT /api/auth/me` - Actualizar perfil

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/products-daily` - Productos por día
- `GET /api/dashboard/margin-distribution` - Distribución de márgenes
- `GET /api/dashboard/recent-activity` - Actividad reciente
- `GET /api/dashboard/performance-metrics` - Métricas de rendimiento
- `GET /api/dashboard/alerts` - Alertas y notificaciones

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Simulaciones
- `GET /api/simulations` - Listar simulaciones
- `POST /api/simulations` - Crear simulación
- `POST /api/simulations/:id/start` - Iniciar simulación
- `GET /api/simulations/:id/results` - Obtener resultados

### Rulesets
- `GET /api/rulesets` - Listar rulesets
- `POST /api/rulesets` - Crear ruleset
- `PUT /api/rulesets/:id` - Actualizar ruleset
- `POST /api/rulesets/:id/execute` - Ejecutar ruleset

## 🎯 Funcionalidades del Dashboard

### Métricas KPI
- **Total de Productos**: Conteo total y tendencia
- **Margen Promedio**: Margen promedio del portafolio
- **Tasa de Éxito**: Porcentaje de productos rentables
- **Productos Críticos**: Productos con margen bajo
- **Simulaciones**: Estado de simulaciones activas
- **Tiempo Total**: Tiempo de procesamiento acumulado

### Gráficos
- **Productos por Día**: Actividad de los últimos 7 días
- **Distribución de Márgenes**: Estado de rentabilidad por producto

### Navegación
- **Dashboard**: Vista general del call center
- **Carga de Archivos**: Subir archivos Excel
- **Simulaciones**: Ejecutar simulaciones de pricing
- **Rulesets**: Gestionar reglas de pricing
- **Publicaciones**: Publicar resultados
- **Configuración**: Configurar sistema
- **Reportes**: Generar reportes
- **Ayuda**: Centro de ayuda

## 🔧 Configuración Avanzada

### Personalizar Colores

Edita `tailwind.config.js` para cambiar la paleta de colores:

```javascript
colors: {
  'acubat': {
    50: '#f0f4ff',
    100: '#e0e9ff',
    // ... más colores
  }
}
```

### Configurar Base de Datos

El sistema soporta diferentes configuraciones de MongoDB:

```javascript
// Conexión local
MONGODB_URI=mongodb://localhost:27017/acubat_pricing

// Conexión con autenticación
MONGODB_URI=mongodb://usuario:password@localhost:27017/acubat_pricing

// Conexión Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/acubat_pricing
```

### Configurar Rate Limiting

Ajusta las limitaciones de velocidad en `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100    # 100 requests por ventana
```

## 🚀 Despliegue en Producción

### 1. Configurar Variables de Producción

```env
NODE_ENV=production
JWT_SECRET=secret_muy_seguro_y_largo
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/acubat_pricing
```

### 2. Construir la Aplicación

```bash
npm run build
```

### 3. Configurar Servidor Web

#### Con PM2
```bash
npm install -g pm2
pm2 start server/index.js --name "acubat-backend"
pm2 start npm --name "acubat-frontend" -- start
```

#### Con Docker
```bash
docker build -t acubat .
docker run -p 5000:5000 -p 3000:3000 acubat
```

### 4. Configurar Proxy Reverso (Nginx)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testing

### Ejecutar Tests del Backend

```bash
npm test
```

### Ejecutar Tests del Frontend

```bash
npm run test:frontend
```

### Tests de Integración

```bash
npm run test:integration
```

## 📝 Logs y Monitoreo

### Logs del Sistema

Los logs se guardan en:
- `logs/app.log` - Logs de la aplicación
- `logs/error.log` - Logs de errores
- `logs/audit.log` - Logs de auditoría

### Métricas de Rendimiento

El sistema incluye métricas integradas:
- Tiempo de respuesta de API
- Uso de memoria y CPU
- Estadísticas de base de datos
- Métricas de autenticación

## 🔒 Seguridad

### Características de Seguridad

- **JWT Tokens**: Autenticación segura con expiración
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de acceso entre dominios
- **Validación**: Validación de entrada con express-validator
- **Auditoría**: Logs completos de todas las acciones

### Mejores Prácticas

1. Cambia el `JWT_SECRET` en producción
2. Usa HTTPS en producción
3. Configura firewalls apropiados
4. Monitorea logs regularmente
5. Actualiza dependencias regularmente

## 🤝 Contribución

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo
refactor: refactorización de código
test: tests
chore: tareas de mantenimiento
```

### Proceso de Contribución

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

### Documentación
- [Documentación de la API](docs/api.md)
- [Guía de Usuario](docs/user-guide.md)
- [Guía de Desarrollador](docs/developer-guide.md)

### Contacto
- **Email**: soporte@acubat.com
- **Issues**: [GitHub Issues](https://github.com/acubat/issues)
- **Discord**: [Servidor de la Comunidad](https://discord.gg/acubat)

### Comunidad
- **Foro**: [Foro de Usuarios](https://forum.acubat.com)
- **Blog**: [Blog Oficial](https://blog.acubat.com)
- **YouTube**: [Canal de Tutoriales](https://youtube.com/acubat)

---

**AcuBat** - Transformando la gestión de precios en call centers 🚀

*Desarrollado con ❤️ por el equipo de AcuBat*
# Configuración actualizada Sun Aug 24 22:29:20 -03 2025
# Forzar deploy Vercel - Rollback completado
# Forzar deploy
