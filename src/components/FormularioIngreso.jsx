import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EMPRESAS, METODOS_COBRO, TIPOS_PAGO, MONEDAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';

const FormularioIngreso = ({ onGuardar, onCancelar, language, transaccion }) => {
  const { t } = useTranslation(language);
  const hoy = new Date().toISOString().split('T')[0];

  const [esComision, setEsComision] = useState(false);
  const [formData, setFormData] = useState({
    fecha: hoy,
    empresa: EMPRESAS[0],
    metodoCobro: METODOS_COBRO[0],
    tipoPago: TIPOS_PAGO[0],
    moneda: MONEDAS[1], // USD por defecto
    monto: '',
    descripcion: '',
    cliente: '',
    // Campos de comisión
    montoTotal: '',
    porcentajeComision: 100
  });

  // Pre-llenar formulario si es edición
  useEffect(() => {
    if (transaccion) {
      const esComisionExistente = transaccion.esComision || false;
      setEsComision(esComisionExistente);

      setFormData({
        fecha: transaccion.fecha,
        empresa: transaccion.empresa,
        metodoCobro: transaccion.metodoCobro || METODOS_COBRO[0],
        tipoPago: transaccion.tipoPago || TIPOS_PAGO[0],
        moneda: transaccion.monedaOriginal || transaccion.moneda || 'USD',
        monto: transaccion.montoOriginal || transaccion.monto || '',
        descripcion: transaccion.descripcion || '',
        cliente: transaccion.cliente || '',
        montoTotal: transaccion.montoTotal || '',
        porcentajeComision: transaccion.porcentajeComision || 100
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

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setEsComision(checked);

    if (checked && formData.monto && !formData.montoTotal) {
      // Si activa comisión y tiene monto, usar ese monto como montoTotal
      setFormData(prev => ({
        ...prev,
        montoTotal: prev.monto,
        porcentajeComision: 100
      }));
    } else if (!checked) {
      // Si desactiva comisión, resetear campos de comisión
      setFormData(prev => ({
        ...prev,
        montoTotal: '',
        porcentajeComision: 100
      }));
    }
  };

  // Calcular monto de comisión automáticamente
  const calcularMontoComision = () => {
    if (!esComision) {
      return formData.monto;
    }

    const total = Number(formData.montoTotal) || 0;
    const porcentaje = Number(formData.porcentajeComision) || 0;
    return (total * porcentaje / 100).toFixed(2);
  };

  const montoComisionCalculado = calcularMontoComision();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (esComision) {
      // Validar campos de comisión
      if (!formData.montoTotal || Number(formData.montoTotal) <= 0) {
        alert('Por favor ingresa un monto total de facturación válido');
        return;
      }
      if (!formData.porcentajeComision || Number(formData.porcentajeComision) <= 0 || Number(formData.porcentajeComision) > 100) {
        alert('Por favor ingresa un porcentaje de comisión válido (1-100)');
        return;
      }
    } else {
      // Validar monto normal
      if (!formData.monto || Number(formData.monto) <= 0) {
        alert(t('forms.validAmount') || 'Por favor ingresa un monto válido');
        return;
      }
    }

    const nuevoIngreso = {
      id: transaccion?.id || uuidv4(),
      fecha: formData.fecha,
      empresa: formData.empresa,
      metodoCobro: formData.metodoCobro,
      tipoPago: formData.tipoPago,
      moneda: formData.moneda,
      descripcion: formData.descripcion,
      cliente: formData.cliente,
      // Campos de comisión
      esComision: esComision,
      porcentajeComision: esComision ? Number(formData.porcentajeComision) : 100,
      montoTotal: esComision ? Number(formData.montoTotal) : Number(formData.monto),
      montoComision: esComision ? Number(montoComisionCalculado) : Number(formData.monto),
      monto: esComision ? Number(montoComisionCalculado) : Number(formData.monto)
    };

    onGuardar(nuevoIngreso);
  };

  const esEdicion = !!transaccion;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 transition-colors">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:bg-gray-900 text-white p-6 shadow-lg border-b border-white/10">
        <h1 className="text-3xl font-bold mb-2">{esEdicion ? (t('forms.editIncome') || 'Editar Ingreso') : (t('forms.newIncome') || 'Nuevo Ingreso')}</h1>
        <p className="text-green-100 dark:text-gray-400">{esEdicion ? (t('forms.editIncomeDesc') || 'Edita el ingreso') : (t('forms.registerIncome') || 'Registra un nuevo ingreso')}</p>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4 border border-gray-200 dark:border-gray-800" data-tour="income-form">
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

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.company') || 'Empresa'} *
            </label>
            <select
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            >
              {EMPRESAS.map(empresa => (
                <option key={empresa} value={empresa} className="dark:bg-gray-800">
                  {empresa}
                </option>
              ))}
            </select>
          </div>

          {/* Método de Cobro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.collectionMethod') || 'Método de Cobro'} *
            </label>
            <select
              name="metodoCobro"
              value={formData.metodoCobro}
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

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.paymentType') || 'Tipo de Pago'} *
            </label>
            <select
              name="tipoPago"
              value={formData.tipoPago}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            >
              {TIPOS_PAGO.map(tipo => (
                <option key={tipo} value={tipo} className="dark:bg-gray-800">
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox de Comisión Empresarial */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={esComision}
                onChange={handleCheckboxChange}
                className="w-5 h-5 text-gold border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-gold transition-colors"
              />
              <div className="ml-3">
                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gold transition-colors">
                  💼 ¿Es comisión empresarial?
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Marca esta opción si facturas un monto total pero solo recibes un % de comisión personal
                </p>
              </div>
            </label>
          </div>

          {/* Campos según tipo de ingreso */}
          {esComision ? (
            <>
              {/* Moneda */}
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

              {/* Monto Total de Facturación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📊 Monto Total de Facturación *
                </label>
                <input
                  type="number"
                  name="montoTotal"
                  value={formData.montoTotal}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="146000.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El monto total que facturaste al cliente
                </p>
              </div>

              {/* Porcentaje de Comisión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📈 Porcentaje de Comisión Personal *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="porcentajeComision"
                    value={formData.porcentajeComision}
                    onChange={handleChange}
                    required
                    min="0.01"
                    max="100"
                    step="0.01"
                    placeholder="5.00"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 font-semibold">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El porcentaje que recibes de comisión (1-100%)
                </p>
              </div>

              {/* Cálculo Automático de Comisión */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💰 Tu Comisión Personal:
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500 font-mono">
                    {formData.moneda} ${Number(montoComisionCalculado).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Este es el monto que se usará para calcular el Sagrado 40% y las prioridades
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Moneda y Monto Normal */}
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
            </>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('forms.client') || 'Cliente'}
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              placeholder={t('forms.clientOptional') || 'Nombre del cliente (opcional)'}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
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
              {esEdicion ? (t('forms.updateIncome') || 'Actualizar Ingreso') : (t('forms.saveIncome') || 'Guardar Ingreso')}
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

export default FormularioIngreso;
