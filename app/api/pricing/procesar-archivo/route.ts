import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Iniciando procesamiento de archivo REAL...')
    
    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ No se recibió archivo')
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' }, 
        { status: 400 }
      )
    }
    
    console.log('✅ API: Archivo recibido:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // LECTURA REAL DEL ARCHIVO EXCEL
    console.log('📊 API: Leyendo archivo Excel real...')
    
    try {
      // Convertir archivo a buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      console.log('📁 Archivo convertido a buffer:', buffer.length, 'bytes')
      
      // Leer Excel con XLSX
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      console.log('📚 Workbook leído, hojas disponibles:', workbook.SheetNames)
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      console.log('📋 Primera hoja seleccionada:', workbook.SheetNames[0])
      
      // Convertir a JSON
      const datosExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
      
      console.log('📋 Headers detectados:', datosExcel[0])
      console.log('📊 Total filas:', datosExcel.length - 1)
      console.log('🔍 Primera fila de datos:', datosExcel[1])
      console.log('🔍 Segunda fila de datos:', datosExcel[2])
      
      // Extraer headers y datos
      const headers = (datosExcel[0] || []) as string[]
      const filas = datosExcel.slice(1)
      
      console.log('📝 Headers extraídos:', headers)
      console.log('📊 Filas extraídas:', filas.length)
      
      // Convertir filas a objetos con los headers
      const datosReales = filas.map((fila: unknown[], index: number) => {
        const registro: Record<string, any> = {}
        headers.forEach((header, colIndex) => {
          if (header && fila[colIndex] !== undefined) {
            // Normalizar nombre de columna
            const key = header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
            registro[key] = fila[colIndex]
          }
        })
        return registro
      })
      
      console.log('✅ Datos reales extraídos:', datosReales.length, 'registros')
      console.log('📝 Primer registro procesado:', datosReales[0])
      console.log('📝 Segundo registro procesado:', datosReales[1])
      console.log('🔍 Claves del primer registro:', Object.keys(datosReales[0] || {}))
      
      // APLICAR LÓGICA DE PRICING REAL
      console.log('🧮 API: Aplicando pricing real...')
      
      const datosPricing = datosReales.map((registro, index) => {
        console.log(`🔍 Procesando registro ${index + 1}:`, registro)
        
        // Extraer datos del registro real
        const codigo = registro.codigo_baterias || registro.codigo || registro.modelo || `PROD_${index + 1}`
        const denominacion = registro.denominacion_comercial || registro.denominacion || registro.descripcion || 'Sin descripción'
        const precioBase = parseFloat(registro.precio_de_lista || registro.precio || registro.precio_lista || '0')
        
        console.log(`📊 Datos extraídos - Código: ${codigo}, Denominación: ${denominacion}, Precio: ${precioBase}`)
        
        if (isNaN(precioBase) || precioBase <= 0) {
          console.warn(`⚠️ Precio inválido en fila ${index + 1}:`, precioBase)
          return {
            codigo_original: codigo,
            denominacion: denominacion,
            precio_lista_moura: 0,
            tiene_equivalencia_varta: false,
            codigo_varta: 'No disponible',
            precio_varta: 0,
            marca_referencia: 'ERROR',
            multiplicador_aplicado: '0%',
            precio_referencia: 0,
            precio_final_calculado: 0,
            utilidad_estimada: 0,
            porcentaje_utilidad: '0%',
            estado: 'ERROR',
            fecha_calculo: new Date().toISOString().split('T')[0],
            observaciones: 'Precio inválido o faltante',
            error: 'Precio base inválido'
          }
        }
        
        // LÓGICA ESPECÍFICA DE BATERÍAS MOURA
        let marca = 'MOURA'
        let multiplicador = 1.25 // +25% para Moura por defecto
        let equivalenciaVarta = null
        
        // Buscar equivalencia Varta basada en el código
        const equivalenciasVarta = {
          'M20GD': { codigo_varta: 'H5-75', precio_varta: 65000 },
          'M22GD': { codigo_varta: 'H6-85', precio_varta: 68000 },
          'M24GD': { codigo_varta: 'H7-95', precio_varta: 72000 },
          'M26GD': { codigo_varta: 'H8-105', precio_varta: 75000 },
          'M28GD': { codigo_varta: 'H9-115', precio_varta: 78000 },
          'M30GD': { codigo_varta: 'H10-125', precio_varta: 82000 },
          'M35GD': { codigo_varta: 'H11-135', precio_varta: 85000 },
          'M40GD': { codigo_varta: 'H12-145', precio_varta: 88000 },
          'M45GD': { codigo_varta: 'H13-155', precio_varta: 92000 },
          'M50GD': { codigo_varta: 'H14-165', precio_varta: 95000 }
        }
        
        // Si tiene equivalencia Varta, usar pricing Varta
        if (equivalenciasVarta[codigo as keyof typeof equivalenciasVarta]) {
          equivalenciaVarta = equivalenciasVarta[codigo as keyof typeof equivalenciasVarta]
          marca = 'VARTA'
          multiplicador = 1.35 // +35% para Varta
          console.log(`🎯 Equivalencia Varta encontrada para ${codigo}:`, equivalenciaVarta)
        }
        
        // Calcular precios
        const precioReferencia = equivalenciaVarta ? equivalenciaVarta.precio_varta : precioBase
        const precioFinal = Math.round(precioReferencia * multiplicador)
        const utilidad = precioFinal - precioBase
        const porcentajeUtilidad = ((utilidad / precioBase) * 100).toFixed(1)
        
        console.log(`💰 Cálculos - Referencia: ${precioReferencia}, Final: ${precioFinal}, Utilidad: ${utilidad}`)
        
        return {
          // Datos originales
          codigo_original: codigo,
          denominacion: denominacion,
          precio_lista_moura: precioBase,
          
          // Equivalencia Varta
          tiene_equivalencia_varta: !!equivalenciaVarta,
          codigo_varta: equivalenciaVarta?.codigo_varta || 'No disponible',
          precio_varta: equivalenciaVarta?.precio_varta || 0,
          
          // Pricing calculado
          marca_referencia: marca,
          multiplicador_aplicado: `+${((multiplicador - 1) * 100).toFixed(0)}%`,
          precio_referencia: precioReferencia,
          precio_final_calculado: precioFinal,
          utilidad_estimada: utilidad,
          porcentaje_utilidad: `${porcentajeUtilidad}%`,
          
          // Metadatos
          estado: 'PROCESADO',
          fecha_calculo: new Date().toISOString().split('T')[0],
          observaciones: `Pricing ${marca} aplicado con +${((multiplicador - 1) * 100).toFixed(0)}%`
        }
      })
      
      console.log('✅ API: Pricing real aplicado:', datosPricing.length, 'registros')
      console.log('📊 Primer producto procesado:', datosPricing[0])
      
      // Filtrar productos válidos y con error
      const productosValidos = datosPricing.filter(p => p.estado === 'PROCESADO')
      const productosConError = datosPricing.filter(p => p.estado === 'ERROR')
      
      console.log('✅ Productos válidos:', productosValidos.length)
      console.log('❌ Productos con error:', productosConError.length)
      
      // Estadísticas REALES
      const estadisticas = {
        total_filas_leidas: datosReales.length + 1, // +1 por header
        headers_detectados: headers.length,
        registros_validos: datosReales.length,
        registros_procesados: datosPricing.length,
        errores: productosConError.length,
        warnings: 0,
        
        // Estadísticas específicas de baterías
        con_equivalencia_varta: productosValidos.filter(r => r.tiene_equivalencia_varta).length,
        sin_equivalencia_varta: productosValidos.filter(r => !r.tiene_equivalencia_varta).length,
        precio_promedio_moura: productosValidos.length > 0 ? 
          Math.round(productosValidos.reduce((sum, r) => sum + r.precio_lista_moura, 0) / productosValidos.length) : 0,
        precio_promedio_final: productosValidos.length > 0 ? 
          Math.round(productosValidos.reduce((sum, r) => sum + r.precio_final_calculado, 0) / productosValidos.length) : 0,
        utilidad_total_estimada: productosValidos.reduce((sum, r) => sum + r.utilidad_estimada, 0)
      }
      
      console.log('📈 Estadísticas calculadas:', estadisticas)
      
      // Resultado final con datos REALES
      const resultado = {
        success: true,
        archivo: file.name,
        timestamp: new Date().toISOString(),
        estadisticas,
        headers_detectados: headers,
        datos_procesados: datosPricing,
        mensaje: `Archivo procesado exitosamente. ${productosValidos.length} baterías con pricing aplicado.`,
        tipo_procesamiento: 'REAL',
        archivo_original: {
          nombre: file.name,
          tamaño: file.size,
          tipo: file.type,
          filas_procesadas: datosReales.length
        },
        debug_info: {
          total_bytes: buffer.length,
          total_filas_excel: datosExcel.length,
          headers_encontrados: headers,
          primer_registro: datosReales[0],
          primer_producto_procesado: datosPricing[0]
        }
      }
      
      console.log('✅ API: Procesamiento REAL completado exitosamente')
      console.log('📊 Estadísticas reales:', estadisticas)
      console.log('🔍 Información de debug:', resultado.debug_info)
      
      return NextResponse.json(resultado)
      
    } catch (errorExcel) {
      console.error('💥 Error leyendo Excel:', errorExcel)
      return NextResponse.json(
        { 
          error: 'Error leyendo archivo Excel',
          details: errorExcel instanceof Error ? errorExcel.message : 'Error desconocido al leer Excel',
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('💥 API: Error procesando archivo:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor procesando el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Servicio de procesamiento de pricing para baterías',
    status: 'API funcionando correctamente - LECTURA REAL de Excel',
    version: 'real-1.0',
    diagnostico: 'Endpoint funcionando con XLSX para lectura real de archivos',
    funcionalidades: [
      'Lectura real de archivos Excel (.xlsx, .xls)',
      'Procesamiento de datos reales de baterías',
      'Cálculo de pricing con equivalencias Varta',
      'Generación de estadísticas reales',
      'Exportación de resultados procesados'
    ],
    formato_esperado: [
      'Columna: codigo_baterias (o codigo, modelo)',
      'Columna: denominacion_comercial (o denominacion, descripcion)',
      'Columna: precio_de_lista (o precio, precio_lista)'
    ],
    proximos_pasos: [
      'Subir archivo Excel con datos reales',
      'Verificar que se detecten las columnas correctamente',
      'Revisar los resultados del pricing aplicado'
    ]
  })
}
