// 🧪 TEST CON NUEVO ARCHIVO: Lista 242 (1).xls
// Probando el sistema corregido con archivo real

const XLSX = require('xlsx');
const fs = require('fs');

console.log('🚀 TEST CON NUEVO ARCHIVO: Lista 242 (1).xls');
console.log('=' .repeat(60));

// 📁 RUTA DEL ARCHIVO
const archivoPath = '/Users/ralborta/downloads/acubat/Lista 242 (1).xls';

// 🧮 FUNCIÓN DE RENTABILIDAD CORREGIDA
function calcularRentabilidad(precioNeto, costo) {
  // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
  return ((precioNeto - costo) / precioNeto) * 100;
}

// 🎯 MARKUPS CORREGIDOS
const MARKUPS_CANAL = {
  LISTA_PVP: 0.00,      // Sin markup, solo IVA
  MINORISTA: 1.00,      // +100% sobre costo (CORREGIDO)
  MAYORISTA: 0.50       // +50% sobre precio Varta (CORREGIDO)
};

// 🚀 FUNCIÓN PRINCIPAL
async function probarNuevoArchivo() {
  try {
    console.log('📁 Leyendo archivo Excel...');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(archivoPath)) {
      throw new Error(`Archivo no encontrado: ${archivoPath}`);
    }
    
    // Leer archivo Excel
    const workbook = XLSX.readFile(archivoPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const datos = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Archivo leído correctamente`);
    console.log(`📊 Hoja: ${sheetName}`);
    console.log(`📈 Total filas: ${datos.length}`);
    
    // Mostrar estructura
    if (datos.length > 0) {
      console.log('\n🔍 ESTRUCTURA DEL ARCHIVO:');
      console.log('Columnas detectadas:', Object.keys(datos[0]));
      
      console.log('\n📋 PRIMERAS 3 FILAS:');
      datos.slice(0, 3).forEach((fila, index) => {
        console.log(`\n   Fila ${index + 1}:`);
        Object.entries(fila).forEach(([columna, valor]) => {
          console.log(`      ${columna}: ${valor}`);
        });
      });
    }
    
    // 🧮 APLICAR SISTEMA CORREGIDO
    console.log('\n🧮 APLICANDO SISTEMA CORREGIDO...');
    console.log('=' .repeat(60));
    
                // Procesar TODAS las filas de datos reales (desde fila 3)
      const filasDatos = datos.slice(2); // Todas las filas desde índice 2
      
      console.log(`\n📊 PROCESANDO ${filasDatos.length} PRODUCTOS...`);
      console.log('=' .repeat(60));
      
      let productosProcesados = 0;
      let equivalenciasEncontradas = 0;
      
      filasDatos.forEach((fila, index) => {
      const filaReal = index + 3; // Número de fila real en Excel
      
      // Extraer datos según estructura real del archivo
      const tipo = fila.__EMPTY || 'N/A';           // Nombre de la batería
      const denominacion = fila.__EMPTY_2 || 'N/A'; // Tipo técnico (12 x 45)
      const capacidad = fila.__EMPTY_6 || 0;        // Capacidad en Ah
      const precio = parseFloat(fila.__EMPTY_14) || 0;          // Precio
      
              // Solo procesar si hay datos válidos
        if (tipo !== 'N/A' && precio > 0) {
          productosProcesados++;
          
          console.log(`\n🔋 PRODUCTO ${productosProcesados} - FILA ${filaReal}:`);
          console.log(`   Tipo: ${tipo}`);
          console.log(`   Denominación: ${denominacion}`);
          console.log(`   Precio: $${precio.toLocaleString()} ARS`);
          console.log(`   Capacidad: ${capacidad}Ah`);
        
        // Simular costo (60% del precio)
        const costoEstimado = precio * 0.6;
      
      // Buscar equivalencia en listas de precios con búsqueda flexible
      const buscarEquivalencia = (modelo, tipo) => {
        // 🗃️ BASE DE DATOS MULTI-LISTA - TODOS LOS PRECIOS EN PESOS ARGENTINOS
        const equivalencias = [
          // 📋 LISTA VARTA (precios en pesos argentinos)
          { nombre: 'UB 450 Ag', codigo: 'UB450', tipo: '12 x 45', precio: 45000, fuente: 'Lista Varta', moneda: 'ARS' },
          { nombre: 'UB 500 Ag', codigo: 'UB500', tipo: '12 x 50', precio: 52000, fuente: 'Lista Varta', moneda: 'ARS' },
          { nombre: 'UB 600 Ag', codigo: 'UB600', tipo: '12 x 60', precio: 58000, fuente: 'Lista Varta', moneda: 'ARS' },
          
          // 📋 LISTA MOURA (precios en pesos argentinos)
          { nombre: 'M40FD', codigo: 'M40FD', tipo: '12 x 40', precio: 42000, fuente: 'Lista Moura', moneda: 'ARS' },
          { nombre: 'M22ED', codigo: 'M22ED', tipo: '12 x 22', precio: 28000, fuente: 'Lista Moura', moneda: 'ARS' },
          
          // 📋 LISTA 242 (precios en pesos argentinos)
          { nombre: 'UB 450 Ag', codigo: 'UB450', tipo: '12 x 45', precio: 156534, fuente: 'Lista 242', moneda: 'ARS' },
          { nombre: 'UB 550 Ag', codigo: 'UB550', tipo: '12 x 50', precio: 175738, fuente: 'Lista 242', moneda: 'ARS' },
          { nombre: 'UB 670 Ag', codigo: 'UB670', tipo: '12 x 55', precio: 188992, fuente: 'Lista 242', moneda: 'ARS' }
        ];
        
        // 1️⃣ BÚSQUEDA POR NOMBRE COMPLETO (exacto) - PRIORIDAD MÁXIMA
        let equivalencia = equivalencias.find(eq => eq.nombre === modelo);
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Nombre completo', prioridad: 1 };
        }
        
        // 2️⃣ BÚSQUEDA POR CÓDIGO (parcial) - PRIORIDAD ALTA
        equivalencia = equivalencias.find(eq => modelo.includes(eq.codigo) || eq.codigo.includes(modelo));
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Código', prioridad: 2 };
        }
        
        // 3️⃣ BÚSQUEDA POR TIPO (exacto) - PRIORIDAD MEDIA
        equivalencia = equivalencias.find(eq => eq.tipo === tipo);
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Tipo exacto', prioridad: 3 };
        }
        
        // 4️⃣ BÚSQUEDA POR TIPO PARCIAL - PRIORIDAD BAJA
        equivalencia = equivalencias.find(eq => tipo.includes(eq.tipo) || eq.tipo.includes(tipo));
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Tipo parcial', prioridad: 4 };
        }
        
        return null; // No encuentra equivalencia
      };
      
      const equivalencia = buscarEquivalencia(tipo, denominacion);
      const tieneEquivalencia = equivalencia !== null;
      
      console.log('\n🧮 CÁLCULOS CORREGIDOS:');
      
      // 1️⃣ LISTA/PVP: Precio de la columna + IVA (sin redondeo)
      const listaNeto = precio;
      const listaFinal = listaNeto * 1.21;
      const listaRentabilidad = calcularRentabilidad(listaNeto, costoEstimado);
      
      console.log('\n📋 LISTA/PVP:');
      console.log(`   Precio Base: $${listaNeto.toLocaleString()} ARS`);
      console.log(`   Precio Final: $${listaFinal.toLocaleString()} ARS (con IVA)`);
      console.log(`   Rentabilidad: ${listaRentabilidad.toFixed(1)}%`);
      
      // 2️⃣ MINORISTA (+100%): Precio de la columna + 100% + IVA + redondeo
      const minoristaNeto = precio * (1 + MARKUPS_CANAL.MINORISTA);
      const minoristaFinal = Math.round((minoristaNeto * 1.21) / 10) * 10;
      const minoristaRentabilidad = calcularRentabilidad(minoristaNeto, costoEstimado);
      
      console.log('\n🏪 MINORISTA (+100%):');
      console.log(`   Precio Base: $${minoristaNeto.toLocaleString()} ARS`);
      console.log(`   Precio Final: $${minoristaFinal.toLocaleString()} ARS (con IVA + redondeo)`);
      console.log(`   Rentabilidad: ${minoristaRentabilidad.toFixed(1)}%`);
      
      // 3️⃣ MAYORISTA (+50%): 
      if (tieneEquivalencia) {
        // SI encuentra equivalencia: usar precio de la lista + 50% + IVA + redondeo
        const precioEquivalencia = equivalencia.precio;
        const mayoristaNeto = precioEquivalencia * (1 + MARKUPS_CANAL.MAYORISTA);
        const mayoristaFinal = Math.round((mayoristaNeto * 1.21) / 10) * 10;
        const mayoristaRentabilidad = calcularRentabilidad(mayoristaNeto, precioEquivalencia);
        
        console.log('\n🏢 MAYORISTA (+50% desde equivalencia):');
        console.log(`   Fuente: ${equivalencia.fuente}`);
        console.log(`   Método de búsqueda: ${equivalencia.metodo} (Prioridad: ${equivalencia.prioridad})`);
        console.log(`   Precio Base: $${precioEquivalencia.toLocaleString()} ARS (Pesos Argentinos)`);
        console.log(`   Precio Final: $${mayoristaFinal.toLocaleString()} ARS`);
        console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);
      } else {
        // SI NO encuentra equivalencia: usar precio de la columna + 50% + IVA + redondeo
        const mayoristaNeto = precio * (1 + MARKUPS_CANAL.MAYORISTA);
        const mayoristaFinal = Math.round((mayoristaNeto * 1.21) / 10) * 10;
        const mayoristaRentabilidad = calcularRentabilidad(mayoristaNeto, precio);
        
        console.log('\n🏢 MAYORISTA (+50% desde precio columna):');
        console.log(`   Precio Final: $${mayoristaFinal.toLocaleString()} ARS`);
        console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);
      }
      
      console.log('\n' + '─'.repeat(60));
    } // Cerrar if de validación
  }); // Cerrar forEach
    
    console.log('\n🎉 ¡ARCHIVO PROCESADO EXITOSAMENTE!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Error procesando archivo:', error.message);
  }
}

// 🚀 EJECUTAR PRUEBA
probarNuevoArchivo();
