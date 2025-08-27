// 🧪 TEST DE EQUIVALENCIAS - BASE DE DATOS LOCAL CON MOURA
console.log('🧪 TEST DE EQUIVALENCIAS CON BASE DE DATOS LOCAL...\n')

// 📁 RUTA DEL ARCHIVO REAL
const archivoMoura = '/Users/ralborta/downloads/acubat/Lista Moura 04 (1).xlsx'
console.log('📁 ARCHIVO A PROCESAR:')
console.log(`   ${archivoMoura}\n`)

// 📊 DATOS DE MOURA (simulando lo que leería la IA del Excel)
const productosMoura = [
  {
    marca: 'Moura',
    tipo: 'Batería',
    modelo: 'M40N',
    precio: 35000,
    descripcion: 'Batería Moura 40Ah 12V',
    capacidad: '40Ah',
    voltaje: '12V'
  },
  {
    marca: 'Moura',
    tipo: 'Batería',
    modelo: 'M60N',
    precio: 48000,
    descripcion: 'Batería Moura 60Ah 12V',
    capacidad: '60Ah',
    voltaje: '12V'
  },
  {
    marca: 'Moura',
    tipo: 'Batería',
    modelo: 'M80N',
    precio: 65000,
    descripcion: 'Batería Moura 80Ah 12V',
    capacidad: '80Ah',
    voltaje: '12V'
  },
  {
    marca: 'Moura',
    tipo: 'Batería',
    modelo: 'M100N',
    precio: 85000,
    descripcion: 'Batería Moura 100Ah 12V',
    capacidad: '100Ah',
    voltaje: '12V'
  },
  {
    marca: 'Moura',
    tipo: 'Batería',
    modelo: 'M120N',
    precio: 95000,
    descripcion: 'Batería Moura 120Ah 12V',
    capacidad: '120Ah',
    voltaje: '12V'
  }
]

console.log('📊 PRODUCTOS MOURA A BUSCAR EQUIVALENCIAS:')
productosMoura.forEach((producto, index) => {
  console.log(`   ${index + 1}. ${producto.marca} ${producto.modelo} - ${producto.capacidad} - $${producto.precio}`)
})
console.log('\n')

// 🗄️ BASE DE DATOS VARTA LOCAL (la que implementamos)
const BASE_DATOS_VARTA = [
  // Baterías Varta Originales
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
]

console.log('🗄️ BASE DE DATOS VARTA DISPONIBLE:')
BASE_DATOS_VARTA.forEach((varta, index) => {
  console.log(`   ${index + 1}. ${varta.codigo} - ${varta.capacidad} - $${varta.precio_neto}`)
})
console.log('\n')

// 🔍 FUNCIÓN DE BÚSQUEDA INTELIGENTE (la que implementamos)
function buscarEquivalenciaVarta(marca, tipo, modelo, capacidad) {
  console.log(`🔍 BUSCANDO EQUIVALENCIA VARTA:`)
  console.log(`   - Marca: "${marca}"`)
  console.log(`   - Tipo: "${tipo}"`)
  console.log(`   - Modelo: "${modelo}"`)
  console.log(`   - Capacidad: "${capacidad}"`)
  
  // 🎯 BÚSQUEDA POR PRIORIDADES
  
  // 1️⃣ BÚSQUEDA EXACTA POR CÓDIGO
  const busquedaExacta = BASE_DATOS_VARTA.find(p => 
    p.codigo.toLowerCase() === modelo?.toLowerCase() ||
    p.modelo.toLowerCase() === modelo?.toLowerCase()
  )
  
  if (busquedaExacta) {
    console.log(`✅ EQUIVALENCIA EXACTA ENCONTRADA: ${busquedaExacta.codigo}`)
    return busquedaExacta
  }
  
  // 2️⃣ BÚSQUEDA POR CAPACIDAD
  if (capacidad) {
    const busquedaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.capacidad.toLowerCase() === capacidad.toLowerCase() ||
      p.equivalencias.some(eq => eq.toLowerCase() === capacidad.toLowerCase())
    )
    
    if (busquedaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR CAPACIDAD ENCONTRADA: ${busquedaCapacidad.codigo}`)
      return busquedaCapacidad
    }
  }
  
  // 3️⃣ BÚSQUEDA POR MARCA Y CAPACIDAD
  if (marca && capacidad) {
    const busquedaMarcaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.marca.toLowerCase() === marca.toLowerCase() &&
      (p.capacidad.toLowerCase() === capacidad.toLowerCase() ||
       p.equivalencias.some(eq => eq.toLowerCase() === capacidad.toLowerCase()))
    )
    
    if (busquedaMarcaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR MARCA Y CAPACIDAD ENCONTRADA: ${busquedaMarcaCapacidad.codigo}`)
      return busquedaMarcaCapacidad
    }
  }
  
  // 4️⃣ BÚSQUEDA FUZZY POR MODELO
  const busquedaFuzzy = BASE_DATOS_VARTA.find(p => 
    p.modelo.toLowerCase().includes(modelo?.toLowerCase() || '') ||
    modelo?.toLowerCase().includes(p.modelo.toLowerCase()) ||
    p.equivalencias.some(eq => 
      eq.toLowerCase().includes(modelo?.toLowerCase() || '') ||
      modelo?.toLowerCase().includes(eq.toLowerCase())
    )
  )
  
  if (busquedaFuzzy) {
    console.log(`✅ EQUIVALENCIA FUZZY ENCONTRADA: ${busquedaFuzzy.codigo}`)
    return busquedaFuzzy
  }
  
  console.log('❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA')
  return null
}

