// 🚀 CONVERSOR PDF A EXCEL - VERSIÓN SIMPLIFICADA
// Librería para crear plantillas Excel basadas en PDFs
// SIN APIs, SIN backend, 100% frontend

// Importar librerías web-friendly
import * as XLSX from 'xlsx';

// 🎯 FUNCIÓN PRINCIPAL: CREAR PLANTILLA EXCEL BASADA EN PDF
export async function convertirPDFaExcelWeb(archivoPDF) {
  try {
    console.log('🚀 Iniciando creación de plantilla Excel basada en PDF...');
    
    // 📊 CREAR DATOS DE EJEMPLO BASADOS EN EL NOMBRE DEL ARCHIVO
    const nombreArchivo = archivoPDF.name.replace('.pdf', '').toUpperCase();
    
    // Crear datos de ejemplo para la plantilla
    const datosExtraidos = [
      {
        codigo: 'PROD001',
        descripcion: `Producto de ${nombreArchivo}`,
        precio_lista: 150000,
        categoria: 'Automotriz',
        voltaje: '12V',
        capacidad: '45Ah'
      },
      {
        codigo: 'PROD002',
        descripcion: `Batería ${nombreArchivo}`,
        precio_lista: 180000,
        categoria: 'Automotriz',
        voltaje: '12V',
        capacidad: '60Ah'
      },
      {
        codigo: 'PROD003',
        descripcion: `Accesorio ${nombreArchivo}`,
        precio_lista: 25000,
        categoria: 'Accesorios',
        voltaje: 'N/A',
        capacidad: 'N/A'
      }
    ];
    
    console.log(`✅ Plantilla creada con ${datosExtraidos.length} productos de ejemplo`);
    
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
      { width: 10 }, // voltaje
      { width: 10 }  // capacidad
    ];
    
    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    
    // Crear hoja de resumen
    const resumen = [
      { metrica: 'Total Productos', valor: datosExtraidos.length },
      { metrica: 'Archivo Original', valor: archivoPDF.name },
      { metrica: 'Fecha de Creación', valor: new Date().toLocaleDateString() },
      { metrica: 'Tipo', valor: 'Plantilla de Ejemplo' }
    ];
    
    const worksheetResumen = XLSX.utils.json_to_sheet(resumen);
    XLSX.utils.book_append_sheet(workbook, worksheetResumen, 'Resumen');
    
    // Crear hoja de instrucciones
    const instrucciones = [
      { paso: 1, instruccion: 'Reemplaza los datos de ejemplo con tus productos reales' },
      { paso: 2, instruccion: 'Mantén el formato de columnas para compatibilidad' },
      { paso: 3, instruccion: 'Guarda el archivo y úsalo en el siguiente proceso' }
    ];
    
    const worksheetInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
    XLSX.utils.book_append_sheet(workbook, worksheetInstrucciones, 'Instrucciones');
    
    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    console.log('✅ Archivo Excel generado exitosamente');
    
    return {
      success: true,
      data: {
        buffer: excelBuffer,
        filename: `plantilla_${nombreArchivo}_${Date.now()}.xlsx`,
        productos: datosExtraidos.length,
        resumen: resumen,
        textoCompleto: ['Plantilla creada automáticamente']
      }
    };
    
  } catch (error) {
    console.error('❌ Error en creación de plantilla Excel:', error);
    return {
      success: false,
      error: `Error en creación: ${error instanceof Error ? error.message : 'Error desconocido'}`
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
