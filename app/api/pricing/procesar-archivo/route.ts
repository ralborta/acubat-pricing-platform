import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

// ============================================================================
// CONFIGURACIÓN GLOBAL DEL SISTEMA DE PRICING
// ============================================================================

type Marca = 'Varta' | 'Moura' | 'Otros'
type Canal = 'Retail' | 'Mayorista' | 'Online'
type TipoRedondeo = 'multiplo100' | 'multiplo50' | 'multiplo25'

interface ConfiguracionMarkups {
  [key: string]: {
    [key: string]: number
  }
}

interface ConfiguracionRentabilidad {
  [key: string]: {
    [key: string]: {
      margen_minimo: number
      alerta: string
    }
  }
}

interface ConfiguracionRedondeo {
  [key: string]: TipoRedondeo
}

interface ConfiguracionAlertas {
  margen_critico: number
  precio_maximo: number
  diferencia_maxima: number
}

interface ConfiguracionSistema {
  markups: ConfiguracionMarkups
  rentabilidad: ConfiguracionRentabilidad
  redondeo: ConfiguracionRedondeo
  alertas: ConfiguracionAlertas
}

const CONFIGURACION_SISTEMA: ConfiguracionSistema = {
  // MARKUPS POR MARCA Y CANAL
  markups: {
    "Varta": {
      "Retail": 1.8,      // 80% de ganancia
      "Mayorista": 1.5,   // 50% de ganancia  
      "Online": 2.0       // 100% de ganancia
    },
    "Moura": {
      "Retail": 1.7,      // 70% de ganancia
      "Mayorista": 1.4,   // 40% de ganancia
      "Online": 1.9       // 90% de ganancia
    },
    "Otros": {
      "Retail": 1.6,      // 60% de ganancia
      "Mayorista": 1.3,   // 30% de ganancia
      "Online": 1.8       // 80% de ganancia
    }
  },
  
  // REGLAS DE RENTABILIDAD
  rentabilidad: {
    "Varta": {
      "Retail": { margen_minimo: 60, alerta: "Margen bajo para Varta Retail" },
      "Mayorista": { margen_minimo: 40, alerta: "Margen bajo para Varta Mayorista" },
      "Online": { margen_minimo: 80, alerta: "Margen bajo para Varta Online" }
    },
    "Moura": {
      "Retail": { margen_minimo: 55, alerta: "Margen bajo para Moura Retail" },
      "Mayorista": { margen_minimo: 35, alerta: "Margen bajo para Moura Mayorista" },
      "Online": { margen_minimo: 75, alerta: "Margen bajo para Moura Online" }
    },
    "Otros": {
      "Retail": { margen_minimo: 50, alerta: "Margen bajo para Otros Retail" },
      "Mayorista": { margen_minimo: 25, alerta: "Margen bajo para Otros Mayorista" },
      "Online": { margen_minimo: 70, alerta: "Margen bajo para Otros Online" }
    }
  },
  
  // CONFIGURACIÓN DE REDONDEO
  redondeo: {
    "Retail": "multiplo100",     // Múltiplos de $100
    "Mayorista": "multiplo50",   // Múltiplos de $50
    "Online": "multiplo50"       // Múltiplos de $50
  },
  
  // ALERTAS Y VALIDACIONES
  alertas: {
    margen_critico: 20,          // Margen mínimo absoluto
    precio_maximo: 100000,       // Precio máximo permitido
    diferencia_maxima: 5000      // Diferencia máxima entre precio base y final
  }
}

// ============================================================================
// TABLA DE EQUIVALENCIAS VARTA (HARDCODEADA POR AHORA)
// ============================================================================

const TABLA_EQUIVALENCIAS = [
  {
    codigos: ["60Ah", "60 Ah", "60AH", "60 AH"],
    modelo: "60Ah AGM",
    tipo: "AGM",
    precio_varta: 15000
  },
  {
    codigos: ["100Ah", "100 Ah", "100AH", "100 AH"],
    modelo: "100Ah AGM", 
    tipo: "AGM",
    precio_varta: 25000
  },
  {
    codigos: ["70Ah", "70 Ah", "70AH", "70 AH"],
    modelo: "70Ah AGM",
    tipo: "AGM", 
    precio_varta: 18000
  },
  {
    codigos: ["80Ah", "80 Ah", "80AH", "80 AH"],
    modelo: "80Ah AGM",
    tipo: "AGM",
    precio_varta: 20000
  },
  {
    codigos: ["90Ah", "90 Ah", "90AH", "90 AH"],
    modelo: "90Ah AGM",
    tipo: "AGM",
    precio_varta: 22000
  }
]

