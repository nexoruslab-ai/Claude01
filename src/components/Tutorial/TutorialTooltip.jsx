import React from 'react';

/**
 * CUSTOM TOOLTIP PARA REACT JOYRIDE
 *
 * Aplica el estilo glassmorphism y la paleta de colores de FinFlow
 * al tooltip del tutorial.
 *
 * Features:
 * - Glassmorphism (backdrop-blur, transparencia)
 * - Colores gold/yellow del tema
 * - Bordes redondeados premium
 * - Sombras elevadas
 * - Botones estilizados con el diseño de FinFlow
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
  return (
    <div
      {...tooltipProps}
      className="bg-gray-900/95 backdrop-blur-xl rounded-premium p-6 shadow-elevation-3 border border-gold/20 max-w-[480px]"
      style={{
        ...tooltipProps.style,
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      {/* Contenido del paso */}
      <div className="tutorial-step-content mb-6">
        {step.content}
      </div>

      {/* Footer con botones */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-700/50">
        {/* Contador de progreso */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-semibold text-gold">
            {index + 1}
          </span>
          <span>/</span>
          <span>{size}</span>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-2">
          {/* Botón Skip (Saltar) */}
          {!isLastStep && (
            <button
              {...skipProps}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800/50"
            >
              ⏭️ {skipProps['aria-label'] || 'Saltar'}
            </button>
          )}

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
                <span>🎉 Finalizar</span>
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

      {/* Indicador visual de progreso */}
      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-gold h-full transition-all duration-500 ease-out"
            style={{
              width: `${((index + 1) / size) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Botón de cerrar (X) en la esquina */}
      <button
        {...closeProps}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all"
        aria-label="Cerrar tutorial"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default TutorialTooltip;
