'use client'

import { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Store, 
  Truck, 
  Globe, 
  BarChart3,
  Download,
  Eye,
  Filter,
  Search
} from 'lucide-react'

interface ProductPricing {
  id: string
  sku: string
  name: string
  category: string
  cost: number
  listPrice: number
  markup: number
  margin: number
  channels: {
    online: number
    retail: number
    wholesale: number
    distributor: number
  }
  profitability: 'high' | 'medium' | 'low'
  recommendations: string[]
}

interface PricingAnalysisProps {
  isVisible: boolean
  onClose: () => void
  fileName: string
}

export default function PricingAnalysis({ isVisible, onClose, fileName }: PricingAnalysisProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductPricing | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'markup' | 'margin' | 'profitability'>('name')

  // Datos simulados de análisis de precios
  const [products] = useState<ProductPricing[]>([
    {
      id: '1',
      sku: 'PROD-001',
      name: 'Laptop Gaming Pro',
      category: 'Electrónicos',
      cost: 450.00,
      listPrice: 799.99,
      markup: 77.8,
      margin: 43.8,
      channels: {
        online: 749.99,
        retail: 799.99,
        wholesale: 679.99,
        distributor: 719.99
      },
      profitability: 'high',
      recommendations: [
        'Aumentar precio online en 5%',
        'Mantener precio retail actual',
        'Reducir precio mayorista en 3%'
      ]
    },
    {
      id: '2',
      sku: 'PROD-002',
      name: 'Mouse Inalámbrico',
      category: 'Accesorios',
      cost: 12.50,
      listPrice: 29.99,
      markup: 139.9,
      margin: 58.3,
      channels: {
        online: 24.99,
        retail: 29.99,
        wholesale: 19.99,
        distributor: 22.99
      },
      profitability: 'high',
      recommendations: [
        'Excelente margen, mantener precios',
        'Considerar bundle con teclado'
      ]
    },
    {
      id: '3',
      sku: 'PROD-003',
      name: 'Teclado Mecánico',
      category: 'Accesorios',
      cost: 35.00,
      listPrice: 89.99,
      markup: 157.1,
      margin: 61.1,
      channels: {
        online: 79.99,
        retail: 89.99,
        wholesale: 69.99,
        distributor: 74.99
      },
      profitability: 'high',
      recommendations: [
        'Margen saludable, precios óptimos',
        'Promocionar en canales online'
      ]
    },
    {
      id: '4',
      sku: 'PROD-004',
      name: 'Monitor 24"',
      category: 'Monitores',
      cost: 120.00,
      listPrice: 199.99,
      markup: 66.7,
      margin: 40.0,
      channels: {
        online: 189.99,
        retail: 199.99,
        wholesale: 169.99,
        distributor: 179.99
      },
      profitability: 'medium',
      recommendations: [
        'Considerar aumentar precio en 8%',
        'Revisar costos de distribución'
      ]
    },
    {
      id: '5',
      sku: 'PROD-005',
      name: 'Cable HDMI Premium',
      category: 'Cables',
      cost: 3.50,
      listPrice: 19.99,
      markup: 471.1,
      margin: 82.5,
      channels: {
        online: 16.99,
        retail: 19.99,
        wholesale: 14.99,
        distributor: 15.99
      },
      profitability: 'high',
      recommendations: [
        'Margen excepcional, mantener precios',
        'Considerar pack de múltiples cables'
      ]
    }
  ])

  const filteredProducts = products
    .filter(product => 
      filterCategory === 'all' || product.category === filterCategory
    )
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'markup': return b.markup - a.markup
        case 'margin': return b.margin - a.margin
        case 'profitability': return a.profitability.localeCompare(b.profitability)
        default: return 0
      }
    })

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProfitabilityLabel = (profitability: string) => {
    switch (profitability) {
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return 'N/A'
    }
  }

  const downloadAnalysis = () => {
    const content = `Análisis de Precios - ${fileName}\n\n${filteredProducts.map(p => 
      `${p.sku} | ${p.name} | Costo: $${p.cost} | Precio: $${p.listPrice} | Markup: ${p.markup}% | Margen: ${p.margin}%`
    ).join('\n')}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis_precios_${fileName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Análisis Completo de Precios</h2>
            <p className="text-gray-600">Archivo: {fileName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadAnalysis}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Lista de Productos */}
          <div className="w-2/3 border-r border-gray-200 overflow-y-auto">
            {/* Filtros y Búsqueda */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="Electrónicos">Electrónicos</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Monitores">Monitores</option>
                  <option value="Cables">Cables</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Ordenar por nombre</option>
                  <option value="markup">Ordenar por markup</option>
                  <option value="margin">Ordenar por margen</option>
                  <option value="profitability">Ordenar por rentabilidad</option>
                </select>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Markup</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentabilidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku} • {product.category}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">${product.cost.toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">${product.listPrice.toFixed(2)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.markup.toFixed(1)}%</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.margin.toFixed(1)}%</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitabilityColor(product.profitability)}`}>
                          {getProfitabilityLabel(product.profitability)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProduct(product)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detalle del Producto */}
          <div className="w-1/3 overflow-y-auto">
            {selectedProduct ? (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedProduct.name}</h3>
                
                {/* Información Básica */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">SKU</div>
                      <div className="font-medium">{selectedProduct.sku}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Categoría</div>
                      <div className="font-medium">{selectedProduct.category}</div>
                    </div>
                  </div>
                </div>

                {/* Análisis de Precios */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Análisis de Precios</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600">Costo Base</div>
                      <div className="text-lg font-bold text-blue-900">${selectedProduct.cost.toFixed(2)}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600">Precio Lista</div>
                      <div className="text-lg font-bold text-green-900">${selectedProduct.listPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600">Markup</div>
                      <div className="text-lg font-bold text-purple-900">{selectedProduct.markup.toFixed(1)}%</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600">Margen</div>
                      <div className="text-lg font-bold text-orange-900">{selectedProduct.margin.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Precios por Canales */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Precios por Canales</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Online</span>
                      </div>
                      <span className="font-bold text-blue-900">${selectedProduct.channels.online.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Retail</span>
                      </div>
                      <span className="font-bold text-green-900">${selectedProduct.channels.retail.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium">Mayorista</span>
                      </div>
                      <span className="font-bold text-purple-900">${selectedProduct.channels.wholesale.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium">Distribuidor</span>
                      </div>
                      <span className="font-bold text-orange-900">${selectedProduct.channels.distributor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Recomendaciones</h4>
                  <div className="space-y-2">
                    {selectedProduct.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Selecciona un producto para ver el análisis detallado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
