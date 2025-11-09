import React from 'react';
import { formatearMoneda } from '../utils/calculations.js';
import { useTranslation } from '../utils/i18n.js';
import { CogIcon } from '@heroicons/react/24/outline';

const SistemaPrioridades = ({ distribucion, language, displayCurrency, exchangeRate, onManagePriorities }) => {
  const { t } = useTranslation(language);
  const rate = exchangeRate?.USD_ARS || 1427.99;

  // Agrupar por nivel de prioridad
  const prioridades = {
    1: [],
    2: [],
    3: [],
    4: []
  };

  distribucion.forEach(item => {
    if (!item.esSagrado) {
      prioridades[item.prioridad].push(item);
    }
  });

  // Encontrar el Sagrado 40%
  const sagrado = distribucion.find(item => item.esSagrado);

  const renderBarraProgreso = (porcentaje, color) => {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(porcentaje, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  const renderFilaCategoria = (item) => {
    const estaCompleto = item.estado === 'OK';
    // Obtener nombre traducido: si idioma es inglés y existe nombreEn, usarlo; sino usar nombre español
    const nombreCategoria = (language === 'en' && item.nombreEn) ? item.nombreEn : item.categoria;
    // Agregar emoji si existe
    const displayName = item.emoji ? `${item.emoji} ${nombreCategoria}` : nombreCategoria;

    return (
      <tr key={item.numero} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.numero}</td>
        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{displayName}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {formatearMoneda(item.meta, displayCurrency, rate)}
        </td>
        <td className="px-4 py-3 text-sm font-semibold" style={{ color: item.color }}>
          {formatearMoneda(item.asignado, displayCurrency, rate)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {formatearMoneda(item.gastado, displayCurrency, rate)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          {formatearMoneda(item.disponible, displayCurrency, rate)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {renderBarraProgreso(item.porcentajeCumplido, item.color)}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[45px]">
              {item.porcentajeCumplido}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              estaCompleto
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {estaCompleto ? (t('priorities.statusOk') || 'OK') : (t('priorities.statusPending') || 'PENDIENTE')}
          </span>
        </td>
      </tr>
    );
  };

  const renderNivelPrioridad = (nivel, items, color, colorBg, nombre) => {
    if (items.length === 0) return null;

    return (
      <div key={nivel} className="glass-card dark:glass-card rounded-premium shadow-elevation-1 overflow-hidden mb-4 border border-white/10">
        {/* Header del nivel */}
        <div
          className="px-4 py-3 font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {nombre}
        </div>

        {/* Tabla de categorías */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.number') || '#'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.category') || 'Categoría'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.goal') || 'Meta'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.assigned') || 'Asignado'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.spent') || 'Gastado'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.available') || 'Disponible'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.progress') || 'Progreso'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('priorities.status') || 'Estado'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map(item => renderFilaCategoria(item))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header Premium */}
      <div className="glass-card dark:glass-card rounded-premium p-6 shadow-elevation-2 border border-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-gold mb-2">
              {t('priorities.title') || 'Sistema de Prioridades'}
            </h1>
            <p className="text-dark-textSecondary dark:text-dark-textSecondary">
              {t('priorities.subtitle') || 'Distribución en Cascada Automática'}
            </p>
          </div>

          {onManagePriorities && (
            <button
              onClick={onManagePriorities}
              className="px-4 py-2 bg-gradient-gold text-black rounded-button font-semibold hover:brightness-110 transition-all shadow-elevation-1 flex items-center gap-2 whitespace-nowrap"
            >
              <CogIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('priorities.customize')}</span>
              <span className="sm:hidden">⚙️</span>
            </button>
          )}
        </div>
      </div>

      {/* Sagrado 40% destacado */}
      {sagrado && (
        <div className="glass-card rounded-premium p-6 shadow-glow-gold border-2 border-gold/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-gold opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-yellow-900 dark:text-gold mb-1 font-bold flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span>{sagrado.categoria}</span>
                </div>
                <div className="text-5xl font-bold text-gradient-gold font-mono mb-2">
                  {formatearMoneda(sagrado.asignado, displayCurrency, rate)}
                </div>
                <div className="text-xs text-dark-textSecondary dark:text-dark-textSecondary">
                  {t('priorities.automaticallyBefore') || 'Apartado automáticamente SIEMPRE antes de cualquier distribución'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-7xl font-bold text-gradient-gold shimmer">40%</div>
                <div className="text-xs text-gold-dark mt-1">{t('dashboard.sacred40Subtitle') || '(Intocable)'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explicación del sistema */}
      <div className="glass-card dark:glass-card border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-premium shadow-elevation-1">
        <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">
          {t('priorities.howItWorks') || '¿Cómo funciona la cascada?'}
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          {(t('priorities.explanation') || [
            'El 60% restante se distribuye en orden estricto de prioridad',
            'Una categoría solo recibe dinero si las anteriores están completas',
            'El dinero "cae en cascada" hasta donde alcance',
            'Estado "OK" = Meta cumplida, "PENDIENTE" = Necesita más fondos'
          ]).map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>

      {/* Niveles de prioridad */}
      {renderNivelPrioridad(
        1,
        prioridades[1],
        '#dc2626',
        '#fee2e2',
        t('priorities.priority01') || 'PRIORIDAD 01 - Crítico'
      )}

      {renderNivelPrioridad(
        2,
        prioridades[2],
        '#ea580c',
        '#ffedd5',
        t('priorities.priority02') || 'PRIORIDAD 02 - Importante'
      )}

      {renderNivelPrioridad(
        3,
        prioridades[3],
        '#ca8a04',
        '#fef9c3',
        t('priorities.priority03') || 'PRIORIDAD 03 - Inversiones'
      )}

      {renderNivelPrioridad(
        4,
        prioridades[4],
        '#16a34a',
        '#dcfce7',
        t('priorities.priority04') || 'PRIORIDAD 04 - Calidad de vida'
      )}
    </div>
  );
};

export default SistemaPrioridades;
