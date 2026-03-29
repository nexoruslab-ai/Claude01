import React, { useEffect, useState } from 'react';
import {
  XMarkIcon, ChevronRightIcon, ChevronLeftIcon,
  SparklesIcon, CheckIcon,
} from '@heroicons/react/24/outline';

/* ── Pasos del tutorial ─────────────────────────────────────────────────── */
export const TUTORIAL_STEPS = [
  {
    seccion: 'dashboard',
    icono: '👋',
    titulo: 'Bienvenido a DENARIUM',
    subtitulo: 'Tu sistema de control financiero',
    desc: 'DENARIUM centraliza todo tu flujo de dinero en un solo lugar. En esta pantalla ves tu balance integrado, patrimonio en cuentas y el estado de tus negocios en tiempo real.',
    tag: 'INICIO',
  },
  {
    seccion: 'dashboard',
    icono: '📊',
    titulo: 'Balance Financiero',
    subtitulo: 'El corazón del sistema',
    desc: 'El balance integra automáticamente tus transacciones formales y los cobros de negocios. El % de Ahorro Sagrado se aparta de cada ingreso y el resto fluye en cascada de prioridades.',
    tag: 'DASHBOARD',
  },
  {
    seccion: 'cuentas',
    icono: '🏦',
    titulo: 'Gestión de Cuentas',
    subtitulo: 'Tu patrimonio en un vistazo',
    desc: 'Registrá tus cuentas bancarias y wallets — Wise, PayPal, Stripe, Binance, banco local o cualquier otra. Podés configurar retenciones de fondos con fechas de liberación automática.',
    tag: 'CUENTAS',
  },
  {
    seccion: 'negocios',
    icono: '💼',
    titulo: 'Negocios & Freelance',
    subtitulo: 'Tus fuentes de ingresos',
    desc: 'Registrá tus negocios o proyectos freelance con sus pagos pendientes, cobrados y cancelados. El sistema calcula tu ganancia según el porcentaje de comisión configurado.',
    tag: 'NEGOCIOS',
  },
  {
    seccion: 'proyectos',
    icono: '🗂️',
    titulo: 'Proyectos',
    subtitulo: 'Pipeline de trabajo activo',
    desc: 'Seguí el avance de tus proyectos con presupuesto, estado y progreso. Ideal para tener claridad sobre tu carga de trabajo y facturación futura.',
    tag: 'PROYECTOS',
  },
  {
    seccion: 'registros',
    icono: '📈',
    titulo: 'Registros y Estadísticas',
    subtitulo: 'Analiza tu flujo de dinero',
    desc: 'Vista unificada de todos tus movimientos: estadísticas por negocio, timeline cronológico de transacciones y análisis comparativo entre fuentes de ingreso.',
    tag: 'REGISTROS',
  },
  {
    seccion: 'configuracion',
    icono: '⚙️',
    titulo: 'Configuración Total',
    subtitulo: 'Adaptalo a tu realidad',
    desc: 'Personalizá todo para que funcione con tu negocio: activá las monedas que usás, actualizá las tasas de cambio, y editá categorías, fuentes y métodos de cobro.',
    tag: 'CONFIG',
  },
  {
    seccion: 'dashboard',
    icono: '🚀',
    titulo: '¡Todo listo!',
    subtitulo: 'DENARIUM está configurado para vos',
    desc: 'Usá el botón + en la barra inferior para registrar tu primera transacción. Todos los datos se guardan localmente en tu dispositivo, seguros y privados.',
    tag: 'FIN',
    esFinal: true,
  },
];

/* ── Indicadores de paso ─────────────────────────────────────────────────── */
const StepDots = ({ total, actual }) => (
  <div className="flex items-center gap-1.5 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i}
        className={`rounded-full transition-all duration-300 ${
          i === actual
            ? 'w-5 h-1.5 bg-violet-400'
            : i < actual
              ? 'w-1.5 h-1.5 bg-violet-600/60'
              : 'w-1.5 h-1.5 bg-white/15'
        }`}
      />
    ))}
  </div>
);

