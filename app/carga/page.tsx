'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Eye, BarChart3, TrendingUp, DollarSign, Package, Users } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function CargaArchivos() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [processResults, setProcessResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
    setProcessResults([]) // Limpiar resultados anteriores
    setShowResults(false)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadStatus('idle')
    setProcessResults([])

    try {
      console.log('🚀 Iniciando procesamiento de archivos...')
      const results = []
      
      // Procesar cada archivo
      for (const file of files) {
        console.log('📁 Procesando archivo:', file.name)
        
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/pricing/procesar-archivo', {
          method: 'POST',
          body: formData,
        })
        
        console.log('📊 Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ Archivo procesado exitosamente:', result)
        results.push(result)
      }
      
      setProcessResults(results)
      setUploadStatus('success')
      setShowResults(true)
      console.log('🎉 Todos los archivos procesados correctamente')
      
    } catch (error) {
      console.error('❌ Error en el procesamiento:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const downloadResults = (result: any) => {
    // Convertir los datos procesados a CSV
    if (!result.productos || result.productos.length === 0) {
      alert('No hay datos para descargar')
      return
    }

    const productos = result.productos
    const headers = [
      'ID', 'Marca', 'Modelo', 'Línea', 'Canal', 'Precio Base', 
      'Precio con Markup', 'Precio Final', 'Markup (%)', 
      'Margen Bruto (%)', 'Margen Neto (%)', 'Rentabilidad', 
      'Estado', 'Alertas'
    ]
    
    // Crear CSV
    let csvContent = headers.join(',') + '\n'
    productos.forEach((producto: any) => {
      const markupPorcentaje = producto.precio_base > 0 ? 
        Math.round(((producto.precio_con_markup / producto.precio_base) - 1) * 100) : 0
      
      const valores = [
        producto.id,
        producto.marca,
        producto.modelo,
        producto.linea_producto,
        producto.canal,
        producto.precio_base,
        producto.precio_con_markup,
        producto.precio_redondeado,
        markupPorcentaje,
        producto.margen?.bruto || 0,
        producto.margen?.neto || 0,
        producto.rentabilidad,
        producto.estado_proceso,
        producto.alertas.join('; ')
      ]
      
      const valoresEscapados = valores.map(valor => {
        const strValor = String(valor)
        if (strValor.includes(',')) {
          return `"${strValor.replace(/"/g, '""')}"`
        }
        return strValor
      })
      
      csvContent += valoresEscapados.join(',') + '\n'
    })

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${result.archivo}_pricing_completo.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Pricing Completo</h1>
            <p className="text-gray-600">Procesa archivos Excel con lógica de pricing avanzada, markups por marca/canal y análisis de rentabilidad</p>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos Excel aquí o haz clic para seleccionar
            </div>
            <p className="text-gray-500 mb-4">
              Soporta archivos Excel (.xlsx, .xls) con columnas: marca, modelo, precio, canal
            </p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Seleccionar Archivos Excel
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && !showResults && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Archivos Seleccionados ({files.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Botón de Procesamiento */}
              <div className="px-6 py-4 bg-gray-50">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando Sistema de Pricing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ejecutar Sistema de Pricing Completo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Resultados del Procesamiento */}
          {showResults && processResults.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    ¡Sistema de Pricing ejecutado exitosamente!
                  </span>
                </div>
              </div>

              {processResults.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        📊 {result.archivo} - Sistema de Pricing Completo
                      </h3>
                      <button
                        onClick={() => downloadResults(result)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar CSV Completo
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    {/* Estadísticas Principales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.estadisticas?.total_productos || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Productos</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {result.estadisticas?.productos_rentables || 0}
                        </div>
                        <div className="text-sm text-gray-500">Rentables</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {result.estadisticas?.productos_no_rentables || 0}
                        </div>
                        <div className="text-sm text-gray-500">No Rentables</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {result.estadisticas?.productos_con_error || 0}
                        </div>
                        <div className="text-sm text-gray-500">Con Error</div>
                      </div>
                    </div>

                    {/* Estadísticas de Margen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {formatPercentage(result.estadisticas?.margen_promedio || 0)}
                        </div>
                        <div className="text-sm text-gray-500">Margen Promedio</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-bold text-indigo-600">
                          {formatPercentage(result.estadisticas?.margen_minimo || 0)}
                        </div>
                        <div className="text-sm text-gray-500">Margen Mínimo</div>
                      </div>
                      <div className="text-center p-4 bg-teal-50 rounded-lg">
                        <div className="text-xl font-bold text-teal-600">
                          {formatPercentage(result.estadisticas?.margen_maximo || 0)}
                        </div>
                        <div className="text-sm text-gray-500">Margen Máximo</div>
                      </div>
                    </div>

                    {/* Análisis por Marca */}
                    {result.estadisticas?.analisis_por_marca && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          Análisis por Marca
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(result.estadisticas.analisis_por_marca).map(([marca, datos]: [string, any]) => (
                            <div key={marca} className="p-4 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900 mb-2">{marca}</div>
                              <div className="text-sm text-gray-600">
                                <div>Total: {datos.total}</div>
                                <div>Rentables: {datos.rentables}</div>
                                <div>Margen Prom: {formatPercentage(datos.margen_promedio)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Análisis por Canal */}
                    {result.estadisticas?.analisis_por_canal && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Análisis por Canal
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(result.estadisticas.analisis_por_canal).map(([canal, datos]: [string, any]) => (
                            <div key={canal} className="p-4 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900 mb-2">{canal}</div>
                              <div className="text-sm text-gray-600">
                                <div>Total: {datos.total}</div>
                                <div>Rentables: {datos.rentables}</div>
                                <div>Margen Prom: {formatPercentage(datos.margen_promedio)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Configuración del Sistema */}
                    {result.configuracion && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Configuración del Sistema
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-2">Markups por Marca y Canal</div>
                            <div className="text-sm text-gray-600">
                              {Object.entries(result.configuracion.markups).map(([marca, canales]: [string, any]) => (
                                <div key={marca} className="mb-1">
                                  <span className="font-medium">{marca}:</span>
                                  {Object.entries(canales).map(([canal, markup]: [string, any]) => (
                                    <span key={canal} className="ml-2">
                                      {canal} ({Math.round((markup - 1) * 100)}%)
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-2">Tipos de Redondeo</div>
                            <div className="text-sm text-gray-600">
                              {Object.entries(result.configuracion.redondeo).map(([canal, tipo]: [string, any]) => (
                                <div key={canal}>
                                  <span className="font-medium">{canal}:</span> {tipo}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Muestra de Productos Procesados */}
                    {result.productos && result.productos.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <Eye className="h-5 w-5 mr-2" />
                          Vista Previa de Productos Procesados
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Base</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Final</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentabilidad</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {result.productos.slice(0, 5).map((producto: any, rowIndex: number) => (
                                <tr key={rowIndex} className={producto.estado_proceso === 'ERROR' ? 'bg-red-50' : ''}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {producto.marca}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {producto.modelo}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {producto.canal}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(producto.precio_base)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(producto.precio_redondeado)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {formatPercentage(producto.margen?.bruto || 0)}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      producto.rentabilidad === 'RENTABLE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {producto.rentabilidad}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {result.productos.length > 5 && (
                          <p className="text-sm text-gray-500 mt-2">
                            ... y {result.productos.length - 5} productos más
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Botón para procesar nuevos archivos */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setFiles([])
                    setProcessResults([])
                    setShowResults(false)
                    setUploadStatus('idle')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Procesar Nuevos Archivos
                </button>
              </div>
            </div>
          )}

          {/* Error Status */}
          {uploadStatus === 'error' && (
            <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  Error en el procesamiento. Inténtalo de nuevo.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
