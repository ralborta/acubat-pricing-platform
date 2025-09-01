// ConfigManager para MongoDB (compatible con Railway)
const mongoose = require('mongoose');
let Config;

try {
  // Verificar si el modelo ya existe antes de requerirlo
  if (mongoose.models.Config) {
    Config = mongoose.models.Config;
  } else {
    Config = require('../server/models/Config');
  }
} catch (error) {
  console.warn('⚠️ No se pudo cargar el modelo Config, usando fallback');
  Config = null;
}

class ConfigManagerMongo {
  constructor() {
    this.defaultConfig = {
      modo: 'produccion',
      iva: 21,
      markups: {
        mayorista: 22,
        directa: 60,
        distribucion: 20
      },
      factoresVarta: {
        factorBase: 40,
        capacidad80Ah: 35
      },
      promociones: false,
      promocionesHabilitado: false,
      comisiones: {
        mayorista: 5,
        directa: 8,
        distribucion: 6
      },
      ultimaActualizacion: new Date().toISOString()
    };
  }

  // Cargar configuración desde MongoDB
  async loadConfig() {
    try {
      // Verificar si Config está disponible
      if (!Config) {
        console.warn('⚠️ Modelo Config no disponible, usando valores por defecto');
        return this.defaultConfig;
      }
      
      // Intentar obtener configuración de MongoDB
      const config = await Config.getCurrentConfig();
      
      if (config) {
        console.log('✅ Configuración cargada desde MongoDB');
        return this.formatConfigForFrontend(config);
      }
      
      console.log('📁 No hay configuración en MongoDB, usando valores por defecto');
      return this.defaultConfig;
    } catch (error) {
      console.error('❌ Error cargando configuración desde MongoDB:', error);
      console.log('⚠️ Fallback a valores por defecto');
      return this.defaultConfig;
    }
  }

  // Guardar configuración en MongoDB
  async saveConfig(config) {
    try {
      // Verificar si Config está disponible
      if (!Config) {
        console.warn('⚠️ Modelo Config no disponible, no se puede guardar');
        throw new Error('Modelo Config no disponible');
      }
      
      // Asegurar que promociones siempre esté desactivado (FASE 1)
      const configToSave = {
        ...config,
        promociones: false,
        promocionesHabilitado: false,
        ultimaActualizacion: new Date()
      };

      // Guardar en MongoDB
      const savedConfig = await Config.findOneAndUpdate(
        {}, // Buscar cualquier configuración existente
        configToSave,
        { 
          new: true, // Retornar el documento actualizado
          upsert: true, // Crear si no existe
          runValidators: true // Ejecutar validaciones del esquema
        }
      );

      console.log('✅ Configuración guardada en MongoDB');
      return this.formatConfigForFrontend(savedConfig);
    } catch (error) {
      console.error('❌ Error guardando configuración en MongoDB:', error);
      throw error;
    }
  }

  // Resetear a configuración por defecto
  async resetConfig() {
    try {
      // Verificar si Config está disponible
      if (!Config) {
        console.warn('⚠️ Modelo Config no disponible, no se puede resetear');
        throw new Error('Modelo Config no disponible');
      }
      
      const resetConfig = await Config.resetConfig();
      console.log('🔄 Configuración reseteada a valores por defecto en MongoDB');
      return this.formatConfigForFrontend(resetConfig);
    } catch (error) {
      console.error('❌ Error reseteando configuración en MongoDB:', error);
      throw error;
    }
  }

  // Obtener configuración actual
  async getCurrentConfig() {
    return await this.loadConfig();
  }

  // Actualizar configuración específica
  async updateConfig(updates) {
    try {
      const currentConfig = await this.loadConfig();
      const updatedConfig = {
        ...currentConfig,
        ...updates
      };

      // Asegurar que promociones siempre esté desactivado (FASE 1)
      updatedConfig.promociones = false;
      updatedConfig.promocionesHabilitado = false;

      return await this.saveConfig(updatedConfig);
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      throw error;
    }
  }

  // Validar configuración
  validateConfig(config) {
    const errors = [];

    // Validar IVA
    if (typeof config.iva !== 'number' || config.iva < 0 || config.iva > 100) {
      errors.push('IVA debe ser un número entre 0 y 100');
    }

    // Validar markups
    if (config.markups) {
      ['mayorista', 'directa', 'distribucion'].forEach(canal => {
        if (config.markups[canal]) {
          if (typeof config.markups[canal] !== 'number' || config.markups[canal] < 0 || config.markups[canal] > 200) {
            errors.push(`Markup ${canal} debe ser un número entre 0 y 200`);
          }
        }
      });
    }

    // Validar comisiones
    if (config.comisiones) {
      ['mayorista', 'directa', 'distribucion'].forEach(canal => {
        if (config.comisiones[canal]) {
          if (typeof config.comisiones[canal] !== 'number' || config.comisiones[canal] < 0 || config.comisiones[canal] > 50) {
            errors.push(`Comisión ${canal} debe ser un número entre 0 y 50`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Formatear configuración para el frontend (mantener compatibilidad)
  formatConfigForFrontend(mongoConfig) {
    return {
      modo: mongoConfig.modo || 'produccion',
      iva: mongoConfig.iva || 21,
      markups: {
        mayorista: mongoConfig.markups?.mayorista || 22,
        directa: mongoConfig.markups?.directa || 60,
        distribucion: mongoConfig.markups?.distribucion || 20
      },
      factoresVarta: {
        factorBase: mongoConfig.factoresVarta?.factorBase || 40,
        capacidad80Ah: mongoConfig.factoresVarta?.capacidad80Ah || 35
      },
      promociones: false, // Siempre false en FASE 1
      promocionesHabilitado: false, // Siempre false en FASE 1
      comisiones: {
        mayorista: mongoConfig.comisiones?.mayorista || 5,
        directa: mongoConfig.comisiones?.directa || 8,
        distribucion: mongoConfig.comisiones?.distribucion || 6
      },
      ultimaActualizacion: mongoConfig.ultimaActualizacion || new Date().toISOString()
    };
  }

  // Método para verificar conexión a MongoDB
  async testConnection() {
    try {
      await Config.findOne().limit(1);
      console.log('✅ Conexión a MongoDB exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error de conexión a MongoDB:', error);
      return false;
    }
  }
}

// Crear instancia única
const configManagerMongo = new ConfigManagerMongo();

// Exportar instancia
module.exports = configManagerMongo;
