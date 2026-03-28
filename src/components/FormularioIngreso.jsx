import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EMPRESAS, METODOS_COBRO, TIPOS_PAGO, MONEDAS } from '../data/constants.js';

const FormularioIngreso = ({ onGuardar, onCancelar }) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha:       hoy,
    empresa:     EMPRESAS[0],
    metodoCobro: METODOS_COBRO[0],
    tipoPago:    TIPOS_PAGO[0],
    moneda:      MONEDAS[1],
    monto:       '',
    descripcion: '',
    cliente:     ''
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
            <h1 className="font-display text-xl font-semibold text-silver tracking-widest">NUEVO INGRESO</h1>
            <p className="text-dark-textSecondary text-xs mt-0.5">Registra un ingreso</p>
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

          {/* Empresa */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Empresa *</label>
            <select name="empresa" value={formData.empresa} onChange={handleChange} required className="input-premium">
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Método de Cobro */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Método de Cobro *</label>
            <select name="metodoCobro" value={formData.metodoCobro} onChange={handleChange} required className="input-premium">
              {METODOS_COBRO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Tipo de Pago *</label>
            <select name="tipoPago" value={formData.tipoPago} onChange={handleChange} required className="input-premium">
              {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
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

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-silver-dark mb-2 uppercase tracking-wider">Cliente</label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              placeholder="Nombre del cliente (opcional)"
              className="input-premium"
            />
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
            <button type="submit" className="flex-1 btn-premium py-3 text-sm tracking-widest">
              GUARDAR INGRESO
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

export default FormularioIngreso;
