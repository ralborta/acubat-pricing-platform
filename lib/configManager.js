import fs from 'fs';
import path from 'path';

class ConfigManager {
  constructor() {
    this.configFile = path.join(process.cwd(), 'config', 'configuracion.json');
    this.defaultConfig = {
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

  // Cargar configuración
  async loadConfig() {
    try {
      if (!fs.existsSync(this.configFile)) {
        console.log('📁 Archivo de configuración no encontrado, creando por defecto...');
        await this.saveConfig(this.defaultConfig);
        return this.defaultConfig;
      }

      const data = fs.readFileSync(this.configFile, 'utf8');
      const config = JSON.parse(data);
      
      console.log('✅ Configuración cargada exitosamente');
      return config;
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      console.log('🔄 Usando configuración por defecto...');
      return this.defaultConfig;
    }
  }

  // Guardar configuración
  async saveConfig(config) {
    try {
      // Asegurar que promociones siempre esté desactivado
      const configToSave = {
        ...config,
        promociones: false,
        promocionesHabilitado: false,
        ultimaActualizacion: new Date().toISOString()
      };

      // Crear directorio si no existe
      const configDir = path.dirname(this.configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.configFile, JSON.stringify(configToSave, null, 2));
      
      console.log('✅ Configuración guardada exitosamente');
      return configToSave;
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      throw error;
    }
  }

  // Resetear a configuración por defecto
  async resetConfig() {
    try {
      const resetConfig = await this.saveConfig(this.defaultConfig);
      console.log('🔄 Configuración reseteada a valores por defecto');
      return resetConfig;
    } catch (error) {
      console.error('❌ Error reseteando configuración:', error);
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

      // Asegurar que promociones siempre esté desactivado
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
    Object.entries(config.markups).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 1000) {
        errors.push(`Markup ${key} debe ser un número entre 0 y 1000`);
      }
    });

    // Validar factores Varta
    Object.entries(config.factoresVarta).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        errors.push(`Factor Varta ${key} debe ser un número entre 0 y 100`);
      }
    });

    // Validar comisiones
    Object.entries(config.comisiones).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        errors.push(`Comisión ${key} debe ser un número entre 0 y 100`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia global del config manager
const configManager = new ConfigManager();

export default configManager;
