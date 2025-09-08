// 🚀 CONVERSOR PDF A IMÁGENES - VERSIÓN ACTUALIZADA
// Librería para extraer tablas de PDFs como imágenes
// CON APIs, CON backend, frontend + backend

// 🖼️ FUNCIÓN ACTUALIZADA: MANEJAR IMÁGENES EN VEZ DE EXCEL
export async function convertirPDFaImagenesWeb(archivoPDF) {
  try {
    console.log('🖼️ Iniciando conversión de PDF a imágenes...');
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', archivoPDF);
    
    // Llamar a la API
    const response = await fetch('/api/pdf-to-excel', {
      method: 'POST',
      body: formData
    });
    
    const resultado = await response.json();
    
    if (resultado.success) {
      console.log(`✅ ${resultado.total} imágenes extraídas`);
      return resultado;
    } else {
      throw new Error(resultado.error);
    }
    
  } catch (error) {
    console.error('❌ Error en conversión:', error);
    return {
      success: false,
      error: error.message
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
  convertirPDFaImagenesWeb,
  descargarArchivo,
  validarArchivoPDF
};
