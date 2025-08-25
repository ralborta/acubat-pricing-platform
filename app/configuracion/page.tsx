'use client'

import { useState } from 'react'
import { Cog6ToothIcon, CurrencyDollarIcon, ChartBarIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

interface ConfiguracionSistema {
  modo: 'simulacion' | 'produccion'
  iva: number
  markups: {
    mayorista: number
    directa: number
    distribucion: {
      base: number
      factorCapacidad: number
      factorLinea: number
    }
  }
  factoresVarta: {
    base: number
    capacidad80: number
    capacidad60: number
    capacidadMenor60: number
    estandar: number
    asiatica: number
  }
  redondeo: {
    mayorista: number
    directa: number
  }
  rentabilidad: {
    margenMinimo: number
    criterios: {
      mayorista: number
      directa: number
    }
  }
  promociones: {
    activo: boolean
    porcentaje: number
    aplicaDesde: number
  }
  comisiones: {
    mayorista: number
    directa: number
    distribucion: number
  }
  otros: {
    descuentoEfectivo: number
    descuentoVolumen: number
    umbralVolumen: number
  }
}

interface ConfiguracionAgente {
  diasOperacion: string[]
  agenteSeleccionado: string
  horarioDesde: string
  horarioHasta: string
  fechasSeleccionadas: string[]
}

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionSistema>({
    modo: 'produccion',
    iva: 21,
    markups: {
      mayorista: 22,
      directa: 60,
      distribucion: {
        base: 20,
        factorCapacidad: 15,
        factorLinea: 10
      }
    },
    factoresVarta: {
      base: 40,
      capacidad80: 35,
      capacidad60: 38,
      capacidadMenor60: 42,
      estandar: 5,
      asiatica: 10
    },
    redondeo: {
      mayorista: 100,
      directa: 50
    },
    rentabilidad: {
      margenMinimo: 15,
      criterios: {
        mayorista: 20,
        directa: 25
      }
    },
    promociones: {
      activo: false,
      porcentaje: 10,
      aplicaDesde: 100000
    },
    comisiones: {
      mayorista: 5,
      directa: 8,
      distribucion: 6
    },
    otros: {
      descuentoEfectivo: 3,
      descuentoVolumen: 5,
      umbralVolumen: 10
    }
  })

  // Estado para configuración del agente
  const [configuracionAgente, setConfiguracionAgente] = useState<ConfiguracionAgente>({
    diasOperacion: ['Lun', 'Mar', 'Mie'],
    agenteSeleccionado: 'Agente Water WhatsApp',
    horarioDesde: '09:00',
    horarioHasta: '18:00',
    fechasSeleccionadas: []
  })

  // Estado para el calendario
  const [mesActual, setMesActual] = useState(new Date())

  const [opcionSeleccionada, setOpcionSeleccionada] = useState<'variables' | 'rentabilidad' | 'agente' | null>(null)

  const handleConfigChange = (path: string, value: any) => {
    setConfiguracion(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current: any = newConfig
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newConfig
    })
  }

  const guardarConfiguracion = () => {
    // Aquí iría la lógica para guardar en base de datos o localStorage
    console.log('Configuración guardada:', configuracion)
    alert('Configuración guardada exitosamente')
  }

  const resetearConfiguracion = () => {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración?')) {
      setConfiguracion({
        modo: 'produccion',
        iva: 21,
        markups: {
          mayorista: 22,
          directa: 60,
          distribucion: {
            base: 20,
            factorCapacidad: 15,
            factorLinea: 10
          }
        },
        factoresVarta: {
          base: 40,
          capacidad80: 35,
          capacidad60: 38,
          capacidadMenor60: 42,
          estandar: 5,
          asiatica: 10
        },
        redondeo: {
          mayorista: 100,
          directa: 50
        },
        rentabilidad: {
          margenMinimo: 15,
          criterios: {
            mayorista: 20,
            directa: 25
          }
        },
        promociones: {
          activo: false,
          porcentaje: 10,
          aplicaDesde: 100000
        },
        comisiones: {
          mayorista: 5,
          directa: 8,
          distribucion: 6
        },
        otros: {
          descuentoEfectivo: 3,
          descuentoVolumen: 5,
          umbralVolumen: 10
        }
      })
      setConfiguracionAgente({
        diasOperacion: ['Lun', 'Mar', 'Mie'],
        agenteSeleccionado: 'Agente Water WhatsApp',
        horarioDesde: '09:00',
        horarioHasta: '18:00',
        fechasSeleccionadas: []
      })
    }
  }

  // Funciones del calendario
  const obtenerDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear()
    const mes = fecha.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const primerDiaSemana = primerDia.getDay()
    
    const dias = []
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null)
    }
    
    // Agregar todos los días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i))
    }
    
    return dias
  }

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    setMesActual(prev => {
      const nuevoMes = new Date(prev)
      if (direccion === 'anterior') {
        nuevoMes.setMonth(prev.getMonth() - 1)
      } else {
        nuevoMes.setMonth(prev.getMonth() + 1)
      }
      return nuevoMes
    })
  }

  const toggleFecha = (fecha: Date) => {
    const fechaString = fecha.toISOString().split('T')[0]
    setConfiguracionAgente(prev => {
      const nuevasFechas = prev.fechasSeleccionadas.includes(fechaString)
        ? prev.fechasSeleccionadas.filter(f => f !== fechaString)
        : [...prev.fechasSeleccionadas, fechaString]
      return { ...prev, fechasSeleccionadas: nuevasFechas }
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración del Sistema
            </h1>
            <p className="text-gray-600">
              Configura todos los parámetros del sistema de pricing
            </p>
          </div>

          {/* Switch Principal: Simulación vs Producción */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Modo de Operación
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {configuracion.modo === 'simulacion' 
                      ? 'Modo simulación: Los cambios no afectan la producción'
                      : 'Modo producción: Los cambios se aplican inmediatamente'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${
                    configuracion.modo === 'simulacion' ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    Simulación
                  </span>
                  <button
                    onClick={() => handleConfigChange('modo', configuracion.modo === 'produccion' ? 'simulacion' : 'produccion')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      configuracion.modo === 'simulacion' ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      configuracion.modo === 'simulacion' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`text-sm font-medium ${
                    configuracion.modo === 'produccion' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    Producción
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de Opciones */}
          {!opcionSeleccionada && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Opción 1: Variables del Sistema */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('variables')}>
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Cog6ToothIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Variables del Sistema
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Configura IVA, Markups, Factores Varta, Redondeo, Promociones y Comisiones
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Configurar Parámetros
                  </div>
                </div>

                {/* Opción 2: Validación de Rentabilidad */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('rentabilidad')}>
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <ChartBarIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Validación de Rentabilidad
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Configura niveles mínimos de rentabilidad por canal y criterios de validación
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Configurar Rentabilidad
                  </div>
                </div>

                {/* Opción 3: Configurar Agente */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('agente')}>
                  <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Configurar Agente
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Define horarios, procesos automatizados, reportes y conexiones del agente
                  </p>
                  <div className="text-sm text-purple-600 font-medium">
                    Configurar Agente IA
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opción 1: Variables del Sistema */}
          {opcionSeleccionada === 'variables' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              <div className="space-y-6">
                {/* IVA */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de IVA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de IVA
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.iva}
                          onChange={(e) => handleConfigChange('iva', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Markups por Canal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Markups por Canal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mayorista
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.markups.mayorista}
                          onChange={(e) => handleConfigChange('markups.mayorista', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Directa
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.markups.directa}
                          onChange={(e) => handleConfigChange('markups.directa', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribución
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.markups.distribucion.base}
                          onChange={(e) => handleConfigChange('markups.distribucion.base', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factores Varta */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Factores de Equivalencia Varta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Factor Base
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.factoresVarta.base}
                          onChange={(e) => handleConfigChange('factoresVarta.base', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad ≥80Ah
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.factoresVarta.capacidad80}
                          onChange={(e) => handleConfigChange('factoresVarta.capacidad80', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promociones */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sistema de Promociones</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={configuracion.promociones.activo}
                        onChange={(e) => handleConfigChange('promociones.activo', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Activar sistema de promociones
                      </label>
                    </div>
                    {configuracion.promociones.activo && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Porcentaje de descuento
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={configuracion.promociones.porcentaje}
                              onChange={(e) => handleConfigChange('promociones.porcentaje', parseFloat(e.target.value))}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              min="0"
                              max="50"
                              step="0.1"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-gray-500 sm:text-sm">%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aplica desde (monto)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={configuracion.promociones.aplicaDesde}
                              onChange={(e) => handleConfigChange('promociones.aplicaDesde', parseFloat(e.target.value))}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              min="0"
                              step="1000"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comisiones */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Comisiones por Canal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mayorista
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.comisiones.mayorista}
                          onChange={(e) => handleConfigChange('comisiones.mayorista', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Directa
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.comisiones.directa}
                          onChange={(e) => handleConfigChange('comisiones.directa', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribución
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={configuracion.comisiones.distribucion}
                          onChange={(e) => handleConfigChange('comisiones.distribucion', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between">
                  <button
                    onClick={resetearConfiguracion}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Resetear Configuración
                  </button>
                  <button
                    onClick={guardarConfiguracion}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Opción 2: Validación de Rentabilidad */}
          {opcionSeleccionada === 'rentabilidad' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              <div className="space-y-6">
                {/* Margen Mínimo General */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Margen Mínimo de Rentabilidad</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margen mínimo general: {configuracion.rentabilidad.margenMinimo}%
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={configuracion.rentabilidad.margenMinimo}
                        onChange={(e) => handleConfigChange('rentabilidad.margenMinimo', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criterios por Canal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Criterios de Rentabilidad por Canal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">Mayorista</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Margen mínimo: {configuracion.rentabilidad.criterios.mayorista}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="40"
                            value={configuracion.rentabilidad.criterios.mayorista}
                            onChange={(e) => handleConfigChange('rentabilidad.criterios.mayorista', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>10%</span>
                            <span>40%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">Directa</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Margen mínimo: {configuracion.rentabilidad.criterios.directa}%
                          </label>
                          <input
                            type="range"
                            min="15"
                            max="50"
                            value={configuracion.rentabilidad.criterios.directa}
                            onChange={(e) => handleConfigChange('rentabilidad.criterios.directa', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>15%</span>
                            <span>50%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between">
                  <button
                    onClick={resetearConfiguracion}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Resetear Configuración
                  </button>
                  <button
                    onClick={guardarConfiguracion}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Opción 3: Configurar Agente */}
          {opcionSeleccionada === 'agente' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              <div className="space-y-6">
                {/* Horario, Días y Calendario */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm">🕐</span>
                    </span>
                    Horario, Días y Calendario
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Días de la semana y horarios */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Días de operación</label>
                        <div className="flex gap-2">
                          {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                            <button
                              key={dia}
                              onClick={() => {
                                const nuevosDias = configuracionAgente.diasOperacion.includes(dia)
                                  ? configuracionAgente.diasOperacion.filter(d => d !== dia)
                                  : [...configuracionAgente.diasOperacion, dia]
                                setConfiguracionAgente(prev => ({
                                  ...prev,
                                  diasOperacion: nuevosDias
                                }))
                              }}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                configuracionAgente.diasOperacion.includes(dia)
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {dia}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                          <input
                            type="time"
                            value={configuracionAgente.horarioDesde}
                            onChange={(e) => setConfiguracionAgente(prev => ({
                              ...prev,
                              horarioDesde: e.target.value
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                          <input
                            type="time"
                            value={configuracionAgente.horarioHasta}
                            onChange={(e) => setConfiguracionAgente(prev => ({
                              ...prev,
                              horarioHasta: e.target.value
                            }))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calendario del mes */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Calendario del mes</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => cambiarMes('anterior')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            ←
                          </button>
                          <span className="text-sm font-medium text-gray-900">
                            {mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => cambiarMes('siguiente')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            →
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {/* Días de la semana */}
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((dia) => (
                          <div key={dia} className="text-center text-xs font-medium text-gray-500 py-1">
                            {dia}
                          </div>
                        ))}
                        
                        {/* Días del mes */}
                        {obtenerDiasDelMes(mesActual).map((fecha, index) => (
                          <div key={index} className="text-center">
                            {fecha ? (
                              <button
                                onClick={() => toggleFecha(fecha)}
                                className={`w-8 h-8 text-xs rounded-md transition-colors ${
                                  configuracionAgente.fechasSeleccionadas.includes(fecha.toISOString().split('T')[0])
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {fecha.getDate()}
                              </button>
                            ) : (
                              <div className="w-8 h-8"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Fechas seleccionadas: {configuracionAgente.fechasSeleccionadas.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reporte de Pricing y Rentabilidad */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📊</span>
                    </span>
                    Reporte de Pricing y Rentabilidad
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enviar reportes a</label>
                      <input
                        type="email"
                        defaultValue="pricing@acubat.com"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Formato de reporte</label>
                      <div className="flex gap-2">
                        {['Excel', 'PDF', 'CSV'].map((formato) => (
                          <button
                            key={formato}
                            className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            {formato}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de reportes</label>
                      <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option>Diario</option>
                        <option>Semanal</option>
                        <option>Mensual</option>
                        <option>Al detectar cambios</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Procesos Automatizados de Pricing */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-yellow-600 text-sm">⚡</span>
                    </span>
                    Procesos Automatizados de Pricing
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button className="px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                        Calcular Pricing
                      </button>
                      <button className="px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                        Analizar Rentabilidad
                      </button>
                      <button className="px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                        Generar Reportes
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors">
                        Sincronizar Precios
                      </button>
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors">
                        Actualizar Equivalencias
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conexión y Archivos de Pricing */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600 text-sm">🔗</span>
                    </span>
                    Conexión y Archivos de Pricing
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Agente</label>
                      <div className="relative">
                        <select
                          value={configuracionAgente.agenteSeleccionado}
                          onChange={(e) => setConfiguracionAgente(prev => ({
                            ...prev,
                            agenteSeleccionado: e.target.value
                          }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm appearance-none bg-white pr-8"
                        >
                          <option value="Agente Water WhatsApp">Agente Water WhatsApp</option>
                          <option value="Consuelo Contabilidad">Consuelo Contabilidad</option>
                          <option value="Bruna Administración">Bruna Administración</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-800 text-sm font-medium">Agente conectado</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 text-sm">{configuracionAgente.agenteSeleccionado}</span>
                        <span className="text-green-600">→</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de archivo soportados</label>
                      <div className="flex gap-2">
                        {['XLSX', 'XLS', 'CSV'].map((tipo) => (
                          <button
                            key={tipo}
                            className="px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuentes de datos</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Lista de precios Moura</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Equivalencias Varta</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Precios base Varta</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instrucciones del Agente de Pricing */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm">⚙️</span>
                    </span>
                    Instrucciones del Agente de Pricing
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones específicas para pricing</label>
                      <textarea
                        rows={4}
                        defaultValue="Analiza precios de baterías Moura, calcula equivalencias Varta, aplica markups por canal (Mayorista +22%, Directa +60%), valida rentabilidad mínima del 15%, genera reportes de pricing por canal con análisis de rentabilidad. Prioriza productos con mayor margen y alerta sobre precios no rentables."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Estas instrucciones se enviarán al agente en cada ejecución de pricing.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parámetros de alerta</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Margen mínimo crítico</label>
                          <input
                            type="number"
                            defaultValue="10"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            min="0"
                            max="50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Variación de precio máxima</label>
                          <input
                            type="number"
                            defaultValue="25"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between">
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors duration-200">
                    Guardar Configuración del Agente
                  </button>
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200">
                    Probar Agente de Pricing
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
