const XLSX = require('xlsx');

console.log('🧪 TEST DIRECTO DE LA IA - VERIFICAR SI FUNCIONA');
console.log('=' .repeat(60));

// Simular exactamente lo que hace el backend
const headers = ['__EMPTY', '__EMPTY_1', '__EMPTY_2', '__EMPTY_3', '__EMPTY_4', '__EMPTY_6', '__EMPTY_7', '__EMPTY_8', '__EMPTY_11', '__EMPTY_12', '__EMPTY_13', '__EMPTY_14'];

// Simular datos de muestra (como los que ve la IA)
const muestra = [
  {
    '__EMPTY': 'UB 450 Ag',
    '__EMPTY_1': 'D/A/1/2/4',
    '__EMPTY_2': '12 x 45',
    '__EMPTY_3': '440',
    '__EMPTY_4': '330',
    '__EMPTY_6': '38',
    '__EMPTY_7': '60',
    '__EMPTY_8': '207',
    '__EMPTY_11': '1073',
    '__EMPTY_12': '100',
    '__EMPTY_13': '25',
    '__EMPTY_14': '156534.5791885957'
  },
  {
    '__EMPTY': 'UB 550 Ag',
    '__EMPTY_1': 'D/A/1/2/4',
    '__EMPTY_2': '12 x 50',
    '__EMPTY_3': '550',
    '__EMPTY_4': '425',
    '__EMPTY_6': '48',
    '__EMPTY_7': '65',
    '__EMPTY_8': '207',
    '__EMPTY_11': '1290',
    '__EMPTY_12': '100',
    '__EMPTY_13': '25',
    '__EMPTY_14': '175738.02172051094'
  }
];

console.log('📋 HEADERS DETECTADOS:');
console.log(headers);

console.log('\n📊 MUESTRA DE DATOS:');
console.log(JSON.stringify(muestra, null, 2));

console.log('\n🔍 ANÁLISIS MANUAL:');
console.log('   - Modelo: __EMPTY (UB 450 Ag, UB 550 Ag)');
console.log('   - Precio: __EMPTY_14 (156,534.58, 175,738.02)');
console.log('   - Capacidad: __EMPTY_7 (60Ah, 65Ah)');
console.log('   - Tipo: __EMPTY_1 (D/A/1/2/4)');

console.log('\n🎯 LO QUE LA IA DEBERÍA DETECTAR:');
console.log('   - tipo: __EMPTY_1');
console.log('   - modelo: __EMPTY');
console.log('   - precio_ars: __EMPTY_14');
console.log('   - descripcion: __EMPTY_2');

console.log('\n❌ PROBLEMA IDENTIFICADO:');
console.log('   - La IA está fallando y usando detección manual');
console.log('   - Pero la detección manual no está configurada para esta estructura');
console.log('   - Por eso no encuentra las equivalencias Varta');

console.log('\n🛠️ SOLUCIÓN:');
console.log('   1. Verificar que la IA funcione correctamente');
console.log('   2. Si no funciona, mejorar la detección manual');
console.log('   3. Asegurar que se mapeen las columnas correctas');
