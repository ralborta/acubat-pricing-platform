// 🗄️ BASE DE DATOS VARTA LOCAL - BÚSQUEDA INTELIGENTE
export interface ProductoVarta {
  codigo: string
  marca: string
  tipo: string
  modelo: string
  capacidad: string
  voltaje: string
  precio_neto: number
  descripcion: string
  equivalencias: string[] // Otros códigos equivalentes
}

export const BASE_DATOS_VARTA: ProductoVarta[] = [
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
  },
  
  // Baterías adicionales para cubrir capacidades del archivo real
  {
    codigo: 'VA45GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA45GD',
    capacidad: '45Ah',
    voltaje: '12V',
    precio_neto: 42000,
    descripcion: 'Batería Varta 45Ah 12V',
    equivalencias: ['45Ah', '45 Ah', '45A', 'VA45', 'UB 450 Ag']
  },
  {
    codigo: 'VA55GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA55GD',
    capacidad: '55Ah',
    voltaje: '12V',
    precio_neto: 48000,
    descripcion: 'Batería Varta 55Ah 12V',
    equivalencias: ['55Ah', '55 Ah', '55A', 'VA55', 'UB 550 Ag']
  },
  
  // Baterías Bosch (equivalentes)
  {
    codigo: 'BOSCH_S4_60Ah',
    marca: 'Bosch',
    tipo: 'Bateria',
    modelo: 'S4 60Ah',
    capacidad: '60Ah',
    voltaje: '12V',
    precio_neto: 52000,
    descripcion: 'Batería Bosch S4 60Ah 12V',
    equivalencias: ['60Ah', '60 Ah', '60A', 'S4', 'S4 60Ah', 'S4 60 Ah', 'VA60HD/E']
  },
  {
    codigo: 'BOSCH_S5_100Ah',
    marca: 'Bosch',
    tipo: 'Bateria',
    modelo: 'S5 100Ah',
    capacidad: '100Ah',
    voltaje: '12V',
    precio_neto: 85000,
    descripcion: 'Batería Bosch S5 100Ah 12V',
    equivalencias: ['100Ah', '100 Ah', '100A', 'S5', 'S5 100Ah', 'S5 100 Ah', 'VA100DD/E']
  }
]

// 🔍 FUNCIÓN DE BÚSQUEDA INTELIGENTE
export function buscarEquivalenciaVarta(
  marca: string, 
  tipo: string, 
  modelo: string, 
  capacidad?: string
): ProductoVarta | null {
  
  console.log('🔍 BÚSQUEDA DE EQUIVALENCIA VARTA:')
  console.log(`   - Marca: "${marca}" (tipo: ${typeof marca})`)
  console.log(`   - Tipo: "${tipo}" (tipo: ${typeof tipo})`)
  console.log(`   - Modelo: "${modelo}" (tipo: ${typeof modelo})`)
  console.log(`   - Capacidad: "${capacidad}" (tipo: ${typeof capacidad})`)
  
  // 🎯 VALIDACIÓN DE PARÁMETROS
  if (!modelo || typeof modelo !== 'string') {
    console.log(`❌ Modelo no válido: "${modelo}" (tipo: ${typeof modelo})`)
    return null
  }
  
  // 🎯 BÚSQUEDA POR PRIORIDADES
  
  // 1️⃣ BÚSQUEDA EXACTA POR CÓDIGO
  const busquedaExacta = BASE_DATOS_VARTA.find(p => 
    (modelo && p.codigo.toLowerCase() === modelo.toLowerCase()) ||
    (modelo && p.modelo.toLowerCase() === modelo.toLowerCase())
  )
  
  if (busquedaExacta) {
    console.log(`✅ EQUIVALENCIA EXACTA ENCONTRADA: ${busquedaExacta.codigo}`)
    return busquedaExacta
  }
  
  // 2️⃣ BÚSQUEDA POR CAPACIDAD
  if (capacidad) {
    const capacidadStr = String(capacidad)
    const busquedaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.capacidad.toLowerCase() === capacidadStr.toLowerCase() ||
      p.equivalencias.some(eq => eq.toLowerCase() === capacidadStr.toLowerCase())
    )
    
    if (busquedaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR CAPACIDAD ENCONTRADA: ${busquedaCapacidad.codigo}`)
      return busquedaCapacidad
    }
  }
  
  // 3️⃣ BÚSQUEDA POR MARCA Y CAPACIDAD
  if (marca && capacidad) {
    const capacidadStr = String(capacidad)
    const busquedaMarcaCapacidad = BASE_DATOS_VARTA.find(p => 
      p.marca.toLowerCase() === marca.toLowerCase() &&
      (p.capacidad.toLowerCase() === capacidadStr.toLowerCase() ||
       p.equivalencias.some(eq => eq.toLowerCase() === capacidadStr.toLowerCase()))
    )
    
    if (busquedaMarcaCapacidad) {
      console.log(`✅ EQUIVALENCIA POR MARCA Y CAPACIDAD ENCONTRADA: ${busquedaMarcaCapacidad.codigo}`)
      return busquedaMarcaCapacidad
    }
  }
  
  // 4️⃣ BÚSQUEDA FUZZY POR MODELO
  const busquedaFuzzy = BASE_DATOS_VARTA.find(p => 
    (modelo && p.modelo.toLowerCase().includes(modelo.toLowerCase())) ||
    (modelo && modelo.toLowerCase().includes(p.modelo.toLowerCase())) ||
    p.equivalencias.some(eq => 
      (modelo && eq.toLowerCase().includes(modelo.toLowerCase())) ||
      (modelo && modelo.toLowerCase().includes(eq.toLowerCase()))
    )
  )
  
  // 5️⃣ BÚSQUEDA POR PATRONES COMUNES (más flexible)
  if (!busquedaFuzzy && modelo) {
    const modeloStr = String(modelo).toLowerCase()
    
    // Buscar por patrones como "UB 450" -> "45Ah"
    const patronCapacidad = modeloStr.match(/(\d+)/)
    if (patronCapacidad) {
      const capacidadNum = patronCapacidad[1]
      const busquedaPatron = BASE_DATOS_VARTA.find(p => 
        p.capacidad.toLowerCase().includes(capacidadNum) ||
        p.equivalencias.some(eq => eq.toLowerCase().includes(capacidadNum))
      )
      if (busquedaPatron) {
        console.log(`✅ EQUIVALENCIA POR PATRÓN ENCONTRADA: ${busquedaPatron.codigo}`)
        return busquedaPatron
      }
    }
  }
  
  if (busquedaFuzzy) {
    console.log(`✅ EQUIVALENCIA FUZZY ENCONTRADA: ${busquedaFuzzy.codigo}`)
    return busquedaFuzzy
  }
  
  console.log('❌ NO SE ENCONTRÓ EQUIVALENCIA VARTA')
  return null
}

// 📊 ESTADÍSTICAS DE LA BASE DE DATOS
export function obtenerEstadisticasVarta() {
  return {
    total_productos: BASE_DATOS_VARTA.length,
    marcas: Array.from(new Set(BASE_DATOS_VARTA.map(p => p.marca))),
    capacidades: Array.from(new Set(BASE_DATOS_VARTA.map(p => p.capacidad))),
    rango_precios: {
      min: Math.min(...BASE_DATOS_VARTA.map(p => p.precio_neto)),
      max: Math.max(...BASE_DATOS_VARTA.map(p => p.precio_neto)),
      promedio: BASE_DATOS_VARTA.reduce((sum, p) => sum + p.precio_neto, 0) / BASE_DATOS_VARTA.length
    }
  }
}
