import React, { useState, useMemo } from 'react';
import { formatearMoneda, formatearFecha } from '../utils/calculations.js';
import { EMPRESAS, CATEGORIAS, MONEDAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Historial = ({ ingresos, gastos, onEliminar, onEditar, language, displayCurrency, exchangeRate }) => {
  const { t } = useTranslation(language);
  const rate = exchangeRate?.USD_ARS || 1427.99;
  const [filtros, setFiltros] = useState({
    tipo: 'todos', // todos, ingresos, gastos
    empresa: 'todas',
    categoria: 'todas',
    moneda: 'todas',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Combinar ingresos y gastos en una sola lista
  const transacciones = useMemo(() => {
    const ingresosConTipo = ingresos.map(i => ({ ...i, tipo: 'ingreso' }));
    const gastosConTipo = gastos.map(g => ({ ...g, tipo: 'gasto' }));
    return [...ingresosConTipo, ...gastosConTipo].sort((a, b) =>
      new Date(b.fecha) - new Date(a.fecha)
    );
  }, [ingresos, gastos]);

  // Aplicar filtros
  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      // Filtro por tipo
      if (filtros.tipo !== 'todos' && t.tipo !== filtros.tipo) return false;

      // Filtro por empresa (solo para ingresos)
      if (filtros.empresa !== 'todas' && t.tipo === 'ingreso' && t.empresa !== filtros.empresa) return false;

      // Filtro por categoría (solo para gastos)
      if (filtros.categoria !== 'todas' && t.tipo === 'gasto' && t.categoria !== filtros.categoria) return false;

      // Filtro por moneda
      if (filtros.moneda !== 'todas' && t.moneda !== filtros.moneda) return false;

      // Filtro por fecha desde
      if (filtros.fechaDesde && t.fecha < filtros.fechaDesde) return false;

      // Filtro por fecha hasta
      if (filtros.fechaHasta && t.fecha > filtros.fechaHasta) return false;

      return true;
    });
  }, [transacciones, filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: 'todos',
      empresa: 'todas',
      categoria: 'todas',
      moneda: 'todas',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const handleEliminar = (id, tipo) => {
    const mensaje = language === 'es'
      ? '¿Estás seguro de que deseas eliminar esta transacción?'
      : 'Are you sure you want to delete this transaction?';
    if (window.confirm(mensaje)) {
      onEliminar(id, tipo);
    }
  };

  const renderTransaccion = (transaccion) => {
    const esIngreso = transaccion.tipo === 'ingreso';

    return (
      <div
        key={transaccion.id}
        className="glass-card dark:glass-card p-4 rounded-premium shadow-elevation-1 hover:shadow-elevation-2 transition-premium border border-white/10"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  esIngreso
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {esIngreso ? `↑ ${t('history.income') || 'Ingreso'}` : `↓ ${t('history.expense') || 'Gasto'}`}
              </span>
              <span className="text-sm text-dark-textSecondary dark:text-dark-textSecondary">
                {formatearFecha(transaccion.fecha)}
              </span>
            </div>

            <div className="font-semibold text-dark-text dark:text-dark-text mb-1">
              {esIngreso ? transaccion.empresa : transaccion.categoria}
            </div>

            {transaccion.descripcion && (
              <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {transaccion.descripcion}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-dark-textSecondary dark:text-dark-textSecondary">
              {esIngreso && (
                <>
                  <span>📍 {transaccion.metodoCobro}</span>
                  <span>📄 {transaccion.tipoPago}</span>
                  {transaccion.cliente && <span>👤 {transaccion.cliente}</span>}
                </>
              )}
              {!esIngreso && (
                <span>📍 {transaccion.metodoPago}</span>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <div
              className={`text-xl font-bold font-mono mb-3 ${
                esIngreso ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              }`}
            >
              {esIngreso ? '+' : '-'}{formatearMoneda(transaccion.monto, displayCurrency, rate)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditar(transaccion, transaccion.tipo)}
                className="glass-card dark:glass-card px-3 py-1.5 rounded-button text-gold hover:shadow-elevation-1 transition-premium border border-gold/20 flex items-center gap-1"
                title={t('history.edit') || 'Editar'}
              >
                <PencilIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{t('history.edit') || 'Editar'}</span>
              </button>
              <button
                onClick={() => handleEliminar(transaccion.id, transaccion.tipo)}
                className="glass-card dark:glass-card px-3 py-1.5 rounded-button text-red-500 hover:shadow-elevation-1 transition-premium border border-red-500/20 flex items-center gap-1"
                title={t('history.delete') || 'Eliminar'}
              >
                <TrashIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{t('history.delete') || 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header Premium */}
      <div className="glass-card dark:glass-card rounded-premium p-6 shadow-elevation-2 border border-gold/20">
        <h1 className="text-4xl font-bold text-gradient-gold mb-2">{t('history.title') || 'Historial'}</h1>
        <p className="text-dark-textSecondary dark:text-dark-textSecondary">
          {transaccionesFiltradas.length} {t('history.of') || 'de'} {transacciones.length} {t('history.transactions') || 'transacciones'}
        </p>
      </div>

      {/* Botón para mostrar/ocultar filtros */}
      <button
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        className="w-full glass-card dark:glass-card p-4 rounded-premium shadow-elevation-1 text-left font-medium text-dark-text dark:text-dark-text hover:shadow-elevation-2 transition-premium border border-white/10"
      >
        🔍 {t('history.filters') || 'Filtros'} {mostrarFiltros ? '▲' : '▼'}
      </button>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="glass-card dark:glass-card p-4 rounded-premium shadow-elevation-1 space-y-3 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterType') || 'Tipo'}
              </label>
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="todos" className="dark:bg-gray-800">{t('history.all') || 'Todos'}</option>
                <option value="ingreso" className="dark:bg-gray-800">{t('history.incomes') || 'Ingresos'}</option>
                <option value="gasto" className="dark:bg-gray-800">{t('history.expenses') || 'Gastos'}</option>
              </select>
            </div>

            {/* Filtro por empresa */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterCompany') || 'Empresa'}
              </label>
              <select
                name="empresa"
                value={filtros.empresa}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="todas" className="dark:bg-gray-800">{t('history.allCompanies') || 'Todas'}</option>
                {EMPRESAS.map(empresa => (
                  <option key={empresa} value={empresa} className="dark:bg-gray-800">{empresa}</option>
                ))}
              </select>
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterCategory') || 'Categoría'}
              </label>
              <select
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="todas" className="dark:bg-gray-800">{t('history.allCategories') || 'Todas'}</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria} className="dark:bg-gray-800">{categoria}</option>
                ))}
              </select>
            </div>

            {/* Filtro por moneda */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterCurrency') || 'Moneda'}
              </label>
              <select
                name="moneda"
                value={filtros.moneda}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="todas" className="dark:bg-gray-800">{t('history.allCurrencies') || 'Todas'}</option>
                {MONEDAS.map(moneda => (
                  <option key={moneda} value={moneda} className="dark:bg-gray-800">{moneda}</option>
                ))}
              </select>
            </div>

            {/* Filtro fecha desde */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterFrom') || 'Desde'}
              </label>
              <input
                type="date"
                name="fechaDesde"
                value={filtros.fechaDesde}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>

            {/* Filtro fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-dark-textSecondary dark:text-dark-textSecondary mb-1">
                {t('history.filterTo') || 'Hasta'}
              </label>
              <input
                type="date"
                name="fechaHasta"
                value={filtros.fechaHasta}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={limpiarFiltros}
            className="w-full glass-card dark:glass-card text-dark-text dark:text-dark-text py-2 px-4 rounded-button hover:shadow-elevation-1 transition-premium text-sm font-medium border border-white/10"
          >
            {t('history.clearFilters') || 'Limpiar Filtros'}
          </button>
        </div>
      )}

      {/* Lista de transacciones */}
      {transaccionesFiltradas.length > 0 ? (
        <div className="space-y-3">
          {transaccionesFiltradas.map(transaccion => renderTransaccion(transaccion))}
        </div>
      ) : (
        <div className="glass-card dark:glass-card p-8 rounded-premium shadow-elevation-1 text-center border border-white/10">
          <p className="text-dark-textSecondary dark:text-dark-textSecondary text-lg mb-2">
            {t('history.noTransactions') || 'No hay transacciones'}
          </p>
          <p className="text-dark-textSecondary dark:text-dark-textSecondary text-sm opacity-75">
            {transacciones.length > 0
              ? (t('history.tryAdjustingFilters') || 'Prueba ajustando los filtros')
              : (t('history.startAdding') || 'Comienza agregando ingresos y gastos')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Historial;
