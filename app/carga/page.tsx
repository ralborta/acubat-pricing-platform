'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Eye, BarChart3 } from 'lucide-react'
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
    if (!result.datos_procesados || result.datos_procesados.length === 0) {
      alert('No hay datos para descargar')
      return
    }

    const datos = result.datos_procesados
    const headers = Object.keys(datos[0])
    
    // Crear CSV
    let csvContent = headers.join(',') + '\n'
    datos.forEach((fila: any) => {
      const valores = headers.map(header => {
        const valor = fila[header]
        // Escapar comillas y agregar comillas si contiene comas
        if (typeof valor === 'string' && valor.includes(',')) {
          return `"${valor.replace(/"/g, '""')}"`
        }
        return valor || ''
      })
      csvContent += valores.join(',') + '\n'
    })

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${result.archivo}_procesado.csv`)
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Procesador de Pricing</h1>
            <p className="text-gray-600">Sube archivos Excel para procesar pricing y generar resultados</p>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos Excel aquí o haz clic para seleccionar
            </div>
            <p className="text-gray-500 mb-4">
              Soporta archivos Excel (.xlsx, .xls)
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
                      Procesando Pricing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Procesar Pricing
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
                    ¡Procesamiento completado exitosamente!
                  </span>
                </div>
              </div>

              {processResults.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        📊 {result.archivo}
                      </h3>
                      <button
                        onClick={() => downloadResults(result)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar CSV
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.estadisticas?.registros_procesados || 0}
                        </div>
                        <div className="text-sm text-gray-500">Registros Procesados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {result.estadisticas?.headers_detectados || 0}
                        </div>
                        <div className="text-sm text-gray-500">Columnas Detectadas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {result.estadisticas?.warnings || 0}
                        </div>
                        <div className="text-sm text-gray-500">Advertencias</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {result.estadisticas?.errores || 0}
                        </div>
                        <div className="text-sm text-gray-500">Errores</div>
                      </div>
                    </div>

                    {/* Muestra de datos */}
                    {result.datos_procesados && result.datos_procesados.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">
                          Vista previa de datos procesados:
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(result.datos_procesados[0]).slice(0, 6).map((header) => (
                                  <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header.replace(/_/g, ' ')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {result.datos_procesados.slice(0, 3).map((row: any, rowIndex: number) => (
                                <tr key={rowIndex}>
                                  {Object.keys(row).slice(0, 6).map((key) => (
                                    <td key={key} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {String(row[key]).substring(0, 50)}
                                      {String(row[key]).length > 50 ? '...' : ''}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {result.datos_procesados.length > 3 && (
                          <p className="text-sm text-gray-500 mt-2">
                            ... y {result.datos_procesados.length - 3} filas más
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
