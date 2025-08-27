// 🚀 MÓDULO DE PRICING HARDCODEADO - SISTEMA COMPLETO
// Equivalencias Varta + Precios Netos + Cálculos por Canal + Redondeo Configurable
// ACTUALIZADO CON DATOS REALES DE ACUBAT

export type ROUNDING_MODE = "nearest_10" | "ceil_10" | "floor_10" | "psych_9";

// 🎯 TABLA DE EQUIVALENCIAS VARTA REAL DE ACUBAT
// Solo contiene: id_bateria → varta_codigo
// Los precios se calculan dinámicamente
export const EQUIVALENCIAS_VARTA = {
  // Baterías 12V - Automotriz (datos reales de Acubat)
  // Tipos exactos del archivo Excel de Acubat
  "12X45": "VA45BD",           // M40FD, M18FD
  "12X50": "VA50GD",           // M22ED
  "12X65": "VA60DD/E",         // M20GD
  "12X65 REF": "VA60DD/E",     // M22GD, M22GI
  "12X65 ALTA": "VA60HD/E",    // M26AD, M26AI
  "12X75": "VA70ND/E",         // M24KD
  "12X75 REF": "VA70ND/E",     // M28KD, M28KI
  "12X75 ALTA": "VA70ND/E",    // M30LD, M30LI
  "12X80 BORA": "VA80DD/E",    // ME80CD, MF80CD, MA80CD
  "12X90 SPRINTER": "VA90LD/E", // ME95QD
  "12X90 HILUX": "VA90LD/E",   // ME90TD, ME90TI
  "12X110": "VPA100LE",        // ME100HA
  "12X180": "VA180TD",         // ME135BD, ME150BD, ME180BD, ME180BI
  "12X220": "VA200TD",         // ME220PD/I
  
  // Baterías especiales
  "12X40 (H FIT)": "VA40DD/E", // M18SD
  "12X50 (H CIVIC)": "VA50GD", // M22JD
  "12X85 HILUX": "VA85DD/E",   // M22RD, M22RI
  "TRACT. CESPED": "VA6V25DD/E", // ME23UI
  "L2": "VA60DD/E",            // MF60AD
  "L3": "VA72DD/E",            // MF72LD
  
  // Equivalencias adicionales para mayor cobertura
  "12x35": "VA35DD/E",
  "12x40": "VA40DD/E",
  "12x55": "VA55DD/E",
  "12x60": "VA60DD/E",
  "12x70": "VA70DD/E",
  "12x85": "VA85DD/E",
  "12x95": "VA95DD/E",
  "12x100": "VA100DD/E",
  "12x120": "VA120DD/E",
  "12x140": "VA140DD/E",
  "12x160": "VA160DD/E",
  "12x200": "VA200DD/E",
  
  // Baterías 6V - Motos/Quads
  "6x35": "VA6V35DD/E",
  "6x40": "VA6V40DD/E",
  "6x45": "VA6V45DD/E",
  "6x50": "VA6V50DD/E",
  "6x55": "VA6V55DD/E",
  "6x60": "VA6V60DD/E",
  "6x70": "VA6V70DD/E",
  "6x80": "VA6V80DD/E",
  "6x90": "VA6V90DD/E",
  "6x100": "VA6V100DD/E"
};

