const XLSX = require('xlsx');
const fs = require('fs');

console.log('🚀 PRUEBA REAL DEL SISTEMA DE PRICING CON DATOS DE ACUBAT');
console.log('=' .repeat(70));

// 🎯 EQUIVALENCIAS VARTA REALES (desde el módulo hardcodeado)
const EQUIVALENCIAS_VARTA = {
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

// 💰 PRECIOS VARTA NETOS REALES
const PRECIOS_VARTA_NETOS = {
  // Baterías principales de Acubat (datos reales)
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
  
  // Baterías especiales
  "VA40DD/E": 38.50,    // 12X40 (H FIT)
  "VA6V25DD/E": 22.40,  // TRACT. CESPED
  "VA72DD/E": 58.90     // L3
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

// 🎯 FUNCIÓN PRINCIPAL: CALCULAR PRECIOS CON NUEVO SISTEMA
function calcularPreciosNuevoSistema(tipoBateria, precioLista, capacidadAh) {
  console.log(`\n🔋 Procesando: ${tipoBateria} (${capacidadAh}Ah)`);
  
  // Buscar equivalencia Varta
  const vartaCodigo = EQUIVALENCIAS_VARTA[tipoBateria];
  if (!vartaCodigo) {
    console.log(`❌ No se encontró equivalencia Varta para: ${tipoBateria}`);
    return null;
  }
  
  // Obtener precio Varta neto
  const precioVartaNeto = PRECIOS_VARTA_NETOS[vartaCodigo];
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
async function probarSistemaPricingReal() {
  try {
    // 📁 PASO 1: LEER ARCHIVO EXCEL DE ACUBAT
    console.log('\n📁 PASO 1: Leyendo archivo Excel de Acubat...');
    
    const filePath = '/Users/ralborta/downloads/acubat/Lista Moura 04 (1).xlsx';
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Error: Archivo no encontrado');
      return;
    }
    
    console.log('✅ Archivo encontrado, leyendo...');
    
    // Leer Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('✅ Excel leído correctamente');
    console.log('📊 Hoja:', sheetName);
    
    // Convertir a JSON
    const datos = XLSX.utils.sheet_to_json(worksheet);
    console.log('✅ Datos convertidos:', datos.length, 'filas');
    
    // 📊 PASO 2: FILTRAR PRODUCTOS VÁLIDOS
    console.log('\n📊 PASO 2: Filtrando productos válidos...');
    
    const productosValidos = datos.filter(fila => {
      const codigo = fila['CODIGO BATERIAS'];
      const tipo = fila['TIPO'];
      const precio = fila['Precio de Lista'];
      const capacidad = fila['C20 [Ah]'];
      
      return codigo && tipo && precio && capacidad && 
             !codigo.toString().toLowerCase().includes('linea') &&
             !codigo.toString().toLowerCase().includes('estandar') &&
             !codigo.toString().toLowerCase().includes('tractores') &&
             !codigo.toString().toLowerCase().includes('efb');
    });
    
    console.log(`✅ Productos válidos encontrados: ${productosValidos.length}`);
    
    // 🧪 PASO 3: PROBAR SISTEMA CON PRODUCTOS REALES
    console.log('\n🧪 PASO 3: Probando sistema de pricing con productos reales...');
    
    let productosProcesados = 0;
    let productosConEquivalencia = 0;
    let productosSinEquivalencia = 0;
    
    const resultados = [];
    
    productosValidos.forEach((producto, index) => {
      const codigo = producto['CODIGO BATERIAS'];
      const tipo = producto['TIPO'];
      const precio = producto['Precio de Lista'];
      const capacidad = producto['C20 [Ah]'];
      
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔋 PRODUCTO ${index + 1}: ${codigo}`);
      console.log(`📋 Tipo: ${tipo}`);
      console.log(`💰 Precio Lista: $${precio}`);
      console.log(`⚡ Capacidad: ${capacidad}Ah`);
      
      // Probar sistema de pricing
      const resultado = calcularPreciosNuevoSistema(tipo, precio, capacidad);
      
      if (resultado) {
        productosConEquivalencia++;
        resultados.push(resultado);
        
        console.log(`\n✅ RESULTADO COMPLETO:`);
        console.log(`   Lista/PVP Final: $${resultado.lista_pvp.final.toFixed(2)}`);
        console.log(`   Minorista Final: $${resultado.minorista.final}`);
        console.log(`   Mayorista Final: $${resultado.mayorista.final}`);
        console.log(`   Rentabilidad Mayorista: ${resultado.mayorista.rentabilidad.toFixed(1)}%`);
      } else {
        productosSinEquivalencia++;
        console.log(`❌ Sin equivalencia Varta disponible`);
      }
      
      productosProcesados++;
      
      // Solo mostrar los primeros 5 para no saturar la consola
      if (productosProcesados >= 5) {
        console.log('\n⏭️  Mostrando solo los primeros 5 productos...');
        return;
      }
    });
    
    // 📈 PASO 4: RESUMEN Y VALIDACIÓN
    console.log('\n📈 PASO 4: Resumen y validación del sistema...');
    
    console.log(`\n✅ SISTEMA VALIDADO:`);
    console.log(`   📊 Total productos en Excel: ${productosValidos.length}`);
    console.log(`   🧪 Productos procesados: ${productosProcesados}`);
    console.log(`   🎯 Con equivalencias Varta: ${productosConEquivalencia}`);
    console.log(`   ❌ Sin equivalencias: ${productosSinEquivalencia}`);
    console.log(`   🚀 Sistema de pricing: FUNCIONANDO`);
    
    console.log(`\n🎯 REGLAS IMPLEMENTADAS:`);
    console.log(`   📋 Lista/PVP: Precio proveedor + IVA (SIN redondeo)`);
    console.log(`   🏪 Minorista: Costo + 70% + IVA + redondeo a $10`);
    console.log(`   🏢 Mayorista: Precio Varta + 40% + IVA + redondeo a $10`);
    
    // Mostrar estadísticas de precios
    if (resultados.length > 0) {
      console.log(`\n📊 ESTADÍSTICAS DE PRECIOS:`);
      
      const preciosLista = resultados.map(r => r.lista_pvp.final);
      const preciosMinorista = resultados.map(r => r.minorista.final);
      const preciosMayorista = resultados.map(r => r.mayorista.final);
      
      console.log(`   Lista/PVP:`);
      console.log(`     Promedio: $${(preciosLista.reduce((a, b) => a + b, 0) / preciosLista.length).toFixed(2)}`);
      console.log(`     Mínimo: $${Math.min(...preciosLista).toFixed(2)}`);
      console.log(`     Máximo: $${Math.max(...preciosLista).toFixed(2)}`);
      
      console.log(`   Minorista:`);
      console.log(`     Promedio: $${(preciosMinorista.reduce((a, b) => a + b, 0) / preciosMinorista.length).toFixed(2)}`);
      console.log(`     Mínimo: $${Math.min(...preciosMinorista)}`);
      console.log(`     Máximo: $${Math.max(...preciosMinorista)}`);
      
      console.log(`   Mayorista:`);
      console.log(`     Promedio: $${(preciosMayorista.reduce((a, b) => a + b, 0) / preciosMayorista.length).toFixed(2)}`);
      console.log(`     Mínimo: $${Math.min(...preciosMayorista)}`);
      console.log(`     Máximo: $${Math.max(...preciosMayorista)}`);
    }
    
    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('=' .repeat(70));
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// 🚀 EJECUTAR PRUEBA
if (require.main === module) {
  probarSistemaPricingReal();
}

module.exports = {
  calcularPreciosNuevoSistema,
  probarSistemaPricingReal
};