// ============================================================================
// FUNCIONES AUXILIARES DEL SISTEMA
// ============================================================================

const normalizarMarca = (marca: string): string => {
  if (!marca) return "Otros"
  
  const marcaLower = marca.toLowerCase().trim()
  
  // Mapeo de variaciones comunes
  const mapeoMarcas: Record<string, string> = {
    "varta": "Varta",
    "moura": "Moura", 
    "baterias varta": "Varta",
    "baterias moura": "Moura",
    "varta baterias": "Varta",
    "moura baterias": "Moura"
  }
  
  return mapeoMarcas[marcaLower] || marca.charAt(0).toUpperCase() + marca.slice(1).toLowerCase()
}

const normalizarCanal = (canal: string): string => {
  if (!canal) return "Retail"
  
  const canalLower = canal.toLowerCase().trim()
  
  // Mapeo de canales
  const mapeoCanales: Record<string, string> = {
    "retail": "Retail",
    "mayorista": "Mayorista",
    "online": "Online",
    "web": "Online",
    "tienda": "Retail",
    "distribuidor": "Mayorista",
    "distribuidor mayorista": "Mayorista"
  }
  
  return mapeoCanales[canalLower] || "Retail"
}

const validarPrecio = (precio: any, index: number): number => {
  const precioNum = parseFloat(precio)
  
  if (isNaN(precioNum) || precioNum <= 0) {
    throw new Error(`Precio inválido en fila ${index + 1}: ${precio}`)
  }
  
  if (precioNum > CONFIGURACION_SISTEMA.alertas.precio_maximo) {
    throw new Error(`Precio muy alto en fila ${index + 1}: $${precioNum}`)
  }
  
  return precioNum
}

const extraerLineaProducto = (modelo: string): string => {
  // Extraer información de la línea de producto del modelo
  const lineas = ["AGM", "Gel", "Plomo", "Litio", "Calcio"]
  
  for (const linea of lineas) {
    if (modelo.toUpperCase().includes(linea.toUpperCase())) {
      return linea
    }
  }
  
  return "Estándar"
}

const obtenerMarkup = (marca: string, canal: string): number => {
  // Buscar markup específico
  const markupEspecifico = CONFIGURACION_SISTEMA.markups[marca]?.[canal]
  
  if (markupEspecifico) {
    return markupEspecifico
  }
  
  // Si no existe, usar markup por defecto según canal
  const markupsPorDefecto: Record<string, number> = {
    "Retail": 1.6,      // 60% de ganancia
    "Mayorista": 1.3,   // 30% de ganancia
    "Online": 1.8       // 80% de ganancia
  }
  
  return markupsPorDefecto[canal] || 1.5
}

const calcularRedondeo = (precio: number, tipo: string): number => {
  switch (tipo) {
    case "multiplo100":
      // Redondear a múltiplos de $100 (ej: 1234 -> 1300)
      return Math.ceil(precio / 100) * 100
      
    case "multiplo50":
      // Redondear a múltiplos de $50 (ej: 1234 -> 1250)
      return Math.ceil(precio / 50) * 50
      
    case "multiplo25":
      // Redondear a múltiplos de $25 (ej: 1234 -> 1250)
      return Math.ceil(precio / 25) * 25
      
    default:
      // Sin redondeo
      return precio
  }
}

const obtenerReglaRentabilidad = (marca: string, canal: string) => {
  return CONFIGURACION_SISTEMA.rentabilidad[marca]?.[canal] || null
}

const calcularMargenPromedio = (productos: any[]): number => {
  const margenes = productos
    .filter((p: any) => p.estado_proceso !== "ERROR")
    .map((p: any) => p.margen?.bruto || 0)
  
  if (margenes.length === 0) return 0
  
  return Math.round(
    (margenes.reduce((a: number, b: number) => a + b, 0) / margenes.length) * 100
  ) / 100
}

