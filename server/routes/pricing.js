const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Función para cargar configuración desde Supabase
async function cargarConfiguracionPricing() {
  if (!supabase) {
    console.warn('⚠️ Supabase no configurado, usando configuración por defecto');
    return CONFIGURACION_PRICING;
  }

  try {
    const { data, error } = await supabase
      .from('config')
      .select('config_data')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error cargando configuración desde Supabase:', error);
      return CONFIGURACION_PRICING;
    }

    if (data && data.length > 0) {
      const config = data[0].config_data;
      console.log('✅ Configuración cargada desde Supabase:', config);
      
      // Actualizar configuración con valores de Supabase
      CONFIGURACION_PRICING = {
        ...CONFIGURACION_PRICING,
        iva: config.iva || 21,
        markups_otras_marcas: {
          "Retail": 1 + (config.markups?.directa || 60) / 100,
          "Mayorista": 1 + (config.markups?.mayorista || 22) / 100,
          "Online": 1 + (config.markups?.distribucion || 20) / 100,
          "Distribuidor": 1 + (config.markups?.distribucion || 20) / 100
        },
        aumento_varta: config.factoresVarta?.factorBase || 40
      };
      
      return CONFIGURACION_PRICING;
    }

    return CONFIGURACION_PRICING;
  } catch (error) {
    console.error('❌ Error cargando configuración:', error);
    return CONFIGURACION_PRICING;
  }
}

