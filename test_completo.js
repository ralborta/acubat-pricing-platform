console.log('🧪 TEST COMPLETO: DETECCIÓN + VARTA + PRECIOS');
console.log('=' .repeat(60));

// Simular la base de datos Varta
const BASE_DATOS_VARTA = [
  {
    codigo: 'VA45GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA45GD',
    capacidad: '45Ah',
    voltaje: '12V',
    precio_neto: 42000,
    descripcion: 'Batería Varta 45Ah 12V',
    equivalencias: ['45Ah', '45 Ah', '45A', 'VA45', 'UB 450 Ag']
  },
  {
    codigo: 'VA55GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA55GD',
    capacidad: '55Ah',
    voltaje: '12V',
    precio_neto: 48000,
    descripcion: 'Batería Varta 55Ah 12V',
    equivalencias: ['55Ah', '55 Ah', '55A', 'VA55', 'UB 550 Ag']
  }
];

// Función de búsqueda Varta
function buscarEquivalenciaVarta(marca, tipo, modelo, capacidad) {
  console.log('🔍 BÚSQUEDA DE EQUIVALENCIA VARTA:');
  console.log(`   - Marca: "${marca}"`);
  console.log(`   - Tipo: "${tipo}"`);
  console.log(`   - Modelo: "${modelo}"`);
  console.log(`   - Capacidad: "${capacidad}"`);
  
  if (!modelo || typeof modelo !== 'string') {
    console.log(`❌ Modelo no válido: "${modelo}"`);
    return null;
  }
  
  // Búsqueda por capacidad
  if (capacidad) {
    const busquedaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.capacidad.toLowerCase() === capacidad.toLowerCase() ||
      p.equivalencias.some(eq => eq.toLowerCase() === capacidad.toLowerCase())
    );
    
    if (busquedaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR CAPACIDAD ENCONTRADA: ${busquedaCapacidad.codigo}`);
      return busquedaCapacidad;
    }
  }
  
  // Búsqueda por patrón de capacidad en el modelo
  if (modelo) {
    const capacidadMatch = modelo.match(/(\d+)/);
    if (capacidadMatch) {
      const capacidadExtraida = capacidadMatch[1] + 'Ah';
      console.log(`   - Capacidad extraída del modelo: "${capacidadExtraida}"`);
      
      const busquedaPatron = BASE_DATOS_VARTA.find(p => 
        p.capacidad.toLowerCase().includes(capacidadMatch[1]) ||
        p.equivalencias.some(eq => eq.toLowerCase().includes(capacidadMatch[1]))
      );
      
      if (busquedaPatron) {
        console.log(`✅ EQUIVALENCIA POR PATRÓN ENCONTRADA: ${busquedaPatron.codigo}`);
        return busquedaPatron;
      }
    }
  }
  
  console.log('❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA');
  return null;
}

// Simular el procesamiento completo
function procesarProducto(producto, columnMapping, index) {
  console.log(`\n🔍 === PRODUCTO ${index + 1} ===`);
  
  // Extraer datos usando mapeo
  const tipo = columnMapping.tipo ? producto[columnMapping.tipo] : 'BATERIA';
  const modelo = columnMapping.modelo ? producto[columnMapping.modelo] : 'N/A';
  const precio = columnMapping.precio ? producto[columnMapping.precio] : 0;
  
  console.log(`✅ Datos extraídos:`);
  console.log(`   - Tipo: "${tipo}" (columna: ${columnMapping.tipo})`);
  console.log(`   - Modelo: "${modelo}" (columna: ${columnMapping.modelo})`);
  console.log(`   - Precio: "${precio}" (columna: ${columnMapping.precio})`);
  
  // Buscar equivalencia Varta
  if (modelo && modelo !== 'N/A' && modelo !== '') {
    console.log(`\n🔍 BUSCANDO EQUIVALENCIA VARTA:`);
    
    // Extraer capacidad del modelo (ej: "UB 450 Ag" -> "45Ah")
    const capacidadMatch = modelo.match(/(\d+)/);
    let capacidad = null;
    if (capacidadMatch) {
      capacidad = capacidadMatch[1] + 'Ah';
      console.log(`   - Capacidad extraída: "${capacidad}"`);
    }
    
    const equivalenciaVarta = buscarEquivalenciaVarta('Varta', tipo, modelo, capacidad);
    
    if (equivalenciaVarta) {
      console.log(`✅ EQUIVALENCIA VARTA ENCONTRADA:`);
      console.log(`   - Código: ${equivalenciaVarta.codigo}`);
      console.log(`   - Precio Neto: ${equivalenciaVarta.precio_neto}`);
      console.log(`   - Descripción: ${equivalenciaVarta.descripcion}`);
      
      // Cálculo de precios
      const precioBase = parseFloat(precio) || 0;
      const mayoristaBase = equivalenciaVarta.precio_neto;
      
      console.log(`\n💰 CÁLCULO DE PRECIOS:`);
      console.log(`   - Precio Base Minorista: ${precioBase} (del archivo)`);
      console.log(`   - Precio Base Mayorista: ${mayoristaBase} (de Varta)`);
      
      if (precioBase > 0 && mayoristaBase > 0) {
        const minoristaFinal = Math.round((precioBase * 1.70 * 1.21) / 10) * 10;
        const mayoristaFinal = Math.round((mayoristaBase * 1.30 * 1.21) / 10) * 10;
        
        console.log(`   - Minorista Final: ${minoristaFinal}`);
        console.log(`   - Mayorista Final: ${mayoristaFinal}`);
        console.log(`   - Diferencia: ${minoristaFinal - mayoristaFinal}`);
        
        if (mayoristaFinal < minoristaFinal) {
          console.log(`✅ VALIDACIÓN: Mayorista < Minorista ✓`);
          return { success: true, minorista: minoristaFinal, mayorista: mayoristaFinal };
        } else {
          console.log(`❌ PROBLEMA: Mayorista >= Minorista`);
          return { success: false, error: 'Mayorista >= Minorista' };
        }
      }
    } else {
      console.log(`❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA para: ${modelo}`);
      return { success: false, error: 'No se encontró equivalencia Varta' };
    }
  } else {
    console.log(`⚠️ Modelo no válido para búsqueda Varta: "${modelo}"`);
    return { success: false, error: 'Modelo no válido' };
  }
}

// Test completo
console.log('📋 SIMULANDO PROCESAMIENTO COMPLETO...');

// Datos del archivo real
const columnMapping = {
  tipo: '__EMPTY_1',
  modelo: '__EMPTY',
  precio: '__EMPTY_14'
};

const productos = [
  {
    '__EMPTY': 'UB 450 Ag',
    '__EMPTY_1': 'D/A/1/2/4',
    '__EMPTY_14': '156534.5791885957'
  },
  {
    '__EMPTY': 'UB 550 Ag',
    '__EMPTY_1': 'D/A/1/2/4',
    '__EMPTY_14': '175738.02172051094'
  }
];

console.log('📋 Mapeo de columnas:', columnMapping);

// Procesar productos
productos.forEach((producto, index) => {
  const resultado = procesarProducto(producto, columnMapping, index);
  console.log(`\n🎯 RESULTADO PRODUCTO ${index + 1}:`, resultado);
});

console.log('\n🎉 ¡¡¡TEST COMPLETO FINALIZADO!!! 🎉');