// ============================================================================
// PASOS DEL PROCESO DE PRICING
// ============================================================================

// PASO 1: Normalización de datos
const normalizarDatos = (datos: any[]): any[] => {
  return datos.map((fila: any, index: number) => {
    // Normalizar marca (primera letra mayúscula, resto minúscula)
    const marca = normalizarMarca(fila.marca || fila.marca_baterias || "Otros")
    
    // Normalizar canal (si no existe, asignar por defecto)
    const canal = normalizarCanal(fila.canal || "Retail")
    
    // Validar y convertir precio
    const precio = validarPrecio(fila.precio || fila.precio_de_lista || fila.precio_lista, index)
    
    // Extraer línea de producto del modelo
    const modelo = fila.modelo || fila.codigo_baterias || "Sin modelo"
    const lineaProducto = extraerLineaProducto(modelo)
    
    return {
      id: index + 1,
      marca: marca,
      modelo: modelo,
      precio_base: precio,
      canal: canal,
      linea_producto: lineaProducto,
      precio_con_markup: 0,
      precio_redondeado: 0,
      margen: { bruto: 0, neto: 0, costos_operativos: 0 },
      rentabilidad: "",
      alertas: [],
      estado_proceso: "PENDIENTE"
    }
  })
}

// PASO 2: Aplicación de markups
const aplicarMarkups = (productos: any[]): any[] => {
  return productos.map((producto: any) => {
    // Obtener markup según marca y canal
    const markup = obtenerMarkup(producto.marca, producto.canal)
    
    // Calcular precio con markup
    producto.precio_con_markup = producto.precio_base * markup
    
    // Actualizar estado
    producto.estado_proceso = "MARKUP_APLICADO"
    
    return producto
  })
}

// PASO 3: Validación de markups
const validarMarkups = (productos: any[]): any[] => {
  return productos.map((producto: any) => {
    const diferencia = producto.precio_con_markup - producto.precio_base
    
    // Verificar que el markup sea razonable
    if (diferencia < 0) {
      producto.alertas.push("Error: Precio con markup menor al precio base")
      producto.estado_proceso = "ERROR"
    } else if (diferencia > CONFIGURACION_SISTEMA.alertas.diferencia_maxima) {
      producto.alertas.push("Advertencia: Diferencia de precio muy alta")
    }
    
    return producto
  })
}

// PASO 4: Aplicación de redondeo
const aplicarRedondeo = (productos: any[]): any[] => {
  return productos.map((producto: any) => {
    if (producto.estado_proceso === "ERROR") {
      return producto // Saltar productos con error
    }
    
    // Obtener tipo de redondeo según canal
    const tipoRedondeo = CONFIGURACION_SISTEMA.redondeo[producto.canal]
    
    // Aplicar redondeo
    producto.precio_redondeado = calcularRedondeo(
      producto.precio_con_markup, 
      tipoRedondeo
    )
    
    // Actualizar estado
    producto.estado_proceso = "REDONDEADO"
    
    return producto
  })
}

// PASO 5: Cálculo de márgenes
const calcularMargenes = (productos: any[]): any[] => {
  return productos.map((producto: any) => {
    if (producto.estado_proceso === "ERROR") {
      return producto
    }
    
    // Calcular margen bruto
    const margenBruto = ((producto.precio_redondeado - producto.precio_base) / producto.precio_base) * 100
    
    // Calcular margen neto (considerando costos operativos estimados)
    const costosOperativos = producto.precio_base * 0.15 // 15% estimado
    const margenNeto = (((producto.precio_redondeado - producto.precio_base - costosOperativos) / producto.precio_base) * 100)
    
    producto.margen = {
      bruto: Math.round(margenBruto * 100) / 100, // Redondear a 2 decimales
      neto: Math.round(margenNeto * 100) / 100,
      costos_operativos: costosOperativos
    }
    
    // Actualizar estado
    producto.estado_proceso = "MARGEN_CALCULADO"
    
    return producto
  })
}

