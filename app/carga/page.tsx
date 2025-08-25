'use client'

import { useState, useRef } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon, PlayIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, TableCellsIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ProcessVisualizer from '@/components/ProcessVisualizer'

interface Producto {
  id: number
  codigo_original: string
  tipo: string
  gtia_meses: number
  bome: string
  c20_ah: number
  rc_min: number
  cca: number
  denominacion: string
  dimensiones: string
  linea: string
  precio_lista_moura: number
  precio_varta_equivalente: number
  precio_promedio_final: number
  tiene_equivalencia_varta: boolean
  codigo_varta: string
  precio_varta: number
  marca_referencia: string
  canal: string
  precios_canales: {
    [key: string]: {
      nombre: string
      precio_final: number
      markup: string
      margen_bruto: string
      rentabilidad: string
      iva_aplicado: number
      iva_porcentaje: string
      precio_base_canal: number
      precio_iva_desglosado: {
        precio_base: number
        markup_aplicado: number
        subtotal: number
        iva: number
        precio_final: number
      }
    }
  }
  utilidad_total_estimada: number
  margen_promedio: string
  rentabilidad_general: string
  canales_rentables: number
  total_canales: number
  estado: string
  fecha_calculo: string
  observaciones: string
}

interface Resultado {
  success: boolean
  archivo: string
  timestamp: string
  estadisticas: any
  mensaje: string
  tipo_procesamiento: string
  datos_procesados: Producto[]
  archivo_original: {
    nombre: string
    tamaño: number
    tipo: string
    filas_procesadas: number
  }
  headers_detectados: string[]
  sistema: any
}