// Configuración de multer para archivos Excel
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Tipos MIME válidos para Excel y CSV
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // CSV estándar
      'text/plain', // CSV como texto plano
      'application/csv', // CSV alternativo
      'text/comma-separated-values' // CSV alternativo
    ];
    
    // También verificar por extensión del archivo
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedExtensions.join(', ')}`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// CONFIGURACIÓN DEL SISTEMA DE PRICING - SE OBTIENE DESDE SUPABASE
let CONFIGURACION_PRICING = {
  // Valores por defecto (se sobrescriben desde Supabase)
  aumento_varta: 35,
  markups_otras_marcas: {
    "Retail": 1.2,
    "Mayorista": 1.15,
    "Online": 1.25,
    "Distribuidor": 1.1
  },
  
  // Reglas de rentabilidad
  reglasRentabilidad: [
    { marca: "Varta", canal: "Retail", margen_minimo: 25 },
    { marca: "Varta", canal: "Mayorista", margen_minimo: 20 },
    { marca: "Varta", canal: "Online", margen_minimo: 30 },
    { marca: "Varta", canal: "Distribuidor", margen_minimo: 18 },
    { marca: "Otros", canal: "Retail", margen_minimo: 15 },
    { marca: "Otros", canal: "Mayorista", margen_minimo: 10 },
    { marca: "Otros", canal: "Online", margen_minimo: 20 },
    { marca: "Otros", canal: "Distribuidor", margen_minimo: 8 }
  ]
};

// FUNCIONES AUXILIARES
function normalizarMarca(marca) {
  if (!marca) return "Otros";
  const marcaLower = marca.toLowerCase().trim();
  if (marcaLower.includes('varta')) return "Varta";
  return "Otros";
}

function normalizarCanal(canal) {
  if (!canal) return "Retail";
  const canalLower = canal.toLowerCase().trim();
  if (canalLower.includes('mayorista') || canalLower.includes('mayor')) return "Mayorista";
  if (canalLower.includes('online') || canalLower.includes('web')) return "Online";
  if (canalLower.includes('distribuidor') || canalLower.includes('dist')) return "Distribuidor";
  return "Retail";
}

function calcularRentabilidad(margen, marca, canal) {
  const regla = CONFIGURACION_PRICING.reglasRentabilidad.find(r => 
    r.marca === marca && r.canal === canal
  );
  
  if (!regla) return { rentabilidad: "NO DEFINIDO", alerta: "Sin regla definida" };
  
  return {
    rentabilidad: margen >= regla.margen_minimo ? "RENTABLE" : "NO RENTABLE",
    alerta: margen < regla.margen_minimo ? `Margen bajo (${regla.margen_minimo}% mínimo)` : ""
  };
}

// FUNCIÓN PRINCIPAL: PROCESAR ARCHIVO EXCEL/CSV
async function procesarArchivoExcel(buffer) {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Intentar cargar como Excel primero
    try {
      await workbook.xlsx.load(buffer);
    } catch (excelError) {
      // Si falla Excel, intentar como CSV
      console.log('📝 Intentando procesar como CSV...');
      const csvContent = buffer.toString('utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Archivo vacío o sin contenido válido');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',').map(v => v.trim());
          const rowData = {};
          
          headers.forEach((header, index) => {
            if (header && values[index]) {
              rowData[header] = values[index];
            }
          });
          
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        }
      }
      
      return { headers, rows };
    }
    
    // Procesar como Excel
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja en el archivo');
    }
    
    const headers = [];
    const rows = [];
    
    // Obtener headers
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value;
    });
    
    // Obtener filas de datos
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};
      
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = row.getCell(index + 1).value;
        }
      });
      
      if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
      }
    }
    
    return { headers, rows };
    
  } catch (error) {
    console.error('❌ Error procesando archivo:', error);
    throw new Error(`Error procesando archivo: ${error.message}`);
  }
}

// FUNCIÓN PRINCIPAL: CÁLCULO DE PRICING CORRECTO CON NUEVO SISTEMA
async function calcularPricingCorrecto(productos, equivalencias) {
  // Cargar configuración actualizada desde Supabase
  const config = await cargarConfiguracionPricing();
  
  return productos.map(producto => {
    const modelo = producto.modelo;
    const marca = normalizarMarca(producto.marca);
    const canal = normalizarCanal(producto.canal);
    const costo = parseFloat(producto.costo) || 0;
    const precioLista = parseFloat(producto.precio_lista) || null;
    
    // Buscar equivalencia en la tabla
    const equivalencia = equivalencias.find(eq => eq.modelo === modelo);
    
    if (!equivalencia) {
      return {
        ...producto,
        error: `No se encontró equivalencia para modelo: ${modelo}`,
        precio_final: 0,
        margen: 0,
        rentabilidad: "ERROR"
      };
    }
    
    // Obtener precio base de Varta
    const precioBaseVarta = parseFloat(equivalencia.precio_varta);
    
    if (isNaN(precioBaseVarta) || precioBaseVarta <= 0) {
      return {
        ...producto,
        error: `Precio Varta inválido para modelo: ${modelo}`,
        precio_final: 0,
        margen: 0,
        rentabilidad: "ERROR"
      };
    }
    
    let precioFinal;
    let margen;
    let tipoCalculo;
    
    // NUEVO SISTEMA DE PRICING POR CANAL
    if (canal === "lista" || canal === "pvp") {
      // LISTA/PVP: Precio sugerido del proveedor + IVA (SIN redondeo)
      if (precioLista && precioLista > 0) {
        precioFinal = precioLista * (1 + CONFIGURACION_PRICING.iva / 100);
        margen = ((precioLista - costo) / costo) * 100;
        tipoCalculo = "Lista/PVP (sin redondeo)";
      } else {
        precioFinal = precioBaseVarta * (1 + CONFIGURACION_PRICING.iva / 100);
        margen = ((precioBaseVarta - costo) / costo) * 100;
        tipoCalculo = "Lista/PVP desde Varta (sin redondeo)";
      }
    } else if (canal === "minorista") {
      // MINORISTA: Usar markup desde configuración de Supabase
      const markupMinorista = config.markups_otras_marcas["Retail"] || 2.00; // Fallback a 100%
      const precioNeto = costo * markupMinorista;
      const precioConIva = precioNeto * (1 + config.iva / 100);
      precioFinal = Math.round(precioConIva / 10) * 10; // Redondeo a múltiplos de $10
      // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
      margen = ((precioNeto - costo) / precioNeto) * 100;
      tipoCalculo = `Minorista (+${((markupMinorista - 1) * 100).toFixed(0)}% + redondeo)`;
    } else if (canal === "mayorista") {
      // MAYORISTA: Usar markup desde configuración de Supabase
      const markupMayorista = config.markups_otras_marcas["Mayorista"] || 1.50; // Fallback a 50%
      const precioNeto = precioBaseVarta * markupMayorista;
      const precioConIva = precioNeto * (1 + config.iva / 100);
      precioFinal = Math.round(precioConIva / 10) * 10; // Redondeo a múltiplos de $10
      // ✅ FÓRMULA CORRECTA: (Precio Neto - Costo) / Precio Neto * 100
      margen = ((precioNeto - precioBaseVarta) / precioNeto) * 100;
      tipoCalculo = `Mayorista (Varta +${((markupMayorista - 1) * 100).toFixed(0)}% + redondeo)`;
    } else {
      // CANAL NO RECONOCIDO: Usar lógica anterior
      if (marca === "Varta") {
        const aumento = precioBaseVarta * (CONFIGURACION_PRICING.aumento_varta / 100);
        precioFinal = precioBaseVarta + aumento;
        margen = CONFIGURACION_PRICING.aumento_varta;
        tipoCalculo = "Aumento 35% (legacy)";
      } else {
        const markup = CONFIGURACION_PRICING.markups_otras_marcas[canal] || 1.15;
        precioFinal = precioBaseVarta * markup;
        margen = ((precioFinal - precioBaseVarta) / precioBaseVarta) * 100;
        tipoCalculo = `Markup ${canal} (legacy)`;
      }
    }
    
    // Validar Rentabilidad
    const { rentabilidad, alerta } = calcularRentabilidad(margen, marca, canal);
    
    return {
      ...producto,
      modelo: modelo,
      marca_original: producto.marca,
      marca_normalizada: marca,
      canal_normalizado: canal,
      equivalente_varta: equivalencia.equivalente_varta,
      precio_base_varta: precioBaseVarta,
      precio_final: precioFinal,
      margen: margen,
      rentabilidad: rentabilidad,
      alerta: alerta,
      tipo_calculo: tipoCalculo,
      configuracion_usada: {
        aumento_varta: CONFIGURACION_PRICING.aumento_varta,
        markup_canal: marca === "Varta" ? null : CONFIGURACION_PRICING.markups_otras_marcas[canal],
        iva: CONFIGURACION_PRICING.iva
      }
    };
  });
}

// RUTAS DE LA API

// POST /procesar-archivo - Procesar archivo Excel y calcular pricing
router.post('/procesar-archivo', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }
    
    console.log(`📁 Procesando archivo: ${req.file.originalname}`);
    
    // Procesar archivo Excel
    const { headers, rows } = await procesarArchivoExcel(req.file.buffer);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene datos válidos' });
    }
    
    console.log(`📊 Productos encontrados: ${rows.length}`);
    
    // NOTA: En una implementación real, aquí cargarías la tabla de equivalencias
    // Por ahora usamos datos de ejemplo
    const equivalencias = [
      { modelo: "60Ah", equivalente_varta: "VARTA_60AH", precio_varta: 15000 },
      { modelo: "70Ah", equivalente_varta: "VARTA_70AH", precio_varta: 18000 },
      { modelo: "100Ah", equivalente_varta: "VARTA_100AH", precio_varta: 25000 },
      { modelo: "55Ah", equivalente_varta: "VARTA_55AH", precio_varta: 14000 },
      { modelo: "80Ah", equivalente_varta: "VARTA_80AH", precio_varta: 20000 }
    ];
    
    // Calcular pricing correcto
    const productosConPricing = await calcularPricingCorrecto(rows, equivalencias);
    
    // Calcular estadísticas
    const estadisticas = {
      total_productos: productosConPricing.length,
      productos_rentables: productosConPricing.filter(p => p.rentabilidad === "RENTABLE").length,
      productos_no_rentables: productosConPricing.filter(p => p.rentabilidad === "NO RENTABLE").length,
      productos_con_error: productosConPricing.filter(p => p.error).length,
      margen_promedio: productosConPricing.filter(p => !p.error).reduce((sum, p) => sum + p.margen, 0) / productosConPricing.filter(p => !p.error).length,
      precio_promedio: productosConPricing.filter(p => !p.error).reduce((sum, p) => sum + p.precio_final, 0) / productosConPricing.filter(p => !p.error).length,
      por_marca: {},
      por_canal: {}
    };
    
    // Estadísticas por marca
    const marcas = [...new Set(productosConPricing.filter(p => !p.error).map(p => p.marca_normalizada))];
    marcas.forEach(marca => {
      const productosMarca = productosConPricing.filter(p => !p.error && p.marca_normalizada === marca);
      estadisticas.por_marca[marca] = {
        cantidad: productosMarca.length,
        margen_promedio: productosMarca.reduce((sum, p) => sum + p.margen, 0) / productosMarca.length,
        rentables: productosMarca.filter(p => p.rentabilidad === "RENTABLE").length
      };
    });
    
    // Estadísticas por canal
    const canales = [...new Set(productosConPricing.filter(p => !p.error).map(p => p.canal_normalizado))];
    canales.forEach(canal => {
      const productosCanal = productosConPricing.filter(p => !p.error && p.canal_normalizado === canal);
      estadisticas.por_canal[canal] = {
        cantidad: productosCanal.length,
        margen_promedio: productosCanal.reduce((sum, p) => sum + p.margen, 0) / productosCanal.length,
        rentables: productosCanal.filter(p => p.rentabilidad === "RENTABLE").length
      };
    });
    
    console.log(`✅ Pricing calculado para ${productosConPricing.length} productos`);
    
    res.json({
      success: true,
      mensaje: `Archivo procesado exitosamente. ${productosConPricing.length} productos analizados.`,
      archivo: req.file.originalname,
      headers: headers,
      productos: productosConPricing,
      estadisticas: estadisticas,
      configuracion: CONFIGURACION_PRICING,
      equivalencias_usadas: equivalencias
    });
    
  } catch (error) {
    console.error('❌ Error procesando archivo:', error);
    res.status(500).json({ 
      error: 'Error procesando archivo', 
      detalles: error.message 
    });
  }
});

// GET /configuracion - Obtener configuración actual
router.get('/configuracion', (req, res) => {
  res.json({
    success: true,
    configuracion: CONFIGURACION_PRICING
  });
});

// PUT /configuracion - Actualizar configuración
router.put('/configuracion', (req, res) => {
  try {
    const nuevaConfig = req.body;
    
    // Validar estructura
    if (nuevaConfig.aumento_varta === undefined || !nuevaConfig.markups_otras_marcas) {
      return res.status(400).json({ error: 'Configuración incompleta' });
    }
    
    // Actualizar configuración
    Object.assign(CONFIGURACION_PRICING, nuevaConfig);
    
    console.log('✅ Configuración actualizada');
    
    res.json({
      success: true,
      mensaje: 'Configuración actualizada exitosamente',
      configuracion: CONFIGURACION_PRICING
    });
    
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    res.status(500).json({ 
      error: 'Error actualizando configuración', 
      detalles: error.message 
    });
  }
});

// POST /configuracion/reset - Resetear configuración a valores por defecto
router.post('/configuracion/reset', (req, res) => {
  try {
    // Resetear a valores por defecto
    CONFIGURACION_PRICING.aumento_varta = 35;
    CONFIGURACION_PRICING.markups_otras_marcas = {
      "Retail": 1.2,
      "Mayorista": 1.15,
      "Online": 1.25,
      "Distribuidor": 1.1
    };
    
    console.log('✅ Configuración reseteada a valores por defecto');
    
    res.json({
      success: true,
      mensaje: 'Configuración reseteada exitosamente',
      configuracion: CONFIGURACION_PRICING
    });
    
  } catch (error) {
    console.error('❌ Error reseteando configuración:', error);
    res.status(500).json({ 
      error: 'Error reseteando configuración', 
      detalles: error.message 
    });
  }
});

// POST /calcular-producto - Calcular pricing para un producto individual
router.post('/calcular-producto', (req, res) => {
  try {
    const { producto, equivalencias } = req.body;
    
    if (!producto || !producto.modelo || !equivalencias) {
      return res.status(400).json({ error: 'Producto o equivalencias inválidos' });
    }
    
    // Calcular pricing para un solo producto
    const [productoConPricing] = await calcularPricingCorrecto([producto], equivalencias);
    
    res.json({
      success: true,
      producto: productoConPricing,
      configuracion: CONFIGURACION_PRICING
    });
    
  } catch (error) {
    console.error('❌ Error calculando producto individual:', error);
    res.status(500).json({ 
      error: 'Error calculando producto', 
      detalles: error.message 
    });
  }
});

module.exports = router;

