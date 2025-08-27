// 🧮 DEMO: CÁLCULO DE PRECIOS PASO A PASO
// Mostrando cómo se calculan los precios en el sistema real

console.log('🚀 DEMO: CÁLCULO DE PRICING PASO A PASO');
console.log('=' .repeat(60));

// 🎯 PRODUCTO DE EJEMPLO: M40FD (12X45)
const productoEjemplo = {
  codigo: 'M40FD',
  tipo: '12X45',
  precio_lista: 136490,  // Precio sugerido del proveedor
  c20_ah: 40,            // Capacidad en Ah
  costo_estimado: 81954   // 60% del precio lista (estimación)
};

console.log('🔋 PRODUCTO DE EJEMPLO:');
console.log(`   Código: ${productoEjemplo.codigo}`);
console.log(`   Tipo: ${productoEjemplo.tipo}`);
console.log(`   Precio Lista: $${productoEjemplo.precio_lista.toLocaleString()}`);
console.log(`   Capacidad: ${productoEjemplo.c20_ah}Ah`);
console.log(`   Costo Estimado: $${productoEjemplo.costo_estimado.toLocaleString()}`);

// 🎯 EQUIVALENCIA VARTA
const equivalenciaVarta = {
  tipo: '12X45',
  varta_codigo: 'VA45BD',
  precio_varta_neto: 42.80
};

console.log('\n🎯 EQUIVALENCIA VARTA:');
console.log(`   Tipo: ${equivalenciaVarta.tipo}`);
console.log(`   Código Varta: ${equivalenciaVarta.varta_codigo}`);
console.log(`   Precio Varta Neto: $${equivalenciaVarta.precio_varta_neto}`);

// 🧮 CONFIGURACIÓN DEL SISTEMA
const configuracion = {
  iva: 0.21,           // 21%
  markup_minorista: 0.70,  // 70%
  markup_mayorista: 0.40,  // 40%
  redondeo: 10          // Múltiplos de $10
};

console.log('\n⚙️ CONFIGURACIÓN DEL SISTEMA:');
console.log(`   IVA: ${(configuracion.iva * 100)}%`);
console.log(`   Markup Minorista: ${(configuracion.markup_minorista * 100)}%`);
console.log(`   Markup Mayorista: ${(configuracion.markup_mayorista * 100)}%`);
console.log(`   Redondeo: Múltiplos de $${configuracion.redondeo}`);

// 🚀 CÁLCULO PASO A PASO

console.log('\n🚀 CÁLCULO PASO A PASO:');
console.log('=' .repeat(60));

// 1️⃣ LISTA/PVP: Precio proveedor + IVA (SIN redondeo)
console.log('\n📋 1️⃣ LISTA/PVP:');
console.log('   Fórmula: Precio Lista + IVA (SIN redondeo)');
console.log(`   Precio Lista: $${productoEjemplo.precio_lista.toLocaleString()}`);
console.log(`   IVA (${(configuracion.iva * 100)}%): $${(productoEjemplo.precio_lista * configuracion.iva).toLocaleString()}`);
console.log(`   Precio Final: $${(productoEjemplo.precio_lista * (1 + configuracion.iva)).toLocaleString()}`);
console.log(`   Rentabilidad: ${(((productoEjemplo.precio_lista - productoEjemplo.costo_estimado) / productoEjemplo.costo_estimado) * 100).toFixed(1)}%`);

const precioListaFinal = productoEjemplo.precio_lista * (1 + configuracion.iva);
const rentabilidadLista = ((productoEjemplo.precio_lista - productoEjemplo.costo_estimado) / productoEjemplo.costo_estimado) * 100;

// 2️⃣ MINORISTA: Costo neto + 70% + IVA + redondeo
console.log('\n🏪 2️⃣ MINORISTA:');
console.log('   Fórmula: Costo + 70% + IVA + redondeo a $10');
console.log(`   Costo Base: $${productoEjemplo.costo_estimado.toLocaleString()}`);
console.log(`   Markup +70%: $${(productoEjemplo.costo_estimado * configuracion.markup_minorista).toLocaleString()}`);
console.log(`   Precio Neto: $${(productoEjemplo.costo_estimado * (1 + configuracion.markup_minorista)).toLocaleString()}`);
console.log(`   IVA (${(configuracion.iva * 100)}%): $${(productoEjemplo.costo_estimado * (1 + configuracion.markup_minorista) * configuracion.iva).toLocaleString()}`);
console.log(`   Precio con IVA: $${(productoEjemplo.costo_estimado * (1 + configuracion.markup_minorista) * (1 + configuracion.iva)).toLocaleString()}`);

const precioMinoristaSinRedondeo = productoEjemplo.costo_estimado * (1 + configuracion.markup_minorista) * (1 + configuracion.iva);
const precioMinoristaFinal = Math.round(precioMinoristaSinRedondeo / configuracion.redondeo) * configuracion.redondeo;
const rentabilidadMinorista = ((productoEjemplo.costo_estimado * (1 + configuracion.markup_minorista) - productoEjemplo.costo_estimado) / productoEjemplo.costo_estimado) * 100;

