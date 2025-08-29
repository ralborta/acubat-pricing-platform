import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar que sea un PDF
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Crear FormData para enviar al microservicio Python
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // URL del microservicio Python en Railway (URL interna)
    const pythonServiceUrl = 'http://acubat-pdf-converter.railway.internal:8080/convert';

    console.log('Enviando archivo al microservicio Python:', pythonServiceUrl);

    // Enviar archivo al microservicio Python
    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del microservicio Python:', response.status, errorText);
      return NextResponse.json(
        { error: `Error del microservicio: ${response.status}` },
        { status: response.status }
      );
    }

    // Obtener el archivo Excel convertido
    const excelBuffer = await response.arrayBuffer();
    
    // Crear respuesta con el archivo Excel
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '.xlsx')}"`,
      },
    });

  } catch (error) {
    console.error('Error en la API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API PDF a Excel funcionando' });
}
