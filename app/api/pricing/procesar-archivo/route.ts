import { NextRequest, NextResponse } from 'next/server';

// POST /api/pricing/procesar-archivo
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route iniciada correctamente');
    
    // Verificar que la request sea válida
    if (!request) {
      console.log('❌ Request inválida');
      return NextResponse.json({ error: 'Request inválida' }, { status: 400 });
    }
    
    console.log('📝 Procesando FormData...');
    
    // Procesar FormData
    const formData = await request.formData();
    console.log('✅ FormData procesado correctamente');
    
    // Obtener archivo
    const file = formData.get('archivo') as File;
    
    if (!file) {
      console.log('❌ No se encontró archivo en FormData');
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }
    
    console.log(`📁 Archivo recibido: ${file.name}, tamaño: ${file.size} bytes`);
    
    // Leer contenido del archivo
    const csvContent = await file.text();
    console.log(`📄 Contenido leído: ${csvContent.length} caracteres`);
    
    // Procesar CSV simple
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📊 Líneas encontradas: ${lines.length}`);
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Archivo vacío' }, { status: 400 });
    }
    
    // Obtener headers
    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`📋 Headers: ${headers.join(', ')}`);
    
    // Procesar filas
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(v => v.trim());
        const rowData: any = {};
        
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
    
    console.log(`📊 Filas procesadas: ${rows.length}`);
    
    // Simular cálculo simple
    const productosConPricing = rows.map((producto, index) => ({
      ...producto,
      id: index + 1,
      precio_final: 100000, // Precio falso para prueba
      margen: 20,
      rentabilidad: "RENTABLE",
      categoria_varta: "12x13",
      precio_base_varta: 83333.33
    }));
    
    console.log('✅ Cálculo completado exitosamente');
    
    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      mensaje: `Archivo procesado exitosamente. ${productosConPricing.length} productos analizados.`,
      archivo: file.name,
      headers: headers,
      productos: productosConPricing,
      estadisticas: {
        total_productos: productosConPricing.length,
        productos_rentables: productosConPricing.length,
        productos_no_rentables: 0,
        margen_promedio: 20,
        precio_promedio: 100000
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO en API Route:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        detalles: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