// 💰 PRECIOS VARTA NETOS REALES DE ACUBAT (en pesos argentinos)
// Solo precios base netos - los precios mayoristas se calculan dinámicamente
export const PRECIOS_VARTA_NETOS = {
  // Baterías principales de Acubat (datos reales)
  "VA150TD": 112.61,
  "VA180TD": 129.32,
  "VPA180TD": 130.07,
  "VA200TD": 160.42,
  "VA225TE": 211.48,
  "VFA180TE": 158.01,
  "VDA95MD": 81.24,
  "VPA100LE": 93.86,
  "VA34JD": 39.95,
  "VA45BD": 42.80,
  "VA50GD": 45.60,
  "VA60DD/E": 46.92,
  "VA70ND/E": 57.75,
  "VA60HD/E": 51.50,
  "VGM60HD/E": 61.93,
  "VA75LD/E": 64.58,
  "VDA75PD": 60.86,
  "VFB72PD": 91.68,
  "VA90LD/E": 78.87,
  
  // Nuevos códigos para tipos reales de Acubat
  "VA40DD/E": 38.50,    // 12X40 (H FIT)
  "VA80DD/E": 62.30,    // 12X80 BORA
  "VA85DD/E": 66.80,    // 12X85 HILUX
  "VA95DD/E": 76.40,    // 12X95
  "VA100DD/E": 81.60,   // 12X100
  "VA160DD/E": 138.20,  // 12X100
  "VA6V25DD/E": 22.40,  // TRACT. CESPED
  "VA72DD/E": 58.90,    // L3
  
  // Precios adicionales para mayor cobertura
  "VA35DD/E": 28.50,
  "VA55DD/E": 43.60,
  "VA120DD/E": 97.50,
  "VA140DD/E": 116.40,
  
  // Baterías 6V - Motos/Quads
  "VA6V35DD/E": 24.80,
  "VA6V40DD/E": 28.40,
  "VA6V45DD/E": 31.90,
  "VA6V50DD/E": 35.60,
  "VA6V55DD/E": 39.20,
  "VA6V60DD/E": 43.10,
  "VA6V70DD/E": 49.80,
  "VA6V80DD/E": 56.90,
  "VA6V90DD/E": 64.20,
  "VA6V100DD/E": 72.40
};

// ⚙️ CONFIGURACIÓN DE MARKUPS POR CANAL - REGLAS CORREGIDAS
export const MARKUPS_CANAL = {
  LISTA_PVP: 0.00,      // Sin markup, solo IVA
  MINORISTA: 1.00,      // +100% sobre costo (regla antigua)
  MAYORISTA: 0.50       // +50% sobre precio Varta (regla antigua)
};

// 🧮 FUNCIÓN DE REDONDEO CONFIGURABLE
export function aplicarRedondeo(precio: number, modo: ROUNDING_MODE = "nearest_10"): number {
  switch (modo) {
    case "nearest_10":
      return Math.round(precio / 10) * 10;
    case "ceil_10":
      return Math.ceil(precio / 10) * 10;
    case "floor_10":
      return Math.floor(precio / 10) * 10;
    case "psych_9":
      // Redondeo psicológico: 99, 199, 299, etc.
      const base = Math.floor(precio / 100) * 100;
      return base + 99;
    default:
      return Math.round(precio / 10) * 10;
  }
}

