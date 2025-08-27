// 🧠 TEST DIRECTO DEL MÓDULO PRICING_MAPPER.TS
// Este script testea el módulo directamente para verificar que funciona

import { mapColumnsStrict } from './app/lib/pricing_mapper.js';

// 📋 DATOS DE PRUEBA REALES (simulando el archivo CSV)
const columnas = [
  "TIPO", 
  "Denominacion Comercial", 
  "__EMPTY_2", 
  "Unidades por Pallet", 
  "Kg por Pallet"
];

const hojas = ["ListaVarta", "Equivalencias"];

const muestra = [
  { 
    "TIPO": "Ca Ag Blindada", 
    "Denominacion Comercial": "UB 670 Ag", 
    "__EMPTY_2": 188992, 
    "Unidades por Pallet": 24 
  },
  { 
    "TIPO": "J.I.S. Baterías", 
    "Denominacion Comercial": "VA40DD/E", 
    "__EMPTY_2": 156535, 
    "Unidades por Pallet": 20 
  }
];

// 🚀 FUNCIÓN PRINCIPAL DE TEST
async function testPricingMapper() {
  try {
    console.log('🧠 ========================================');
    console.log('🧠 INICIANDO TEST DEL MÓDULO PRICING_MAPPER');
    console.log('🧠 ========================================');
    
    console.log('\n📋 DATOS DE ENTRADA:');
    console.log('   - Columnas:', columnas);
    console.log('   - Hojas:', hojas);
    console.log('   - Muestra:', JSON.stringify(muestra, null, 2));
    
    console.log('\n🚀 LLAMANDO A MAPCOLUMNSSTRICT...');
    
    // 🎯 LLAMADA AL MÓDULO
    const { result, attempts } = await mapColumnsStrict({ 
      columnas, 
      hojas, 
      muestra, 
      maxRetries: 1 
    });
    
    console.log('\n✅ RESULTADO EXITOSO:');
    console.log('🔄 Intentos realizados:', attempts);
    console.log('📋 Resultado completo:', JSON.stringify(result, null, 2));
    
    // 🔍 ANÁLISIS DEL RESULTADO
    console.log('\n🔍 ANÁLISIS DEL RESULTADO:');
    console.log('   - Tipo detectado:', result.tipo || 'NO DETECTADO');
    console.log('   - Modelo detectado:', result.modelo || 'NO DETECTADO');
    console.log('   - Precio detectado:', result.precio_ars || 'NO DETECTADO');
    console.log('   - Descripción detectada:', result.descripcion || 'NO DETECTADA');
    console.log('   - Evidencia:', result.evidencia || 'NO DISPONIBLE');
    console.log('   - Confianza:', result.confianza || 'NO DISPONIBLE');
    
    // ✅ VALIDACIÓN FINAL
    console.log('\n✅ VALIDACIÓN FINAL:');
    if (result.tipo && result.modelo && result.precio_ars) {
      console.log('🎯 TODAS LAS COLUMNAS PRINCIPALES DETECTADAS');
    } else {
      console.log('⚠️ FALTAN COLUMNAS PRINCIPALES');
    }
    
    console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE!');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error('   - Mensaje:', error.message);
    console.error('   - Tipo:', error.constructor.name);
    console.error('   - Stack:', error.stack);
    
    // 🔍 ANÁLISIS DEL ERROR
    if (error.message.includes('openai')) {
      console.error('\n💡 SUGERENCIA: Verificar que OPENAI_API_KEY esté configurado');
    }
    if (error.message.includes('fetch')) {
      console.error('\n💡 SUGERENCIA: Verificar conexión a internet');
    }
    if (error.message.includes('module')) {
      console.error('\n💡 SUGERENCIA: Verificar que el módulo existe y está bien importado');
    }
  }
}

// 🚀 EJECUTAR EL TEST
console.log('🚀 Iniciando test en 3 segundos...');
setTimeout(() => {
  testPricingMapper();
}, 3000);
