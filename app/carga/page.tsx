'use client'

import { useState, useRef } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon, PlayIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, TableCellsIcon, CurrencyDollarIcon, DocumentIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ProcessVisualizer from '@/components/ProcessVisualizer'
import { exportarAExcel } from '../../src/lib/excel-export'

interface Producto {
  id: number
  producto: string
  tipo: string
  modelo: string
  precio_base_minorista: number  // ✅ Precio base para Minorista (del archivo)
  precio_base_mayorista: number  // ✅ Precio base para Mayorista (Varta o archivo)
  costo_estimado_minorista: number  // ✅ Costo estimado para Minorista
  costo_estimado_mayorista: number  // ✅ Costo estimado para Mayorista
  equivalencia_varta?: {
    encontrada: boolean
    codigo?: string
    precio_varta?: number
    descripcion?: string
    razon?: string
  }
  minorista: {
    precio_neto: number
    precio_final: number
    rentabilidad: string
  }
  mayorista: {
    precio_neto: number
    precio_final: number
    rentabilidad: string
  }
}

interface Resultado {
  success: boolean
  archivo: string
  timestamp: string
  estadisticas: {
    total_productos: number
    productos_rentables: number
    margen_promedio: string
  }
  productos: Producto[]
}

export default function CargaPage() {
  return <main style={{ padding: 24 }}>Carga: OK</main>;
}

