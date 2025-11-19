import React from 'react';

/**
 * CUSTOM TOOLTIP PARA REACT JOYRIDE
 *
 * Tooltip personalizado con glassmorphism y diseño FinFlow:
 * - Max-width: 400px
 * - Contador "Paso X de 15" visible
 * - Glassmorphism con colores gold/yellow
 * - Oculta botones en pasos con acción requerida (hideFooter)
 * - Botones claros: [Siguiente] [Atrás] [Saltar Tutorial]
 */

const TutorialTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size
}) => {
  // Detectar si este paso requiere acción (hideFooter)
  const hideFooter = step.hideFooter || false;

  return (
    <div
      {...tooltipProps}
      className="bg-gray-900/95 backdrop-blur-xl rounded-premium p-6 shadow-elevation-3 border border-gold/20"
      style={{
        ...tooltipProps.style,
        maxWidth: '400px',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      {/* Header con contador */}
      <div className="mb-4 pb-3 border-b border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Paso {index + 1} de {size}
          </div>
          {/* Botón de cerrar (X) */}
          <button
            {...closeProps}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all"
            aria-label="Cerrar tutorial"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="tutorial-step-content mb-4">
        {step.content}
      </div>

      {/* Footer con botones - Solo si NO es hideFooter */}
      {!hideFooter && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-700/50">
          {/* Botón Skip (Saltar) - Solo si no es el último paso */}
          <div className="flex-shrink-0">
            {!isLastStep && (
              <button
                {...skipProps}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50 border border-gray-700/50"
              >
                ⏭️ Saltar Tutorial
              </button>
            )}
          </div>

          {/* Botones de navegación */}
          <div className="flex items-center gap-2">
            {/* Botón Atrás */}
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 text-sm bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all shadow-sm"
              >
                ← Atrás
              </button>
            )}

            {/* Botón Siguiente/Finalizar */}
            <button
              {...primaryProps}
              className="px-6 py-2 text-sm bg-gradient-gold text-black font-semibold rounded-button hover:brightness-110 transition-all shadow-elevation-1 flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <span>🚀 Comenzar a usar FinFlow</span>
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mensaje especial para pasos con acción requerida */}
      {hideFooter && (
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
            <span className="italic">Esperando tu acción para continuar...</span>
          </div>
        </div>
      )}

      {/* Barra de progreso visual */}
      <div className="mt-4 pt-3 border-t border-gray-700/30">
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-gold h-full transition-all duration-500 ease-out"
            style={{
              width: `${((index + 1) / size) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TutorialTooltip;
