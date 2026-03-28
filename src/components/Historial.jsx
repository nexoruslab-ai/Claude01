import React, { useState, useMemo } from 'react';
import { formatearMoneda, formatearFecha } from '../utils/calculations.js';
import { EMPRESAS, CATEGORIAS, MONEDAS } from '../data/constants.js';

const Historial = ({ ingresos, gastos, onEliminar }) => {
  const [filtros, setFiltros] = useState({
    tipo:       'todos',
    empresa:    'todas',
    categoria:  'todas',
    moneda:     'todas',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const transacciones = useMemo(() => {
    const i = ingresos.map(t => ({ ...t, tipo: 'ingreso' }));
    const g = gastos.map(t => ({ ...t, tipo: 'gasto' }));
    return [...i, ...g].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ingresos, gastos]);

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      if (filtros.tipo      !== 'todos'  && t.tipo      !== filtros.tipo)      return false;
      if (filtros.empresa   !== 'todas'  && t.tipo === 'ingreso' && t.empresa  !== filtros.empresa)  return false;
      if (filtros.categoria !== 'todas'  && t.tipo === 'gasto'   && t.categoria !== filtros.categoria) return false;
      if (filtros.moneda    !== 'todas'  && t.moneda    !== filtros.moneda)    return false;
      if (filtros.fechaDesde             && t.fecha     <  filtros.fechaDesde) return false;
      if (filtros.fechaHasta             && t.fecha     >  filtros.fechaHasta) return false;
      return true;
    });
  }, [transacciones, filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () =>
    setFiltros({ tipo: 'todos', empresa: 'todas', categoria: 'todas', moneda: 'todas', fechaDesde: '', fechaHasta: '' });

  const handleEliminar = (id, tipo) => {
    if (window.confirm('¿Eliminar esta transacción?')) onEliminar(id, tipo);
  };

  const renderTransaccion = (t) => {
    const esIngreso = t.tipo === 'ingreso';

    return (
      <div key={t.id} className="glass-card rounded-premium p-4 border border-white/[0.06] hover:border-silver/15 transition-premium">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider border ${
                esIngreso
                  ? 'bg-silver/10 text-silver-bright border-silver/20'
                  : 'bg-silver-muted/30 text-silver-dim border-silver-deep/30'
              }`}>
                {esIngreso ? '↑ INGRESO' : '↓ GASTO'}
              </span>
              <span className="text-xs text-dark-textSecondary">{formatearFecha(t.fecha)}</span>
            </div>

            <div className="font-semibold text-silver-bright mb-1 truncate">
              {esIngreso ? t.empresa : t.categoria}
            </div>

            {t.descripcion && (
              <div className="text-sm text-dark-textSecondary mb-1 line-clamp-1">{t.descripcion}</div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-silver-deep">
              {esIngreso && (
                <>
                  <span>{t.metodoCobro}</span>
                  <span>{t.tipoPago}</span>
                  {t.cliente && <span>{t.cliente}</span>}
                </>
              )}
              {!esIngreso && <span>{t.metodoPago}</span>}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className={`text-xl font-bold font-mono ${esIngreso ? 'text-silver-bright' : 'text-silver-dim'}`}>
              {esIngreso ? '+' : '−'}{formatearMoneda(t.monto, t.moneda)}
            </div>
            <button
              onClick={() => handleEliminar(t.id, t.tipo)}
              className="mt-2 text-silver-deep hover:text-silver-dim text-xs transition-premium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectCls = "w-full px-3 py-2 rounded-button text-sm bg-dark-bgSecondary border border-white/[0.08] text-dark-text focus:outline-none focus:border-silver/30 transition-premium";

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">

      {/* Header */}
      <div className="glass-card rounded-premium p-5 shadow-elevation-1 border border-silver/10">
        <h1 className="font-display text-2xl font-bold text-silver tracking-widest mb-1">HISTORIAL</h1>
        <p className="text-dark-textSecondary text-sm">
          {transaccionesFiltradas.length} de {transacciones.length} transacciones
        </p>
      </div>

      {/* Toggle filtros */}
      <button
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        className="w-full glass-card p-4 rounded-premium text-left font-medium text-silver-dark hover:border-silver/20 border border-white/[0.06] transition-premium text-sm tracking-wider"
      >
        ⊞ FILTROS {mostrarFiltros ? '▲' : '▼'}
      </button>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="glass-card p-5 rounded-premium border border-white/[0.06] space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Tipo</label>
              <select name="tipo" value={filtros.tipo} onChange={handleFiltroChange} className={selectCls}>
                <option value="todos">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Empresa</label>
              <select name="empresa" value={filtros.empresa} onChange={handleFiltroChange} className={selectCls}>
                <option value="todas">Todas</option>
                {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Categoría</label>
              <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className={selectCls}>
                <option value="todas">Todas</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Moneda</label>
              <select name="moneda" value={filtros.moneda} onChange={handleFiltroChange} className={selectCls}>
                <option value="todas">Todas</option>
                {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Desde</label>
              <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange}
                className={selectCls} style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-1 uppercase tracking-wider">Hasta</label>
              <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange}
                className={selectCls} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <button
            onClick={limpiarFiltros}
            className="w-full bg-dark-bgSecondary text-dark-textSecondary py-2 px-4 rounded-button hover:bg-silver-muted/20 transition-premium text-sm font-medium border border-white/[0.06]"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Lista de transacciones */}
      {transaccionesFiltradas.length > 0 ? (
        <div className="space-y-3">
          {transaccionesFiltradas.map(t => renderTransaccion(t))}
        </div>
      ) : (
        <div className="glass-card p-12 rounded-premium text-center border border-white/[0.06]">
          <p className="text-dark-textSecondary text-lg mb-2">Sin transacciones</p>
          <p className="text-silver-deep text-sm">
            {transacciones.length > 0 ? 'Ajusta los filtros' : 'Comienza agregando ingresos y gastos'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Historial;
