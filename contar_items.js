const XLSX = require('xlsx');
const path = require('path');

function contarItems() {
  try {
    // 📁 Ruta del archivo
    const archivoPath = '/Users/ralborta/downloads/acubat/Lista 242 (1).xls';
    
    console.log('🔍 CONTANDO ITEMS EN ARCHIVO EXCEL');
    console.log('=====================================');
    console.log(`📁 Archivo: ${path.basename(archivoPath)}`);
    
    // 📖 Leer archivo
    const workbook = XLSX.readFile(archivoPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Total filas en Excel: ${datos.length}`);
    
    // 🔍 Contar filas con datos válidos (desde fila 3)
    let itemsValidos = 0;
    let itemsConPrecio = 0;
    let itemsSinPrecio = 0;
    
    // Procesar desde fila 3 (índice 2)
    for (let i = 2; i < datos.length; i++) {
      const fila = datos[i];
      if (fila && fila.length > 0) {
        const tipo = fila[0]; // __EMPTY
        const precio = fila[14]; // __EMPTY_14
        
        if (tipo && tipo !== 'TIPO' && tipo !== '') {
          itemsValidos++;
          
          if (precio && !isNaN(parseFloat(precio)) && parseFloat(precio) > 0) {
            itemsConPrecio++;
          } else {
            itemsSinPrecio++;
          }
        }
      }
    }
    
    console.log('\n📈 RESUMEN DE ITEMS:');
    console.log(`   ✅ Items válidos: ${itemsValidos}`);
    console.log(`   💰 Con precio: ${itemsConPrecio}`);
    console.log(`   ❌ Sin precio: ${itemsSinPrecio}`);
    console.log(`   📋 Encabezados: ${datos.length - itemsValidos}`);
    
    // Mostrar algunos ejemplos
    console.log('\n🔍 EJEMPLOS DE ITEMS:');
    for (let i = 2; i < Math.min(7, datos.length); i++) {
      const fila = datos[i];
      if (fila && fila[0] && fila[0] !== 'TIPO') {
        const tipo = fila[0];
        const denominacion = fila[2] || 'N/A';
        const precio = fila[14] || 'N/A';
        console.log(`   ${i + 1}. ${tipo} - ${denominacion} - $${precio}`);
      }
    }
    
    if (itemsValidos > 7) {
      console.log(`   ... y ${itemsValidos - 5} items más`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// 🚀 EJECUTAR
contarItems();
