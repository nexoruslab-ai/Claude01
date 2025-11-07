import React, { useState, useMemo } from 'react';
import { formatearMoneda, formatearFecha } from '../utils/calculations.js';
import { EMPRESAS, CATEGORIAS, MONEDAS } from '../data/constants.js';

const Historial = ({ ingresos, gastos, onEliminar }) => {
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
    if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      onEliminar(id, tipo);
    }
  };

  const renderTransaccion = (transaccion) => {
    const esIngreso = transaccion.tipo === 'ingreso';

    return (
      <div
        key={transaccion.id}
        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  esIngreso
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {esIngreso ? '↑ Ingreso' : '↓ Gasto'}
              </span>
              <span className="text-sm text-gray-500">
                {formatearFecha(transaccion.fecha)}
              </span>
            </div>

            <div className="font-semibold text-gray-800 mb-1">
              {esIngreso ? transaccion.empresa : transaccion.categoria}
            </div>

            {transaccion.descripcion && (
              <div className="text-sm text-gray-600 mb-1">
                {transaccion.descripcion}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
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
              className={`text-xl font-bold ${
                esIngreso ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {esIngreso ? '+' : '-'}{formatearMoneda(transaccion.monto, transaccion.moneda)}
            </div>
            <button
              onClick={() => handleEliminar(transaccion.id, transaccion.tipo)}
              className="mt-2 text-red-500 hover:text-red-700 text-sm"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Historial</h1>
        <p className="text-indigo-100">
          {transaccionesFiltradas.length} de {transacciones.length} transacciones
        </p>
      </div>

      {/* Botón para mostrar/ocultar filtros */}
      <button
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
        className="w-full bg-white p-4 rounded-lg shadow text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        🔍 Filtros {mostrarFiltros ? '▲' : '▼'}
      </button>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="bg-white p-4 rounded-lg shadow space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="gasto">Gastos</option>
              </select>
            </div>

            {/* Filtro por empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                name="empresa"
                value={filtros.empresa}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="todas">Todas</option>
                {EMPRESAS.map(empresa => (
                  <option key={empresa} value={empresa}>{empresa}</option>
                ))}
              </select>
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="todas">Todas</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            {/* Filtro por moneda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                name="moneda"
                value={filtros.moneda}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="todas">Todas</option>
                {MONEDAS.map(moneda => (
                  <option key={moneda} value={moneda}>{moneda}</option>
                ))}
              </select>
            </div>

            {/* Filtro fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                name="fechaDesde"
                value={filtros.fechaDesde}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filtro fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                name="fechaHasta"
                value={filtros.fechaHasta}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <button
            onClick={limpiarFiltros}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Lista de transacciones */}
      {transaccionesFiltradas.length > 0 ? (
        <div className="space-y-3">
          {transaccionesFiltradas.map(transaccion => renderTransaccion(transaccion))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg mb-2">No hay transacciones</p>
          <p className="text-gray-400 text-sm">
            {transacciones.length > 0
              ? 'Prueba ajustando los filtros'
              : 'Comienza agregando ingresos y gastos'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Historial;
