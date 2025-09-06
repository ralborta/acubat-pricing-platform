import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 RECIBIENDO REQUEST...')
    console.log('📋 Content-Type:', request.headers.get('content-type'))
    
    const formData = await request.formData()
    console.log('📋 FormData recibido:', formData)
    
    const file = formData.get('file') as File
    console.log('📁 Archivo recibido:', file)

    if (!file) {
      console.error('❌ No se encontró archivo en formData')
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Archivo recibido correctamente',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('❌ Error en test-upload:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      detalles: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}