export default function CargaPage() {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<'base' | 'pricing' | 'simulacion' | null>(null)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [archivoNombre, setArchivoNombre] = useState<string>('')
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string>('')
  const [procesosCompletados, setProcesosCompletados] = useState<boolean[]>([false, false, false, false])
  const [mostrarTodosProductos, setMostrarTodosProductos] = useState(false)
  const [showProcessVisualizer, setShowProcessVisualizer] = useState(false)
  const [productosAMostrar, setProductosAMostrar] = useState<Producto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Función para formatear moneda
  const formatCurrency = (amount: number | string): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0'
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Función para formatear porcentaje
  const formatPercentage = (amount: number | string): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0%'
    }
    return `${amount.toFixed(1)}%`
  }

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setArchivoSeleccionado(file)
      setArchivoNombre(file.name)
      setError('')
      setResultado(null)
      setProcesosCompletados([false, false, false, false])
      setMostrarTodosProductos(false)
    }
  }

  // Simular procesos de carga
  const simularProcesos = async () => {
    setProcesosCompletados([false, false, false, false])
    
    // Proceso 1: Validación del archivo
    await new Promise(resolve => setTimeout(resolve, 800))
    setProcesosCompletados([true, false, false, false])
    setProgreso(25)
    
    // Proceso 2: Lectura de datos
    await new Promise(resolve => setTimeout(resolve, 1000))
    setProcesosCompletados([true, true, false, false])
    setProgreso(50)
    
    // Proceso 3: Aplicación de pricing
    await new Promise(resolve => setTimeout(resolve, 1200))
    setProcesosCompletados([true, true, true, false])
    setProgreso(75)
    
    // Proceso 4: Generación de resultados
    await new Promise(resolve => setTimeout(resolve, 600))
    setProcesosCompletados([true, true, true, true])
    setProgreso(100)
  }

  // Procesar archivo
  const procesarArchivo = async () => {
    if (!archivoSeleccionado) return

    setProcesando(true)
    setProgreso(0)
    setError('')
    
    try {
      // Mostrar visualizador de proceso
      setShowProcessVisualizer(true)
      
      // Simular progreso del visualizador mientras se procesa
      const simularProgreso = () => {
        let paso = 0
        const interval = setInterval(() => {
          paso++
          if (paso <= 8) {
            // Simular progreso del paso actual
            setProgreso((paso / 8) * 100)
          } else {
            clearInterval(interval)
          }
        }, 2000) // 2 segundos por paso
        
        return interval
      }
      
      const progresoInterval = simularProgreso()
      
      // Llamada real a la API
      const formData = new FormData()
      formData.append('file', archivoSeleccionado)
      
      const response = await fetch('/api/pricing/procesar-archivo', {
        method: 'POST',
        body: formData
      })
      
      // Limpiar el intervalo de progreso
      clearInterval(progresoInterval)
      
      if (!response.ok) {
        throw new Error('Error al procesar el archivo')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setResultado(data)
        setProductosAMostrar(data.datos_procesados || [])
        setProgreso(100) // Completar al 100%
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setProcesando(false)
    }
  }

  // Callback cuando se complete el proceso visual
  const handleProcessComplete = () => {
    setShowProcessVisualizer(false)
    setProcesando(false)
  }

  // Descargar resultados como CSV
  const downloadResults = () => {
    if (!resultado) return

    const headers = [
      'Modelo',
      'Descripción',
      'Canal',
      'Precio Base Moura',
      'Precio Varta',
      'Precio Final',
      'Markup',
      'Margen',
      'Rentabilidad'
    ]

    const csvContent = [
      headers.join(','),
      ...resultado.datos_procesados.map(producto => [
        producto.codigo_original,
        producto.denominacion,
        producto.canal,
        producto.precio_lista_moura,
        producto.precio_varta,
        producto.precio_promedio_final,
        producto.precios_canales[producto.canal.toLowerCase()]?.markup || '',
        producto.precios_canales[producto.canal.toLowerCase()]?.margen_bruto || '',
        producto.precios_canales[producto.canal.toLowerCase()]?.rentabilidad || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pricing_resultados_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Obtener productos para mostrar (4 iniciales o todos)
  const productosParaMostrar = productosAMostrar.length > 0 ? 
    (mostrarTodosProductos ? productosAMostrar : productosAMostrar.slice(0, 12)) : []

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Pricing Acubat
            </h1>
            <p className="text-gray-600">
              Sistema profesional para gestión de pricing de baterías con análisis completo de rentabilidad
            </p>
          </div>

          {/* Selección de Opciones */}
          {!opcionSeleccionada && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Opción 1: Archivos de Base */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('base')}>
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <TableCellsIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Archivos de Base
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Carga tu tabla de equivalencias Varta y lista de precios base para el sistema
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Cargar Equivalencias + Precios Base
                  </div>
                </div>

                {/* Opción 2: Calcular Pricing */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('pricing')}>
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CurrencyDollarIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Calcular Pricing
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Procesa archivos de baterías y obtén pricing profesional por canal
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    Calcular Pricing por Canal
                  </div>
                </div>

                {/* Opción 3: Archivos Simulación */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpcionSeleccionada('simulacion')}>
                  <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Archivos Simulación
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Carga archivos para revisión y validación sin procesamiento
                  </p>
                  <div className="text-sm text-purple-600 font-medium">
                    Cargar y Validar Archivos
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opción 1: Archivos de Base */}
          {opcionSeleccionada === 'base' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <TableCellsIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    📋 Cargar Archivos de Base
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Carga tu tabla de equivalencias Varta y lista de precios base
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tabla de Equivalencias */}
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                      <TableCellsIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tabla de Equivalencias
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Mapeo Varta ↔ Moura
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setArchivoSeleccionado(file)
                          setArchivoNombre(file.name)
                        }
                      }}
                      className="hidden"
                      id="equivalencias-input"
                    />
                    <label
                      htmlFor="equivalencias-input"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Cargar Excel
                    </label>
                  </div>

                  {/* Lista de Precios Base */}
                  <div className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Lista de Precios Base
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Precios Varta de referencia
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setArchivoSeleccionado(file)
                          setArchivoNombre(file.name)
                        }
                      }}
                      className="hidden"
                      id="precios-input"
                    />
                    <label
                      htmlFor="precios-input"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Cargar Excel
                    </label>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  {archivoSeleccionado && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-800 text-sm">
                        ✅ Archivo cargado: <strong>{archivoNombre}</strong>
                      </p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (archivoSeleccionado) {
                        setOpcionSeleccionada('pricing')
                      } else {
                        alert('Por favor, carga un archivo primero')
                      }
                    }}
                    disabled={!archivoSeleccionado}
                    className={`inline-flex items-center px-6 py-3 font-medium rounded-md transition-colors duration-200 ${
                      archivoSeleccionado 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {archivoSeleccionado ? 'Continuar a Pricing' : 'Cargar Archivo Primero'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Opción 2: Calcular Pricing (TU PANTALLA ACTUAL - SIN CAMBIOS) */}
          {opcionSeleccionada === 'pricing' && (
            <div className="max-w-6xl">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              {/* Botón de Carga */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <ArrowUpTrayIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Cargar Archivo Excel
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Selecciona tu archivo de baterías para procesar
                    </p>
                  </div>

                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Botón de selección */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </button>
                </div>

                {/* Archivo seleccionado */}
                {archivoSeleccionado && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-green-800">
                          Archivo Seleccionado
                        </h3>
                        <p className="text-green-700 text-sm">{archivoNombre}</p>
                        <p className="text-green-600 text-xs">
                          Tamaño: {formatFileSize(archivoSeleccionado.size)} | 
                          Tipo: {archivoSeleccionado.type || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Procesar */}
              {archivoSeleccionado && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      ¿Listo para procesar?
                    </h3>
                    
                    {/* Botón de procesar con progress */}
                    <button
                      onClick={procesarArchivo}
                      disabled={procesando}
                      className={`relative overflow-hidden inline-flex items-center px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        procesando 
                          ? 'bg-gray-400 cursor-not-allowed text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {procesando ? (
                        <>
                          <span className="relative z-10">Procesando...</span>
                          {/* Progress bar */}
                          <div 
                            className="absolute inset-0 bg-green-500 transition-all duration-300 ease-out"
                            style={{ width: `${progreso}%` }}
                          />
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Procesar Archivo
                        </>
                      )}
                    </button>

                    {/* Barra de progreso */}
                    {procesando && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Progreso: {progreso}%
                        </p>
                      </div>
                    )}

                    {/* Procesos con checkmarks */}
                    {procesando && (
                      <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                        <div className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-all duration-300 ${
                          procesosCompletados[0] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <CheckCircleIcon className={`w-4 h-4 ${
                            procesosCompletados[0] ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            procesosCompletados[0] ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            Validación
                          </span>
                        </div>

                        <div className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-all duration-300 ${
                          procesosCompletados[1] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <CheckCircleIcon className={`w-4 h-4 ${
                            procesosCompletados[1] ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            procesosCompletados[1] ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            Lectura
                          </span>
                        </div>

                        <div className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-all duration-300 ${
                          procesosCompletados[2] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <CheckCircleIcon className={`w-4 h-4 ${
                            procesosCompletados[2] ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            procesosCompletados[2] ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            Pricing
                          </span>
                        </div>

                        <div className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-all duration-300 ${
                          procesosCompletados[3] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <CheckCircleIcon className={`w-4 h-4 ${
                            procesosCompletados[3] ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            procesosCompletados[3] ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            Resultados
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resultados */}
              {resultado && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      ¡Procesamiento Completado!
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {resultado.mensaje}
                    </p>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {resultado.estadisticas.total_productos}
                        </div>
                        <div className="text-blue-800 text-sm font-medium">Total Productos</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {resultado.estadisticas.productos_rentables}
                        </div>
                        <div className="text-green-800 text-sm font-medium">Rentables</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {resultado.estadisticas.con_equivalencia_varta}
                        </div>
                        <div className="text-purple-800 text-sm font-medium">Con Varta</div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 mb-1">
                          {resultado.estadisticas.margen_promedio_general}
                        </div>
                        <div className="text-indigo-800 text-sm font-medium">Margen Promedio</div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de descarga */}
                  <div className="text-center mb-6">
                    <button
                      onClick={downloadResults}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    >
                      📊 Descargar Excel con Resultados
                    </button>
                  </div>

                  {/* Vista Previa de Productos Procesados */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Productos Procesados por Canal
                      </h3>
                      <div className="text-sm text-gray-500">
                        Mostrando {productosParaMostrar.length} de {productosAMostrar.length} productos
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-md overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Modelo
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Descripción
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Canal
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Precio Base Moura
                            </th>
                                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Precio Varta
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Precio Final
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Markup
                              </th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                IVA
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Desglose
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Margen
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Rentabilidad
                              </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {productosParaMostrar.map((producto) => (
                            <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b">
                                {producto.codigo_original}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600 border-b max-w-xs truncate">
                                {producto.denominacion}
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  producto.canal === 'MAYORISTA' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {producto.canal}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-b font-medium">
                                {formatCurrency(producto.precio_lista_moura)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-700 border-b">
                                {formatCurrency(producto.precio_varta)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 border-b font-medium">
                                {formatCurrency(producto.precio_promedio_final)}
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <span className="text-gray-700 font-medium">
                                  {producto.precios_canales[producto.canal.toLowerCase()]?.markup || ''}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <span className="text-red-600 font-medium">
                                  {formatCurrency(producto.precios_canales[producto.canal.toLowerCase()]?.iva_aplicado || 0)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="font-medium">Base: {formatCurrency(producto.precios_canales[producto.canal.toLowerCase()]?.precio_base_canal || 0)}</div>
                                  <div className="text-blue-600">+IVA: {formatCurrency(producto.precios_canales[producto.canal.toLowerCase()]?.iva_aplicado || 0)}</div>
                                  <div className="text-green-600">Final: {formatCurrency(producto.precio_promedio_final)}</div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <span className="text-gray-700 font-medium">
                                  {producto.precios_canales[producto.canal.toLowerCase()]?.margen_bruto || ''}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-sm border-b">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  producto.rentabilidad_general === 'RENTABLE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {producto.rentabilidad_general === 'RENTABLE' ? '✅ RENTABLE' : '❌ NO RENTABLE'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Botón de expansión */}
                    {resultado.datos_procesados.length > 12 && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setMostrarTodosProductos(!mostrarTodosProductos)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                        >
                          {mostrarTodosProductos ? (
                            <>
                              <ChevronUpIcon className="w-4 h-4 mr-2" />
                              Ocultar Productos
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="w-4 h-4 mr-2" />
                              Ver Todos los Productos ({resultado.datos_procesados.length})
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Información del sistema */}
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Sistema de Pricing Acubat v{resultado.sistema.version}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {resultado.sistema.tipo} - Optimizado para máximo rendimiento
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {resultado.sistema.funcionalidades.map((func: string, index: number) => (
                          <span key={index} className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-gray-200">
                            {func}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opción 3: Archivos Simulación */}
          {opcionSeleccionada === 'simulacion' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setOpcionSeleccionada(null)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  ← Volver a Opciones
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <DocumentTextIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Archivos Simulación
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Carga archivos para revisión y validación sin procesamiento
                  </p>
                </div>

                {/* Botón de Carga */}
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <ArrowUpTrayIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Cargar Archivo Excel
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selecciona tu archivo para revisión
                    </p>
                  </div>

                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Botón de selección */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </button>
                </div>

                {/* Archivo seleccionado */}
                {archivoSeleccionado && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-purple-800">
                          Archivo Seleccionado
                        </h3>
                        <p className="text-purple-700 text-sm">{archivoNombre}</p>
                        <p className="text-purple-600 text-xs">
                          Tamaño: {formatFileSize(archivoSeleccionado.size)} | 
                          Tipo: {archivoSeleccionado.type || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje de simulación */}
                {archivoSeleccionado && (
                  <div className="mt-6 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 text-sm font-medium">
                          Archivo cargado correctamente para simulación
                        </span>
                      </div>
                      <p className="text-blue-600 text-xs mt-2">
                        Este archivo está listo para revisión. No se procesará ni calculará pricing.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Visualizador de Proceso */}
      <ProcessVisualizer
        isVisible={showProcessVisualizer}
        onComplete={handleProcessComplete}
        fileName={archivoNombre || 'Archivo'}
      />
    </div>
  )
}

