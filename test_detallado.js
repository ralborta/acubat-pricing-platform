const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔍 ANÁLISIS DETALLADO DEL ARCHIVO DE ACUBAT');
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
  
  // Mostrar estructura completa
  if (datos.length > 0) {
    console.log('\n📋 COLUMNAS DETECTADAS:');
    const columnas = Object.keys(datos[0]);
    columnas.forEach((col, i) => {
      console.log(`   ${i+1}. ${col}`);
    });
    
    console.log('\n📝 ANÁLISIS DE LAS PRIMERAS 5 FILAS:');
    datos.slice(0, 5).forEach((fila, index) => {
      console.log(`\n--- FILA ${index + 1} ---`);
      Object.entries(fila).forEach(([col, valor]) => {
        console.log(`   ${col}: ${valor}`);
      });
    });
    
    // Buscar filas que parezcan productos (no encabezados)
    console.log('\n🔍 BUSCANDO FILAS DE PRODUCTOS:');
    let filasProductos = 0;
    let filasEncabezados = 0;
    
    datos.forEach((fila, index) => {
      const codigo = fila['CODIGO BATERIAS'];
      if (codigo && typeof codigo === 'string') {
        if (codigo.toLowerCase().includes('linea') || codigo.toLowerCase().includes('estandar')) {
          filasEncabezados++;
        } else {
          filasProductos++;
          if (filasProductos <= 3) {
            console.log(`   Producto ${filasProductos}: ${codigo}`);
          }
        }
      }
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total filas: ${datos.length}`);
    console.log(`   Filas encabezados: ${filasEncabezados}`);
    console.log(`   Filas productos: ${filasProductos}`);
    
    // Mostrar algunas filas de productos
    if (filasProductos > 0) {
      console.log('\n📦 EJEMPLOS DE PRODUCTOS:');
      datos.forEach((fila, index) => {
        const codigo = fila['CODIGO BATERIAS'];
        if (codigo && typeof codigo === 'string' && 
            !codigo.toLowerCase().includes('linea') && 
            !codigo.toLowerCase().includes('estandar')) {
          console.log(`   ${index + 1}. ${codigo}`);
        }
      });
    }
  }
  
  console.log('\n🎉 Análisis completado exitosamente!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
