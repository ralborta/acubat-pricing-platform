import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Iniciando procesamiento de archivo...')
    
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
    
    // SIMULACIÓN DE PROCESAMIENTO (sin XLSX por ahora)
    console.log('📊 API: Simulando procesamiento...')
    
    // Datos simulados basados en tu archivo Moura
    const datosSimulados = [
      { codigo_baterias: "M20GD", denominacion_comercial: "APLICACIONES_GENERALES", precio_de_lista: 45000 },
      { codigo_baterias: "M22GD", denominacion_comercial: "APLICACIONES_GENERALES", precio_de_lista: 48000 },
      { codigo_baterias: "M24GD", denominacion_comercial: "APLICACIONES_GENERALES", precio_de_lista: 52000 },
      { codigo_baterias: "M26GD", denominacion_comercial: "APLICACIONES_GENERALES", precio_de_lista: 55000 },
      { codigo_baterias: "M28GD", denominacion_comercial: "APLICACIONES_GENERALES", precio_de_lista: 58000 }
    ]
    
    // APLICAR LÓGICA DE PRICING DE BATERÍAS
    const datosPricing = datosSimulados.map((registro, index) => {
      const precioBase = registro.precio_de_lista
      const codigo = registro.codigo_baterias
      
      // LÓGICA ESPECÍFICA DE BATERÍAS
      let marca = 'MOURA'
      let multiplicador = 1.25 // +25% para Moura por defecto
      let equivalenciaVarta = null
      
      // Simulación de búsqueda de equivalencia Varta
      const equivalenciasVarta = {
        'M20GD': { codigo_varta: 'H5-75', precio_varta: 65000 },
        'M22GD': { codigo_varta: 'H6-85', precio_varta: 68000 },
        'M24GD': { codigo_varta: 'H7-95', precio_varta: 72000 },
        'M26GD': { codigo_varta: 'H8-105', precio_varta: 75000 },
        'M28GD': { codigo_varta: 'H9-115', precio_varta: 78000 }
      }
      
      // Si tiene equivalencia Varta, usar pricing Varta
      if (equivalenciasVarta[codigo as keyof typeof equivalenciasVarta]) {
        equivalenciaVarta = equivalenciasVarta[codigo as keyof typeof equivalenciasVarta]
        marca = 'VARTA'
        multiplicador = 1.35 // +35% para Varta
      }
      
      // Calcular precios
      const precioReferencia = equivalenciaVarta ? equivalenciaVarta.precio_varta : precioBase
      const precioFinal = Math.round(precioReferencia * multiplicador)
      const utilidad = precioFinal - precioBase
      const porcentajeUtilidad = ((utilidad / precioBase) * 100).toFixed(1)
      
      return {
        // Datos originales
        codigo_original: codigo,
        denominacion: registro.denominacion_comercial,
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
    
    console.log('✅ API: Pricing aplicado:', datosPricing.length, 'registros')
    
    // Estadísticas
    const estadisticas = {
      total_filas_leidas: datosSimulados.length + 1, // +1 por header
      headers_detectados: Object.keys(datosSimulados[0]).length,
      registros_validos: datosSimulados.length,
      registros_procesados: datosPricing.length,
      errores: 0,
      warnings: 0,
      
      // Estadísticas específicas de baterías
      con_equivalencia_varta: datosPricing.filter(r => r.tiene_equivalencia_varta).length,
      sin_equivalencia_varta: datosPricing.filter(r => !r.tiene_equivalencia_varta).length,
      precio_promedio_moura: Math.round(datosPricing.reduce((sum, r) => sum + r.precio_lista_moura, 0) / datosPricing.length),
      precio_promedio_final: Math.round(datosPricing.reduce((sum, r) => sum + r.precio_final_calculado, 0) / datosPricing.length),
      utilidad_total_estimada: datosPricing.reduce((sum, r) => sum + r.utilidad_estimada, 0)
    }
    
    // Resultado final
    const resultado = {
      success: true,
      archivo: file.name,
      timestamp: new Date().toISOString(),
      estadisticas,
      headers_detectados: ['codigo_baterias', 'denominacion_comercial', 'precio_de_lista'],
      datos_procesados: datosPricing,
      mensaje: `Archivo procesado con éxito. ${datosPricing.length} baterías con pricing aplicado.`,
      tipo_procesamiento: 'SIMULADO'
    }
    
    console.log('✅ API: Procesamiento completado exitosamente')
    console.log('📊 Estadísticas:', estadisticas)
    
    return NextResponse.json(resultado)
    
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
    status: 'API funcionando correctamente - Versión de prueba',
    version: 'debug-1.0',
    diagnostico: 'Endpoint funcionando sin XLSX para pruebas',
    proximos_pasos: [
      'Verificar que la API funcione con datos simulados',
      'Instalar y configurar XLSX correctamente',
      'Implementar procesamiento real de archivos Excel'
    ]
  })
}
