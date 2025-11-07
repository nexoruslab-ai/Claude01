import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EMPRESAS, METODOS_COBRO, TIPOS_PAGO, MONEDAS } from '../data/constants.js';

const FormularioIngreso = ({ onGuardar, onCancelar }) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: hoy,
    empresa: EMPRESAS[0],
    metodoCobro: METODOS_COBRO[0],
    tipoPago: TIPOS_PAGO[0],
    moneda: MONEDAS[1], // USD por defecto
    monto: '',
    descripcion: '',
    cliente: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.monto || Number(formData.monto) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    const nuevoIngreso = {
      id: uuidv4(),
      ...formData,
      monto: Number(formData.monto)
    };

    onGuardar(nuevoIngreso);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Nuevo Ingreso</h1>
        <p className="text-green-100">Registra un nuevo ingreso</p>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa *
            </label>
            <select
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {EMPRESAS.map(empresa => (
                <option key={empresa} value={empresa}>
                  {empresa}
                </option>
              ))}
            </select>
          </div>

          {/* Método de Cobro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Cobro *
            </label>
            <select
              name="metodoCobro"
              value={formData.metodoCobro}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {METODOS_COBRO.map(metodo => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pago *
            </label>
            <select
              name="tipoPago"
              value={formData.tipoPago}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {TIPOS_PAGO.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Moneda y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda} value={moneda}>
                    {moneda}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              placeholder="Nombre del cliente (opcional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales (opcional)"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Guardar Ingreso
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
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