console.log(`   Redondeo a $${configuracion.redondeo}: $${precioMinoristaFinal.toLocaleString()}`);
console.log(`   Rentabilidad: ${rentabilidadMinorista.toFixed(1)}%`);

// 3️⃣ MAYORISTA: Precio Varta neto + 40% + IVA + redondeo
console.log('\n🏢 3️⃣ MAYORISTA:');
console.log('   Fórmula: Precio Varta + 40% + IVA + redondeo a $10');
console.log(`   Precio Varta Neto: $${equivalenciaVarta.precio_varta_neto}`);
console.log(`   Markup +40%: $${(equivalenciaVarta.precio_varta_neto * configuracion.markup_mayorista).toFixed(2)}`);
console.log(`   Precio Neto: $${(equivalenciaVarta.precio_varta_neto * (1 + configuracion.markup_mayorista)).toFixed(2)}`);
console.log(`   IVA (${(configuracion.iva * 100)}%): $${(equivalenciaVarta.precio_varta_neto * (1 + configuracion.markup_mayorista) * configuracion.iva).toFixed(2)}`);
console.log(`   Precio con IVA: $${(equivalenciaVarta.precio_varta_neto * (1 + configuracion.markup_mayorista) * (1 + configuracion.iva)).toFixed(2)}`);

const precioMayoristaSinRedondeo = equivalenciaVarta.precio_varta_neto * (1 + configuracion.markup_mayorista) * (1 + configuracion.iva);
const precioMayoristaFinal = Math.round(precioMayoristaSinRedondeo / configuracion.redondeo) * configuracion.redondeo;
const rentabilidadMayorista = ((equivalenciaVarta.precio_varta_neto * (1 + configuracion.markup_mayorista) - equivalenciaVarta.precio_varta_neto) / equivalenciaVarta.precio_varta_neto) * 100;

console.log(`   Redondeo a $${configuracion.redondeo}: $${precioMayoristaFinal}`);
console.log(`   Rentabilidad: ${rentabilidadMayorista.toFixed(1)}%`);

// 📊 RESUMEN FINAL
console.log('\n📊 RESUMEN FINAL:');
console.log('=' .repeat(60));
console.log(`🔋 Producto: ${productoEjemplo.codigo} (${productoEjemplo.tipo})`);
console.log(`💰 Precio Lista: $${productoEjemplo.precio_lista.toLocaleString()}`);
console.log(`⚡ Capacidad: ${productoEjemplo.c20_ah}Ah`);
console.log('');

console.log('📋 LISTA/PVP:');
console.log(`   Precio Final: $${precioListaFinal.toLocaleString()}`);
console.log(`   Rentabilidad: ${rentabilidadLista.toFixed(1)}%`);
console.log(`   Característica: SIN redondeo`);

console.log('\n🏪 MINORISTA:');
console.log(`   Precio Final: $${precioMinoristaFinal.toLocaleString()}`);
console.log(`   Rentabilidad: ${rentabilidadMinorista.toFixed(1)}%`);
console.log(`   Característica: +70% + redondeo a $10`);

console.log('\n🏢 MAYORISTA:');
console.log(`   Precio Final: $${precioMayoristaFinal}`);
console.log(`   Rentabilidad: ${rentabilidadMayorista.toFixed(1)}%`);
console.log(`   Característica: Varta +40% + redondeo a $10`);

// 🎯 ANÁLISIS DE RENTABILIDAD
console.log('\n🎯 ANÁLISIS DE RENTABILIDAD:');
console.log('=' .repeat(60));

const margenMinimo = 10; // 10% mínimo

const analisisLista = rentabilidadLista >= margenMinimo ? '✅ RENTABLE' : '❌ NO RENTABLE';
const analisisMinorista = rentabilidadMinorista >= margenMinimo ? '✅ RENTABLE' : '❌ NO RENTABLE';
const analisisMayorista = rentabilidadMayorista >= margenMinimo ? '✅ RENTABLE' : '❌ NO RENTABLE';

console.log(`📋 Lista/PVP: ${rentabilidadLista.toFixed(1)}% ${analisisLista}`);
console.log(`🏪 Minorista: ${rentabilidadMinorista.toFixed(1)}% ${analisisMinorista}`);
console.log(`🏢 Mayorista: ${rentabilidadMayorista.toFixed(1)}% ${analisisMayorista}`);

// 📈 COMPARACIÓN DE PRECIOS
console.log('\n📈 COMPARACIÓN DE PRECIOS:');
console.log('=' .repeat(60));

const precios = [
  { canal: 'Lista/PVP', precio: precioListaFinal, rentabilidad: rentabilidadLista },
  { canal: 'Minorista', precio: precioMinoristaFinal, rentabilidad: rentabilidadMinorista },
  { canal: 'Mayorista', precio: precioMayoristaFinal, rentabilidad: rentabilidadMayorista }
];

// Ordenar por precio
precios.sort((a, b) => a.precio - b.precio);

console.log('Ordenados por precio (de menor a mayor):');
precios.forEach((item, index) => {
  console.log(`   ${index + 1}. ${item.canal}: $${item.precio.toLocaleString()} (${item.rentabilidad.toFixed(1)}% rentabilidad)`);
});

console.log('\n🎉 ¡DEMO COMPLETADA!');
console.log('=' .repeat(60));
