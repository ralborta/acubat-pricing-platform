// 🚀 CONVERSOR PDF A EXCEL - VERSIÓN WEB
// Librería para convertir PDFs a Excel directamente en el navegador
// SIN APIs, SIN backend, 100% frontend

// Importar librerías web-friendly
import * as XLSX from 'xlsx';

// 🎯 FUNCIÓN PRINCIPAL: CONVERTIR PDF A EXCEL
export async function convertirPDFaExcelWeb(archivoPDF) {
  try {
    console.log('🚀 Iniciando conversión PDF a Excel (web)...');
    
    // 📖 LEER ARCHIVO PDF
    const arrayBuffer = await archivoPDF.arrayBuffer();
    
    // 🔍 IMPORTAR PDFJS DINÁMICAMENTE (versión web)
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurar worker para web (usar worker local o deshabilitar)
    if (typeof window !== 'undefined' && window.Worker) {
      // Intentar usar worker local primero
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
      } catch (e) {
        // Si falla, deshabilitar worker y usar modo sincrónico
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      }
    } else {
      // En entornos sin Worker, deshabilitar
      pdfjsLib.GlobalWorkerOptions.workerSrc = false;
    }
    
    // 📄 CARGAR PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`📄 PDF cargado: ${pdf.numPages} páginas`);
    
    // 📊 EXTRAER TEXTO DE TODAS LAS PÁGINAS
    let textoCompleto = '';
    const datosExtraidos = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      textoCompleto += pageText + ' ';
      
      console.log(`📖 Página ${pageNum}: ${pageText.length} caracteres`);
    }
    
    // 🔍 PROCESAR TEXTO Y EXTRAER DATOS
    console.log('🔍 Procesando texto extraído...');
    
    // Dividir por líneas y buscar patrones de productos
    const lineas = textoCompleto.split('\n').filter(linea => linea.trim().length > 0);
    
    // Buscar patrones comunes en listas de productos
    lineas.forEach((linea, index) => {
      // Patrón: código + descripción + precio
      const patronProducto = /([A-Z0-9]{3,10})\s+([A-Za-z0-9\s\-\.]+?)\s+(\$?\d{1,3}(?:[.,]\d{3})*)/i;
      
      const match = linea.match(patronProducto);
      if (match) {
        const [, codigo, descripcion, precio] = match;
        const precioNumerico = parseFloat(precio.replace(/[$,]/g, ''));
        
        if (precioNumerico > 0) {
          datosExtraidos.push({
            codigo: codigo.trim(),
            descripcion: descripcion.trim(),
            precio_lista: precioNumerico,
            categoria: 'Producto',
            pagina: Math.floor(index / 50) + 1
          });
        }
      }
    });
    
    // Si no se encontraron productos con el patrón, crear datos basados en el texto
    if (datosExtraidos.length === 0) {
      console.log('🔍 No se encontraron productos con patrón, creando datos del texto...');
      
      // Buscar números que podrían ser precios
      const precios = textoCompleto.match(/\$?\d{1,3}(?:[.,]\d{3})*/g) || [];
      const palabras = textoCompleto.match(/[A-Za-z]{3,20}/g) || [];
      
      precios.slice(0, 10).forEach((precio, index) => {
        const precioNumerico = parseFloat(precio.replace(/[$,]/g, ''));
        if (precioNumerico > 100) { // Solo precios razonables
          datosExtraidos.push({
            codigo: `ITEM${index + 1}`,
            descripcion: palabras[index] || `Producto ${index + 1}`,
            precio_lista: precioNumerico,
            categoria: 'Extraído del PDF',
            pagina: 1
          });
        }
      });
    }
    
    console.log(`✅ Datos extraídos: ${datosExtraidos.length} productos`);
    
    if (datosExtraidos.length === 0) {
      throw new Error('No se pudieron extraer datos del PDF. El archivo podría no contener información de productos.');
    }
    
    // 📈 GENERAR EXCEL USANDO XLSX
    console.log('📈 Generando archivo Excel...');
    
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de productos
    const worksheet = XLSX.utils.json_to_sheet(datosExtraidos);
    
    // Aplicar estilos y formatos
    worksheet['!cols'] = [
      { width: 15 }, // código
      { width: 40 }, // descripción
      { width: 15 }, // precio_lista
      { width: 20 }, // categoría
      { width: 10 }  // página
    ];
    
    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    
    // Crear hoja de resumen
    const resumen = [
      { metrica: 'Total Productos', valor: datosExtraidos.length },
      { metrica: 'Precio Promedio', valor: Math.round(datosExtraidos.reduce((sum, p) => sum + p.precio_lista, 0) / datosExtraidos.length) },
      { metrica: 'Precio Mínimo', valor: Math.min(...datosExtraidos.map(p => p.precio_lista)) },
      { metrica: 'Precio Máximo', valor: Math.max(...datosExtraidos.map(p => p.precio_lista)) },
      { metrica: 'Páginas Procesadas', valor: pdf.numPages },
      { metrica: 'Fecha Conversión', valor: new Date().toLocaleDateString('es-ES') }
    ];
    
    const worksheetResumen = XLSX.utils.json_to_sheet(resumen);
    worksheetResumen['!cols'] = [
      { width: 20 }, // métrica
      { width: 20 }  // valor
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen');
    
    // Crear hoja con texto completo para referencia
    const textoData = [
      ['TEXTO EXTRAÍDO DEL PDF'],
      [''],
      ...lineas.map(linea => [linea])
    ];
    
    const worksheetTexto = XLSX.utils.aoa_to_sheet(textoData);
    worksheetTexto['!cols'] = [{ width: 100 }];
    XLSX.utils.book_append_sheet(workbook, worksheetTexto, 'Texto Completo');
    
    // 💾 GENERAR ARCHIVO EXCEL
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('✅ Archivo Excel generado exitosamente');
    
    return {
      success: true,
      data: {
        buffer: excelBuffer,
        filename: `conversion_${Date.now()}.xlsx`,
        productos: datosExtraidos.length,
        resumen: resumen,
        textoCompleto: lineas
      }
    };
    
  } catch (error) {
    console.error('❌ Error en conversión PDF a Excel:', error);
    return {
      success: false,
      error: `Error en conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// 🎯 FUNCIÓN AUXILIAR: DESCARGAR ARCHIVO
export function descargarArchivo(buffer, filename, tipoMIME) {
  try {
    // Crear blob
    const blob = new Blob([buffer], { type: tipoMIME });
    
    // Crear URL y descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log(`✅ Archivo descargado: ${filename}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error descargando archivo:', error);
    return false;
  }
}

// 🎯 FUNCIÓN AUXILIAR: VALIDAR ARCHIVO PDF
export function validarArchivoPDF(archivo) {
  if (!archivo) {
    return { valido: false, error: 'No se seleccionó ningún archivo' };
  }
  
  if (!archivo.type.includes('pdf') && !archivo.name.toLowerCase().endsWith('.pdf')) {
    return { valido: false, error: 'El archivo debe ser un PDF' };
  }
  
  if (archivo.size > 50 * 1024 * 1024) { // 50MB máximo
    return { valido: false, error: 'El archivo es demasiado grande (máximo 50MB)' };
  }
  
  return { valido: true, archivo };
}

// 📋 EXPORTAR FUNCIONES
export default {
  convertirPDFaExcelWeb,
  descargarArchivo,
  validarArchivoPDF
};
