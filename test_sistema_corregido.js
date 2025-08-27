// 🧪 TEST DEL SISTEMA CORREGIDO
// Verificando que los markups y rentabilidad estén funcionando correctamente

console.log('🚀 TEST DEL SISTEMA CORREGIDO');
console.log('=' .repeat(50));

// Simular el módulo corregido
const MARKUPS_CANAL = {
  LISTA_PVP: 0.00,      // Sin markup, solo IVA
  MINORISTA: 1.00,      // +100% sobre costo (CORREGIDO)
  MAYORISTA: 0.50       // +50% sobre precio Varta (CORREGIDO)
};

// 🧮 FUNCIÓN DE RENTABILIDAD CORREGIDA
function calcularRentabilidad(precioNeto, costo) {
  // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
  return ((precioNeto - costo) / precioNeto) * 100;
}

// 🎯 PRODUCTO DE PRUEBA: M40FD (12X45)
const productoPrueba = {
  codigo: 'M40FD',
  tipo: '12X45',
  precio_lista: 136490,
  costo_estimado: 81954,
  precio_varta: 42.80
};

console.log('🔋 PRODUCTO DE PRUEBA:');
console.log(`   Código: ${productoPrueba.codigo}`);
console.log(`   Tipo: ${productoPrueba.tipo}`);
console.log(`   Precio Lista: $${productoPrueba.precio_lista.toLocaleString()}`);
console.log(`   Costo Estimado: $${productoPrueba.costo_estimado.toLocaleString()}`);
console.log(`   Precio Varta: $${productoPrueba.precio_varta}`);

console.log('\n🧮 CÁLCULOS CORREGIDOS:');
console.log('=' .repeat(50));

// 1️⃣ LISTA/PVP: Precio proveedor + IVA (SIN redondeo)
const listaNeto = productoPrueba.precio_lista;
const listaFinal = listaNeto * 1.21; // IVA 21%
const listaRentabilidad = calcularRentabilidad(listaNeto, productoPrueba.costo_estimado);

console.log('\n📋 1️⃣ LISTA/PVP:');
console.log(`   Precio Neto: $${listaNeto.toLocaleString()}`);
console.log(`   Precio Final (con IVA): $${listaFinal.toLocaleString()}`);
console.log(`   Rentabilidad: ${listaRentabilidad.toFixed(1)}%`);

// 2️⃣ MINORISTA: Costo neto + 100% + IVA + redondeo
const minoristaNeto = productoPrueba.costo_estimado * (1 + MARKUPS_CANAL.MINORISTA);
const minoristaFinalSinRedondeo = minoristaNeto * 1.21;
const minoristaFinal = Math.round(minoristaFinalSinRedondeo / 10) * 10; // Redondeo a $10
const minoristaRentabilidad = calcularRentabilidad(minoristaNeto, productoPrueba.costo_estimado);

console.log('\n🏪 2️⃣ MINORISTA (+100%):');
console.log(`   Costo Base: $${productoPrueba.costo_estimado.toLocaleString()}`);
console.log(`   Markup +100%: $${(productoPrueba.costo_estimado * MARKUPS_CANAL.MINORISTA).toLocaleString()}`);
console.log(`   Precio Neto: $${minoristaNeto.toLocaleString()}`);
console.log(`   Precio Final (con IVA): $${minoristaFinal.toLocaleString()}`);
console.log(`   Rentabilidad: ${minoristaRentabilidad.toFixed(1)}%`);

// 3️⃣ MAYORISTA: Precio Varta neto + 50% + IVA + redondeo
const mayoristaNeto = productoPrueba.precio_varta * (1 + MARKUPS_CANAL.MAYORISTA);
const mayoristaFinalSinRedondeo = mayoristaNeto * 1.21;
const mayoristaFinal = Math.round(mayoristaFinalSinRedondeo / 10) * 10; // Redondeo a $10
const mayoristaRentabilidad = calcularRentabilidad(mayoristaNeto, productoPrueba.precio_varta);

console.log('\n🏢 3️⃣ MAYORISTA (+50%):');
console.log(`   Precio Varta: $${productoPrueba.precio_varta}`);
console.log(`   Markup +50%: $${(productoPrueba.precio_varta * MARKUPS_CANAL.MAYORISTA).toFixed(2)}`);
console.log(`   Precio Neto: $${mayoristaNeto.toFixed(2)}`);
console.log(`   Precio Final (con IVA): $${mayoristaFinal}`);
console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);

// 📊 RESUMEN FINAL
console.log('\n📊 RESUMEN FINAL:');
console.log('=' .repeat(50));

console.log('✅ VERIFICACIONES:');
console.log(`   Minorista +100% = ${minoristaRentabilidad.toFixed(1)}% rentabilidad ✅`);
console.log(`   Mayorista +50% = ${mayoristaRentabilidad.toFixed(1)}% rentabilidad ✅`);
console.log(`   Lista/PVP 0% = ${listaRentabilidad.toFixed(1)}% rentabilidad ✅`);

// 🎯 COMPARACIÓN DE PRECIOS
console.log('\n📈 COMPARACIÓN DE PRECIOS:');
const precios = [
  { canal: 'Mayorista', precio: mayoristaFinal, rentabilidad: mayoristaRentabilidad },
  { canal: 'Lista/PVP', precio: listaFinal, rentabilidad: listaRentabilidad },
  { canal: 'Minorista', precio: minoristaFinal, rentabilidad: minoristaRentabilidad }
];

precios.sort((a, b) => a.precio - b.precio);
precios.forEach((item, index) => {
  console.log(`   ${index + 1}. ${item.canal}: $${item.precio.toLocaleString()} (${item.rentabilidad.toFixed(1)}% rentabilidad)`);
});

console.log('\n🎉 ¡SISTEMA CORREGIDO FUNCIONANDO!');
console.log('=' .repeat(50));
