import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIAS, METODOS_COBRO, MONEDAS } from '../data/constants.js';

const FormularioGasto = ({ onGuardar, onCancelar, transaccion, config }) => {
  const hoy = new Date().toISOString().split('T')[0];

  // Usar listas de config si están disponibles, sino fallback a constants
  const categorias     = config?.categoriasGastos?.length ? config.categoriasGastos : CATEGORIAS;
  const metodosCobro   = config?.metodosCobro?.length     ? config.metodosCobro     : METODOS_COBRO;
  const monedasActivas = config?.monedasActivas?.length   ? config.monedasActivas   : MONEDAS;

  const [formData, setFormData] = useState({
    fecha:       hoy,
    categoria:   categorias[0] || '',
    metodoPago:  metodosCobro[0] || '',
    moneda:      monedasActivas.includes('USD') ? 'USD' : monedasActivas[0] || 'USD',
    monto:       '',
    descripcion: ''
  });

  // Si estamos editando, prellenar con datos existentes
  useEffect(() => {
    if (transaccion) {
      setFormData({
        fecha:       transaccion.fecha       || hoy,
        categoria:   transaccion.categoria   || categorias[0] || '',
        metodoPago:  transaccion.metodoPago  || metodosCobro[0] || '',
        moneda:      transaccion.moneda      || 'USD',
        monto:       String(transaccion.monto || ''),
        descripcion: transaccion.descripcion || '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaccion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.monto || Number(formData.monto) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }
    onGuardar({
      id: transaccion?.id || uuidv4(),
      ...formData,
      monto: Number(formData.monto)
    });
  };

  const esEdicion = Boolean(transaccion);

  return (
    <div className="min-h-screen bg-dark-bg pb-20 animate-fadeIn">

      {/* Header */}
      <div className="glass-card border-b border-white/[0.06] px-6 py-5 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onCancelar}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-silver-dim hover:text-silver hover:border-silver/30 transition-premium">
            ←
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-silver tracking-widest">
              {esEdicion ? 'EDITAR GASTO' : 'NUEVO GASTO'}
            </h1>
            <p className="text-dark-textSecondary text-xs mt-0.5">
              {esEdicion ? 'Modifica los datos del gasto' : 'Registra un gasto en tu flujo'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="glass-card rounded-premium p-6 border border-silver/10 space-y-5">

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Fecha *</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="input-premium"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Categoría *</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} required className="input-premium">
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Método de Pago *</label>
            <select name="metodoPago" value={formData.metodoPago} onChange={handleChange} required className="input-premium">
              {metodosCobro.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Moneda + Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Moneda *</label>
              <select name="moneda" value={formData.moneda} onChange={handleChange} required className="input-premium">
                {monedasActivas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Monto *</label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-premium"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales (opcional)"
              rows="3"
              className="input-premium resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="flex-1 bg-silver-muted text-silver-bright py-3 rounded-button font-semibold hover:bg-silver-deep transition-premium shadow-elevation-1 text-sm tracking-widest">
              {esEdicion ? 'ACTUALIZAR' : 'GUARDAR GASTO'}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-dark-bgSecondary text-dark-textSecondary py-3 rounded-button font-semibold hover:bg-opacity-80 transition-premium border border-white/[0.06] text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioGasto;
