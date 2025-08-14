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
    
    // Buscar equivalencia en la tabla
    const equivalencia = equivalencias.find((eq: any) => eq.modelo === modelo);
    
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
        error: `Precio Varta inválido para modelo: ${modelo}`,
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
      equivalente_varta: equivalencia.equivalente_varta,
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
    
    // Tabla de equivalencias (en una implementación real, esto vendría de una base de datos)
    const equivalencias = [
      { modelo: "60Ah", equivalente_varta: "VARTA_60AH", precio_varta: 15000 },
      { modelo: "70Ah", equivalente_varta: "VARTA_70AH", precio_varta: 18000 },
      { modelo: "100Ah", equivalente_varta: "VARTA_100AH", precio_varta: 25000 },
      { modelo: "55Ah", equivalente_varta: "VARTA_55AH", precio_varta: 14000 },
      { modelo: "80Ah", equivalente_varta: "VARTA_80AH", precio_varta: 20000 }
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
    const marcas = [...new Set(productosConPricing.filter(p => !p.error).map(p => p.marca_normalizada))];
    marcas.forEach(marca => {
      const productosMarca = productosConPricing.filter(p => !p.error && p.marca_normalizada === marca);
      estadisticas.por_marca[marca] = {
        cantidad: productosMarca.length,
        margen_promedio: productosMarca.reduce((sum, p) => sum + p.margen, 0) / productosMarca.length,
        rentables: productosMarca.filter(p => p.rentabilidad === "RENTABLE").length
      };
    });
    
    // Estadísticas por canal
    const canales = [...new Set(productosConPricing.filter(p => !p.error).map(p => p.canal_normalizado))];
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
