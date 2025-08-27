const XLSX = require('xlsx');

console.log('🧪 TEST CON DATOS REALES - ARCHIVO: Lista 242 (1).xls');
console.log('=' .repeat(60));

// Simular la base de datos Varta (copiada del archivo real)
const BASE_DATOS_VARTA = [
  {
    codigo: 'VA40DD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA40DD/E',
    capacidad: '40Ah',
    voltaje: '12V',
    precio_neto: 38500,
    descripcion: 'Batería Varta 40Ah 12V',
    equivalencias: ['40Ah', '40 Ah', '40A']
  },
  {
    codigo: 'VA50GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA50GD',
    capacidad: '50Ah',
    voltaje: '12V',
    precio_neto: 45600,
    descripcion: 'Batería Varta 50Ah 12V',
    equivalencias: ['50Ah', '50 Ah', '50A', 'VA50']
  },
  {
    codigo: 'VA60HD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA60HD/E',
    capacidad: '60Ah',
    voltaje: '12V',
    precio_neto: 51500,
    descripcion: 'Batería Varta 60Ah 12V',
    equivalencias: ['60Ah', '60 Ah', '60A', 'VA60', 'S4 60Ah', 'S4 60 Ah']
  },
  {
    codigo: 'VA75LD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA75LD/E',
    capacidad: '70Ah',
    voltaje: '12V',
    precio_neto: 64580,
    descripcion: 'Batería Varta 70Ah 12V',
    equivalencias: ['70Ah', '70 Ah', '70A', 'VA75']
  },
  {
    codigo: 'VA80DD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA80DD/E',
    capacidad: '80Ah',
    voltaje: '12V',
    precio_neto: 62300,
    descripcion: 'Batería Varta 80Ah 12V',
    equivalencias: ['80Ah', '80 Ah', '80A', 'VA80']
  },
  {
    codigo: 'VA85DD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA85DD/E',
    capacidad: '85Ah',
    voltaje: '12V',
    precio_neto: 66800,
    descripcion: 'Batería Varta 85Ah 12V',
    equivalencias: ['85Ah', '85 Ah', '85A', 'VA85']
  },
  {
    codigo: 'VA95DD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA95DD/E',
    capacidad: '95Ah',
    voltaje: '12V',
    precio_neto: 76400,
    descripcion: 'Batería Varta 95Ah 12V',
    equivalencias: ['95Ah', '95 Ah', '95A', 'VA95']
  },
  {
    codigo: 'VA100DD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA100DD/E',
    capacidad: '100Ah',
    voltaje: '12V',
    precio_neto: 81600,
    descripcion: 'Batería Varta 100Ah 12V',
    equivalencias: ['100Ah', '100 Ah', '100A', 'VA100', 'S5 100Ah', 'S5 100 Ah']
  }
];

