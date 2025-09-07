// BASE DE DATOS VARTA CORREGIDA - Basada en tabla de equivalencias real
const BASE_DATOS_VARTA = [
  {
    codigo: 'VDA60PLYE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VDA60PLYE',
    capacidad: '60Ah',
    voltaje: '12V',
    precio_neto: 116917.65,
    descripcion: 'Batería Varta 60Ah 12V',
    equivalencias: ['60Ah', '60 Ah', '60A', 'VA60']
  },
  {
    codigo: 'VDA65PLYE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VDA65PLYE',
    capacidad: '65Ah',
    voltaje: '12V',
    precio_neto: 0.00, // Sin precio en tabla
    descripcion: 'Batería Varta 65Ah 12V',
    equivalencias: ['65Ah', '65 Ah', '65A', 'VA65']
  },
  {
    codigo: 'VDA70PLYE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VDA70PLYE',
    capacidad: '70Ah',
    voltaje: '12V',
    precio_neto: 0.00, // Sin precio en tabla
    descripcion: 'Batería Varta 70Ah 12V',
    equivalencias: ['70Ah', '70 Ah', '70A', 'VA70']
  },
  {
    codigo: 'VDA75PD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VDA75PD',
    capacidad: '75Ah',
    voltaje: '12V',
    precio_neto: 114897.69,
    descripcion: 'Batería Varta 75Ah 12V',
    equivalencias: ['75Ah', '75 Ah', '75A', 'VA75']
  },
  {
    codigo: 'VDA95MD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VDA95MD',
    capacidad: '95Ah',
    voltaje: '12V',
    precio_neto: 153373.00,
    descripcion: 'Batería Varta 95Ah 12V',
    equivalencias: ['95Ah', '95 Ah', '95A', 'VA95']
  },
  {
    codigo: 'VA3AJD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA3AJD',
    capacidad: '42Ah', // Estimado basado en nomenclatura
    voltaje: '12V',
    precio_neto: 79839.29,
    descripcion: 'Batería Varta 42Ah 12V',
    equivalencias: ['42Ah', '42 Ah', '42A']
  },
  {
    codigo: 'VA4A0D',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA4A0D',
    capacidad: '40Ah',
    voltaje: '12V',
    precio_neto: 75421.61,
    descripcion: 'Batería Varta 40Ah 12V',
    equivalencias: ['40Ah', '40 Ah', '40A']
  },
  {
    codigo: 'VA45BD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA45BD',
    capacidad: '45Ah',
    voltaje: '12V',
    precio_neto: 80802.12,
    descripcion: 'Batería Varta 45Ah 12V',
    equivalencias: ['45Ah', '45 Ah', '45A']
  },
  {
    codigo: 'VA45JNE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA45JNE',
    capacidad: '45Ah',
    voltaje: '12V',
    precio_neto: 85996.00,
    descripcion: 'Batería Varta 45Ah 12V Enhanced',
    equivalencias: ['45Ah', '45 Ah', '45A']
  },
  {
    codigo: 'VA50GD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA50GD',
    capacidad: '50Ah',
    voltaje: '12V',
    precio_neto: 86088.24,
    descripcion: 'Batería Varta 50Ah 12V',
    equivalencias: ['50Ah', '50 Ah', '50A']
  },
  {
    codigo: 'VA55HD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA55HD',
    capacidad: '55Ah',
    voltaje: '12V',
    precio_neto: 97226.85,
    descripcion: 'Batería Varta 55Ah 12V',
    equivalencias: ['55Ah', '55 Ah', '55A']
  },
  {
    codigo: 'VA60D0E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA60D0E',
    capacidad: '60Ah',
    voltaje: '12V',
    precio_neto: 88580.27,
    descripcion: 'Batería Varta 60Ah 12V',
    equivalencias: ['60Ah', '60 Ah', '60A']
  },
  {
    codigo: 'VA70HD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA70HD/E',
    capacidad: '70Ah',
    voltaje: '12V',
    precio_neto: 109026.22,
    descripcion: 'Batería Varta 70Ah 12V HD',
    equivalencias: ['70Ah', '70 Ah', '70A']
  },
  {
    codigo: 'VA75DD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA75DD',
    capacidad: '75Ah',
    voltaje: '12V',
    precio_neto: 121920.36,
    descripcion: 'Batería Varta 75Ah 12V',
    equivalencias: ['75Ah', '75 Ah', '75A']
  },
  {
    codigo: 'VA80LD/E',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA80LD/E',
    capacidad: '80Ah',
    voltaje: '12V',
    precio_neto: 148898.67,
    descripcion: 'Batería Varta 80Ah 12V LD',
    equivalencias: ['80Ah', '80 Ah', '80A']
  },
  {
    codigo: 'VA100LLE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA100LLE',
    capacidad: '100Ah',
    voltaje: '12V',
    precio_neto: 210595.25,
    descripcion: 'Batería Varta 100Ah 12V',
    equivalencias: ['100Ah', '100 Ah', '100A']
  },
  {
    codigo: 'VPA100LE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VPA100LE',
    capacidad: '100Ah',
    voltaje: '12V',
    precio_neto: 177198.29,
    descripcion: 'Batería Varta 100Ah 12V LE',
    equivalencias: ['100Ah', '100 Ah', '100A']
  },
  {
    codigo: 'VPA105RE',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VPA105RE',
    capacidad: '105Ah',
    voltaje: '12V',
    precio_neto: 212596.42,
    descripcion: 'Batería Varta 105Ah 12V RE',
    equivalencias: ['105Ah', '105 Ah', '105A']
  },
  {
    codigo: 'VPA150TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VPA150TD',
    capacidad: '150Ah',
    voltaje: '12V',
    precio_neto: 244142.23,
    descripcion: 'Batería Varta 150Ah 12V TD',
    equivalencias: ['150Ah', '150 Ah', '150A']
  },
  {
    codigo: 'VA180TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA180TD',
    capacidad: '180Ah',
    voltaje: '12V',
    precio_neto: 245559.18,
    descripcion: 'Batería Varta 180Ah 12V TD',
    equivalencias: ['180Ah', '180 Ah', '180A']
  },
  {
    codigo: 'VPA180TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VPA180TD',
    capacidad: '180Ah',
    voltaje: '12V',
    precio_neto: 298307.08,
    descripcion: 'Batería Varta 180Ah 12V TD Premium',
    equivalencias: ['180Ah', '180 Ah', '180A']
  },
  {
    codigo: 'VA200TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA200TD',
    capacidad: '200Ah',
    voltaje: '12V',
    precio_neto: 302856.92,
    descripcion: 'Batería Varta 200Ah 12V TD',
    equivalencias: ['200Ah', '200 Ah', '200A']
  },
  {
    codigo: 'VA225TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VA225TD',
    capacidad: '225Ah',
    voltaje: '12V',
    precio_neto: 399253.09,
    descripcion: 'Batería Varta 225Ah 12V TD',
    equivalencias: ['225Ah', '225 Ah', '225A']
  },
  {
    codigo: 'VTA143TD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VTA143TD',
    capacidad: '143Ah',
    voltaje: '12V',
    precio_neto: 5.00,
    descripcion: 'Batería Varta 143Ah 12V TD',
    equivalencias: ['143Ah', '143 Ah', '143A']
  },
  {
    codigo: 'VFB60HD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VFB60HD',
    capacidad: '60Ah',
    voltaje: '12V',
    precio_neto: 159244.37,
    descripcion: 'Batería Varta 60Ah 12V HD',
    equivalencias: ['60Ah', '60 Ah', '60A']
  },
  {
    codigo: 'VFB70DD',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: 'VFB70DD',
    capacidad: '70Ah',
    voltaje: '12V',
    precio_neto: 173082.02,
    descripcion: 'Batería Varta 70Ah 12V DD',
    equivalencias: ['70Ah', '70 Ah', '70A']
  },
  {
    codigo: '27 AGM',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: '27 AGM',
    capacidad: '95Ah', // Estimado para Group 27
    voltaje: '12V',
    precio_neto: 0.00,
    descripcion: 'Batería Varta AGM Group 27',
    equivalencias: ['27AGM', 'Group 27', 'AGM27']
  },
  {
    codigo: '31 AGM',
    marca: 'Varta',
    tipo: 'Bateria',
    modelo: '31 AGM',
    capacidad: '105Ah', // Estimado para Group 31
    voltaje: '12V',
    precio_neto: 0.00,
    descripcion: 'Batería Varta AGM Group 31',
    equivalencias: ['31AGM', 'Group 31', 'AGM31']
  }
];

