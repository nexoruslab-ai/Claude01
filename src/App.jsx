import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SistemaPrioridades from './components/SistemaPrioridades.jsx';
import FormularioIngreso from './components/FormularioIngreso.jsx';
import FormularioGasto from './components/FormularioGasto.jsx';
import Historial from './components/Historial.jsx';
import Toast from './components/Toast.jsx';
import { calcularBalanceGeneral } from './utils/calculations.js';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n.js';
import { initializeTheme, toggleTheme as toggleThemeUtil, setStoredTheme, applyTheme } from './utils/theme.js';
import { getStoredDisplayCurrency, setStoredDisplayCurrency } from './utils/currency.js';
import { getCurrentExchangeRate, processTransactionWithCurrency } from './utils/exchangeRate.js';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon, FireIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY_INGRESOS = 'denarium_ingresos';
const STORAGE_KEY_GASTOS   = 'denarium_gastos';

function App() {
  const [ingresos, setIngresos]               = useState([]);
  const [gastos, setGastos]                   = useState([]);
  const [vistaActual, setVistaActual]         = useState('dashboard');
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [transaccionEditar, setTransaccionEditar] = useState(null);
  const [language, setLanguage]               = useState('es');
  const [theme, setTheme]                     = useState('dark');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate]       = useState(null);
  const [toast, setToast]                     = useState(null);

  useEffect(() => {
    const savedTheme = initializeTheme();
    setTheme(savedTheme);
    const savedLanguage = getStoredLanguage();
    setLanguage(savedLanguage);
    const savedCurrency = getStoredDisplayCurrency();
    setDisplayCurrency(savedCurrency);
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    try {
      const ing = localStorage.getItem(STORAGE_KEY_INGRESOS);
      const gas = localStorage.getItem(STORAGE_KEY_GASTOS);
      if (ing) setIngresos(JSON.parse(ing));
      if (gas) setGastos(JSON.parse(gas));
    } catch (e) { console.error('Error al cargar datos:', e); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(ingresos)); }
    catch (e) { console.error('Error al guardar ingresos:', e); }
  }, [ingresos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_GASTOS, JSON.stringify(gastos)); }
    catch (e) { console.error('Error al guardar gastos:', e); }
  }, [gastos]);

  const fetchExchangeRate = async () => {
    try {
      const rate = await getCurrentExchangeRate();
      setExchangeRate(rate);
    } catch (e) {
      console.error('Error fetching exchange rate:', e);
      showToast('Error al obtener tipo de cambio', 'error');
    }
  };

  const balance = calcularBalanceGeneral(ingresos, gastos);

  const handleGuardarIngreso = (nuevoIngreso) => {
    if (exchangeRate) {
      const ingresoConConversion = processTransactionWithCurrency(nuevoIngreso, exchangeRate);
      if (transaccionEditar) {
        setIngresos(prev => prev.map(i => i.id === transaccionEditar.id ? ingresoConConversion : i));
        showToast(language === 'es' ? 'Ingreso actualizado exitosamente' : 'Income updated successfully', 'success');
        setTransaccionEditar(null);
      } else {
        setIngresos(prev => [...prev, ingresoConConversion]);
        showToast(language === 'es' ? 'Ingreso guardado exitosamente' : 'Income saved successfully', 'success');
      }
    }
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  const handleGuardarGasto = (nuevoGasto) => {
    if (exchangeRate) {
      const gastoConConversion = processTransactionWithCurrency(nuevoGasto, exchangeRate);
      if (transaccionEditar) {
        setGastos(prev => prev.map(g => g.id === transaccionEditar.id ? gastoConConversion : g));
        showToast(language === 'es' ? 'Gasto actualizado exitosamente' : 'Expense updated successfully', 'success');
        setTransaccionEditar(null);
      } else {
        setGastos(prev => [...prev, gastoConConversion]);
        showToast(language === 'es' ? 'Gasto guardado exitosamente' : 'Expense saved successfully', 'success');
      }
    }
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  const handleEliminarTransaccion = (id, tipo) => {
    if (tipo === 'ingreso') setIngresos(prev => prev.filter(i => i.id !== id));
    else setGastos(prev => prev.filter(g => g.id !== id));
    showToast(language === 'es' ? 'Transacción eliminada' : 'Transaction deleted', 'success');
  };

  const handleEditarTransaccion = (transaccion, tipo) => {
    setTransaccionEditar(transaccion);
    setVistaActual(tipo === 'ingreso' ? 'nuevoIngreso' : 'nuevoGasto');
  };

  const handleCancelar = () => {
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
    setTransaccionEditar(null);
  };

  const handleNuevaTransaccion = (tipo) => {
    setTransaccionEditar(null);
    if (tipo === 'ingreso')     setVistaActual('nuevoIngreso');
    else if (tipo === 'gasto')  setVistaActual('nuevoGasto');
    else                        setMostrarModalTipo(true);
  };

  const handleToggleTheme = () => {
    const newTheme = toggleThemeUtil(theme);
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleToggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
  };

  const handleToggleCurrency = () => {
    const newCurrency = displayCurrency === 'USD' ? 'ARS' : 'USD';
    setDisplayCurrency(newCurrency);
    setStoredDisplayCurrency(newCurrency);
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return <Dashboard balance={balance} onNuevaTransaccion={handleNuevaTransaccion} language={language} displayCurrency={displayCurrency} exchangeRate={exchangeRate} />;
      case 'prioridades':
        return <SistemaPrioridades distribucion={balance.distribucion} language={language} displayCurrency={displayCurrency} exchangeRate={exchangeRate} />;
      case 'nuevoIngreso':
        return <FormularioIngreso onGuardar={handleGuardarIngreso} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} />;
      case 'nuevoGasto':
        return <FormularioGasto onGuardar={handleGuardarGasto} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} />;
      case 'historial':
        return <Historial ingresos={ingresos} gastos={gastos} onEliminar={handleEliminarTransaccion} onEditar={handleEditarTransaccion} language={language} displayCurrency={displayCurrency} exchangeRate={exchangeRate} />;
      default:
        return <Dashboard balance={balance} onNuevaTransaccion={handleNuevaTransaccion} language={language} displayCurrency={displayCurrency} exchangeRate={exchangeRate} />;
    }
  };

  const enFormulario = ['nuevoIngreso', 'nuevoGasto'].includes(vistaActual);

  return (
    <div className="min-h-screen bg-dark-bg">

      {/* ── Header ── */}
      {!enFormulario && (
        <div className="fixed top-0 left-0 right-0 z-30 glass-card border-b border-white/[0.06] backdrop-blur-glass">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

            {/* Logo DENARIUM */}
            <span className="font-display text-silver text-sm tracking-[0.2em] select-none">
              DENARIUM
            </span>

            {/* Controles */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleCurrency}
                className="glass-card px-3 py-1.5 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium"
                title={`Ver en ${displayCurrency === 'USD' ? 'ARS' : 'USD'}`}
              >
                <span className="font-mono font-semibold text-silver text-xs">{displayCurrency}</span>
              </button>

              <button
                onClick={handleToggleLanguage}
                className="glass-card p-2 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium flex items-center gap-1"
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                <LanguageIcon className="w-4 h-4 text-silver-dark" />
                <span className="text-[10px] font-semibold text-silver-dark">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenido principal ── */}
      <div className={`max-w-7xl mx-auto p-4 ${!enFormulario ? 'pt-20' : ''}`}>
        {renderVista()}
      </div>

      {/* ── Barra de navegación inferior ── */}
      {!enFormulario && (
        <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/[0.06] shadow-elevation-3 z-30 backdrop-blur-glass">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">

              <NavButton
                icon={<ChartBarIcon className="w-6 h-6" />}
                label={language === 'es' ? 'Dashboard' : 'Dashboard'}
                active={vistaActual === 'dashboard'}
                onClick={() => setVistaActual('dashboard')}
              />

              <NavButton
                icon={<FireIcon className="w-6 h-6" />}
                label={language === 'es' ? 'Prioridades' : 'Priorities'}
                active={vistaActual === 'prioridades'}
                onClick={() => setVistaActual('prioridades')}
              />

              {/* FAB central */}
              <button
                onClick={() => handleNuevaTransaccion()}
                className="flex flex-col items-center justify-center flex-1 h-full transition-premium"
              >
                <div className="bg-gradient-silver text-dark-bg rounded-full w-12 h-12 flex items-center justify-center shadow-glow-silver hover:shadow-glow-silver-lg transition-premium hover-scale mb-1">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-silver-dim">
                  {language === 'es' ? 'Agregar' : 'Add'}
                </span>
              </button>

              <NavButton
                icon={<ClockIcon className="w-6 h-6" />}
                label={language === 'es' ? 'Historial' : 'History'}
                active={vistaActual === 'historial'}
                onClick={() => setVistaActual('historial')}
              />
            </div>
          </div>
        </nav>
      )}

      {/* ── Modal tipo de transacción ── */}
      {mostrarModalTipo && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fadeIn"
          onClick={() => setMostrarModalTipo(false)}
        >
          <div
            className="glass-card rounded-premium shadow-elevation-3 p-6 max-w-sm w-full border border-silver/10 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-semibold mb-2 text-silver tracking-widest">
              {language === 'es' ? 'NUEVA TRANSACCIÓN' : 'NEW TRANSACTION'}
            </h2>
            <p className="text-dark-textSecondary text-sm mb-6">
              {language === 'es' ? '¿Qué deseas registrar?' : 'What do you want to register?'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setVistaActual('nuevoIngreso'); setMostrarModalTipo(false); }}
                className="w-full btn-premium text-center py-4 text-sm tracking-widest"
              >
                ↑&nbsp;&nbsp;{language === 'es' ? 'INGRESO' : 'INCOME'}
              </button>

              <button
                onClick={() => { setVistaActual('nuevoGasto'); setMostrarModalTipo(false); }}
                className="w-full bg-silver-muted text-silver-bright py-4 rounded-button font-semibold hover:bg-silver-deep transition-premium shadow-elevation-1 tracking-widest text-sm"
              >
                ↓&nbsp;&nbsp;{language === 'es' ? 'GASTO' : 'EXPENSE'}
              </button>

              <button
                onClick={() => setMostrarModalTipo(false)}
                className="w-full bg-dark-bgSecondary text-dark-textSecondary py-4 rounded-button font-semibold hover:bg-opacity-80 transition-premium border border-white/[0.06] text-sm"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// Botón de navegación
const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 h-full transition-premium ${
      active ? 'text-silver' : 'text-dark-textSecondary hover:text-silver-dark'
    }`}
  >
    {icon}
    <span className="text-xs font-medium mt-1">{label}</span>
  </button>
);

export default App;