// PASO 6: Validación de rentabilidad
const validarRentabilidad = (productos: any[]): any[] => {
  return productos.map((producto: any) => {
    if (producto.estado_proceso === "ERROR") {
      return producto
    }
    
    // Obtener regla de rentabilidad para esta marca y canal
    const regla = obtenerReglaRentabilidad(producto.marca, producto.canal)
    
    if (regla) {
      // Evaluar rentabilidad según margen mínimo
      if (producto.margen.bruto >= regla.margen_minimo) {
        producto.rentabilidad = "RENTABLE"
        producto.estado_proceso = "RENTABLE"
      } else {
        producto.rentabilidad = "NO RENTABLE"
        producto.estado_proceso = "NO_RENTABLE"
        producto.alertas.push(regla.alerta)
      }
    } else {
      // Sin regla específica, usar regla general
      if (producto.margen.bruto >= 30) {
        producto.rentabilidad = "RENTABLE"
        producto.estado_proceso = "RENTABLE"
      } else {
        producto.rentabilidad = "NO RENTABLE"
        producto.estado_proceso = "NO_RENTABLE"
        producto.alertas.push("Margen por debajo del mínimo recomendado")
      }
    }
    
    return producto
  })
}

// PASO 7: Generación de resumen
const generarResumenFinal = (productos: any[]): any => {
  const resumen = {
    total_productos: productos.length,
    productos_procesados: productos.filter((p: any) => p.estado_proceso !== "ERROR").length,
    productos_con_error: productos.filter((p: any) => p.estado_proceso === "ERROR").length,
    productos_rentables: productos.filter((p: any) => p.rentabilidad === "RENTABLE").length,
    productos_no_rentables: productos.filter((p: any) => p.rentabilidad === "NO RENTABLE").length,
    
    // Estadísticas de margen
    margen_promedio: 0,
    margen_minimo: Infinity,
    margen_maximo: -Infinity,
    
    // Análisis por marca
    analisis_por_marca: {} as Record<string, any>,
    
    // Análisis por canal
    analisis_por_canal: {} as Record<string, any>,
    
    // Productos con alertas
    productos_con_alertas: productos.filter((p: any) => p.alertas.length > 0).length,
    
    // Tiempo de procesamiento
    tiempo_procesamiento: 0,
    fecha_procesamiento: new Date().toISOString()
  }
  
  // Calcular estadísticas de margen
  const margenes = productos
    .filter((p: any) => p.estado_proceso !== "ERROR")
    .map((p: any) => p.margen.bruto)
  
  if (margenes.length > 0) {
    resumen.margen_promedio = Math.round(
      (margenes.reduce((a: number, b: number) => a + b, 0) / margenes.length) * 100
    ) / 100
    resumen.margen_minimo = Math.min(...margenes)
    resumen.margen_maximo = Math.max(...margenes)
  }
  
  // Análisis por marca
  const marcas = [...new Set(productos.map((p: any) => p.marca))]
  marcas.forEach(marca => {
    const productosMarca = productos.filter((p: any) => p.marca === marca)
    resumen.analisis_por_marca[marca] = {
      total: productosMarca.length,
      rentables: productosMarca.filter((p: any) => p.rentabilidad === "RENTABLE").length,
      margen_promedio: calcularMargenPromedio(productosMarca)
    }
  })
  
  // Análisis por canal
  const canales = [...new Set(productos.map((p: any) => p.canal))]
  canales.forEach(canal => {
    const productosCanal = productos.filter((p: any) => p.canal === canal)
    resumen.analisis_por_canal[canal] = {
      total: productosCanal.length,
      rentables: productosCanal.filter((p: any) => p.rentabilidad === "RENTABLE").length,
      margen_promedio: calcularMargenPromedio(productosCanal)
    }
  })
  
  return resumen
}

// ============================================================================
// FUNCIÓN PRINCIPAL DEL PROCESO COMPLETO
// ============================================================================

