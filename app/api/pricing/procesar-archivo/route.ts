import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Iniciando procesamiento de archivo...')
    console.log('🔍 API: Headers:', Object.fromEntries(request.headers.entries()))
    
    // Obtener el archivo del FormData
    const formData = await request.formData()
    console.log('📦 API: FormData keys:', Array.from(formData.keys()))
    
    const file = formData.get('file') as File
    console.log('📄 API: Archivo recibido:', file)
    
    if (!file) {
      console.error('❌ API: No se recibió archivo')
      console.error('❌ API: FormData completo:', Array.from(formData.entries()))
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' }, 
        { status: 400 }
      )
    }

    // Validar que sea un archivo Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ API: Tipo de archivo no válido:', file.type)
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
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
        datos: datosExcel // Los datos procesados
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
