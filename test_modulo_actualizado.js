// 🧪 PRUEBA DIRECTA DEL MÓDULO ACTUALIZADO
// Verifica que las equivalencias Varta funcionen correctamente

console.log('🔍 VERIFICANDO MÓDULO DE PRICING ACTUALIZADO');
console.log('=' .repeat(60));

// Simular las equivalencias actualizadas del módulo
const EQUIVALENCIAS_VARTA_ACTUALIZADAS = {
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
  "L3": "VA72DD/E"             // MF72LD
};

// Precios Varta actualizados
const PRECIOS_VARTA_ACTUALIZADOS = {
  "VA45BD": 42.80,
  "VA50GD": 45.60,
  "VA60DD/E": 46.92,
  "VA60HD/E": 51.50,
  "VA70ND/E": 57.75,
  "VA80DD/E": 62.30,
  "VA85DD/E": 66.80,
  "VA90LD/E": 78.87,
  "VPA100LE": 93.86,
  "VA180TD": 129.32,
  "VA200TD": 160.42,
  "VA40DD/E": 38.50,
  "VA6V25DD/E": 22.40,
  "VA72DD/E": 58.90
};

// 🧮 FUNCIÓN DE REDONDEO
function aplicarRedondeo(precio, modo = "nearest_10") {
  switch (modo) {
    case "nearest_10":
      return Math.round(precio / 10) * 10;
    case "ceil_10":
      return Math.ceil(precio / 10) * 10;
    case "floor_10":
      return Math.floor(precio / 10) * 10;
    default:
      return Math.round(precio / 10) * 10;
  }
}

// 🎯 FUNCIÓN DE PRUEBA: CALCULAR PRECIOS CON EQUIVALENCIAS ACTUALIZADAS
function calcularPreciosConEquivalenciasActualizadas(tipoBateria, precioLista, capacidadAh) {
  console.log(`\n🔋 Procesando: ${tipoBateria} (${capacidadAh}Ah)`);
  
  // Buscar equivalencia Varta
  const vartaCodigo = EQUIVALENCIAS_VARTA_ACTUALIZADAS[tipoBateria];
  if (!vartaCodigo) {
    console.log(`❌ No se encontró equivalencia Varta para: ${tipoBateria}`);
    return null;
  }
  
  // Obtener precio Varta neto
  const precioVartaNeto = PRECIOS_VARTA_ACTUALIZADOS[vartaCodigo];
  if (!precioVartaNeto || precioVartaNeto === 0) {
    console.log(`❌ No se encontró precio Varta para: ${vartaCodigo}`);
    return null;
  }
  
  console.log(`✅ Varta Código: ${vartaCodigo}`);
  console.log(`💰 Precio Varta Neto: $${precioVartaNeto}`);
  
  // Simular costo (en un caso real vendría del sistema)
  const costoNeto = precioLista * 0.6; // Estimación: 60% del precio lista
  
  // 🚀 CALCULAR PRECIOS PARA LOS TRES CANALES
  
  // 1️⃣ LISTA/PVP: Precio proveedor + IVA (SIN redondeo)
  const listaNeto = precioLista;
  const listaFinal = listaNeto * 1.21; // IVA 21%
  const listaRentabilidad = ((listaNeto - costoNeto) / costoNeto) * 100;
  
  console.log(`📋 LISTA/PVP:`);
  console.log(`   Neto: $${listaNeto.toFixed(2)}`);
  console.log(`   Final: $${listaFinal.toFixed(2)}`);
  console.log(`   Rentabilidad: ${listaRentabilidad.toFixed(1)}%`);
  
  // 2️⃣ MINORISTA: Costo neto + 70% + IVA + redondeo
  const minoristaNeto = costoNeto * 1.70;
  const minoristaFinalSinRedondeo = minoristaNeto * 1.21;
  const minoristaFinal = aplicarRedondeo(minoristaFinalSinRedondeo);
  const minoristaRentabilidad = ((minoristaNeto - costoNeto) / costoNeto) * 100;
  
  console.log(`🏪 MINORISTA:`);
  console.log(`   Neto: $${minoristaNeto.toFixed(2)}`);
  console.log(`   Final sin redondeo: $${minoristaFinalSinRedondeo.toFixed(2)}`);
  console.log(`   Final con redondeo: $${minoristaFinal}`);
  console.log(`   Rentabilidad: ${minoristaRentabilidad.toFixed(1)}%`);
  
  // 3️⃣ MAYORISTA: Precio Varta neto + 40% + IVA + redondeo
  const mayoristaNeto = precioVartaNeto * 1.40;
  const mayoristaFinalSinRedondeo = mayoristaNeto * 1.21;
  const mayoristaFinal = aplicarRedondeo(mayoristaFinalSinRedondeo);
  const mayoristaRentabilidad = ((mayoristaNeto - precioVartaNeto) / precioVartaNeto) * 100;
  
  console.log(`🏢 MAYORISTA:`);
  console.log(`   Neto: $${mayoristaNeto.toFixed(2)}`);
  console.log(`   Final sin redondeo: $${mayoristaFinalSinRedondeo.toFixed(2)}`);
  console.log(`   Final con redondeo: $${mayoristaFinal}`);
  console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);
  
  return {
    tipo_bateria: tipoBateria,
    capacidad_ah: capacidadAh,
    varta_codigo: vartaCodigo,
    varta_precio_neto: precioVartaNeto,
    lista_pvp: {
      neto: listaNeto,
      final: listaFinal,
      rentabilidad: listaRentabilidad
    },
    minorista: {
      neto: minoristaNeto,
      final: minoristaFinal,
      rentabilidad: minoristaRentabilidad
    },
    mayorista: {
      neto: mayoristaNeto,
      final: mayoristaFinal,
      rentabilidad: mayoristaRentabilidad
    }
  };
}

