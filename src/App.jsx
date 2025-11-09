import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SistemaPrioridades from './components/SistemaPrioridades.jsx';
import FormularioIngreso from './components/FormularioIngreso.jsx';
import FormularioGasto from './components/FormularioGasto.jsx';
import Historial from './components/Historial.jsx';
import Toast from './components/Toast.jsx';
import EditorPrioridades from './components/EditorPrioridades.jsx';
import { calcularBalanceGeneral } from './utils/calculations.js';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n.js';
import { initializeTheme, toggleTheme as toggleThemeUtil, setStoredTheme, applyTheme } from './utils/theme.js';
import { getStoredDisplayCurrency, setStoredDisplayCurrency } from './utils/currency.js';
import { getCurrentExchangeRate, processTransactionWithCurrency } from './utils/exchangeRate.js';
import { loadPriorities, savePriorities } from './utils/prioritiesManager.js';
import { SunIcon, MoonIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon, FireIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';

// Constantes para localStorage
const STORAGE_KEY_INGRESOS = 'finflow_ingresos';
const STORAGE_KEY_GASTOS = 'finflow_gastos';

function App() {
  // Estado para datos
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Estado para navegación
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [mostrarEditorPrioridades, setMostrarEditorPrioridades] = useState(false);

  // Estado para edición
  const [transaccionEditar, setTransaccionEditar] = useState(null);

  // Estado para configuración
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('dark');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);

  // Estado para notificaciones
  const [toast, setToast] = useState(null);

  // Inicializar configuración
  useEffect(() => {
    // Tema
    const savedTheme = initializeTheme();
    setTheme(savedTheme);

    // Idioma
    const savedLanguage = getStoredLanguage();
    setLanguage(savedLanguage);

    // Moneda de visualización
    const savedCurrency = getStoredDisplayCurrency();
    setDisplayCurrency(savedCurrency);

    // Cargar prioridades
    const loadedPriorities = loadPriorities();
    setPrioridades(loadedPriorities);

    // Obtener tasa de cambio
    fetchExchangeRate();
  }, []);

  // Cargar datos desde localStorage con migración automática
  useEffect(() => {
    try {
      const ingresosGuardados = localStorage.getItem(STORAGE_KEY_INGRESOS);
      const gastosGuardados = localStorage.getItem(STORAGE_KEY_GASTOS);

      if (ingresosGuardados) {
        const ingresosParseados = JSON.parse(ingresosGuardados);

        // MIGRACIÓN AUTOMÁTICA: Agregar campos de comisión a ingresos antiguos
        const ingresosMigrados = ingresosParseados.map(ingreso => {
          // Si el ingreso ya tiene los campos nuevos, no hacer nada
          if (ingreso.hasOwnProperty('esComision')) {
            return ingreso;
          }

          // Si es un ingreso antiguo, agregar campos de comisión con valores default
          return {
            ...ingreso,
            esComision: false,
            porcentajeComision: 100,
            montoTotal: ingreso.monto || 0,
            montoComision: ingreso.monto || 0
          };
        });

        setIngresos(ingresosMigrados);

        // Si hubo cambios, actualizar localStorage
        const necesitaMigracion = ingresosParseados.some(i => !i.hasOwnProperty('esComision'));
        if (necesitaMigracion) {
          localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(ingresosMigrados));
          console.log('✓ Migración automática completada: Se agregaron campos de comisión a', ingresosParseados.length, 'ingresos');
        }
      }

      if (gastosGuardados) {
        setGastos(JSON.parse(gastosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }, []);

  // Guardar ingresos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(ingresos));
    } catch (error) {
      console.error('Error al guardar ingresos:', error);
    }
  }, [ingresos]);

  // Guardar gastos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GASTOS, JSON.stringify(gastos));
    } catch (error) {
      console.error('Error al guardar gastos:', error);
    }
  }, [gastos]);

  // Obtener tasa de cambio de la API
  const fetchExchangeRate = async () => {
    try {
      const rate = await getCurrentExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      showToast('Error al obtener tipo de cambio', 'error');
    }
  };

  // Calcular balance general con prioridades personalizadas
  const balance = calcularBalanceGeneral(ingresos, gastos, prioridades.length > 0 ? prioridades : null);

  // Handlers para agregar/editar transacciones
  const handleGuardarIngreso = (nuevoIngreso) => {
    if (exchangeRate) {
      const ingresoConConversion = processTransactionWithCurrency(nuevoIngreso, exchangeRate);

      if (transaccionEditar) {
        // Editar ingreso existente
        setIngresos(prev => prev.map(i => i.id === transaccionEditar.id ? ingresoConConversion : i));
        showToast(language === 'es' ? 'Ingreso actualizado exitosamente' : 'Income updated successfully', 'success');
        setTransaccionEditar(null);
      } else {
        // Nuevo ingreso
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
        // Editar gasto existente
        setGastos(prev => prev.map(g => g.id === transaccionEditar.id ? gastoConConversion : g));
        showToast(language === 'es' ? 'Gasto actualizado exitosamente' : 'Expense updated successfully', 'success');
        setTransaccionEditar(null);
      } else {
        // Nuevo gasto
        setGastos(prev => [...prev, gastoConConversion]);
        showToast(language === 'es' ? 'Gasto guardado exitosamente' : 'Expense saved successfully', 'success');
      }
    }

    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  // Handler para eliminar transacciones
  const handleEliminarTransaccion = (id, tipo) => {
    if (tipo === 'ingreso') {
      setIngresos(prev => prev.filter(i => i.id !== id));
    } else {
      setGastos(prev => prev.filter(g => g.id !== id));
    }
    showToast(language === 'es' ? 'Transacción eliminada exitosamente' : 'Transaction deleted successfully', 'success');
  };

  // Handler para editar transacción
  const handleEditarTransaccion = (transaccion, tipo) => {
    setTransaccionEditar(transaccion);
    if (tipo === 'ingreso') {
      setVistaActual('nuevoIngreso');
    } else {
      setVistaActual('nuevoGasto');
    }
  };

  // Handler para cancelar formularios
  const handleCancelar = () => {
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
    setTransaccionEditar(null);
  };

  // Handler para nueva transacción
  const handleNuevaTransaccion = (tipo) => {
    setTransaccionEditar(null);
    if (tipo === 'ingreso') {
      setVistaActual('nuevoIngreso');
    } else if (tipo === 'gasto') {
      setVistaActual('nuevoGasto');
    } else {
      setMostrarModalTipo(true);
    }
  };

  // Handlers para configuración
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

  // Handlers para gestionar prioridades
  const handleManagePriorities = () => {
    setMostrarEditorPrioridades(true);
  };

  const handleSavePriorities = (nuevasPrioridades) => {
    setPrioridades(nuevasPrioridades);
    savePriorities(nuevasPrioridades);
    showToast(
      language === 'es' ? 'Prioridades actualizadas exitosamente' : 'Priorities updated successfully',
      'success'
    );
  };

  // Mostrar toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Renderizar vista actual
  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return (
          <Dashboard
            balance={balance}
            onNuevaTransaccion={handleNuevaTransaccion}
            language={language}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
          />
        );
      case 'prioridades':
        return (
          <SistemaPrioridades
            distribucion={balance.distribucion}
            language={language}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
            onManagePriorities={handleManagePriorities}
          />
        );
      case 'nuevoIngreso':
        return (
          <FormularioIngreso
            onGuardar={handleGuardarIngreso}
            onCancelar={handleCancelar}
            language={language}
            transaccion={transaccionEditar}
          />
        );
      case 'nuevoGasto':
        return (
          <FormularioGasto
            onGuardar={handleGuardarGasto}
            onCancelar={handleCancelar}
            language={language}
            transaccion={transaccionEditar}
          />
        );
      case 'historial':
        return (
          <Historial
            ingresos={ingresos}
            gastos={gastos}
            onEliminar={handleEliminarTransaccion}
            onEditar={handleEditarTransaccion}
            language={language}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
          />
        );
      default:
        return (
          <Dashboard
            balance={balance}
            onNuevaTransaccion={handleNuevaTransaccion}
            language={language}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
      {/* Header con controles premium */}
      {!['nuevoIngreso', 'nuevoGasto'].includes(vistaActual) && (
        <div className="fixed top-0 left-0 right-0 z-30 glass-card dark:glass-card border-b border-white/10 backdrop-blur-glass">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-end gap-3">
              {/* Selector de moneda */}
              <button
                onClick={handleToggleCurrency}
                className="glass-card dark:glass-card px-3 py-2 rounded-button hover:shadow-elevation-1 transition-premium flex items-center justify-center gap-1.5 border border-white/10 min-w-[70px]"
                title={`Ver en ${displayCurrency === 'USD' ? 'ARS' : 'USD'}`}
              >
                <span className="font-mono font-semibold text-gold text-sm">{displayCurrency}</span>
              </button>

              {/* Toggle de idioma */}
              <button
                onClick={handleToggleLanguage}
                className="glass-card dark:glass-card px-3 py-2 rounded-button hover:shadow-elevation-1 transition-premium flex items-center justify-center gap-1.5 border border-white/10 min-w-[70px]"
                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              >
                <LanguageIcon className="w-4 h-4 text-gold" />
                <span className="text-xs font-semibold text-gold">{language.toUpperCase()}</span>
              </button>

              {/* Toggle de tema */}
              <button
                onClick={handleToggleTheme}
                className="glass-card dark:glass-card px-3 py-2 rounded-button hover:shadow-elevation-1 transition-premium flex items-center justify-center border border-white/10 min-w-[70px]"
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-gold" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gold" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className={`max-w-7xl mx-auto p-4 ${!['nuevoIngreso', 'nuevoGasto'].includes(vistaActual) ? 'pt-20' : ''}`}>
        {renderVista()}
      </div>

      {/* Barra de navegación inferior premium */}
      {!['nuevoIngreso', 'nuevoGasto'].includes(vistaActual) && (
        <nav className="fixed bottom-0 left-0 right-0 glass-card dark:glass-card border-t border-white/10 shadow-elevation-3 z-30 backdrop-blur-glass">
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

              <button
                onClick={() => handleNuevaTransaccion()}
                className="flex flex-col items-center justify-center flex-1 h-full transition-premium"
              >
                <div className="bg-gradient-gold text-dark-bg rounded-full w-12 h-12 flex items-center justify-center shadow-glow-gold hover:shadow-elevation-2 transition-premium hover-scale mb-1">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-dark-textSecondary dark:text-dark-textSecondary">
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

      {/* Modal para seleccionar tipo de transacción */}
      {mostrarModalTipo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fadeIn"
          onClick={() => setMostrarModalTipo(false)}
        >
          <div
            className="glass-card dark:glass-card rounded-premium shadow-elevation-3 p-6 max-w-sm w-full border border-gold/20 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-dark-text dark:text-dark-text">
              {language === 'es' ? 'Nueva Transacción' : 'New Transaction'}
            </h2>
            <p className="text-dark-textSecondary dark:text-dark-textSecondary mb-6">
              {language === 'es' ? '¿Qué deseas registrar?' : 'What do you want to register?'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setVistaActual('nuevoIngreso');
                  setMostrarModalTipo(false);
                }}
                className="w-full btn-premium text-center py-4"
              >
                <span className="text-xl mr-2">↑</span>
                <span>{language === 'es' ? 'Ingreso' : 'Income'}</span>
              </button>

              <button
                onClick={() => {
                  setVistaActual('nuevoGasto');
                  setMostrarModalTipo(false);
                }}
                className="w-full bg-red-600 text-white py-4 rounded-button font-semibold hover:bg-red-700 transition-premium shadow-elevation-1 hover:shadow-elevation-2"
              >
                <span className="text-xl mr-2">↓</span>
                <span>{language === 'es' ? 'Gasto' : 'Expense'}</span>
              </button>

              <button
                onClick={() => setMostrarModalTipo(false)}
                className="w-full bg-dark-bgSecondary dark:bg-dark-bgSecondary text-dark-textSecondary dark:text-dark-textSecondary py-4 rounded-button font-semibold hover:bg-opacity-80 transition-premium border border-white/10"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Editor de Prioridades */}
      {mostrarEditorPrioridades && (
        <EditorPrioridades
          priorities={prioridades}
          onSave={handleSavePriorities}
          onClose={() => setMostrarEditorPrioridades(false)}
          language={language}
        />
      )}
    </div>
  );
}

// Componente auxiliar para botones de navegación
const NavButton = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 h-full transition-premium ${
        active
          ? 'text-gold'
          : 'text-dark-textSecondary dark:text-dark-textSecondary hover:text-gold'
      }`}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
};

export default App;
