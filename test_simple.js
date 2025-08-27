const XLSX = require('xlsx');
const fs = require('fs');

console.log('🚀 INICIANDO PRUEBA REAL DEL SISTEMA DE PRICING ACUBAT');
console.log('=' .repeat(60));

try {
  // Leer archivo Excel de Acubat
  const filePath = '/Users/ralborta/downloads/acubat/Lista Moura 04 (1).xlsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Error: Archivo no encontrado');
    process.exit(1);
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
  
  // Mostrar estructura
  if (datos.length > 0) {
    console.log('\n📋 Columnas detectadas:');
    Object.keys(datos[0]).forEach((col, i) => {
      console.log('   ' + (i+1) + '. ' + col);
    });
    
    console.log('\n📝 Primera fila de datos:');
    Object.entries(datos[0]).slice(0, 5).forEach(([col, valor]) => {
      console.log('   ' + col + ': ' + valor);
    });
  }
  
  console.log('\n🎉 Archivo procesado exitosamente!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