/* ── Overlay principal ──────────────────────────────────────────────────── */
const TutorialOverlay = ({ step, onNext, onPrev, onClose, onNavigate }) => {
  const [visible,   setVisible]   = useState(false);
  const [animCard,  setAnimCard]  = useState(false);
  const [prevStep,  setPrevStep]  = useState(step);

  // Entrada inicial
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true),   10);
    const t2 = setTimeout(() => setAnimCard(true),  80);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Navegar a la sección del paso actual
  useEffect(() => {
    const s = TUTORIAL_STEPS[step];
    if (s) onNavigate(s.seccion);
    // Animar cambio de paso
    if (step !== prevStep) {
      setAnimCard(false);
      const t = setTimeout(() => setAnimCard(true), 120);
      setPrevStep(step);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const current   = TUTORIAL_STEPS[step];
  const total     = TUTORIAL_STEPS.length;
  const esPrimero = step === 0;
  const esUltimo  = step === total - 1;

  if (!current) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleNext = () => {
    if (esUltimo) { handleClose(); return; }
    onNext();
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col justify-end transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: 'all' }}
    >
      {/* ── Backdrop con blur purple-tinted ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(109,40,217,0.12) 0%, rgba(0,0,0,0.88) 65%)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
        onClick={handleClose}
      />

      {/* ── Partículas decorativas (purple dots) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width:  `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              background: 'radial-gradient(circle, #a78bfa, #7c3aed)',
              left:  `${10 + i * 15}%`,
              top:   `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ── Botón cerrar (top right) ── */}
      <button onClick={handleClose}
        className="absolute top-16 right-4 z-10 w-9 h-9 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all duration-200">
        <XMarkIcon className="w-4 h-4" />
      </button>

      {/* ── Counter top ── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 backdrop-blur-sm">
          <SparklesIcon className="w-3 h-3 text-violet-300" />
          <span className="text-[10px] font-semibold text-violet-200 tracking-widest">
            TUTORIAL · {step + 1} / {total}
          </span>
        </div>
      </div>

      {/* ── Tarjeta del paso (bottom sheet) ── */}
      <div
        className={`relative z-10 mx-3 mb-[80px] transition-all duration-300 ${
          animCard
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow detrás de la card */}
        <div
          className="absolute -inset-1 rounded-[22px] opacity-60 blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.45), transparent 70%)' }}
        />

        {/* Card glass con borde morado */}
        <div
          className="relative rounded-[20px] overflow-hidden"
          style={{
            background: 'rgba(15, 10, 30, 0.92)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(109, 40, 217, 0.2), 0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {/* Línea superior gradiente */}
          <div className="h-[2px] w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, #a78bfa, #8b5cf6, transparent)' }} />

          <div className="p-5">
            {/* Tag + emoji */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[9px] font-bold tracking-[0.2em] px-2 py-1 rounded-full"
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}
              >
                {current.tag}
              </span>
              <span className="text-2xl">{current.icono}</span>
            </div>

            {/* Título */}
            <h2
              className="font-display text-xl font-bold leading-tight mb-1"
              style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #f0abfc 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {current.titulo}
            </h2>
            <p className="text-[11px] text-violet-300/70 tracking-wider mb-3 uppercase font-semibold">
              {current.subtitulo}
            </p>

            {/* Descripción */}
            <p className="text-sm text-white/75 leading-relaxed mb-5">
              {current.desc}
            </p>

            {/* Step dots */}
            <StepDots total={total} actual={step} />

            {/* Botones de navegación */}
            <div className="flex gap-2.5 mt-4">
              {!esPrimero && (
                <button onClick={onPrev}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-xs font-semibold text-white/50 border border-white/10 hover:border-white/25 hover:text-white/80 transition-all duration-200">
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  Anterior
                </button>
              )}
              <button onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-bold tracking-wider transition-all duration-200 hover:brightness-110 hover:-translate-y-px active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea, #a855f7)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(139,92,246,0.4), 0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {esUltimo ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    COMENZAR
                  </>
                ) : (
                  <>
                    SIGUIENTE
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Saltar tutorial */}
            {!esUltimo && (
              <button onClick={handleClose}
                className="w-full mt-2.5 text-[10px] text-white/25 hover:text-white/50 transition-colors py-1 tracking-widest">
                SALTAR TUTORIAL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
