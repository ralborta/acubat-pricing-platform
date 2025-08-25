'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  ArrowsRightLeftIcon, 
  CalculatorIcon, 
  ReceiptPercentIcon, 
  ArrowTrendingUpIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ProcessStep {
  id: number
  title: string
  description: string
  icon: any
  status: 'pending' | 'active' | 'completed'
  duration: number
  details?: string[]
}

interface ProcessVisualizerProps {
  isVisible: boolean
  onComplete: () => void
  fileName: string
}

export default function ProcessVisualizer({ isVisible, onComplete, fileName }: ProcessVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const processSteps: ProcessStep[] = [
    {
      id: 1,
      title: 'Toma Lista de Precios',
      description: 'Cargando archivo de precios base',
      icon: DocumentTextIcon,
      status: 'pending',
      duration: 2000,
      details: ['Leyendo archivo Excel/CSV', 'Validando estructura de datos', 'Extrayendo productos y precios']
    },
    {
      id: 2,
      title: 'Genera Tabla de Equivalencia',
      description: 'Creando equivalencias entre marcas',
      icon: ArrowsRightLeftIcon,
      status: 'pending',
      duration: 2500,
      details: ['Mapeando productos Moura', 'Buscando equivalentes Varta', 'Estableciendo relaciones de capacidad']
    },
    {
      id: 3,
      title: 'Calcula Precios Mayoristas',
      description: 'Aplicando markups por canal',
      icon: CalculatorIcon,
      status: 'pending',
      duration: 3000,
      details: ['Aplicando markup mayorista (+22%)', 'Aplicando markup directa (+60%)', 'Validando coherencia de precios']
    },
    {
      id: 4,
      title: 'Calcula IVA',
      description: 'Aplicando impuesto al valor agregado',
      icon: ReceiptPercentIcon,
      status: 'pending',
      duration: 2000,
      details: ['Calculando IVA 21%', 'Aplicando sobre precios con markup', 'Desglosando montos por producto']
    },
    {
      id: 5,
      title: 'Calcula Markup Final',
      description: 'Aplicando márgenes de rentabilidad',
      icon: ArrowTrendingUpIcon,
      status: 'pending',
      duration: 2500,
      details: ['Ajustando precios por canal', 'Aplicando redondeo inteligente', 'Optimizando márgenes']
    },
    {
      id: 6,
      title: 'Calcula Rentabilidad',
      description: 'Analizando viabilidad económica',
      icon: ChartBarIcon,
      status: 'pending',
      duration: 3000,
      details: ['Evaluando márgenes por canal', 'Calculando rentabilidad por producto', 'Identificando productos críticos']
    },
    {
      id: 7,
      title: 'Define Precios Finales',
      description: 'Estableciendo precios de venta',
      icon: CurrencyDollarIcon,
      status: 'pending',
      duration: 2000,
      details: ['Confirmando precios por canal', 'Validando coherencia general', 'Aplicando reglas de negocio']
    },
    {
      id: 8,
      title: 'Prepara Datos para Transferencia',
      description: 'Generando archivo de resultados',
      icon: ArrowUpTrayIcon,
      status: 'pending',
      duration: 1500,
      details: ['Formateando resultados', 'Generando Excel de salida', 'Preparando para descarga']
    }
  ]

  useEffect(() => {
    if (isVisible && !isRunning) {
      startProcess()
    }
  }, [isVisible])

  const startProcess = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setProgress(0)

    for (let i = 0; i < processSteps.length; i++) {
      // Activar paso actual
      setCurrentStep(i)
      
      // Simular progreso del paso
      const stepDuration = processSteps[i].duration
      const stepProgress = 100 / (stepDuration / 50) // Actualizar cada 50ms
      
      for (let j = 0; j <= 100; j += stepProgress) {
        setProgress(j)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Marcar paso como completado
      processSteps[i].status = 'completed'
      
      // Pausa entre pasos
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Proceso completado
    setIsRunning(false)
    setProgress(100)
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Proceso de Pricing Acubat</h2>
              <p className="text-blue-100 mt-1">Procesando: {fileName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm">Procesando...</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso General</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-500 ${
                  step.status === 'completed'
                    ? 'border-green-500 bg-green-50'
                    : step.status === 'active'
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Step Number */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'active'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <step.icon className={`h-6 w-6 transition-colors duration-300 ${
                      step.status === 'completed'
                        ? 'text-green-600'
                        : step.status === 'active'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`} />
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      step.status === 'completed'
                        ? 'text-green-800'
                        : step.status === 'active'
                        ? 'text-blue-800'
                        : 'text-gray-600'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  
                  <p className={`text-sm transition-colors duration-300 ${
                    step.status === 'completed'
                      ? 'text-green-700'
                      : step.status === 'active'
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>

                  {/* Step Details */}
                  {step.details && step.status === 'active' && (
                    <div className="mt-3 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="flex items-center space-x-2 text-xs text-blue-600 animate-fade-in"
                          style={{ animationDelay: `${detailIndex * 200}ms` }}
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step Progress */}
                  {step.status === 'active' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${(index === currentStep ? progress : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className={`absolute left-4 top-full w-0.5 h-4 transition-all duration-500 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRunning 
                ? `Procesando paso ${currentStep + 1} de ${processSteps.length}...`
                : progress === 100 
                  ? '¡Proceso completado exitosamente! 🎉'
                  : 'Listo para comenzar...'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