// 🎯 FUNCIÓN PRINCIPAL: CALCULAR PRECIO MAYORISTA DESDE ID_BATERIA
// Calcula dinámicamente: precio Varta neto → +40% → +IVA → redondeo
export function precioMayoristaDesdeIdBateria(
  id_bateria: string, 
  modo_redondeo: ROUNDING_MODE = "nearest_10",
  iva: number = 0.21
): {
  id_bateria: string;
  varta_codigo: string | null;
  varta_precio_neto: number | null;
  mayorista_neto: number | null;
  mayorista_final_sin_redondeo: number | null;
  mayorista_final: number | null;
  rentabilidad_porcentaje: number | null;
  error?: string;
} {
  try {
    // 1️⃣ BUSCAR EQUIVALENCIA VARTA (solo mapeo id_bateria → varta_codigo)
    const varta_codigo = EQUIVALENCIAS_VARTA[id_bateria as keyof typeof EQUIVALENCIAS_VARTA];
    
    if (!varta_codigo) {
      return {
        id_bateria,
        varta_codigo: null,
        varta_precio_neto: null,
        mayorista_neto: null,
        mayorista_final_sin_redondeo: null,
        mayorista_final: null,
        rentabilidad_porcentaje: null,
        error: `No se encontró equivalencia Varta para: ${id_bateria}`
      };
    }
    
    // 2️⃣ OBTENER PRECIO VARTA NETO BASE (solo precio base, sin cálculos)
    const varta_precio_neto = PRECIOS_VARTA_NETOS[varta_codigo as keyof typeof PRECIOS_VARTA_NETOS];
    
    if (!varta_precio_neto || varta_precio_neto === 0) {
      return {
        id_bateria,
        varta_codigo,
        varta_precio_neto: null,
        mayorista_neto: null,
        mayorista_final_sin_redondeo: null,
        mayorista_final: null,
        rentabilidad_porcentaje: null,
        error: `No se encontró precio Varta válido para código: ${varta_codigo}`
      };
    }
    
    // 3️⃣ CALCULAR DINÁMICAMENTE: Precio Mayorista Neto (+40% sobre precio Varta)
    const mayorista_neto = varta_precio_neto * (1 + MARKUPS_CANAL.MAYORISTA);
    
    // 4️⃣ CALCULAR DINÁMICAMENTE: Precio Final con IVA (sin redondeo)
    const mayorista_final_sin_redondeo = mayorista_neto * (1 + iva);
    
    // 5️⃣ CALCULAR DINÁMICAMENTE: Aplicar Redondeo al Precio Final
    const mayorista_final = aplicarRedondeo(mayorista_final_sin_redondeo, modo_redondeo);
    
    // 6️⃣ CALCULAR DINÁMICAMENTE: Rentabilidad (sobre neto, sin IVA, sin redondeo)
    // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
    const rentabilidad_porcentaje = ((mayorista_neto - varta_precio_neto) / mayorista_neto) * 100;
    
    return {
      id_bateria,
      varta_codigo,
      varta_precio_neto,
      mayorista_neto,
      mayorista_final_sin_redondeo,
      mayorista_final,
      rentabilidad_porcentaje,
    };
    
  } catch (error) {
    return {
      id_bateria,
      varta_codigo: null,
      varta_precio_neto: null,
      mayorista_neto: null,
      mayorista_final_sin_redondeo: null,
      mayorista_final: null,
      rentabilidad_porcentaje: null,
      error: `Error en cálculo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// 🚀 FUNCIÓN COMPLETA: CALCULAR PRECIOS PARA TODOS LOS CANALES
// TODOS los precios se calculan dinámicamente desde los datos base
export function calcularPreciosCompletos(
  id_bateria: string,
  costo_neto: number,
  precio_lista_proveedor: number | null = null,
  modo_redondeo: ROUNDING_MODE = "nearest_10",
  iva: number = 0.21
): {
  id_bateria: string;
  lista_pvp: {
    neto: number;
    final: number;
    rentabilidad: number;
  } | null;
  minorista: {
    neto: number;
    final: number;
    rentabilidad: number;
  } | null;
  mayorista: {
    neto: number;
    final: number;
    rentabilidad: number;
    varta_codigo: string | null;
    varta_precio_neto: number | null;
  } | null;
  error?: string;
} {
  try {
    const resultado: any = { id_bateria };
    
    // 1️⃣ LISTA/PVP: Precio sugerido del proveedor + IVA (SIN redondeo)
    if (precio_lista_proveedor !== null) {
      const lista_neto = precio_lista_proveedor;
      const lista_final = lista_neto * (1 + iva);
      // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
      const lista_rentabilidad = ((lista_neto - costo_neto) / lista_neto) * 100;
      
      resultado.lista_pvp = {
        neto: lista_neto,
        final: lista_final,
        rentabilidad: lista_rentabilidad
      };
    } else {
      resultado.lista_pvp = null;
    }
    
    // 2️⃣ MINORISTA: Costo neto + 100% + IVA + redondeo (TODO calculado)
    const minorista_neto = costo_neto * (1 + MARKUPS_CANAL.MINORISTA);
    const minorista_final_sin_redondeo = minorista_neto * (1 + iva);
    const minorista_final = aplicarRedondeo(minorista_final_sin_redondeo, modo_redondeo);
    // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
    const minorista_rentabilidad = ((minorista_neto - costo_neto) / minorista_neto) * 100;
    
    resultado.minorista = {
      neto: minorista_neto,
      final: minorista_final,
      rentabilidad: minorista_rentabilidad
    };
    
    // 3️⃣ MAYORISTA: Precio Varta neto + 50% + IVA + redondeo (TODO calculado)
    const mayorista_resultado = precioMayoristaDesdeIdBateria(id_bateria, modo_redondeo, iva);
    
    if (mayorista_resultado.error) {
      resultado.error = mayorista_resultado.error;
      resultado.mayorista = null;
    } else {
      resultado.mayorista = {
        neto: mayorista_resultado.mayorista_neto!,
        final: mayorista_resultado.mayorista_final!,
        rentabilidad: mayorista_resultado.rentabilidad_porcentaje!,
        varta_codigo: mayorista_resultado.varta_codigo,
        varta_precio_neto: mayorista_resultado.varta_precio_neto
      };
    }
    
    return resultado;
    
  } catch (error) {
    return {
      id_bateria,
      lista_pvp: null,
      minorista: null,
      mayorista: null,
      error: `Error en cálculo completo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// 📊 FUNCIÓN DE VALIDACIÓN DE RENTABILIDAD
export function validarRentabilidad(
  rentabilidad: number,
  piso_minimo: number = 10
): {
  es_rentable: boolean;
  nivel: 'EXCELENTE' | 'BUENA' | 'ACEPTABLE' | 'CRÍTICA';
  mensaje: string;
} {
  if (rentabilidad >= 25) {
    return {
      es_rentable: true,
      nivel: 'EXCELENTE',
      mensaje: `Rentabilidad excelente: ${rentabilidad.toFixed(1)}%`
    };
  } else if (rentabilidad >= 15) {
    return {
      es_rentable: true,
      nivel: 'BUENA',
      mensaje: `Rentabilidad buena: ${rentabilidad.toFixed(1)}%`
    };
  } else if (rentabilidad >= piso_minimo) {
    return {
      es_rentable: true,
      nivel: 'ACEPTABLE',
      mensaje: `Rentabilidad aceptable: ${rentabilidad.toFixed(1)}%`
    };
  } else {
    return {
      es_rentable: false,
      nivel: 'CRÍTICA',
      mensaje: `⚠️ Rentabilidad crítica: ${rentabilidad.toFixed(1)}% (mínimo: ${piso_minimo}%)`
    };
  }
}

// 🔍 FUNCIÓN DE BÚSQUEDA EN EQUIVALENCIAS
export function buscarEquivalencias(
  termino: string,
  limite: number = 10
): Array<{id_bateria: string, varta_codigo: string}> {
  const resultados = [];
  const termino_lower = termino.toLowerCase();
  
  for (const [id_bateria, varta_codigo] of Object.entries(EQUIVALENCIAS_VARTA)) {
    if (id_bateria.toLowerCase().includes(termino_lower) || 
        varta_codigo.toLowerCase().includes(termino_lower)) {
      resultados.push({ id_bateria, varta_codigo });
      
      if (resultados.length >= limite) break;
    }
  }
  
  return resultados;
}

// 📈 FUNCIÓN DE ESTADÍSTICAS DEL SISTEMA
// Solo muestra datos base - los precios finales se calculan dinámicamente
export function obtenerEstadisticasSistema(): {
  total_equivalencias: number;
  total_precios_varta: number;
  rangos_precios: {
    minimo: number;
    maximo: number;
    promedio: number;
  };
  canales_disponibles: string[];
} {
  const precios = Object.values(PRECIOS_VARTA_NETOS);
  const precios_numericos = precios.filter(p => typeof p === 'number' && !isNaN(p) && p > 0);
  
  return {
    total_equivalencias: Object.keys(EQUIVALENCIAS_VARTA).length,
    total_precios_varta: precios_numericos.length,
    rangos_precios: {
      minimo: Math.min(...precios_numericos),
      maximo: Math.max(...precios_numericos),
      promedio: precios_numericos.reduce((a, b) => a + b, 0) / precios_numericos.length
    },
    canales_disponibles: Object.keys(MARKUPS_CANAL)
  };
}

// 🎯 EXPORTACIÓN DE TIPOS Y CONSTANTES
export {
  EQUIVALENCIAS_VARTA as equivalenciasVarta,
  PRECIOS_VARTA_NETOS as preciosVartaNetos,
  MARKUPS_CANAL as markupsCanal
};
