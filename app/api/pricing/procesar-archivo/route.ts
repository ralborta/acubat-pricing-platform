import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Iniciando procesamiento de archivo...')
    console.log('🔍 API: Headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 API: Content-Type:', request.headers.get('content-type'))
    
    // Verificar que sea multipart/form-data
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ API: Content-Type incorrecto:', contentType)
      return NextResponse.json(
        { error: 'Content-Type debe ser multipart/form-data' },
        { status: 400 }
      )
    }
    
    // Obtener el archivo del FormData
    const formData = await request.formData()
    console.log('📋 API: FormData keys:', Array.from(formData.keys()))
    console.log('📋 API: FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
    })))
    
    const file = formData.get('file') as File
    console.log('📂 API: Archivo recibido:', file)
    console.log('📂 API: Tipo de archivo recibido:', typeof file)
    
    if (!file) {
      console.error('❌ API: No se recibió archivo')
      console.error('❌ API: FormData completo:', Array.from(formData.entries()))
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' }, 
        { status: 400 }
      )
    }
    
    // Verificar que sea realmente un File object
    if (!(file instanceof File)) {
      console.error('❌ API: El objeto recibido no es un File:', file)
      return NextResponse.json(
        { error: 'El objeto recibido no es un archivo válido' },
        { status: 400 }
      )
    }
    
    // Validar que sea un archivo Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    console.log('🔍 API: Tipo MIME del archivo:', file.type)
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ API: Tipo de archivo no válido:', file.type)
      return NextResponse.json(
        { error: `El archivo debe ser un Excel (.xlsx o .xls). Tipo recibido: ${file.type}` },
        { status: 400 }
      )
    }
    
    console.log('✅ API: Archivo recibido:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Convertir archivo a buffer para procesarlo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('📊 API: Procesando archivo Excel...')
    console.log('📊 API: Buffer size:', buffer.length)
    
    // AQUÍ CONECTAS CON TU SERVICIO DE PRICING REAL
    // Ejemplo de datos simulados que devolvería tu servicio:
    const datosExcel = [
      { codigo_baterias: "M20GD", tipo: "12X50", precio_varta: 80002.12 },
      { codigo_baterias: "M22GD", tipo: "12X50", precio_varta: 80002.12 },
      { codigo_baterias: "M22GT", tipo: "12X50", precio_varta: 80002.12 },
    ]
    
    // Simular procesamiento de pricing
    const resultadoPricing = {
      success: true,
      archivo: file.name,
      registros: datosExcel.length,
      timestamp: new Date().toISOString(),
      resultados: {
        totalProcesados: datosExcel.length,
        errores: 0,
        warnings: 1,
        datos: datosExcel
      },
      mensaje: "Archivo procesado exitosamente por el servicio de pricing"
    }
    
    console.log('✅ API: Procesamiento completado exitosamente')
    
    return NextResponse.json(resultadoPricing)
    
  } catch (error) {
    console.error('💥 API: Error procesando archivo:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor procesando el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para procesamiento de archivos Excel',
    methods: ['POST'],
    expectedFormat: 'multipart/form-data con campo "file"',
    status: 'API funcionando correctamente'
  })
}
