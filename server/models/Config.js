const mongoose = require('mongoose');

// Esquema para configuración del sistema
const configSchema = new mongoose.Schema({
  // Variables USADAS en pricing (FASE 1)
  iva: {
    type: Number,
    required: true,
    default: 21,
    min: 0,
    max: 100,
    description: 'Porcentaje de IVA aplicado a precios'
  },
  
  markups: {
    mayorista: {
      type: Number,
      required: true,
      default: 22,
      min: 0,
      max: 200,
      description: 'Markup porcentual para canal mayorista (USADO en FASE 1)'
    },
    directa: {
      type: Number,
      required: true,
      default: 60,
      min: 0,
      max: 200,
      description: 'Markup porcentual para venta directa/minorista (USADO en FASE 1)'
    },
    distribucion: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
      max: 200,
      description: 'Markup porcentual para canal distribución (DISPONIBLE para futuras fases)'
    }
  },
  
  comisiones: {
    mayorista: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
      max: 50,
      description: 'Comisión porcentual para canal mayorista (USADO en FASE 1)'
    },
    directa: {
      type: Number,
      required: true,
      default: 8,
      min: 0,
      max: 50,
      description: 'Comisión porcentual para venta directa (USADO en FASE 1)'
    },
    distribucion: {
      type: Number,
      required: true,
      default: 6,
      min: 0,
      max: 50,
      description: 'Comisión porcentual para canal distribución (DISPONIBLE para futuras fases)'
    }
  },
  
  // Variables NO USADAS en pricing (FASE 1) pero necesarias en DB
  factoresVarta: {
    factorBase: {
      type: Number,
      required: true,
      default: 40,
      min: 0,
      max: 100,
      description: 'Factor base para cálculos Varta (DISPONIBLE para futuras fases)'
    },
    capacidad80Ah: {
      type: Number,
      required: true,
      default: 35,
      min: 0,
      max: 100,
      description: 'Factor para capacidad de 80Ah (DISPONIBLE para futuras fases)'
    }
  },
  
  promociones: {
    type: Boolean,
    required: true,
    default: false,
    description: 'Estado de promociones (siempre false por ahora, DISPONIBLE para futuras fases)'
  },
  
  promocionesHabilitado: {
    type: Boolean,
    required: true,
    default: false,
    description: 'Habilitación de promociones (siempre false por ahora, DISPONIBLE para futuras fases)'
  },
  
  modo: {
    type: String,
    required: true,
    enum: ['simulacion', 'produccion'],
    default: 'produccion',
    description: 'Modo de operación del sistema (DISPONIBLE para futuras fases)'
  },
  
  // Timestamps para auditoría
  ultimaActualizacion: {
    type: Date,
    default: Date.now,
    description: 'Última vez que se actualizó la configuración'
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  collection: 'configuracion_sistema' // Nombre específico de la colección
});

// Índices para optimizar consultas
configSchema.index({ modo: 1 });
configSchema.index({ ultimaActualizacion: -1 });

// Método para obtener configuración actual
configSchema.statics.getCurrentConfig = async function() {
  try {
    let config = await this.findOne().sort({ updatedAt: -1 });
    
    if (!config) {
      // Si no hay configuración, crear una con valores por defecto
      config = await this.create({});
      console.log('✅ Configuración por defecto creada en MongoDB');
    }
    
    return config;
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    throw error;
  }
};

// Método para resetear a valores por defecto
configSchema.statics.resetConfig = async function() {
  try {
    // Eliminar configuración existente
    await this.deleteMany({});
    
    // Crear nueva configuración por defecto
    const newConfig = await this.create({});
    console.log('🔄 Configuración reseteada a valores por defecto');
    
    return newConfig;
  } catch (error) {
    console.error('❌ Error reseteando configuración:', error);
    throw error;
  }
};

// Validación personalizada
configSchema.pre('save', function(next) {
  // Asegurar que promociones siempre esté desactivado (FASE 1)
  this.promociones = false;
  this.promocionesHabilitado = false;
  
  // Actualizar timestamp
  this.ultimaActualizacion = new Date();
  
  next();
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