// Función de búsqueda Varta (copiada del archivo real)
function buscarEquivalenciaVarta(marca, tipo, modelo, capacidad) {
  console.log('🔍 BÚSQUEDA DE EQUIVALENCIA VARTA:');
  console.log(`   - Marca: "${marca}" (tipo: ${typeof marca})`);
  console.log(`   - Tipo: "${tipo}" (tipo: ${typeof tipo})`);
  console.log(`   - Modelo: "${modelo}" (tipo: ${typeof modelo})`);
  console.log(`   - Capacidad: "${capacidad}" (tipo: ${typeof capacidad})`);
  
  if (!modelo || typeof modelo !== 'string') {
    console.log(`❌ Modelo no válido: "${modelo}" (tipo: ${typeof modelo})`);
    return null;
  }
  
  // 1️⃣ BÚSQUEDA EXACTA POR CÓDIGO
  const busquedaExacta = BASE_DATOS_VARTA.find(p => 
    (modelo && p.codigo.toLowerCase() === modelo.toLowerCase()) ||
    (modelo && p.modelo.toLowerCase() === modelo.toLowerCase())
  );
  
  if (busquedaExacta) {
    console.log(`✅ EQUIVALENCIA EXACTA ENCONTRADA: ${busquedaExacta.codigo}`);
    return busquedaExacta;
  }
  
  // 2️⃣ BÚSQUEDA POR CAPACIDAD
  if (capacidad) {
    const capacidadStr = String(capacidad);
    const busquedaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.capacidad.toLowerCase() === capacidadStr.toLowerCase() ||
      p.equivalencias.some(eq => eq.toLowerCase() === capacidadStr.toLowerCase())
    );
    
    if (busquedaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR CAPACIDAD ENCONTRADA: ${busquedaCapacidad.codigo}`);
      return busquedaCapacidad;
    }
  }
  
  // 3️⃣ BÚSQUEDA FUZZY POR MODELO
  const busquedaFuzzy = BASE_DATOS_VARTA.find(p => 
    (modelo && p.modelo.toLowerCase().includes(modelo.toLowerCase())) ||
    (modelo && modelo.toLowerCase().includes(p.modelo.toLowerCase())) ||
    p.equivalencias.some(eq => 
      (modelo && eq.toLowerCase().includes(modelo.toLowerCase())) ||
      (modelo && modelo.toLowerCase().includes(eq.toLowerCase()))
    )
  );
  
  // 4️⃣ BÚSQUEDA POR PATRONES COMUNES
  if (!busquedaFuzzy && modelo) {
    const modeloStr = String(modelo).toLowerCase();
    const patronCapacidad = modeloStr.match(/(\d+)/);
    if (patronCapacidad) {
      const capacidadNum = patronCapacidad[1];
      const busquedaPatron = BASE_DATOS_VARTA.find(p => 
        p.capacidad.toLowerCase().includes(capacidadNum) ||
        p.equivalencias.some(eq => eq.toLowerCase().includes(capacidadNum))
      );
      if (busquedaPatron) {
        console.log(`✅ EQUIVALENCIA POR PATRÓN ENCONTRADA: ${busquedaPatron.codigo}`);
        return busquedaPatron;
      }
    }
  }
  
  if (busquedaFuzzy) {
    console.log(`✅ EQUIVALENCIA FUZZY ENCONTRADA: ${busquedaFuzzy.codigo}`);
    return busquedaFuzzy;
  }
  
  console.log('❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA');
  return null;
}

// Leer el archivo Excel
const filePath = '/Users/ralborta/downloads/acubat/Lista 242 (1).xls';
console.log(`📁 Leyendo archivo: ${filePath}`);

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log(`📊 Hoja encontrada: ${sheetName}`);
  
  // Convertir a JSON
  const datos = XLSX.utils.sheet_to_json(worksheet);
  console.log(`📋 Total de filas: ${datos.length}`);
  
  // Mostrar las primeras 5 filas para ver la estructura
  console.log('\n🔍 PRIMERAS 5 FILAS DEL ARCHIVO:');
  console.log('-'.repeat(60));
  
  datos.slice(0, 5).forEach((fila, index) => {
    console.log(`\n📝 FILA ${index + 1}:`);
    Object.entries(fila).forEach(([columna, valor]) => {
      console.log(`   ${columna}: "${valor}"`);
    });
  });
  
  // Simular el procesamiento del backend
  console.log('\n🔄 SIMULANDO PROCESAMIENTO DEL BACKEND:');
  console.log('=' .repeat(60));
  
  // Procesar las filas 3, 4, 5 (que tienen datos reales)
  const filasConDatos = [2, 3, 4]; // índices 0-based
  
  filasConDatos.forEach((indexFila, index) => {
    const producto = datos[indexFila];
    console.log(`\n🎯 PRODUCTO ${index + 1} (FILA ${indexFila + 1}):`);
    
    // Extraer datos básicos (simular detección de columnas)
    const columnas = Object.keys(producto);
    console.log(`   - Columnas disponibles: ${columnas.join(', ')}`);
    
    // Buscar columnas clave - CORREGIDO PARA LA ESTRUCTURA REAL
    let tipo = 'BATERIA';
    let modelo = null;
    let precio = null;
    
    // Buscar modelo en __EMPTY (primera columna)
    if (producto['__EMPTY'] && typeof producto['__EMPTY'] === 'string') {
      modelo = producto['__EMPTY'];
    }
    
    // Buscar precio en __EMPTY_14 (columna de precio)
    if (producto['__EMPTY_14'] && !isNaN(parseFloat(producto['__EMPTY_14']))) {
      precio = producto['__EMPTY_14'];
    }
    
    // Buscar capacidad en __EMPTY_7 (columna de Ah)
    let capacidad = null;
    if (producto['__EMPTY_7'] && !isNaN(parseFloat(producto['__EMPTY_7']))) {
      capacidad = producto['__EMPTY_7'] + 'Ah';
    }
    
    console.log(`   - Tipo detectado: "${tipo}"`);
    console.log(`   - Modelo detectado: "${modelo}"`);
    console.log(`   - Precio detectado: "${precio}"`);
    console.log(`   - Capacidad detectada: "${capacidad}"`);
    
    // Simular búsqueda Varta
    if (modelo && modelo !== 'N/A' && modelo !== '') {
      console.log(`\n🔍 BUSCANDO EQUIVALENCIA VARTA:`);
      console.log(`   - Marca: Varta`);
      console.log(`   - Tipo: ${tipo}`);
      console.log(`   - Modelo: ${modelo}`);
      console.log(`   - Capacidad: ${capacidad}`);
      
      try {
        // Intentar búsqueda directa
        console.log(`🔍 ESTRATEGIA 1: Búsqueda directa`);
        let equivalenciaVarta = buscarEquivalenciaVarta('Varta', tipo, modelo, undefined);
        
        // Si no se encuentra, intentar con modelo limpio
        if (!equivalenciaVarta && modelo) {
          console.log(`🔍 ESTRATEGIA 2: Búsqueda con modelo limpio`);
          const modeloLimpio = modelo.trim().replace(/\s+/g, ' ');
          if (modeloLimpio !== modelo) {
            console.log(`   - Modelo original: "${modelo}"`);
            console.log(`   - Modelo limpio: "${modeloLimpio}"`);
            equivalenciaVarta = buscarEquivalenciaVarta('Varta', tipo, modeloLimpio, undefined);
          }
        }
        
        // Si aún no se encuentra, intentar con capacidad detectada
        if (!equivalenciaVarta && capacidad) {
          console.log(`🔍 ESTRATEGIA 3: Búsqueda con capacidad detectada`);
          console.log(`   - Capacidad del archivo: "${capacidad}"`);
          equivalenciaVarta = buscarEquivalenciaVarta('Varta', tipo, modelo, capacidad);
        }
        
        // Si aún no se encuentra, intentar extraer capacidad del modelo
        if (!equivalenciaVarta && modelo) {
          console.log(`🔍 ESTRATEGIA 4: Extraer capacidad del modelo`);
          const capacidadMatch = modelo.match(/(\d+)/);
          if (capacidadMatch) {
            const capacidadExtraida = capacidadMatch[1] + 'Ah';
            console.log(`   - Capacidad extraída del modelo: "${capacidadExtraida}"`);
            equivalenciaVarta = buscarEquivalenciaVarta('Varta', tipo, modelo, capacidadExtraida);
          }
        }
        
        if (equivalenciaVarta) {
          console.log(`✅ EQUIVALENCIA VARTA ENCONTRADA:`);
          console.log(`   - Código: ${equivalenciaVarta.codigo}`);
          console.log(`   - Precio Neto: ${equivalenciaVarta.precio_neto}`);
          console.log(`   - Descripción: ${equivalenciaVarta.descripcion}`);
          
          // Simular cálculo de precios
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
            } else {
              console.log(`❌ PROBLEMA: Mayorista >= Minorista`);
            }
          }
        } else {
          console.log(`❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA para: ${modelo}`);
        }
      } catch (error) {
        console.log(`❌ ERROR en búsqueda Varta: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Modelo no válido para búsqueda Varta: "${modelo}"`);
    }
    
    console.log('-'.repeat(40));
  });
  
} catch (error) {
  console.error('❌ ERROR leyendo archivo:', error.message);
}
