import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIAS, METODOS_COBRO, MONEDAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';

const FormularioGasto = ({ onGuardar, onCancelar, language, transaccion }) => {
  const { t } = useTranslation(language);
  const hoy = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: hoy,
    categoria: CATEGORIAS[0],
    metodoPago: METODOS_COBRO[0],
    moneda: MONEDAS[1], // USD por defecto
    monto: '',
    descripcion: ''
  });

  // Pre-llenar formulario si es edición
  useEffect(() => {
    if (transaccion) {
      setFormData({
        fecha: transaccion.fecha,
        categoria: transaccion.categoria,
        metodoPago: transaccion.metodoPago || METODOS_COBRO[0],
        moneda: transaccion.monedaOriginal || transaccion.moneda || 'USD',
        monto: transaccion.montoOriginal || transaccion.monto || '',
        descripcion: transaccion.descripcion || ''
      });
    }
  }, [transaccion]);

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
      alert(t('forms.validAmount') || 'Por favor ingresa un monto válido');
      return;
    }

    const nuevoGasto = {
      id: transaccion?.id || uuidv4(),
      ...formData,
      monto: Number(formData.monto)
    };

    onGuardar(nuevoGasto);
  };

  const esEdicion = !!transaccion;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 transition-colors">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 dark:bg-gray-900 text-white p-6 shadow-lg border-b border-white/10">
        <h1 className="text-3xl font-bold mb-2">{esEdicion ? (t('forms.editExpense') || 'Editar Gasto') : (t('forms.newExpense') || 'Nuevo Gasto')}</h1>
        <p className="text-red-100 dark:text-gray-400">{esEdicion ? (t('forms.editExpenseDesc') || 'Edita el gasto') : (t('forms.registerExpense') || 'Registra un nuevo gasto')}</p>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4 border border-gray-200 dark:border-gray-800" data-tour="expense-form">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.date') || 'Fecha'} *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.category') || 'Categoría'} *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            >
              {CATEGORIAS.map(categoria => (
                <option key={categoria} value={categoria} className="dark:bg-gray-800">
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.paymentMethod') || 'Método de Pago'} *
            </label>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            >
              {METODOS_COBRO.map(metodo => (
                <option key={metodo} value={metodo} className="dark:bg-gray-800">
                  {metodo}
                </option>
              ))}
            </select>
          </div>

          {/* Moneda y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forms.currency') || 'Moneda'} *
              </label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda} value={moneda} className="dark:bg-gray-800">
                    {moneda}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forms.amount') || 'Monto'} *
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.description') || 'Descripción'}
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder={t('forms.descriptionOptional') || 'Detalles adicionales (opcional)'}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-gold text-black py-3 px-6 rounded-lg font-semibold hover:brightness-110 transition-all shadow-elevation-1"
            >
              {esEdicion ? (t('forms.updateExpense') || 'Actualizar Gasto') : (t('forms.saveExpense') || 'Guardar Gasto')}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
            >
              {t('forms.cancel') || 'Cancelar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioGasto;
