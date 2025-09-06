import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación interna
  const protectedRoutes = ['/api/admin', '/api/debug-db'];
  
  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const internalKey = request.headers.get('x-internal-key');
    const bypassToken = request.headers.get('x-vercel-protection-bypass');
    
    // Verificar bypass token de Vercel
    if (bypassToken && bypassToken === process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      return NextResponse.next();
    }
    
    // Verificar clave interna
    if (internalKey && internalKey === process.env.INTERNAL_KEY) {
      return NextResponse.next();
    }
    
    // Verificar query param para webhooks
    const queryBypass = request.nextUrl.searchParams.get('x-vercel-protection-bypass');
    if (queryBypass && queryBypass === process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      return NextResponse.next();
    }
    
    return new Response('Unauthorized', { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Unauthorized',
        message: 'This endpoint requires authentication',
        required: 'x-internal-key header or x-vercel-protection-bypass token'
      })
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/debug-db'
  ]
};
