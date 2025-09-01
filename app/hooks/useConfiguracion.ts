'use client'

import { useState, useEffect } from 'react';
import configManager from '../../lib/configManagerMongo';

interface ConfiguracionSistema {
  modo: string;
  iva: number;
  markups: {
    mayorista: number;
    directa: number;
    distribucion: number;
  };
  factoresVarta: {
    factorBase: number;
    capacidad80Ah: number;
  };
  promociones: boolean;
  comisiones: {
    mayorista: number;
    directa: number;
    distribucion: number;
  };
  ultimaActualizacion: string;
}

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionSistema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración inicial
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const config = await configManager.getCurrentConfig();
      setConfiguracion(config);
      setError(null);
    } catch (err) {
      setError('Error al cargar configuración');
      console.error('❌ Error cargando configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar nueva configuración
  const guardarConfiguracion = async (nuevaConfig: Partial<ConfiguracionSistema>) => {
    try {
      setLoading(true);
      const configGuardada = await configManager.saveConfig({
        ...configuracion,
        ...nuevaConfig
      });
      setConfiguracion(configGuardada);
      setError(null);
      
      // Notificar a otros componentes que la configuración cambió
      window.dispatchEvent(new CustomEvent('configuracionCambiada', { 
        detail: configGuardada 
      }));
      
      return { success: true, data: configGuardada };
    } catch (err) {
      const errorMsg = 'Error al guardar configuración';
      setError(errorMsg);
      console.error('❌ Error guardando configuración:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Resetear a configuración por defecto
  const resetearConfiguracion = async () => {
    try {
      setLoading(true);
      const configReset = await configManager.resetConfig();
      setConfiguracion(configReset);
      setError(null);
      
      // Notificar cambio
      window.dispatchEvent(new CustomEvent('configuracionCambiada', { 
        detail: configReset 
      }));
      
      return { success: true, data: configReset };
    } catch (err) {
      const errorMsg = 'Error al resetear configuración';
      setError(errorMsg);
      console.error('❌ Error reseteando configuración:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cambios de configuración desde otros componentes
  useEffect(() => {
    const handleConfiguracionCambiada = (event: CustomEvent) => {
      setConfiguracion(event.detail);
    };

    window.addEventListener('configuracionCambiada', handleConfiguracionCambiada as EventListener);
    
    return () => {
      window.removeEventListener('configuracionCambiada', handleConfiguracionCambiada as EventListener);
    };
  }, []);

  return {
    configuracion,
    loading,
    error,
    guardarConfiguracion,
    resetearConfiguracion,
    cargarConfiguracion
  };
}
