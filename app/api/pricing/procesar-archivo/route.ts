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
    const datosExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
    
    console.log('📋 API: Datos leídos del Excel:', datosExcel.slice(0, 3)) // Primeras 3 filas
    console.log('📊 API: Total de filas:', datosExcel.length)
    
    // PROCESAR DATOS PARA PRICING
    const headers = (datosExcel[0] || []) as string[] // Primera fila como headers
    const filas = datosExcel.slice(1) // Resto de filas como datos
    
    console.log('📋 API: Headers detectados:', headers)
    
    // Mapear datos a estructura de pricing
    const datosProcessados = filas.map((fila: unknown[], index: number) => {
      const registro: Record<string, unknown> = {}
      
      // Mapear cada columna según los headers
      headers.forEach((header, colIndex) => {
        if (header && fila[colIndex] !== undefined) {
          const headerKey = header.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w]/g, '_') // Limpiar caracteres especiales
          registro[headerKey] = fila[colIndex]
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
    
    // APLICAR LÓGICA DE PRICING ESPECÍFICA
    const datosPricing = datosProcessados.map((registro: Record<string, unknown>, index: number) => {
      // Extraer valores con validación de tipos
      const precioLista = typeof registro.precio_de_lista === 'number' ? registro.precio_de_lista : 
                         typeof registro.precio_de_lista === 'string' ? parseFloat(registro.precio_de_lista.replace(/[^\d.-]/g, '')) || 0 : 0
      
      const codigoBaterias = typeof registro.codigo_baterias === 'string' ? registro.codigo_baterias : 
                           typeof registro.codigo === 'string' ? registro.codigo : `ITEM_${index + 1}`
      
      const denominacion = typeof registro.denominacion_comercial === 'string' ? registro.denominacion_comercial : 
                          typeof registro.descripcion === 'string' ? registro.descripcion : 'Sin descripción'
      
      // LÓGICA DE PRICING
      let descuentoAplicado = 0
      let categoria = 'STANDARD'
      let margen = 0.25 // 25% de margen base
      
      // Aplicar diferentes descuentos según criterios
      if (precioLista > 100000) {
        descuentoAplicado = 0.15 // 15% descuento para items caros
        categoria = 'PREMIUM'
        margen = 0.30
      } else if (precioLista > 50000) {
        descuentoAplicado = 0.10 // 10% descuento para items medianos
        categoria = 'MEDIUM'
        margen = 0.27
      } else {
        descuentoAplicado = 0.05 // 5% descuento para items económicos
        categoria = 'BASIC'
        margen = 0.25
      }
      
      // Calcular precios
      const precioConDescuento = precioLista * (1 - descuentoAplicado)
      const precioVenta = precioConDescuento * (1 + margen)
      const utilidad = precioVenta - precioLista
      
      return {
        // Datos originales
        codigo_baterias: codigoBaterias,
        denominacion_comercial: denominacion,
        precio_lista_original: precioLista,
        
        // Datos de pricing calculados
        categoria_producto: categoria,
        descuento_porcentaje: (descuentoAplicado * 100).toFixed(1) + '%',
        descuento_aplicado: descuentoAplicado,
        precio_con_descuento: Math.round(precioConDescuento * 100) / 100,
        margen_porcentaje: (margen * 100).toFixed(1) + '%',
        margen_aplicado: margen,
        precio_venta_sugerido: Math.round(precioVenta * 100) / 100,
        utilidad_estimada: Math.round(utilidad * 100) / 100,
        
        // Metadatos
        estado_pricing: 'PROCESADO',
        fecha_procesamiento: new Date().toISOString().split('T')[0],
        observaciones: `Pricing ${categoria} aplicado`,
        
        // Mantener otros campos originales
        ...registro
      }
    })
    
    console.log('✅ API: Pricing aplicado:', datosPricing.length, 'registros con pricing')
    
    // Generar estadísticas del procesamiento
    const estadisticas = {
      total_filas_leidas: datosExcel.length,
      headers_detectados: headers.length,
      registros_validos: datosProcessados.length,
      registros_procesados: datosPricing.length,
      errores: 0,
      warnings: datosExcel.length - datosProcessados.length - 1, // -1 por header
      
      // Estadísticas de pricing
      por_categoria: {
        PREMIUM: datosPricing.filter(r => r.categoria_producto === 'PREMIUM').length,
        MEDIUM: datosPricing.filter(r => r.categoria_producto === 'MEDIUM').length,
        BASIC: datosPricing.filter(r => r.categoria_producto === 'BASIC').length
      },
      
      precio_promedio_original: datosPricing.reduce((sum, r) => sum + r.precio_lista_original, 0) / datosPricing.length,
      precio_promedio_venta: datosPricing.reduce((sum, r) => sum + r.precio_venta_sugerido, 0) / datosPricing.length,
      utilidad_total_estimada: datosPricing.reduce((sum, r) => sum + r.utilidad_estimada, 0)
    }
    
    // Resultado final
    const resultadoPricing = {
      success: true,
      archivo: file.name,
      timestamp: new Date().toISOString(),
      estadisticas,
      headers_detectados: headers,
      datos_procesados: datosPricing,
      mensaje: `Archivo procesado exitosamente. ${datosPricing.length} registros con pricing aplicado.`,
      
      // Información para descarga
      archivo_original: file.name,
      archivo_procesado: file.name.replace(/\.[^/.]+$/, "_procesado.xlsx"),
      total_registros: datosPricing.length
    }
    
    console.log('✅ API: Procesamiento completado:', {
      archivo: file.name,
      registros: datosPricing.length,
      headers: headers.length,
      categorias: estadisticas.por_categoria
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

// Endpoint para obtener información del servicio
export async function GET() {
  return NextResponse.json({ 
    message: 'Servicio de procesamiento de pricing para archivos Excel',
    methods: ['POST'],
    expectedFormat: 'multipart/form-data con campo "file"',
    features: [
      'Lectura de archivos Excel (.xlsx, .xls)',
      'Aplicación de lógica de pricing automática',
      'Categorización de productos',
      'Cálculo de descuentos y márgenes',
      'Generación de precios de venta sugeridos',
      'Estadísticas de procesamiento',
      'Exportación a CSV'
    ],
    status: 'API funcionando correctamente'
  })
}
