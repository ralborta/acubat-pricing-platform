'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionResult, setConversionResult] = useState<{
    success: boolean
    message: string
    filename?: string
    error?: string
  } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🎯 MANEJAR SELECCIÓN DE ARCHIVO
  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFile(selectedFile)
      setConversionResult(null)
      console.log('📄 Archivo PDF seleccionado:', selectedFile.name)
    } else {
      setConversionResult({
        success: false,
        message: 'Error: El archivo debe ser un PDF',
        error: 'Formato de archivo no válido'
      })
    }
  }

  // 🎯 MANEJAR DRAG & DROP
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // 🚀 CONVERTIR PDF A EXCEL
  const convertPdfToExcel = async () => {
    if (!file) {
      setConversionResult({
        success: false,
        message: 'Error: No se seleccionó ningún archivo',
        error: 'Archivo requerido'
      })
      return
    }

    setIsConverting(true)
    setConversionResult(null)

    try {
      console.log('🚀 Iniciando conversión PDF a Excel...')
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        // 📥 DESCARGAR ARCHIVO EXCEL
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversion_${Date.now()}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setConversionResult({
          success: true,
          message: '✅ Conversión completada exitosamente',
          filename: a.download
        })
        
        console.log('✅ Archivo Excel descargado')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en la conversión')
      }
    } catch (error) {
      console.error('❌ Error en conversión:', error)
      setConversionResult({
        success: false,
        message: '❌ Error en la conversión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsConverting(false)
    }
  }

  // 🎯 LIMPIAR ARCHIVO
  const clearFile = () => {
    setFile(null)
    setConversionResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* 🎯 HEADER */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Conversor PDF a Excel
              </h1>
              <p className="text-gray-600">
                Convierte archivos PDF a formato Excel (.xlsx) para análisis y procesamiento
              </p>
            </div>

            {/* 📄 ZONA DE SUBIDA DE ARCHIVOS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Subir Archivo PDF
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Arrastra y suelta tu archivo PDF aquí o haz clic para seleccionar
                </p>

                {/* 🎯 ZONA DE DRAG & DROP */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : file 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Archivo seleccionado
                      </p>
                      <p className="text-gray-600 mb-4">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <button
                        onClick={clearFile}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Arrastra tu archivo PDF aquí o
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Seleccionar PDF
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🚀 BOTÓN DE CONVERSIÓN */}
            {file && (
              <div className="text-center mb-6">
                <button
                  onClick={convertPdfToExcel}
                  disabled={isConverting}
                  className={`px-8 py-4 text-lg font-medium rounded-lg transition-all ${
                    isConverting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  } text-white`}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Convirtiendo...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5 inline mr-2" />
                      Convertir a Excel
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 📊 RESULTADO DE LA CONVERSIÓN */}
            {conversionResult && (
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${
                conversionResult.success 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center">
                  {conversionResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  )}
                  
                  <div>
                    <h3 className={`font-medium ${
                      conversionResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {conversionResult.message}
                    </h3>
                    
                    {conversionResult.filename && (
                      <p className="text-green-700 text-sm mt-1">
                        Archivo descargado: {conversionResult.filename}
                      </p>
                    )}
                    
                    {conversionResult.error && (
                      <p className="text-red-700 text-sm mt-1">
                        {conversionResult.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 📋 INFORMACIÓN DEL SERVICIO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Características del Servicio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Extracción de datos de PDF</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Generación de Excel (.xlsx)</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Múltiples hojas de cálculo</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Formateo automático</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Resumen estadístico</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Descarga automática</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