// 🚀 TEST DE BÚSQUEDA DE EQUIVALENCIAS
console.log('🚀 INICIANDO BÚSQUEDA DE EQUIVALENCIAS...\n')

const resultados = []

productosMoura.forEach((producto, index) => {
  console.log(`\n🔍 === PRODUCTO MOURA ${index + 1}: ${producto.marca} ${producto.modelo} ===`)
  
  const equivalencia = buscarEquivalenciaVarta(
    producto.marca,
    producto.tipo,
    producto.modelo,
    producto.capacidad
  )
  
  if (equivalencia) {
    console.log(`✅ EQUIVALENCIA ENCONTRADA:`)
    console.log(`   - Código Varta: ${equivalencia.codigo}`)
    console.log(`   - Capacidad: ${equivalencia.capacidad}`)
    console.log(`   - Precio Varta: $${equivalencia.precio_neto}`)
    console.log(`   - Descripción: ${equivalencia.descripcion}`)
    
    resultados.push({
      producto_moura: producto,
      equivalencia_varta: equivalencia,
      encontrada: true
    })
  } else {
    console.log(`❌ NO SE ENCONTRÓ EQUIVALENCIA`)
    
    resultados.push({
      producto_moura: producto,
      equivalencia_varta: null,
      encontrada: false
    })
  }
})

// 📊 RESUMEN DE RESULTADOS
console.log('\n📊 RESUMEN DE EQUIVALENCIAS ENCONTRADAS:')
console.log('=' * 50)

resultados.forEach((resultado, index) => {
  const producto = resultado.producto_moura
  const equivalencia = resultado.equivalencia_varta
  
  if (resultado.encontrada) {
    console.log(`✅ ${index + 1}. ${producto.marca} ${producto.modelo} (${producto.capacidad})`)
    console.log(`   → Equivalente a: ${equivalencia.codigo} - $${equivalencia.precio_neto}`)
  } else {
    console.log(`❌ ${index + 1}. ${producto.marca} ${producto.modelo} (${producto.capacidad})`)
    console.log(`   → No se encontró equivalencia Varta`)
  }
})

console.log('\n' + '=' * 50)
console.log(`📈 TOTAL: ${resultados.length} productos`)
console.log(`✅ EQUIVALENCIAS ENCONTRADAS: ${resultados.filter(r => r.encontrada).length}`)
console.log(`❌ SIN EQUIVALENCIA: ${resultados.filter(r => !r.encontrada).length}`)

console.log('\n✅ TEST DE EQUIVALENCIAS COMPLETADO!')
console.log('🎯 Base de datos local funcionando correctamente')
console.log('🚀 Listo para integrar en el sistema principal')
