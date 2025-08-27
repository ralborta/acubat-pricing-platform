// 🔄 SISTEMA DE MAPEO IA → TEMPLATE ESTÁNDAR
export interface TemplateEstandar {
  marca: string
  tipo: string
  modelo: string
  precio: number
  descripcion: string
  capacidad?: string
  voltaje?: string
  precio_varta?: number
  equivalencia_encontrada: boolean
}

export interface MapeoColumnas {
  marca: string
  tipo: string
  modelo: string
  precio: string
  descripcion: string
  capacidad?: string
  voltaje?: string
}

// 🔧 FUNCIÓN DE MAPEO A TEMPLATE ESTÁNDAR
export function mapearATemplateEstandar(
  datosOriginales: any[],
  mapeoColumnas: MapeoColumnas
): TemplateEstandar[] {
  
  console.log('🔄 MAPEANDO A TEMPLATE ESTÁNDAR:')
  console.log('📋 Mapeo de columnas:', mapeoColumnas)
  console.log('📊 Total de productos a mapear:', datosOriginales.length)
  
  const templateEstandar: TemplateEstandar[] = []
  
  datosOriginales.forEach((producto, index) => {
    console.log(`\n🔍 MAPEANDO PRODUCTO ${index + 1}:`)
    
    // Extraer datos usando el mapeo
    const marca = mapeoColumnas.marca ? producto[mapeoColumnas.marca] : 'N/A'
    const tipo = mapeoColumnas.tipo ? producto[mapeoColumnas.tipo] : 'Bateria'
    const modelo = mapeoColumnas.modelo ? producto[mapeoColumnas.modelo] : 'N/A'
    const descripcion = mapeoColumnas.descripcion ? producto[mapeoColumnas.descripcion] : 'N/A'
    const capacidad = mapeoColumnas.capacidad ? producto[mapeoColumnas.capacidad] : undefined
    const voltaje = mapeoColumnas.voltaje ? producto[mapeoColumnas.voltaje] : undefined
    
    // Buscar precio
    let precio = 0
    if (mapeoColumnas.precio && producto[mapeoColumnas.precio]) {
      precio = parseFloat(producto[mapeoColumnas.precio]) || 0
    }
    
    console.log(`✅ Datos extraídos:`)
    console.log(`   - Marca: "${marca}"`)
    console.log(`   - Tipo: "${tipo}"`)
    console.log(`   - Modelo: "${modelo}"`)
    console.log(`   - Descripción: "${descripcion}"`)
    console.log(`   - Precio: ${precio}`)
    console.log(`   - Capacidad: "${capacidad}"`)
    console.log(`   - Voltaje: "${voltaje}"`)
    
    // Crear entrada del template
    const entradaTemplate: TemplateEstandar = {
      marca: marca || 'N/A',
      tipo: tipo || 'Bateria',
      modelo: modelo || 'N/A',
      precio: precio,
      descripcion: descripcion || 'N/A',
      capacidad: capacidad,
      voltaje: voltaje,
      precio_varta: 0, // Se llenará después
      equivalencia_encontrada: false // Se llenará después
    }
    
    templateEstandar.push(entradaTemplate)
    
    console.log(`✅ PRODUCTO ${index + 1} MAPEADO AL TEMPLATE`)
  })
  
  console.log(`\n🎯 MAPEO COMPLETADO: ${templateEstandar.length} productos mapeados`)
  return templateEstandar
}

// 🔍 VALIDAR TEMPLATE ESTÁNDAR
export function validarTemplateEstandar(template: TemplateEstandar[]): {
  valido: boolean
  errores: string[]
  estadisticas: any
} {
  const errores: string[] = []
  
  template.forEach((producto, index) => {
    if (!producto.marca || producto.marca === 'N/A') {
      errores.push(`Producto ${index + 1}: Marca no válida`)
    }
    if (!producto.precio || producto.precio <= 0) {
      errores.push(`Producto ${index + 1}: Precio no válido (${producto.precio})`)
    }
    if (!producto.descripcion || producto.descripcion === 'N/A') {
      errores.push(`Producto ${index + 1}: Descripción no válida`)
    }
  })
  
  const estadisticas = {
    total_productos: template.length,
    productos_con_precio: template.filter(p => p.precio > 0).length,
    productos_con_marca: template.filter(p => p.marca && p.marca !== 'N/A').length,
    productos_con_descripcion: template.filter(p => p.descripcion && p.descripcion !== 'N/A').length,
    rango_precios: {
      min: Math.min(...template.map(p => p.precio)),
      max: Math.max(...template.map(p => p.precio)),
      promedio: template.reduce((sum, p) => sum + p.precio, 0) / template.length
    }
  }
  
  return {
    valido: errores.length === 0,
    errores,
    estadisticas
  }
}

// 📊 GENERAR REPORTE DE MAPEO
export function generarReporteMapeo(
  datosOriginales: any[],
  templateEstandar: TemplateEstandar[],
  mapeoColumnas: MapeoColumnas
): any {
  
  const validacion = validarTemplateEstandar(templateEstandar)
  
  return {
    timestamp: new Date().toISOString(),
    mapeo_columnas: mapeoColumnas,
    estadisticas_original: {
      total_filas: datosOriginales.length,
      columnas_detectadas: Object.keys(datosOriginales[0] || {}),
      muestra_datos: datosOriginales.slice(0, 3)
    },
    estadisticas_template: validacion.estadisticas,
    validacion: {
      valido: validacion.valido,
      errores: validacion.errores
    },
    productos_mapeados: templateEstandar
  }
}
