import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// 🚀 FUNCIÓN MÁS EFICIENTE
async function obtenerConfiguracion() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables Supabase no configuradas');
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/config?id=eq.1&select=config_data`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      console.log('🎯 Configuración cargada desde Supabase:', data[0].config_data);
      return data[0].config_data;
    } else {
      console.warn('⚠️ Usando configuración por defecto');
      return {
        iva: 21,
        markups: { mayorista: 22, directa: 60, distribucion: 20 },
        factoresVarta: { factorBase: 40, capacidad80Ah: 35 },
        comisiones: { mayorista: 5, directa: 8, distribucion: 6 }
      };
    }
  } catch (error) {
    console.error('❌ Error config DB:', error);
    return {
      iva: 21,
      markups: { mayorista: 22, directa: 60, distribucion: 20 }
    };
  }
}

export async function GET() {
  try {
    // 🎯 CARGAR CONFIG UNA SOLA VEZ
    const config = await obtenerConfiguracion()
    console.log('⚙️ Config cargada:', config)

    // 📊 SIMULAR CÁLCULOS CON VALORES DE SUPABASE
    const precioBase = 10000
    const ivaMultiplier = 1 + (config.iva / 100)
    const markupMinorista = 1 + (config.markups.directa / 100)
    const markupMayorista = 1 + (config.markups.mayorista / 100)
    
    // Cálculo Minorista
    const minoristaNeto = precioBase * markupMinorista
    const minoristaFinal = Math.round((minoristaNeto * ivaMultiplier) / 10) * 10
    const minoristaRentabilidad = ((minoristaNeto - precioBase) / minoristaNeto) * 100
    
    // Cálculo Mayorista
    const mayoristaNeto = precioBase * markupMayorista
    const mayoristaFinal = Math.round((mayoristaNeto * ivaMultiplier) / 10) * 10
    const mayoristaRentabilidad = ((mayoristaNeto - precioBase) / mayoristaNeto) * 100

    const resultado = {
      success: true,
      configuracion: config,
      calculos: {
        precio_base: precioBase,
        iva: config.iva,
        markups: {
          minorista: config.markups.directa,
          mayorista: config.markups.mayorista
        },
        minorista: {
          precio_neto: minoristaNeto,
          precio_final: minoristaFinal,
          rentabilidad: minoristaRentabilidad.toFixed(1) + '%'
        },
        mayorista: {
          precio_neto: mayoristaNeto,
          precio_final: mayoristaFinal,
          rentabilidad: mayoristaRentabilidad.toFixed(1) + '%'
        }
      }
    }

    return NextResponse.json(resultado, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Error en test-pricing:', error)
    return NextResponse.json({ 
      error: 'Error en test-pricing',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
