import React from 'react';
import { formatearMoneda } from '../utils/calculations.js';

const SistemaPrioridades = ({ distribucion }) => {
  const prioridades = { 1: [], 2: [], 3: [], 4: [] };

  distribucion.forEach(item => {
    if (!item.esSagrado) prioridades[item.prioridad].push(item);
  });

  const sagrado = distribucion.find(item => item.esSagrado);

  const renderBarraProgreso = (porcentaje, color) => (
    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(porcentaje, 100)}%`, backgroundColor: color }}
      />
    </div>
  );

  const renderFilaCategoria = (item) => {
    const estaCompleto = item.estado === 'OK';

    return (
      <tr key={item.numero} className="hover:bg-white/[0.02] transition-premium border-b border-white/[0.04] last:border-0">
        <td className="px-4 py-3 text-xs text-dark-textSecondary font-mono">{item.numero}</td>
        <td className="px-4 py-3 font-medium text-silver-bright text-sm">{item.categoria}</td>
        <td className="px-4 py-3 text-xs text-dark-textSecondary font-mono">{formatearMoneda(item.meta, 'USD')}</td>
        <td className="px-4 py-3 text-xs font-semibold font-mono" style={{ color: item.color }}>
          {formatearMoneda(item.asignado, 'USD')}
        </td>
        <td className="px-4 py-3 text-xs text-dark-textSecondary font-mono">{formatearMoneda(item.gastado, 'USD')}</td>
        <td className="px-4 py-3 text-xs text-dark-textSecondary font-mono">{formatearMoneda(item.disponible, 'USD')}</td>
        <td className="px-4 py-3 min-w-[140px]">
          <div className="flex items-center gap-2">
            <div className="flex-1">{renderBarraProgreso(item.porcentajeCumplido, item.color)}</div>
            <span className="text-xs font-mono text-dark-textSecondary min-w-[40px] text-right">
              {item.porcentajeCumplido}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider border ${
            estaCompleto
              ? 'bg-silver/10 text-silver-bright border-silver/20'
              : 'bg-silver-muted/20 text-silver-dim border-silver-deep/30'
          }`}>
            {item.estado}
          </span>
        </td>
      </tr>
    );
  };

  const renderNivelPrioridad = (nivel, items, color, nombre) => {
    if (items.length === 0) return null;

    return (
      <div key={nivel} className="glass-card rounded-premium overflow-hidden border border-white/[0.06] mb-4">
        {/* Header del nivel */}
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderLeft: `3px solid ${color}` }}>
          <span className="font-display text-xs font-semibold tracking-widest" style={{ color }}>
            {nombre}
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['#', 'Categoría', 'Meta', 'Asignado', 'Gastado', 'Disponible', 'Progreso', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-silver-deep uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => renderFilaCategoria(item))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">

      {/* Header */}
      <div className="glass-card rounded-premium p-5 shadow-elevation-1 border border-silver/10">
        <h1 className="font-display text-2xl font-bold text-silver tracking-widest mb-1">PRIORIDADES</h1>
        <p className="text-dark-textSecondary text-sm">Distribución en Cascada Automática</p>
      </div>

      {/* Sagrado 40% */}
      {sagrado && (
        <div className="glass-card rounded-premium p-6 border border-silver/20 shadow-glow-silver relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-silver opacity-[0.03] pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs text-silver-dark mb-2 font-bold flex items-center gap-2 uppercase tracking-widest">
                <span>⬡</span>
                <span>{sagrado.categoria}</span>
              </div>
              <div className="text-5xl font-bold text-gradient-silver font-mono mb-2">
                {formatearMoneda(sagrado.asignado, 'USD')}
              </div>
              <div className="text-xs text-dark-textSecondary">
                Apartado automáticamente antes de cualquier distribución
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-6xl font-bold text-gradient-silver shimmer">40%</div>
              <div className="text-xs text-silver-deep mt-1 tracking-widest">INTOCABLE</div>
            </div>
          </div>
        </div>
      )}

      {/* Explicación */}
      <div className="glass-card rounded-premium p-5 border border-silver/10">
        <h3 className="font-semibold text-silver-dark mb-3 text-sm uppercase tracking-wider">¿Cómo funciona la cascada?</h3>
        <ul className="text-sm text-dark-textSecondary space-y-1.5">
          <li>· El 60% restante se distribuye en orden estricto de prioridad</li>
          <li>· Una categoría solo recibe fondos si las anteriores están completas</li>
          <li>· El dinero "cae en cascada" hasta donde alcance</li>
          <li>· Estado OK = Meta cumplida · PENDIENTE = Necesita más fondos</li>
        </ul>
      </div>

      {/* Niveles */}
      {renderNivelPrioridad(1, prioridades[1], '#e8e8e8', 'PRIORIDAD 01 — Crítico')}
      {renderNivelPrioridad(2, prioridades[2], '#c0c0c0', 'PRIORIDAD 02 — Importante')}
      {renderNivelPrioridad(3, prioridades[3], '#a0a0a0', 'PRIORIDAD 03 — Inversiones')}
      {renderNivelPrioridad(4, prioridades[4], '#808080', 'PRIORIDAD 04 — Calidad de vida')}
    </div>
  );
};

export default SistemaPrioridades;