const ejecutarProcesoCompleto = async (archivo: File) => {
  console.log("🚀 INICIANDO PROCESO DE PRICING COMPLETO...")
  
  try {
    // Leer el archivo Excel
    const bytes = await archivo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const datosExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
    
    // Procesar datos
    const headers = (datosExcel[0] || []) as string[]
    const filas = datosExcel.slice(1)
    
    console.log('📋 Headers:', headers)
    console.log('📊 Total filas:', filas.length)
    
    // Convertir filas a objetos
    const datos = filas.map((fila: unknown[]) => {
      const registro: Record<string, any> = {}
      headers.forEach((header, colIndex) => {
        if (header && fila[colIndex] !== undefined) {
          const key = header.toLowerCase().replace(/\s+/g, '_')
          registro[key] = fila[colIndex]
        }
      })
      return registro
    })
    
    // PASO 1: Carga y validación
    console.log("📥 PASO 1: Cargando y validando datos...")
    const productos = normalizarDatos(datos)
    console.log(`✅ ${productos.length} productos cargados`)
    
    // PASO 2: Aplicación de markups
    console.log("🧮 PASO 2: Aplicando markups...")
    const productosConMarkup = aplicarMarkups(productos)
    const productosMarkupValidados = validarMarkups(productosConMarkup)
    console.log("✅ Markups aplicados y validados")
    
    // PASO 3: Aplicación de redondeo
    console.log("🔢 PASO 3: Aplicando redondeo...")
    const productosRedondeados = aplicarRedondeo(productosMarkupValidados)
    console.log("✅ Redondeo aplicado")
    
    // PASO 4: Cálculo de márgenes
    console.log("💰 PASO 4: Calculando márgenes...")
    const productosConMargen = calcularMargenes(productosRedondeados)
    console.log("✅ Márgenes calculados")
    
    // PASO 5: Validación de rentabilidad
    console.log("✅ PASO 5: Validando rentabilidad...")
    const productosConRentabilidad = validarRentabilidad(productosConMargen)
    console.log("✅ Rentabilidad validada")
    
    // PASO 6: Generación de resumen
    console.log("📈 PASO 6: Generando resumen...")
    const resumen = generarResumenFinal(productosConRentabilidad)
    console.log("✅ Resumen generado")
    
    console.log("🎯 PROCESO COMPLETADO EXITOSAMENTE!")
    
    return {
      productos: productosConRentabilidad,
      resumen: resumen
    }
    
  } catch (error) {
    console.error("❌ ERROR EN EL PROCESO:", error)
    throw error
  }
}

// ============================================================================
// ENDPOINT PRINCIPAL DE LA API
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Procesando archivo con sistema de pricing completo...')
    
    // Obtener archivo
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }
    
    // Ejecutar proceso completo
    const resultado = await ejecutarProcesoCompleto(file)
    
    // Preparar respuesta
    const respuesta = {
      success: true,
      archivo: file.name,
      total_registros: resultado.productos.length,
      productos: resultado.productos,
      estadisticas: resultado.resumen,
      configuracion: {
        markups: CONFIGURACION_SISTEMA.markups,
        redondeo: CONFIGURACION_SISTEMA.redondeo,
        alertas: CONFIGURACION_SISTEMA.alertas
      }
    }
    
    console.log('✅ Procesado:', resultado.productos.length, 'productos')
    return NextResponse.json(respuesta)
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ 
      error: 'Error procesando archivo',
      detalles: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Endpoint para obtener información del servicio
export async function GET() {
  return NextResponse.json({ 
    message: 'Sistema de Pricing Completo para archivos Excel',
    methods: ['POST'],
    expectedFormat: 'multipart/form-data con campo "file"',
    features: [
      'Sistema de pricing completo de 7 pasos',
      'Markups dinámicos por marca y canal',
      'Reglas de rentabilidad configurables',
      'Redondeo inteligente por canal',
      'Cálculo de márgenes brutos y netos',
      'Validación de rentabilidad',
      'Análisis estadístico completo',
      'Configuración flexible del sistema'
    ],
    configuracion: {
      marcas_soportadas: Object.keys(CONFIGURACION_SISTEMA.markups),
      canales_soportados: Object.keys(CONFIGURACION_SISTEMA.redondeo),
      tipos_redondeo: ["multiplo100", "multiplo50", "multiplo25"]
    },
    status: 'API funcionando correctamente'
  })
}