// FUNCIÓN DE BÚSQUEDA MEJORADA
function buscarEquivalenciaVarta(marca, tipo, modelo, capacidad) {
  // Normalizar entrada
  const modeloNorm = modelo?.toUpperCase().trim() || '';
  const capacidadNorm = capacidad?.toLowerCase().trim() || '';
  
  // 1️⃣ BÚSQUEDA EXACTA POR CÓDIGO
  let resultado = BASE_DATOS_VARTA.find(p => 
    p.codigo.toUpperCase() === modeloNorm ||
    p.modelo.toUpperCase() === modeloNorm
  );
  
  if (resultado) {
    console.log(`✅ Encontrado por código exacto: ${resultado.codigo}`);
    return resultado;
  }
  
  // 2️⃣ BÚSQUEDA POR CAPACIDAD
  if (capacidadNorm) {
    // Extraer número de capacidad
    const numeroCapacidad = parseInt(capacidadNorm.replace(/\D/g, ''));
    
    if (numeroCapacidad) {
      resultado = BASE_DATOS_VARTA.find(p => {
        const capProducto = parseInt(p.capacidad.replace(/\D/g, ''));
        return capProducto === numeroCapacidad;
      });
      
      if (resultado) {
        console.log(`✅ Encontrado por capacidad: ${resultado.codigo}`);
        return resultado;
      }
    }
  }
  
  // 3️⃣ BÚSQUEDA PARCIAL EN CÓDIGO
  resultado = BASE_DATOS_VARTA.find(p => 
    p.codigo.toUpperCase().includes(modeloNorm) ||
    modeloNorm.includes(p.codigo.toUpperCase())
  );
  
  if (resultado) {
    console.log(`✅ Encontrado por búsqueda parcial: ${resultado.codigo}`);
    return resultado;
  }
  
  // 4️⃣ BÚSQUEDA EN EQUIVALENCIAS
  resultado = BASE_DATOS_VARTA.find(p => 
    p.equivalencias.some(eq => 
      eq.toUpperCase() === modeloNorm ||
      eq.toUpperCase().includes(modeloNorm) ||
      modeloNorm.includes(eq.toUpperCase())
    )
  );
  
  if (resultado) {
    console.log(`✅ Encontrado por equivalencia: ${resultado.codigo}`);
    return resultado;
  }
  
  console.log(`❌ No se encontró equivalencia Varta para: ${modelo}`);
  return null;
}

module.exports = {
  BASE_DATOS_VARTA,
  buscarEquivalenciaVarta
};
