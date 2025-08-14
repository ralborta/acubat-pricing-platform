import { NextRequest, NextResponse } from 'next/server';

// CONFIGURACIÓN DEL SISTEMA DE PRICING CORRECTO
const CONFIGURACION_PRICING = {
  // AUMENTO FIJO PARA PRODUCTOS VARTA
  aumento_varta: 35,  // 35% de aumento
  
  // MARKUPS PARA OTRAS MARCAS (si aplican)
  markups_otras_marcas: {
    "Retail": 1.2,      // 20% de aumento
    "Mayorista": 1.15,  // 15% de aumento
    "Online": 1.25,     // 25% de aumento
    "Distribuidor": 1.1 // 10% de aumento
  },
  
  // Reglas de rentabilidad
  reglasRentabilidad: [
    { marca: "Varta", canal: "Retail", margen_minimo: 25 },
    { marca: "Varta", canal: "Mayorista", margen_minimo: 20 },
    { marca: "Varta", canal: "Online", margen_minimo: 30 },
    { marca: "Varta", canal: "Distribuidor", margen_minimo: 18 },
    { marca: "Otros", canal: "Retail", margen_minimo: 15 },
    { marca: "Otros", canal: "Mayorista", margen_minimo: 10 },
    { marca: "Otros", canal: "Online", margen_minimo: 20 },
    { marca: "Otros", canal: "Distribuidor", margen_minimo: 8 }
  ]
};

// FUNCIONES AUXILIARES
function normalizarMarca(marca: string): string {
  if (!marca) return "Otros";
  const marcaLower = marca.toLowerCase().trim();
  if (marcaLower.includes('varta')) return "Varta";
  return "Otros";
}

function normalizarCanal(canal: string): string {
  if (!canal) return "Retail";
  const canalLower = canal.toLowerCase().trim();
  if (canalLower.includes('mayorista') || canalLower.includes('mayor')) return "Mayorista";
  if (canalLower.includes('online') || canalLower.includes('web')) return "Online";
  if (canalLower.includes('distribuidor') || canalLower.includes('dist')) return "Distribuidor";
  return "Retail";
}

function calcularRentabilidad(margen: number, marca: string, canal: string) {
  const regla = CONFIGURACION_PRICING.reglasRentabilidad.find(r => 
    r.marca === marca && r.canal === canal
  );
  
  if (!regla) return { rentabilidad: "NO DEFINIDO", alerta: "Sin regla definida" };
  
  return {
    rentabilidad: margen >= regla.margen_minimo ? "RENTABLE" : "NO RENTABLE",
    alerta: margen < regla.margen_minimo ? `Margen bajo (${regla.margen_minimo}% mínimo)` : ""
  };
}

