import * as XLSX from 'xlsx'

export interface ProductoExcel {
  producto: string
  tipo: string
  descripcion: string
  canal: string
  precio_base: number
  costo_estimado: number
  precio_final_minorista: number
  precio_final_mayorista: number
  markup_minorista: string
  markup_mayorista: string
  iva_minorista: number
  iva_mayorista: number
  equivalencia_varta?: {
    encontrada: boolean
    codigo?: string
    precio_varta?: number
  }
}

export interface EstadisticasExcel {
  total_productos: number
  productos_rentables: number
  con_equivalencia: number
  margen_promedio: string
}

export function exportarAExcel(
  productos: ProductoExcel[],
  estadisticas: EstadisticasExcel,
  nombreArchivo: string = 'reporte_precios'
) {
  // 📊 HOJA 1: RESUMEN
  const resumenData = [
    ['RESUMEN DE PRODUCTOS PROCESADOS'],
    [''],
    ['Total Productos', estadisticas.total_productos],
    ['Productos Rentables', estadisticas.productos_rentables],
    ['Con Equivalencia Varta', estadisticas.con_equivalencia],
    ['Margen Promedio', estadisticas.margen_promedio],
    [''],
    ['Fecha de Generación', new Date().toLocaleDateString('es-AR')],
    ['Hora', new Date().toLocaleTimeString('es-AR')]
  ]

  // 📋 HOJA 2: PRODUCTOS DETALLADOS
  const productosData = [
    [
      'PRODUCTO',
      'TIPO', 
      'DESCRIPCIÓN',
      'CANAL',
      'PRECIO BASE',
      'COSTO ESTIMADO',
      'PRECIO FINAL MINORISTA',
      'PRECIO FINAL MAYORISTA',
      'MARKUP MINORISTA',
      'MARKUP MAYORISTA',
      'IVA MINORISTA',
      'IVA MAYORISTA',
      'EQUIVALENCIA VARTA',
      'CÓDIGO VARTA',
      'PRECIO VARTA'
    ]
  ]

  // Agregar cada producto
  productos.forEach(producto => {
    productosData.push([
      String(producto.producto),
      String(producto.tipo),
      String(producto.descripcion),
      String(producto.canal),
      String(producto.precio_base),
      String(producto.costo_estimado),
      String(producto.precio_final_minorista),
      String(producto.precio_final_mayorista),
      String(producto.markup_minorista),
      String(producto.markup_mayorista),
      String(producto.iva_minorista),
      String(producto.iva_mayorista),
      producto.equivalencia_varta?.encontrada ? 'SÍ' : 'NO',
      producto.equivalencia_varta?.codigo || '',
      producto.equivalencia_varta?.precio_varta ? String(producto.equivalencia_varta.precio_varta) : ''
    ])
  })

  // 📊 HOJA 3: ESTADÍSTICAS DETALLADAS
  const estadisticasData = [
    ['ESTADÍSTICAS DETALLADAS'],
    [''],
    ['ANÁLISIS DE PRECIOS'],
    ['Precio más alto', Math.max(...productos.map(p => p.precio_base))],
    ['Precio más bajo', Math.min(...productos.map(p => p.precio_base))],
    ['Precio promedio', Math.round(productos.reduce((sum, p) => sum + p.precio_base, 0) / productos.length)],
    [''],
    ['ANÁLISIS DE RENTABILIDAD'],
    ['Productos con precio > 0', productos.filter(p => p.precio_base > 0).length],
    ['Productos con precio = 0', productos.filter(p => p.precio_base === 0).length],
    [''],
    ['EQUIVALENCIAS VARTA'],
    ['Total encontradas', productos.filter(p => p.equivalencia_varta?.encontrada).length],
    ['Total no encontradas', productos.filter(p => !p.equivalencia_varta?.encontrada).length]
  ]

  // 📁 CREAR WORKBOOK
  const workbook = XLSX.utils.book_new()

  // 📊 HOJA RESUMEN
  const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData)
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'RESUMEN')

  // 📋 HOJA PRODUCTOS
  const productosSheet = XLSX.utils.aoa_to_sheet(productosData)
  XLSX.utils.book_append_sheet(workbook, productosSheet, 'PRODUCTOS')

  // 📊 HOJA ESTADÍSTICAS
  const estadisticasSheet = XLSX.utils.aoa_to_sheet(estadisticasData)
  XLSX.utils.book_append_sheet(workbook, estadisticasSheet, 'ESTADÍSTICAS')

  // 💾 DESCARGAR ARCHIVO
  const nombreCompleto = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, nombreCompleto)

  return nombreCompleto
}
