const XLSX = require('xlsx');
const path = require('path');

// 🧮 FUNCIONES DE CÁLCULO
const MARKUPS_CANAL = {
  MINORISTA: 0.70,  // +70% desde costo neto
  MAYORISTA: 0.40   // +40% desde precio Varta
};

const calcularRentabilidad = (precioNeto, costo) => {
  return ((precioNeto - costo) / precioNeto) * 100;
};

// 🧮 RENTABILIDAD CORREGIDA PARA MINORISTA
const calcularRentabilidadMinorista = (precioNeto, costo) => {
  return ((precioNeto - costo) / precioNeto) * 100;
};

// 🧮 RENTABILIDAD CORREGIDA PARA MAYORISTA
const calcularRentabilidadMayorista = (precioNeto, costo) => {
  return ((precioNeto - costo) / precioNeto) * 100;
};

function probarListaAbril() {
  try {
    // 📁 Ruta del archivo
    const archivoPath = '/Users/ralborta/downloads/acubat/LISTA DE PRECIOS ABRIL ONLINE & OFFLINE  (1).xlsx';
    
    console.log('🚀 TEST CON NUEVA LISTA: LISTA DE PRECIOS ABRIL ONLINE & OFFLINE');
    console.log('=' .repeat(80));
    console.log('📁 Leyendo archivo Excel...');
    
    // 📖 Leer archivo
    const workbook = XLSX.readFile(archivoPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('✅ Archivo leído correctamente');
    console.log(`📊 Hoja: ${workbook.SheetNames[0]}`);
    console.log(`📈 Total filas: ${datos.length}`);
    
    // 🔍 ANALIZAR ESTRUCTURA
    console.log('\n🔍 ESTRUCTURA DEL ARCHIVO:');
    if (datos.length > 0) {
      const columnas = Object.keys(datos[0]);
      console.log('Columnas detectadas:', columnas);
      
      // Mostrar primeras filas para entender estructura
      const filasAMostrar = Math.min(3, datos.length);
      console.log(`\n📋 PRIMERAS ${filasAMostrar} FILAS:\n`);
      
      for (let i = 0; i < filasAMostrar; i++) {
        const fila = datos[i];
        console.log(`   Fila ${i + 1}:`);
        Object.keys(fila).forEach(key => {
          if (fila[key] !== undefined && fila[key] !== '') {
            console.log(`      ${key}: ${fila[key]}`);
          }
        });
        console.log('');
      }
    }
    
    // 🧮 APLICAR SISTEMA CORREGIDO
    console.log('\n🧮 APLICANDO SISTEMA CORREGIDO...');
    console.log('=' .repeat(80));
    
    // Procesar TODAS las filas de datos
    console.log(`\n📊 PROCESANDO ${datos.length} PRODUCTOS...`);
    console.log('=' .repeat(80));
    
    let productosProcesados = 0;
    let equivalenciasEncontradas = 0;
    
    datos.forEach((fila, index) => {
      // Extraer datos según estructura de la Lista de Abril
      const marca = fila.__EMPTY || 'N/A';
      const rubro = fila.__EMPTY_1 || 'N/A';
      const subrubro = fila.__EMPTY_2 || 'N/A';
      const modelo = fila.__EMPTY_3 || 'N/A';
      const descripcion = fila.__EMPTY_4 || 'N/A';
      const precio = parseFloat(fila.__EMPTY_8 || 0); // PRECIO LISTA
      
            // Solo procesar si hay datos válidos y es un producto (no encabezado)
      if (marca !== 'N/A' && precio > 0 && marca !== 'MARCA' && marca !== 'RUBRO') {
        productosProcesados++;
        
        console.log(`\n🔋 PRODUCTO ${productosProcesados} - FILA ${index + 1}:`);
        console.log(`   Marca: ${marca}`);
        console.log(`   Rubro: ${rubro}`);
        console.log(`   Subrubro: ${subrubro}`);
        console.log(`   Modelo: ${modelo}`);
        console.log(`   Descripción: ${descripcion}`);
        console.log(`   Precio Lista: $${precio.toLocaleString()} ARS`);
        
        // Simular costo (60% del precio)
        const costoEstimado = precio * 0.6;
        
        // Buscar equivalencia en listas de precios con búsqueda flexible
        const buscarEquivalencia = (modelo, tipo) => {
          // 🗃️ BASE DE DATOS MULTI-LISTA - TODOS LOS PRECIOS EN PESOS ARGENTINOS
          const equivalencias = [
            // 📋 LISTA VARTA (precios en pesos argentinos)
            { nombre: 'UB 450 Ag', codigo: 'UB450', marca: 'VARTA', tipo: '12 x 45', modelo: 'UB450', precio: 45000, fuente: 'Lista Varta', moneda: 'ARS' },
            { nombre: 'UB 500 Ag', codigo: 'UB500', marca: 'VARTA', tipo: '12 x 50', modelo: 'UB500', precio: 52000, fuente: 'Lista Varta', moneda: 'ARS' },
            { nombre: 'UB 600 Ag', codigo: 'UB600', marca: 'VARTA', tipo: '12 x 60', modelo: 'UB600', precio: 58000, fuente: 'Lista Varta', moneda: 'ARS' },
            
            // 📋 LISTA MOURA (precios en pesos argentinos)
            { nombre: 'M40FD', codigo: 'M40FD', marca: 'MOURA', tipo: '12 x 40', modelo: 'M40FD', precio: 42000, fuente: 'Lista Moura', moneda: 'ARS' },
            { nombre: 'M22ED', codigo: 'M22ED', marca: 'MOURA', tipo: '12 x 22', modelo: 'M22ED', precio: 28000, fuente: 'Lista Moura', moneda: 'ARS' },
            
            // 📋 LISTA 242 (precios en pesos argentinos)
            { nombre: 'UB 450 Ag', codigo: 'UB450', marca: 'UB', tipo: '12 x 45', modelo: 'UB450', precio: 156534, fuente: 'Lista 242', moneda: 'ARS' },
            { nombre: 'UB 550 Ag', codigo: 'UB550', marca: 'UB', tipo: '12 x 50', modelo: 'UB550', precio: 175738, fuente: 'Lista 242', moneda: 'ARS' },
            { nombre: 'UB 670 Ag', codigo: 'UB670', marca: 'UB', tipo: '12 x 55', modelo: 'UB670', precio: 188992, fuente: 'Lista 242', moneda: 'ARS' }
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
          
                  // 3️⃣ BÚSQUEDA POR MARCA (exacto) - PRIORIDAD MEDIA
        equivalencia = equivalencias.find(eq => eq.marca === marca);
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Marca exacta', prioridad: 3 };
        }
        
        // 4️⃣ BÚSQUEDA POR MARCA PARCIAL - PRIORIDAD BAJA
        equivalencia = equivalencias.find(eq => marca.includes(eq.marca) || eq.marca.includes(marca));
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Marca parcial', prioridad: 4 };
        }
        
        // 5️⃣ BÚSQUEDA POR MODELO (exacto) - PRIORIDAD BAJA
        equivalencia = equivalencias.find(eq => eq.modelo === modelo);
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Modelo exacto', prioridad: 5 };
        }
        
        // 6️⃣ BÚSQUEDA POR MODELO PARCIAL - PRIORIDAD MÍNIMA
        equivalencia = equivalencias.find(eq => modelo.includes(eq.modelo) || eq.modelo.includes(modelo));
        if (equivalencia) {
          return { ...equivalencia, metodo: 'Modelo parcial', prioridad: 6 };
        }
          
          return null; // No encuentra equivalencia
        };
        
        const equivalencia = buscarEquivalencia(modelo, descripcion);
        const tieneEquivalencia = equivalencia !== null;
        
        if (tieneEquivalencia) {
          equivalenciasEncontradas++;
        }
        
        console.log('\n🧮 CÁLCULOS CORREGIDOS:');
        
        // 1️⃣ LISTA/PVP: Precio de la columna + IVA (sin redondeo)
        const listaNeto = precio;
        const listaFinal = listaNeto * 1.21;
        const listaRentabilidad = calcularRentabilidad(listaNeto, costoEstimado);
        
        console.log('\n📋 LISTA/PVP:');
        console.log(`   Precio Base: $${listaNeto.toLocaleString()} ARS`);
        console.log(`   Precio Final: $${listaFinal.toLocaleString()} ARS (con IVA)`);
        console.log(`   Rentabilidad: ${listaRentabilidad.toFixed(1)}%`);
        
        // 2️⃣ MINORISTA (+70%): Costo neto + 70% + IVA + redondeo
        const minoristaNeto = costoEstimado * (1 + MARKUPS_CANAL.MINORISTA);
        const minoristaFinal = Math.round((minoristaNeto * 1.21) / 10) * 10;
        const minoristaRentabilidad = calcularRentabilidadMinorista(minoristaNeto, costoEstimado);
        
        console.log('\n🏪 MINORISTA (+70% desde costo):');
        console.log(`   Costo Base: $${costoEstimado.toLocaleString()} ARS`);
        console.log(`   Precio Base: $${minoristaNeto.toLocaleString()} ARS (+70%)`);
        console.log(`   Precio Final: $${minoristaFinal.toLocaleString()} ARS (con IVA + redondeo)`);
        console.log(`   Rentabilidad: ${minoristaRentabilidad.toFixed(1)}%`);
        
        // 3️⃣ MAYORISTA (+40%): 
        if (tieneEquivalencia) {
          // SI encuentra equivalencia: usar precio Varta + 40% + IVA + redondeo
          const precioEquivalencia = equivalencia.precio;
          const mayoristaNeto = precioEquivalencia * (1 + MARKUPS_CANAL.MAYORISTA);
          const mayoristaFinal = Math.round((mayoristaNeto * 1.21) / 10) * 10;
          const mayoristaRentabilidad = calcularRentabilidadMayorista(mayoristaNeto, precioEquivalencia);
          
          console.log('\n🏢 MAYORISTA (+40% desde Varta):');
          console.log(`   Fuente: ${equivalencia.fuente}`);
          console.log(`   Método de búsqueda: ${equivalencia.metodo} (Prioridad: ${equivalencia.prioridad})`);
          console.log(`   Precio Varta: $${precioEquivalencia.toLocaleString()} ARS (Pesos Argentinos)`);
          console.log(`   Precio Base: $${mayoristaNeto.toLocaleString()} ARS (+40%)`);
          console.log(`   Precio Final: $${mayoristaFinal.toLocaleString()} ARS`);
          console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);
        } else {
          // SI NO encuentra equivalencia: usar precio de la columna + 40% + IVA + redondeo
          const mayoristaNeto = precio * (1 + MARKUPS_CANAL.MAYORISTA);
          const mayoristaFinal = Math.round((mayoristaNeto * 1.21) / 10) * 10;
          const mayoristaRentabilidad = calcularRentabilidadMayorista(mayoristaNeto, precio);
          
          console.log('\n🏢 MAYORISTA (+40% desde precio columna):');
          console.log(`   Precio Final: $${mayoristaFinal.toLocaleString()} ARS`);
          console.log(`   Rentabilidad: ${mayoristaRentabilidad.toFixed(1)}%`);
        }
        
        console.log('\n' + '─'.repeat(80));
      }
    });
    
    // 📊 RESUMEN FINAL
    console.log('\n📊 RESUMEN DEL PROCESAMIENTO:');
    console.log('=' .repeat(80));
    console.log(`✅ Total productos procesados: ${productosProcesados}`);
    console.log(`🔍 Equivalencias encontradas: ${equivalenciasEncontradas}`);
    console.log(`❌ Sin equivalencias: ${productosProcesados - equivalenciasEncontradas}`);
    
    console.log('\n🎉 ¡LISTA DE ABRIL PROCESADA EXITOSAMENTE!');
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('❌ Error procesando archivo:', error.message);
  }
}

// 🚀 EJECUTAR PRUEBA
probarListaAbril();