// TABLA DE EQUIVALENCIAS COMPLETA basada en la imagen del usuario
const TABLA_EQUIVALENCIAS = [
  // 12X45 - Baterías pequeñas
  { modelo: "12X45", precio_varta: 79839.29, codigos: ["M40FD", "M18FD", "M22ED"] },
  // 12X50
  { modelo: "12X50", precio_varta: 80802.12, codigos: ["M20GD", "M22GD", "M22GI"] },
  // 12X65 - Baterías medianas
  { modelo: "12X65", precio_varta: 85956.09, codigos: ["M26AD", "M26AI", "M24KD"] },
  // 12X75 - Baterías estándar
  { modelo: "12X75", precio_varta: 114897.59, codigos: ["M28KD", "M28KI", "M30LD", "M30LI", "ME80CD", "ME95QD"] },
  // 12X80 BORA
  { modelo: "12X80 BORA", precio_varta: 116917.65, codigos: ["M18SD", "M22JD", "M22RD", "M22RI"] },
  // 12X85 HILUX
  { modelo: "12X85 HILUX", precio_varta: 114897.59, codigos: ["ME90TD", "ME90TI"] },
  // 12X90 SPRINTER
  { modelo: "12X90 SPRINTER", precio_varta: 116917.65, codigos: ["ME100HA"] },
  // 12X110 - Baterías grandes
  { modelo: "12X110", precio_varta: 153373.00, codigos: ["ME135BD", "ME150BD", "ME180BD", "ME180BI"] },
  // 12X180 - Baterías extra grandes
  { modelo: "12X180", precio_varta: 244143.23, codigos: ["ME220PD/I", "ME23UI"] },
  // 12X220 - Baterías industriales
  { modelo: "12X220", precio_varta: 302856.92, codigos: ["MF60AD", "MF72LD"] },
  // Categorías especiales
  { modelo: "TRACT. CESPED", precio_varta: 79839.29, codigos: ["TRACT. CESPED"] },
  { modelo: "L2", precio_varta: 79839.29, codigos: ["L2"] },
  { modelo: "L3", precio_varta: 80802.12, codigos: ["L3"] }
];
  
  // 12X50
  { codigo_baterias: "M20GD", tipo: "12X50", precio_varta: 80802.12 },
  { codigo_baterias: "M22GD", tipo: "12X50", precio_varta: 80802.12 },
  { codigo_baterias: "M22GI", tipo: "12X50", precio_varta: 80802.12 },
  
  // 12X65 - Baterías medianas
  { codigo_baterias: "M26AD", tipo: "12X65", precio_varta: 85956.09 },
  { codigo_baterias: "M26AI", tipo: "12X65", precio_varta: 85956.09 },
  { codigo_baterias: "M24KD", tipo: "12X65", precio_varta: 85956.09 },
  
  // 12X75 - Baterías estándar
  { codigo_baterias: "M28KD", tipo: "12X75", precio_varta: 114897.59 },
  { codigo_baterias: "M28KI", tipo: "12X75", precio_varta: 114897.59 },
  { codigo_baterias: "M30LD", tipo: "12X75", precio_varta: 114897.59 },
  { codigo_baterias: "M30LI", tipo: "12X75", precio_varta: 114897.59 },
  { codigo_baterias: "ME80CD", tipo: "12X75", precio_varta: 114897.59 },
  { codigo_baterias: "ME95QD", tipo: "12X75", precio_varta: 114897.59 },
  
  // 12X80 BORA
  { codigo_baterias: "M18SD", tipo: "12X80 BORA", precio_varta: 116917.65 },
  { codigo_baterias: "M22JD", tipo: "12X80 BORA", precio_varta: 116917.65 },
  { codigo_baterias: "M22RD", tipo: "12X80 BORA", precio_varta: 116917.65 },
  { codigo_baterias: "M22RI", tipo: "12X80 BORA", precio_varta: 116917.65 },
  
  // 12X85 HILUX
  { codigo_baterias: "ME90TD", tipo: "12X85 HILUX", precio_varta: 114897.59 },
  { codigo_baterias: "ME90TI", tipo: "12X85 HILUX", precio_varta: 114897.59 },
  
  // 12X90 SPRINTER
  { codigo_baterias: "ME100HA", tipo: "12X90 SPRINTER", precio_varta: 116917.65 },
  
  // 12X110 - Baterías grandes
  { codigo_baterias: "ME135BD", tipo: "12X110", precio_varta: 153373.00 },
  { codigo_baterias: "ME150BD", tipo: "12X110", precio_varta: 153373.00 },
  { codigo_baterias: "ME180BD", tipo: "12X110", precio_varta: 153373.00 },
  { codigo_baterias: "ME180BI", tipo: "12X110", precio_varta: 153373.00 },
  
  // 12X180 - Baterías extra grandes
  { codigo_baterias: "ME220PD/I", tipo: "12X180", precio_varta: 244143.23 },
  { codigo_baterias: "ME23UI", tipo: "12X180", precio_varta: 244143.23 },
  
  // 12X220 - Baterías industriales
  { codigo_baterias: "MF60AD", tipo: "12X220", precio_varta: 302856.92 },
  { codigo_baterias: "MF72LD", tipo: "12X220", precio_varta: 302856.92 },
  
  // Categorías especiales
  { codigo_baterias: "TRACT. CESPED", tipo: "TRACT. CESPED", precio_varta: 79839.29 },
  { codigo_baterias: "L2", tipo: "L2", precio_varta: 79839.29 },
  { codigo_baterias: "L3", tipo: "L3", precio_varta: 80802.12 }
];

