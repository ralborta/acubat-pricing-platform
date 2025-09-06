// ConfigManager para Supabase (base de datos)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

class ConfigManagerSupabase {
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

  // Inicializar configuración por defecto en la DB
  async initializeDefaultConfig() {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, usando configuración local');
      return this.defaultConfig;
    }

    try {
      // Verificar si ya existe configuración
      const { data: existingConfig, error: fetchError } = await supabase
        .from('config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('❌ Error verificando configuración existente:', fetchError);
        return this.defaultConfig;
      }

      // Si no hay configuración, insertar la por defecto
      if (!existingConfig || existingConfig.length === 0) {
        console.log('🚀 Inicializando configuración por defecto en Supabase...');
        
        const { data, error } = await supabase
          .from('config')
          .insert([{ config_data: this.defaultConfig }])
          .select();

        if (error) {
          console.error('❌ Error insertando configuración por defecto:', error);
          return this.defaultConfig;
        }

        console.log('✅ Configuración por defecto inicializada en Supabase');
        return this.defaultConfig;
      }

      // Si ya existe, devolver la más reciente
      console.log('✅ Configuración existente encontrada en Supabase');
      return existingConfig[0].config_data;
    } catch (error) {
      console.error('❌ Error inicializando configuración:', error);
      return this.defaultConfig;
    }
  }

  // Cargar configuración desde Supabase
  async loadConfig() {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, usando configuración por defecto');
      return this.defaultConfig;
    }

    try {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error cargando configuración desde Supabase:', error);
        return await this.initializeDefaultConfig();
      }

      if (!data || data.length === 0) {
        console.log('📁 No hay configuración en Supabase, inicializando...');
        return await this.initializeDefaultConfig();
      }

      console.log('✅ Configuración cargada desde Supabase:', data[0].config_data);
      console.log('📅 Fecha de actualización:', data[0].created_at);
      console.log('🆔 ID de la configuración:', data[0].id);
      console.log('🔍 Total de configuraciones encontradas:', data.length);
      return data[0].config_data;
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      return this.defaultConfig;
    }
  }

  // Guardar configuración en Supabase
  async saveConfig(config) {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se puede guardar');
      return config;
    }

    try {
      // Asegurar que promociones siempre esté desactivado
      const configToSave = {
        ...config,
        promociones: false,
        promocionesHabilitado: false,
        ultimaActualizacion: new Date().toISOString()
      };

      // Primero eliminar TODAS las configuraciones existentes
      const { error: deleteError } = await supabase
        .from('config')
        .delete()
        .neq('id', 0); // Eliminar todas las filas

      if (deleteError) {
        console.error('❌ Error eliminando configuraciones:', deleteError);
      } else {
        console.log('✅ Todas las configuraciones anteriores eliminadas');
      }

      // Luego insertar la nueva configuración
      const { data, error } = await supabase
        .from('config')
        .insert([{ config_data: configToSave }])
        .select();

      if (error) {
        console.error('❌ Error guardando configuración en Supabase:', error);
        throw error;
      }

      console.log('✅ Configuración guardada en Supabase');
      return configToSave;
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
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

  // Resetear a configuración por defecto
  async resetConfig() {
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se puede resetear');
      return this.defaultConfig;
    }

    try {
      // Eliminar todas las configuraciones existentes
      const { error: deleteError } = await supabase
        .from('config')
        .delete()
        .neq('id', 0); // Eliminar todos los registros

      if (deleteError) {
        console.error('❌ Error eliminando configuraciones existentes:', deleteError);
      }

      // Insertar configuración por defecto
      return await this.initializeDefaultConfig();
    } catch (error) {
      console.error('❌ Error reseteando configuración:', error);
      throw error;
    }
  }

  // Validar configuración
  validateConfig(config) {
    const errors = [];

    // Validar IVA
    if (config.iva !== undefined && (typeof config.iva !== 'number' || config.iva < 0 || config.iva > 100)) {
      errors.push('IVA debe ser un número entre 0 y 100');
    }

    // Validar markups
    if (config.markups && typeof config.markups === 'object') {
      Object.entries(config.markups).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 1000) {
          errors.push(`Markup ${key} debe ser un número entre 0 y 1000`);
        }
      });
    }

    // Validar factores Varta
    if (config.factoresVarta && typeof config.factoresVarta === 'object') {
      Object.entries(config.factoresVarta).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push(`Factor Varta ${key} debe ser un número entre 0 y 100`);
        }
      });
    }

    // Validar comisiones
    if (config.comisiones && typeof config.comisiones === 'object') {
      Object.entries(config.comisiones).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push(`Comisión ${key} debe ser un número entre 0 y 100`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia global del config manager
const configManagerSupabase = new ConfigManagerSupabase();

export default configManagerSupabase;