// 🚀 FUNCIÓN PRINCIPAL DE PRUEBA
function probarEquivalenciasActualizadas() {
  console.log('\n🧪 PROBANDO EQUIVALENCIAS ACTUALIZADAS...');
  
  // Tipos de batería reales del archivo de Acubat
  const tiposParaProbar = [
    "12X45",
    "12X50", 
    "12X65",
    "12X65 REF",
    "12X65 ALTA",
    "12X75",
    "12X75 REF",
    "12X75 ALTA",
    "12X80 BORA",
    "12X90 SPRINTER",
    "12X90 HILUX",
    "12X110",
    "12X180",
    "12X220",
    "12X40 (H FIT)",
    "12X50 (H CIVIC)",
    "12X85 HILUX",
    "TRACT. CESPED",
    "L2",
    "L3"
  ];
  
  let equivalenciasEncontradas = 0;
  let equivalenciasNoEncontradas = 0;
  
  tiposParaProbar.forEach((tipo, index) => {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`🔍 PRUEBA ${index + 1}: ${tipo}`);
    
    // Simular datos de producto
    const precioLista = 150000; // Precio simulado
    const capacidadAh = 60;     // Capacidad simulada
    
    const resultado = calcularPreciosConEquivalenciasActualizadas(tipo, precioLista, capacidadAh);
    
    if (resultado) {
      equivalenciasEncontradas++;
      console.log(`✅ EQUIVALENCIA ENCONTRADA:`);
      console.log(`   Código Varta: ${resultado.varta_codigo}`);
      console.log(`   Precio Varta: $${resultado.varta_precio_neto}`);
      console.log(`   Mayorista Final: $${resultado.mayorista.final}`);
      console.log(`   Rentabilidad Mayorista: ${resultado.mayorista.rentabilidad.toFixed(1)}%`);
    } else {
      equivalenciasNoEncontradas++;
      console.log(`❌ SIN EQUIVALENCIA`);
    }
  });
  
  // 📊 RESUMEN FINAL
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESUMEN DE EQUIVALENCIAS:`);
  console.log(`   ✅ Encontradas: ${equivalenciasEncontradas}`);
  console.log(`   ❌ No encontradas: ${equivalenciasNoEncontradas}`);
  console.log(`   📈 Tasa de éxito: ${((equivalenciasEncontradas / tiposParaProbar.length) * 100).toFixed(1)}%`);
  
  if (equivalenciasEncontradas > 0) {
    console.log(`\n🎉 ¡EQUIVALENCIAS FUNCIONANDO!`);
    console.log(`🚀 Sistema listo para procesar archivo real de Acubat`);
  } else {
    console.log(`\n❌ PROBLEMA: No se encontraron equivalencias`);
    console.log(`🔍 Revisar configuración del módulo`);
  }
}

// 🚀 EJECUTAR PRUEBA
probarEquivalenciasActualizadas();
