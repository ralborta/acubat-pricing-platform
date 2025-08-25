'use client'

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Circle, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  FileText, 
  ArrowLeftRight, 
  Calculator, 
  Percent, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Upload,
  Clock,
  CheckCircle2
} from "lucide-react";

// ==========================
// Tipos y Interfaces
// ==========================
type PVStatus = 'pending' | 'active' | 'completed';

interface PVStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: PVStatus;
  duration: number; // ms
  details?: string[];
}

interface ProcessVisualizerProps {
  isVisible: boolean;
  onComplete: () => void;
  fileName: string;
}

// ==========================
// Componentes de UI
// ==========================
function Card({ title, subtitle, children, className = "" }: { 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="mb-4">
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ==========================
// Donut por Etapas (Principal)
// ==========================
function ProgressDonutSteps({ steps }: { steps: PVStep[] }) {
  const total = steps.length;
  const size = 180; 
  const cx = size/2; 
  const cy = size/2;
  const rOuter = 75; 
  const rInner = 55;
  const gap = 6; // grados de separación
  const stepAngle = 360 / total;

  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const polar = (r: number, deg: number) => ({ 
    x: cx + r * Math.cos(toRad(deg)), 
    y: cy + r * Math.sin(toRad(deg)) 
  });

  const ringSlice = (startDeg: number, endDeg: number) => {
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    const a1 = polar(rOuter, startDeg);
    const a2 = polar(rOuter, endDeg);
    const b2 = polar(rInner, endDeg);
    const b1 = polar(rInner, startDeg);
    return `M ${a1.x} ${a1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${a2.x} ${a2.y} L ${b2.x} ${b2.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${b1.x} ${b1.y} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
      {steps.map((s, i) => {
        const start = i * stepAngle + gap/2;
        const end = (i + 1) * stepAngle - gap/2;
        const d = ringSlice(start, end);
        const fill = s.status === 'completed' ? '#22c55e' : s.status === 'active' ? '#6366f1' : '#e5e7eb';
        
        return (
          <motion.path
            key={s.id}
            d={d}
            fill={fill}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ 
              opacity: s.status === 'pending' ? 0.6 : 1, 
              scale: s.status === 'active' ? 1.05 : 1 
            }}
            transform-origin={`${cx} ${cy}`}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 18,
              duration: 0.6
            }}
          />
        );
      })}
    </svg>
  );
}

// ==========================
// Visualizador Principal
// ==========================
export default function ProcessVisualizer({ isVisible, onComplete, fileName }: ProcessVisualizerProps) {
  const [steps, setSteps] = useState<PVStep[]>([
    { 
      id: 1, 
      title: 'Toma Lista de Precios', 
      description: 'Cargando archivo de precios base', 
      icon: FileText, 
      status: 'pending', 
      duration: 2000, 
      details: ['Leyendo archivo Excel/CSV', 'Validando estructura de datos', 'Extrayendo productos y precios']
    },
    { 
      id: 2, 
      title: 'Genera Tabla de Equivalencia', 
      description: 'Creando equivalencias entre marcas', 
      icon: ArrowLeftRight, 
      status: 'pending', 
      duration: 2500, 
      details: ['Mapeando productos Moura', 'Buscando equivalentes Varta', 'Estableciendo relaciones de capacidad']
    },
    { 
      id: 3, 
      title: 'Calcula Precios Mayoristas', 
      description: 'Aplicando markups por canal', 
      icon: Calculator, 
      status: 'pending', 
      duration: 3000, 
      details: ['Aplicando markup mayorista (+22%)', 'Aplicando markup directa (+60%)', 'Validando coherencia de precios']
    },
    { 
      id: 4, 
      title: 'Calcula IVA', 
      description: 'Aplicando impuesto al valor agregado', 
      icon: Percent, 
      status: 'pending', 
      duration: 2000, 
      details: ['Calculando IVA 21%', 'Aplicando sobre precios con markup', 'Desglosando montos por producto']
    },
    { 
      id: 5, 
      title: 'Calcula Markup Final', 
      description: 'Aplicando márgenes de rentabilidad', 
      icon: TrendingUp, 
      status: 'pending', 
      duration: 2500, 
      details: ['Ajustando precios por canal', 'Aplicando redondeo inteligente', 'Optimizando márgenes']
    },
    { 
      id: 6, 
      title: 'Calcula Rentabilidad', 
      description: 'Analizando viabilidad económica', 
      icon: BarChart3, 
      status: 'pending', 
      duration: 3000, 
      details: ['Evaluando márgenes por canal', 'Calculando rentabilidad por producto', 'Identificando productos críticos']
    },
    { 
      id: 7, 
      title: 'Define Precios Finales', 
      description: 'Estableciendo precios de venta', 
      icon: DollarSign, 
      status: 'pending', 
      duration: 2000, 
      details: ['Confirmando precios por canal', 'Validando coherencia general', 'Aplicando reglas de negocio']
    },
    { 
      id: 8, 
      title: 'Prepara Datos para Transferencia', 
      description: 'Generando archivo de resultados', 
      icon: Upload, 
      status: 'pending', 
      duration: 1500, 
      details: ['Formateando resultados', 'Generando Excel de salida', 'Preparando para descarga']
    },
  ]);

  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(0);
  const [stepPct, setStepPct] = useState(0); // 0..100 del paso actual

  const totalPct = useMemo(() => {
    const completed = steps.filter(s => s.status === 'completed').length;
    const base = (completed / steps.length) * 100;
    return Math.min(base + stepPct / steps.length, 100);
  }, [steps, stepPct]);

  // Auto-start cuando se hace visible
  useEffect(() => {
    if (isVisible && !running) {
      start();
    }
  }, [isVisible]);

  // Lógica de progreso
  useEffect(() => {
    if (!running) return;
    if (current >= steps.length) return;

    // Marcar paso como activo
    setSteps(prev => prev.map((s, i) => i === current ? { ...s, status: 'active' } : s));

    const duration = steps[current].duration;
    const tickMs = 50;
    const inc = (100 / (duration / tickMs));

    let cancelled = false;
    const id = setInterval(() => {
      setStepPct(prev => {
        const next = prev + inc;
        if (next >= 100) {
          clearInterval(id);
          if (!cancelled) {
            // Completar paso y avanzar
            setSteps(p => p.map((s, i) => i === current ? { ...s, status: 'completed' } : s));
            setStepPct(0);
            setCurrent(c => c + 1);
          }
        }
        return Math.min(100, next);
      });
    }, tickMs);

    return () => { 
      cancelled = true; 
      clearInterval(id); 
    };
  }, [running, current, steps]);

  // Completar proceso
  useEffect(() => {
    if (!running) return;
    if (current === steps.length) {
      setRunning(false);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [current, running, onComplete]);

  const start = () => {
    if (running) return;
    setRunning(true);
  };

  const pause = () => setRunning(false);
  
  const reset = () => {
    setRunning(false);
    setCurrent(0);
    setStepPct(0);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
  };

  const active = steps[current];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Proceso de Pricing Acubat</h2>
                  <div className="flex items-center gap-2 mt-2 text-blue-100">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{fileName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl backdrop-blur-sm">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Procesando...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!running ? (
                      <button 
                        onClick={start} 
                        className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-medium">Continuar</span>
                      </button>
                    ) : (
                      <button 
                        onClick={pause} 
                        className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-colors"
                      >
                        <Pause className="h-4 w-4" />
                        <span className="text-sm font-medium">Pausar</span>
                      </button>
                    )}
                    <button 
                      onClick={reset} 
                      className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-sm font-medium">Reiniciar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
              {/* Donut Circular */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ProgressDonutSteps steps={steps} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold tabular-nums text-gray-800">
                        {Math.round(totalPct)}%
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        Paso {Math.min(current + 1, steps.length)} de {steps.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    Completado
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                    Activo
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-300"></span>
                    Pendiente
                  </span>
                </div>
              </div>

              {/* Lista de Pasos */}
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-500 ${
                      step.status === 'completed'
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                        : step.status === 'active'
                        ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-105'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Indicador de Estado */}
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : step.status === 'active'
                        ? 'bg-indigo-500 text-white shadow-lg animate-pulse'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>

                    {/* Contenido del Paso */}
                    <div className="ml-8">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className={`h-6 w-6 transition-colors duration-300 ${
                          step.status === 'completed'
                            ? 'text-emerald-600'
                            : step.status === 'active'
                            ? 'text-indigo-600'
                            : 'text-gray-400'
                        }`} />
                        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                          step.status === 'completed'
                            ? 'text-emerald-800'
                            : step.status === 'active'
                            ? 'text-indigo-800'
                            : 'text-gray-700'
                        }`}>
                          {step.title}
                        </h3>
                        <div className="ml-auto text-sm font-medium text-gray-500">
                          {step.status === 'active' ? `${Math.round(stepPct)}%` : 
                           step.status === 'completed' ? '100%' : '0%'}
                        </div>
                      </div>
                      
                      <p className={`text-sm transition-colors duration-300 ${
                        step.status === 'completed'
                          ? 'text-emerald-700'
                          : step.status === 'active'
                          ? 'text-indigo-700'
                          : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>

                      {/* Detalles del Paso */}
                      {step.status === 'active' && step.details && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="mt-3 text-xs text-indigo-700 space-y-1"
                        >
                          {step.details.map((detail, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1, duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              {detail}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}

                      {/* Barra de Progreso del Paso */}
                      {step.status === 'active' && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className="mt-3"
                        >
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${stepPct}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Línea de Conexión */}
                    {i < steps.length - 1 && (
                      <div className={`absolute left-6 top-full w-0.5 h-6 transition-all duration-500 ${
                        step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="text-center">
              <motion.p
                key={running ? 'running' : 'complete'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-600 font-medium"
              >
                {running 
                  ? `Procesando paso ${current + 1} de ${steps.length}...`
                  : totalPct === 100 
                    ? '¡Proceso completado exitosamente! 🎉'
                    : 'Listo para comenzar...'
                }
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
