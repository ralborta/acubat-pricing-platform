import { NextResponse } from 'next/server'

// Fuerza serverless Node (no Edge)
export const runtime = 'nodejs'

// Evita CDN/ISR
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json(
    { ok: true, ts: new Date().toISOString() },
    {
      headers: {
        // Cero caché en CDN y browser
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store'
      }
    }
  )
}

// (Opcional) HEAD para chequeos rápidos
export async function HEAD() {
  return new Response(null, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store'
    }
  })
}