// FUNCIÓN PRINCIPAL: PROCESAR ARCHIVO CSV
function procesarArchivoCSV(csvContent: string) {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Archivo vacío o sin contenido válido');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          if (header && values[index]) {
            rowData[header] = values[index];
          }
        });
        
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      }
    }
    
    return { headers, rows };
    
  } catch (error) {
    console.error('❌ Error procesando CSV:', error);
    throw new Error(`Error procesando CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// FUNCIÓN PRINCIPAL: CÁLCULO DE PRICING CORRECTO
function calcularPricingCorrecto(productos: any[], equivalencias: any[]) {
  return productos.map(producto => {
    const codigoBaterias = producto.codigo_baterias || producto.modelo;
    
    // Si solo tenemos codigo_baterias, asignar marca y canal automáticamente
    let marca: string;
    let canal: string;
    
    if (producto.marca && producto.canal) {
      // Archivo completo con marca y canal
      marca = normalizarMarca(producto.marca);
      canal = normalizarCanal(producto.canal);
    } else {
      // Solo codigo_baterias - asignar automáticamente
      marca = "Otros"; // Por defecto
      canal = "Retail"; // Por defecto
      
      // Detectar si es Varta basándose en el código
      if (codigoBaterias && (codigoBaterias.startsWith('MF') || codigoBaterias.includes('EFB'))) {
        marca = "Varta";
      }
    }
    
    // Buscar equivalencia por código de batería en el array de códigos
    const equivalencia = equivalencias.find((eq: any) => eq.codigos.includes(codigoBaterias));
    
    if (!equivalencia) {
      return {
        ...producto,
        error: `No se encontró equivalencia para código: ${codigoBaterias}`,
        precio_final: 0,
        margen: 0,
        rentabilidad: "ERROR"
      };
    }
    
    // Obtener precio base de Varta
    const precioBaseVarta = parseFloat(equivalencia.precio_varta);
    
    if (isNaN(precioBaseVarta) || precioBaseVarta <= 0) {
      return {
        ...producto,
        error: `Precio Varta inválido para código: ${codigoBaterias} (${equivalencia.precio_varta})`,
        precio_final: 0,
        margen: 0,
        rentabilidad: "ERROR"
      };
    }
    
    let precioFinal: number;
    let margen: number;
    
    if (marca === "Varta") {
      // PRODUCTO VARTA: Aplicar 35% de aumento
      const aumento = precioBaseVarta * (CONFIGURACION_PRICING.aumento_varta / 100);
      precioFinal = precioBaseVarta + aumento;
      margen = CONFIGURACION_PRICING.aumento_varta; // El margen es el aumento
    } else {
      // OTRAS MARCAS: Aplicar markup del canal
      const markup = CONFIGURACION_PRICING.markups_otras_marcas[canal as keyof typeof CONFIGURACION_PRICING.markups_otras_marcas] || 1.15;
      precioFinal = precioBaseVarta * markup;
      margen = ((precioFinal - precioBaseVarta) / precioBaseVarta) * 100;
    }
    
    // Validar Rentabilidad
    const { rentabilidad, alerta } = calcularRentabilidad(margen, marca, canal);
    
    return {
      ...producto,
      codigo_baterias: codigoBaterias,
      marca_original: producto.marca,
      marca_normalizada: marca,
      canal_normalizado: canal,
      tipo_varta: equivalencia.modelo,
      precio_base_varta: precioBaseVarta,
      precio_final: precioFinal,
      margen: margen,
      rentabilidad: rentabilidad,
      alerta: alerta,
      tipo_calculo: marca === "Varta" ? "Aumento 35%" : `Markup ${canal}`,
      configuracion_usada: {
        aumento_varta: CONFIGURACION_PRICING.aumento_varta,
        markup_canal: marca === "Varta" ? null : CONFIGURACION_PRICING.markups_otras_marcas[canal as keyof typeof CONFIGURACION_PRICING.markups_otras_marcas]
      }
    };
  });
}

// POST /api/pricing/procesar-archivo
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando procesamiento de archivo...');
    
    const formData = await request.formData();
    const file = formData.get('archivo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }
    
    console.log(`📁 Procesando archivo: ${file.name}, tamaño: ${file.size} bytes`);
    
    // Leer contenido del archivo
    const csvContent = await file.text();
    console.log(`📄 Contenido del archivo leído, longitud: ${csvContent.length} caracteres`);
    
    // Procesar archivo CSV
    const { headers, rows } = procesarArchivoCSV(csvContent);
    console.log(`📊 Headers encontrados: ${headers.join(', ')}`);
    console.log(`📊 Filas procesadas: ${rows.length}`);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo no contiene datos válidos' },
        { status: 400 }
      );
    }
    
    // Mostrar primera fila para debug
    console.log('🔍 Primera fila de ejemplo:', rows[0]);
    
    // Calcular pricing correcto usando la tabla de equivalencias
    const productosConPricing = calcularPricingCorrecto(rows, TABLA_EQUIVALENCIAS);
    
    // Calcular estadísticas
    const estadisticas = {
      total_productos: productosConPricing.length,
      productos_rentables: productosConPricing.filter(p => p.rentabilidad === "RENTABLE").length,
      productos_no_rentables: productosConPricing.filter(p => p.rentabilidad === "NO RENTABLE").length,
      productos_con_error: productosConPricing.filter(p => p.error).length,
      margen_promedio: productosConPricing.filter(p => !p.error).reduce((sum, p) => sum + p.margen, 0) / productosConPricing.filter(p => !p.error).length,
      precio_promedio: productosConPricing.filter(p => !p.error).reduce((sum, p) => sum + p.precio_final, 0) / productosConPricing.filter(p => !p.error).length,
      por_marca: {} as any,
      por_canal: {} as any
    };
    
    // Estadísticas por marca
    const marcas = Array.from(new Set(productosConPricing.filter(p => !p.error).map(p => p.marca_normalizada)));
    marcas.forEach(marca => {
      const productosMarca = productosConPricing.filter(p => !p.error && p.marca_normalizada === marca);
      estadisticas.por_marca[marca] = {
        cantidad: productosMarca.length,
        margen_promedio: productosMarca.reduce((sum, p) => sum + p.margen, 0) / productosMarca.length,
        rentables: productosMarca.filter(p => p.rentabilidad === "RENTABLE").length
      };
    });
    
    // Estadísticas por canal
    const canales = Array.from(new Set(productosConPricing.filter(p => !p.error).map(p => p.canal_normalizado)));
    canales.forEach(canal => {
      const productosCanal = productosConPricing.filter(p => !p.error && p.canal_normalizado === canal);
      estadisticas.por_canal[canal] = {
        cantidad: productosCanal.length,
        margen_promedio: productosCanal.reduce((sum, p) => sum + p.margen, 0) / productosCanal.length,
        rentables: productosCanal.filter(p => p.rentabilidad === "RENTABLE").length
      };
    });
    
    console.log(`✅ Pricing calculado para ${productosConPricing.length} productos`);
    
    return NextResponse.json({
      success: true,
      mensaje: `Archivo procesado exitosamente. ${productosConPricing.length} productos analizados.`,
      archivo: file.name,
      headers: headers,
      productos: productosConPricing,
      estadisticas: estadisticas,
      configuracion: CONFIGURACION_PRICING,
      equivalencias_usadas: TABLA_EQUIVALENCIAS
    });
    
  } catch (error) {
    console.error('❌ Error procesando archivo:', error);
    return NextResponse.json(
      { 
        error: 'Error procesando archivo', 
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
