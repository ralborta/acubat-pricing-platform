import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Obtener configuración actual
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('config')
      .select('config_data, created_at, id')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data?.config_data || {}
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error('❌ Error interno:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Guardar nueva configuración
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const body = await request.json();
    
    // Validación básica
    if (!body.iva || !body.markups) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuración inválida',
          details: ['IVA y markups son requeridos']
        },
        { status: 400 }
      );
    }

    // Preparar configuración para guardar
    const configToSave = {
      ...body,
      promociones: false,
      ultimaActualizacion: new Date().toISOString()
    };

    // Primero eliminar TODAS las configuraciones existentes
    const { error: deleteError } = await supabase
      .from('config')
      .delete()
      .neq('id', 0); // Eliminar todas las filas

    if (deleteError) {
      console.error('❌ Error eliminando configuraciones:', deleteError);
    }

    // Luego insertar la nueva configuración
    const { data, error } = await supabase
      .from('config')
      .insert([{ config_data: configToSave }])
      .select();

    if (error) {
      console.error('❌ Error guardando configuración:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: configToSave,
      message: 'Configuración guardada exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error interno:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar configuración existente (mismo que POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// DELETE - Resetear a configuración por defecto
export async function DELETE() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const defaultConfig = {
      iva: 21,
      markups: {
        mayorista: 22,
        directa: 60,
        distribucion: 20
      },
      factoresVarta: {
        factorBase: 40,
        capacidad80Ah: 35
      },
      promociones: false,
      comisiones: {
        mayorista: 5,
        directa: 8,
        distribucion: 6
      },
      ultimaActualizacion: new Date().toISOString()
    };

    // Primero eliminar TODAS las configuraciones existentes
    const { error: deleteError } = await supabase
      .from('config')
      .delete()
      .neq('id', 0); // Eliminar todas las filas

    if (deleteError) {
      console.error('❌ Error eliminando configuraciones:', deleteError);
    }

    // Luego insertar la configuración por defecto
    const { data, error } = await supabase
      .from('config')
      .insert([{ config_data: defaultConfig }])
      .select();

    if (error) {
      console.error('❌ Error reseteando configuración:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: defaultConfig,
      message: 'Configuración reseteada a valores por defecto'
    });
  } catch (error) {
    console.error('❌ Error interno:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
