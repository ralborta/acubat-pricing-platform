# 🚀 PDF to Excel Microservice

Microservicio Python para convertir archivos PDF a Excel, optimizado para tablas y datos estructurados.

## ✨ Características

- **Extracción inteligente**: Detecta automáticamente tablas en PDFs
- **Formato profesional**: Genera Excel con estilos y bordes
- **Múltiples hojas**: Una hoja por tabla encontrada
- **API REST**: Endpoint simple para integración
- **Health checks**: Compatible con Railway

## 🏗️ Arquitectura

- **Flask**: Framework web ligero
- **pdfplumber**: Extracción de tablas PDF
- **openpyxl**: Generación de archivos Excel
- **CORS**: Configurado para dominios específicos

## 📡 Endpoints

### `POST /convert-pdf`
Convierte un archivo PDF a Excel.

**Request:**
```bash
curl -X POST -F "file=@documento.pdf" https://tu-servicio.railway.app/convert-pdf
```

**Response:**
- Archivo Excel descargable
- Headers de descarga automática

### `GET /health`
Verifica el estado del servicio.

**Response:**
```json
{
  "status": "healthy",
  "service": "pdf-to-excel",
  "timestamp": "2024-01-01T12:00:00"
}
```

### `GET /`
Información del servicio.

## 🚀 Deploy en Railway

1. **Conectar repositorio** a Railway
2. **Configurar variables** de entorno si es necesario
3. **Deploy automático** en cada push

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
python app.py

# Servicio disponible en http://localhost:8080
```

## 📊 Formato de Salida

- **Hoja por tabla**: Cada tabla del PDF se convierte en una hoja
- **Estilos automáticos**: Encabezados destacados, bordes, alineación
- **Ancho de columnas**: Ajustado automáticamente al contenido
- **Nombres de archivo**: Timestamp incluido para evitar duplicados

## 🛡️ Manejo de Errores

- Validación de archivos PDF
- Fallback a texto si no hay tablas
- Logs detallados para debugging
- Respuestas HTTP apropiadas

## 🔗 Integración Frontend

```typescript
const convertirPDFaExcel = async (archivoPDF: File) => {
  const formData = new FormData()
  formData.append('file', archivoPDF)
  
  const response = await fetch('https://tu-servicio.railway.app/convert-pdf', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) throw new Error('Error en conversión')
  
  // Descargar Excel
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted_${archivoPDF.name.replace('.pdf', '')}.xlsx`
  a.click()
}
```
