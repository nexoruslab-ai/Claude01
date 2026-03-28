import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIAS, METODOS_COBRO, MONEDAS } from '../data/constants.js';

const FormularioGasto = ({ onGuardar, onCancelar }) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha:       hoy,
    categoria:   CATEGORIAS[0],
    metodoPago:  METODOS_COBRO[0],
    moneda:      MONEDAS[1],
    monto:       '',
    descripcion: ''
  });

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
    onGuardar({ id: uuidv4(), ...formData, monto: Number(formData.monto) });
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20 animate-fadeIn">

      {/* Header */}
      <div className="glass-card border-b border-white/[0.06] px-6 py-5 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancelar}
            className="text-silver-dim hover:text-silver transition-premium text-lg"
          >
            ←
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-silver tracking-widest">NUEVO GASTO</h1>
            <p className="text-dark-textSecondary text-xs mt-0.5">Registra un gasto</p>
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
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Método de Pago *</label>
            <select name="metodoPago" value={formData.metodoPago} onChange={handleChange} required className="input-premium">
              {METODOS_COBRO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Moneda + Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Moneda *</label>
              <select name="moneda" value={formData.moneda} onChange={handleChange} required className="input-premium">
                {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
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
            <button type="submit" className="flex-1 bg-silver-muted text-silver-bright py-3 rounded-button font-semibold hover:bg-silver-deep transition-premium shadow-elevation-1 text-sm tracking-widest">
              GUARDAR GASTO
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
