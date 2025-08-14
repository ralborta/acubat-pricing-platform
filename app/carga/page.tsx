'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Play, BarChart3 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import FileProcessor, { FileProcessorRef } from '@/components/FileProcessor'

export default function CargaArchivos() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [processedFiles, setProcessedFiles] = useState<any[]>([])
  const fileProcessorRef = useRef<FileProcessorRef>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadStatus('idle')

    try {
      console.log('🚀 Iniciando subida real de archivos...')
      
      // Subir cada archivo al backend
      for (const file of files) {
        console.log('📁 Subiendo archivo:', file.name)
        
        const formData = new FormData()
        formData.append('file', file, file.name) // Especificar nombre explícitamente
        
        // Log para verificar FormData
        Array.from(formData.entries()).forEach(([key, value]) => {
          console.log('📦 FormData entry:', key, value instanceof File ? `File: ${value.name}` : value)
        })
        
        const response = await fetch('/api/pricing/procesar-archivo', {
          method: 'POST',
          body: formData,
          // Importante: NO especificar Content-Type para FormData
        })
        
        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
        
        const responseText = await response.text()
        console.log('📄 Response raw text:', responseText)
        
        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(`Error parsing response: ${responseText}`)
        }
        
        if (!response.ok) {
          throw new Error(result.error || `Error ${response.status}`)
        }
        
        console.log('✅ Archivo subido exitosamente:', result)
      }
      
      setUploadStatus('success')
      console.log('🎉 Todos los archivos subidos correctamente')
      
    } catch (error) {
      console.error('💥 Error en la subida:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const handleProcessFiles = async () => {
    if (files.length === 0) return
    
    console.log('🔄 Iniciando procesamiento de archivos...')
    console.log('📁 Archivos a procesar:', files.map(f => f.name))

    // Procesar cada archivo usando el FileProcessor
    for (const file of files) {
      console.log('⚙️ Procesando archivo:', file.name)
      if (fileProcessorRef.current && fileProcessorRef.current.processFile) {
        await fileProcessorRef.current.processFile(file)
      }
    }

    // Limpiar archivos después del procesamiento
    setFiles([])
    setUploadStatus('idle')
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Carga de Archivos</h1>
            <p className="text-gray-600">Sube archivos Excel, CSV y otros formatos para análisis</p>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </div>
            <p className="text-gray-500 mb-4">
              Soporta archivos Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf) y texto (.txt)
            </p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Seleccionar Archivos
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
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
              
              {/* Botones de Acción */}
              <div className="px-6 py-4 bg-gray-50 space-y-3">
                {/* Botón de Subida */}
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Archivos
                    </>
                  )}
                </button>

                {/* Botón de Procesar - Solo visible después de subir exitosamente */}
                {uploadStatus === 'success' && (
                  <button
                    onClick={handleProcessFiles}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Procesar Archivos para Análisis
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus !== 'idle' && (
            <div className={`mt-4 p-4 rounded-md ${
              uploadStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {uploadStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadStatus === 'success' 
                    ? 'Archivos subidos exitosamente! Ahora puedes procesarlos para análisis.' 
                    : 'Error al subir archivos. Inténtalo de nuevo.'
                  }
                </span>
              </div>
            </div>
          )}

          {/* File Types Info */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Archivo Soportados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900">Excel</div>
                <div className="text-sm text-gray-500">.xlsx, .xls</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium text-gray-900">CSV</div>
                <div className="text-sm text-gray-500">.csv</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-medium text-gray-900">PDF</div>
                <div className="text-sm text-gray-500">.pdf</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900">Texto</div>
                <div className="text-sm text-gray-500">.txt</div>
              </div>
            </div>
          </div>

          {/* File Processor - Conectar con ref */}
          <FileProcessor ref={fileProcessorRef} />
        </main>
      </div>
    </div>
  )
}
