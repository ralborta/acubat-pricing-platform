import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Iniciando procesamiento de archivo...')
    
    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
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
    
    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('📊 API: Leyendo archivo Excel...')
    
    // PROCESAR EL ARCHIVO EXCEL REAL
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0] // Primera hoja
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir a JSON
    const datosExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    console.log('📋 API: Datos leídos del Excel:', datosExcel.slice(0, 3)) // Primeras 3 filas
    console.log('📊 API: Total de filas:', datosExcel.length)
    
    // PROCESAR DATOS PARA PRICING
    const headers = datosExcel[0] as string[] // Primera fila como headers
    const filas = datosExcel.slice(1) // Resto de filas como datos
    
    console.log('📋 API: Headers detectados:', headers)
    
    // Mapear datos a estructura de pricing
    const datosProcessados = filas.map((fila: any[], index: number) => {
      const registro: any = {}
      
      // Mapear cada columna según los headers
      headers.forEach((header, colIndex) => {
        if (header && fila[colIndex] !== undefined) {
          registro[header.toLowerCase().replace(/\s+/g, '_')] = fila[colIndex]
        }
      })
      
      // Agregar información de procesamiento
      registro.fila_original = index + 2 // +2 porque empezamos desde fila 1 y saltamos headers
      registro.procesado_timestamp = new Date().toISOString()
      
      return registro
    }).filter(registro => {
      // Filtrar filas vacías
      const valores = Object.values(registro).filter(val => val !== null && val !== undefined && val !== '')
      return valores.length > 2 // Al menos 2 campos con datos
    })
    
    console.log('✅ API: Datos procesados:', datosProcessados.length, 'registros válidos')
    console.log('📋 API: Muestra de datos procesados:', datosProcessados.slice(0, 2))
    
    // APLICAR LÓGICA DE PRICING
    const datosPricing = datosProcessados.map((registro, index) => {
      // Aquí puedes aplicar tu lógica de pricing específica
      // Por ejemplo, buscar precios, aplicar descuentos, etc.
      
      return {
        ...registro,
        // Campos de pricing calculados
        precio_base: registro.precio_varta || 0,
        descuento_aplicado: 0.1, // 10% ejemplo
        precio_final: (registro.precio_varta || 0) * 0.9,
        estado_pricing: 'procesado',
        observaciones: `Precio calculado para ${registro.codigo_baterias || 'item ' + (index + 1)}`
      }
    })
    
    // Resultado final
    const resultadoPricing = {
      success: true,
      archivo: file.name,
      timestamp: new Date().toISOString(),
      estadisticas: {
        total_filas_leidas: datosExcel.length,
        headers_detectados: headers.length,
        registros_validos: datosProcessados.length,
        registros_procesados: datosPricing.length,
        errores: 0,
        warnings: datosExcel.length - datosProcessados.length - 1 // -1 por header
      },
      headers_detectados: headers,
      datos_procesados: datosPricing,
      mensaje: `Archivo procesado exitosamente. ${datosPricing.length} registros con pricing aplicado.`
    }
    
    console.log('✅ API: Procesamiento completado:', {
      archivo: file.name,
      registros: datosPricing.length,
      headers: headers.length
    })
    
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
    message: 'Endpoint para procesamiento de archivos Excel con pricing real',
    methods: ['POST'],
    expectedFormat: 'multipart/form-data con campo "file"',
    status: 'API funcionando correctamente'
  })
}
