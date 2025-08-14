const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido',
        message: 'Debe proporcionar un token de autenticación válido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        message: 'El token es válido pero el usuario no existe'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Usuario inactivo',
        message: 'Su cuenta ha sido desactivada'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Su sesión ha expirado, inicie sesión nuevamente'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error interno del servidor durante la autenticación'
    });
  }
};

// Middleware para verificar roles específicos
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      });
    }

    // Los administradores tienen todos los permisos
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar si el usuario tiene los permisos requeridos
    const hasPermission = permissions.every(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        message: 'No tiene los permisos necesarios para realizar esta acción'
      });
    }

    next();
  };
};

// Middleware para verificar propiedad del recurso
const authorizeResourceOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({ 
          error: 'ID de recurso requerido',
          message: 'Debe proporcionar un ID válido'
        });
      }

      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          error: 'Recurso no encontrado',
          message: 'El recurso solicitado no existe'
        });
      }

      // Los administradores pueden acceder a todos los recursos
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Verificar si el usuario es el propietario del recurso
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso'
      });
    } catch (error) {
      console.error('Error en autorización de recurso:', error);
      return res.status(500).json({ 
        error: 'Error de autorización',
        message: 'Error interno del servidor durante la autorización'
      });
    }
  };
};

// Middleware para logging de auditoría
const auditLog = (action) => {
  return (req, res, next) => {
    const auditData = {
      action,
      userId: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      body: req.body,
      query: req.query
    };

    // Aquí podrías guardar el log en la base de datos
    console.log('🔍 AUDIT LOG:', JSON.stringify(auditData, null, 2));
    
    next();
  };
};

// Exportar la función principal por defecto
module.exports = authenticateToken;

// También exportar las funciones específicas
module.exports.authenticateToken = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
module.exports.authorizePermissions = authorizePermissions;
module.exports.authorizeResourceOwnership = authorizeResourceOwnership;
module.exports.auditLog = auditLog;
