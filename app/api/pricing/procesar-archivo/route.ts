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
    const modelo = producto.modelo;
    const marca = normalizarMarca(producto.marca);
    const canal = normalizarCanal(producto.canal);
    
    // Buscar equivalencia en la tabla (búsqueda flexible por modelo)
    const equivalencia = equivalencias.find((eq: any) => {
      // Búsqueda exacta por modelo
      if (eq.modelo === modelo) return true;
      
      // Búsqueda por modelo parcial (para casos como "60Ah" vs "VA60HD/E")
      const modeloLower = modelo.toLowerCase();
      const eqModeloLower = eq.modelo.toLowerCase();
      
      // Buscar si el modelo contiene números similares
      const modeloNumeros = modeloLower.match(/\d+/g);
      const eqNumeros = eqModeloLower.match(/\d+/g);
      
      if (modeloNumeros && eqNumeros) {
        return modeloNumeros.some(num => eqNumeros.includes(num));
      }
      
      return false;
    });
    
    if (!equivalencia) {
      return {
        ...producto,
        error: `No se encontró equivalencia para modelo: ${modelo}`,
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
        error: `Precio Varta inválido para modelo: ${modelo} (${equivalencia.precio_varta})`,
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
      modelo: modelo,
      marca_original: producto.marca,
      marca_normalizada: marca,
      canal_normalizado: canal,
      equivalencia_encontrada: equivalencia.modelo,
      categoria_varta: equivalencia.categoria,
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
    const formData = await request.formData();
    const file = formData.get('archivo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }
    
    console.log(`📁 Procesando archivo: ${file.name}`);
    
    // Leer contenido del archivo
    const csvContent = await file.text();
    
    // Procesar archivo CSV
    const { headers, rows } = procesarArchivoCSV(csvContent);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo no contiene datos válidos' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Productos encontrados: ${rows.length}`);
    
    // Tabla de equivalencias COMPLETA basada en la imagen
    const equivalencias = [
      // 12x13
      { modelo: "Wabatt 100", categoria: "12x13", precio_varta: 116917.65 },
      { modelo: "Wabatt 44", categoria: "12x13", precio_varta: 116917.65 },
      
      // 12x9
      { modelo: "Moura M18KD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M310", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M310GD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M310GD/1", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M6AD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M4KD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M8KD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M1ELD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M8ECD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M8ECD S/H", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M8ECD AGM", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M100HA", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M8QD", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M190", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M210", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M150", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M180", categoria: "12x9", precio_varta: 116917.65 },
      { modelo: "Moura M180GD", categoria: "12x9", precio_varta: 116917.65 },
      
      // 12x75 Alto
      { modelo: "Varta Silver WM5BD", categoria: "12x75 Alto", precio_varta: 114897.59 },
      { modelo: "Varta Silver WM5GD", categoria: "12x75 Alto", precio_varta: 114897.59 },
      { modelo: "Varta Silver WM6GD/S", categoria: "12x75 Alto", precio_varta: 114897.59 },
      { modelo: "Varta Silver VATEND/S", categoria: "12x75 Alto", precio_varta: 114897.59 },
      { modelo: "Varta Silver Alta VDM7SPD", categoria: "12x75 Alto", precio_varta: 114897.59 },
      { modelo: "Varta Silver VAJ35/S", categoria: "12x75 Alto", precio_varta: 114897.59 },
      
      // 12x75 / 12-80
      { modelo: "Varta Plus VDM6HS", categoria: "12x75 / 12-80", precio_varta: 114897.59 },
      { modelo: "Varta Plus VDM5MD", categoria: "12x75 / 12-80", precio_varta: 114897.59 },
      
      // 12x85
      { modelo: "Varta S/H VBH5CH", categoria: "12x85", precio_varta: 114897.59 },
      { modelo: "Moura S/H WM6D", categoria: "12x85", precio_varta: 114897.59 },
      { modelo: "Varta S/H VBH2FPD", categoria: "12x85", precio_varta: 114897.59 },
      
      // 12x75 larga
      { modelo: "Varta Blue WM3D/WM4D", categoria: "12x75 larga", precio_varta: 114897.59 },
      { modelo: "Varta Blue WM7SLD/S", categoria: "12x75 larga", precio_varta: 114897.59 },
      { modelo: "Varta Blue WMELD/S", categoria: "12x75 larga", precio_varta: 114897.59 },
      
      // 12x110
      { modelo: "Wabatt 110", categoria: "12x110", precio_varta: 153373.00 },
      { modelo: "Wabatt 600", categoria: "12x110", precio_varta: 153373.00 },
      { modelo: "Wabatt 600 Gold Alto", categoria: "12x110", precio_varta: 153373.00 },
      { modelo: "Wabatt 180", categoria: "12x110", precio_varta: 153373.00 },
      
      // 12x100
      { modelo: "Lubeck 110", categoria: "12x100", precio_varta: 153373.00 },
      { modelo: "Lubeck 600", categoria: "12x100", precio_varta: 153373.00 },
      
      // 12x75 S/H
      { modelo: "Moura M310 S/H", categoria: "12x75 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM10 S/H", categoria: "12x75 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM40 S/H", categoria: "12x75 S/H", precio_varta: 114897.59 },
      
      // 12x85 S/H
      { modelo: "Willard UBM30", categoria: "12x85 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM40", categoria: "12x85 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM20", categoria: "12x85 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM25", categoria: "12x85 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM35", categoria: "12x85 S/H", precio_varta: 114897.59 },
      { modelo: "Willard UBM10", categoria: "12x85 S/H", precio_varta: 114897.59 },
      
      // 12x95
      { modelo: "Varta Blue VA150D", categoria: "12x95", precio_varta: 177198.29 },
      
      // 12x110
      { modelo: "Varta Blue VA180D", categoria: "12x110", precio_varta: 210595.25 },
      
      // 12x160
      { modelo: "Varta Blue VA200D", categoria: "12x160", precio_varta: 212596.42 },
      
      // 12x180
      { modelo: "Varta Scania VPA180/S", categoria: "12x180", precio_varta: 244143.23 },
      
      // 12x190
      { modelo: "Varta Scania VPA180/S", categoria: "12x190", precio_varta: 245559.15 },
      
      // 12-190 Scania T 12-200
      { modelo: "Varta Scania VPA180/S", categoria: "12-190 Scania T 12-200", precio_varta: 298307.08 },
      
      // Modelos Varta específicos con precios exactos
      { modelo: "VGM60HD/E", categoria: "Varta Específico", precio_varta: 116917.65 },
      { modelo: "VDA65DD/E", categoria: "Varta Específico", precio_varta: 116917.65 },
      { modelo: "VDA70ND/E", categoria: "Varta Específico", precio_varta: 0.00 },
      { modelo: "VDA75PD", categoria: "Varta Específico", precio_varta: 114897.59 },
      { modelo: "VDA95MD", categoria: "Varta Específico", precio_varta: 153373.00 },
      { modelo: "VA38JD", categoria: "Varta Específico", precio_varta: 79839.29 },
      { modelo: "VA34JD", categoria: "Varta Específico", precio_varta: 75421.61 },
      { modelo: "VA45BD", categoria: "Varta Específico", precio_varta: 80802.12 },
      { modelo: "VA45JD/E", categoria: "Varta Específico", precio_varta: 85956.09 },
      { modelo: "VA50GD", categoria: "Varta Específico", precio_varta: 86088.24 },
      { modelo: "VA60HD/E", categoria: "Varta Específico", precio_varta: 97226.85 },
      { modelo: "VA60DD/E", categoria: "Varta Específico", precio_varta: 88580.27 },
      { modelo: "VA70ND/E", categoria: "Varta Específico", precio_varta: 109026.23 },
      { modelo: "VA75LD/E", categoria: "Varta Específico", precio_varta: 121920.58 },
      { modelo: "VA90LD/E", categoria: "Varta Específico", precio_varta: 148898.67 },
      { modelo: "VAF90MD", categoria: "Varta Específico", precio_varta: 210595.25 },
      { modelo: "VPA100LE", categoria: "Varta Específico", precio_varta: 177198.29 },
      { modelo: "VA150TD", categoria: "Varta Específico", precio_varta: 212596.42 },
      { modelo: "VPA150TD", categoria: "Varta Específico", precio_varta: 212596.42 },
      { modelo: "VA180TD", categoria: "Varta Específico", precio_varta: 244143.23 },
      { modelo: "VPA180TD", categoria: "Varta Específico", precio_varta: 245559.15 },
      { modelo: "VFA180TD", categoria: "Varta Específico", precio_varta: 245559.15 },
      { modelo: "VFA180TE", categoria: "Varta Específico", precio_varta: 298307.08 },
      { modelo: "VA200TD", categoria: "Varta Específico", precio_varta: 302856.92 },
      { modelo: "VA225TE", categoria: "Varta Específico", precio_varta: 399253.09 },
      { modelo: "VTA135TD", categoria: "Varta Específico", precio_varta: 5.00 },
      { modelo: "VFB60HD", categoria: "Varta Específico", precio_varta: 159244.37 },
      { modelo: "VFB72PD", categoria: "Varta Específico", precio_varta: 173082.67 },
      { modelo: "57 AGM", categoria: "Varta Específico", precio_varta: 0.00 },
      { modelo: "88 AGM", categoria: "Varta Específico", precio_varta: 0.00 }
    ];
    
    // Calcular pricing correcto
    const productosConPricing = calcularPricingCorrecto(rows, equivalencias);
    
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
      equivalencias_usadas: equivalencias
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
