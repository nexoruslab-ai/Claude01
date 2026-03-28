import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SistemaPrioridades from './components/SistemaPrioridades.jsx';
import FormularioIngreso from './components/FormularioIngreso.jsx';
import FormularioGasto from './components/FormularioGasto.jsx';
import Historial from './components/Historial.jsx';
import Cuentas from './components/Cuentas.jsx';
import Negocios from './components/Negocios.jsx';
import Proyectos from './components/Proyectos.jsx';
import Toast from './components/Toast.jsx';
import { calcularBalanceGeneral } from './utils/calculations.js';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n.js';
import { initializeTheme, toggleTheme as toggleThemeUtil, setStoredTheme, applyTheme } from './utils/theme.js';
import { getStoredDisplayCurrency, setStoredDisplayCurrency } from './utils/currency.js';
import { getCurrentExchangeRate, processTransactionWithCurrency } from './utils/exchangeRate.js';
import { LanguageIcon } from '@heroicons/react/24/solid';
import {
  ChartBarIcon, PlusIcon,
  BanknotesIcon, BriefcaseIcon, FolderOpenIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

// ── Storage keys ──────────────────────────────────────────────────────────
const SK_INGRESOS  = 'denarium_ingresos';
const SK_GASTOS    = 'denarium_gastos';
const SK_CONFIG    = 'denarium_config';
const SK_CUENTAS   = 'denarium_cuentas';
const SK_NEGOCIOS  = 'denarium_negocios';
const SK_PROYECTOS = 'denarium_proyectos';

// ── Config por defecto ────────────────────────────────────────────────────
const CONFIG_DEFAULT = {
  porcentajeAhorro: 40,
  tasas: { usdToArs: 1453.73, usdtToUsd: 0.999 },
  fees: [
    { id: 'wise_binance',   origen: 'Wise',       destino: 'Binance (USDT)', tipo: 'ACH Transfer', fee: 0,    nota: 'ACH gratis hasta 1M/mo' },
    { id: 'p2p_binance',    origen: 'P2P Binance', destino: 'Wallet',        tipo: 'P2P',          fee: 0.1,  nota: 'Comisión maker/taker' },
    { id: 'binance_wallet', origen: 'Binance',     destino: 'Wallet externo',tipo: 'Withdraw',     fee: 1,    nota: 'Fee red TRC20 aprox.' },
    { id: 'wallbit_ars',    origen: 'Wallbit',     destino: 'ARS local',     tipo: 'Conversión',   fee: 2,    nota: 'Spread estimado' },
    { id: 'paypal_out',     origen: 'PayPal',      destino: 'Banco',         tipo: 'Retiro',       fee: 2.5,  nota: 'Fee transferencia' },
    { id: 'stripe_out',     origen: 'Stripe',      destino: 'Banco',         tipo: 'Payout',       fee: 0.25, nota: '0.25% por payout' },
  ]
};

const loadJSON = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ── Modal: editar % ahorro sagrado ────────────────────────────────────────
function ModalAhorro({ porcentaje, onGuardar, onCerrar }) {
  const [val, setVal] = useState(String(porcentaje));
  const n = parseFloat(val) || 0;
  const valido = n >= 0 && n <= 100;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-premium shadow-elevation-3 p-6 max-w-xs w-full border border-silver/10 animate-slideUp">
        <h2 className="font-display text-lg font-semibold mb-1 text-silver tracking-widest">% AHORRO SAGRADO</h2>
        <p className="text-dark-textSecondary text-xs mb-4">
          Se aparta automáticamente de todos tus ingresos y ajusta toda la cascada de prioridades.
        </p>
        <div className="relative mb-4">
          <input
            type="number" min="0" max="100" value={val}
            onChange={e => setVal(e.target.value)}
            className="input-premium w-full text-3xl text-center font-display font-bold pr-12"
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-silver-dim text-2xl font-bold">%</span>
        </div>
        {!valido && <p className="text-xs text-silver-dim mb-3">Debe estar entre 0% y 100%</p>}
        <div className="flex gap-2">
          <button disabled={!valido} onClick={() => onGuardar(n)}
            className="btn-premium flex-1 py-3 text-xs tracking-widest disabled:opacity-40">
            GUARDAR
          </button>
          <button onClick={onCerrar}
            className="flex-1 py-3 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────────
function App() {
  const [ingresos, setIngresos]   = useState([]);
  const [gastos, setGastos]       = useState([]);
  const [config, setConfig]       = useState(CONFIG_DEFAULT);
  const [cuentas, setCuentas]     = useState([]);
  const [negocios, setNegocios]   = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const [vistaActual, setVistaActual]               = useState('dashboard');
  const [mostrarModalTipo, setMostrarModalTipo]     = useState(false);
  const [mostrarModalAhorro, setMostrarModalAhorro] = useState(false);
  const [transaccionEditar, setTransaccionEditar]   = useState(null);
  const [language, setLanguage]         = useState('es');
  const [theme, setTheme]               = useState('dark');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [toast, setToast]               = useState(null);

  // ── Cargar todo al inicio ─────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = initializeTheme();
    setTheme(savedTheme);
    setLanguage(getStoredLanguage());
    setDisplayCurrency(getStoredDisplayCurrency());
    fetchExchangeRate();

    setIngresos(loadJSON(SK_INGRESOS, []));
    setGastos(loadJSON(SK_GASTOS, []));
    setConfig(prev => ({ ...CONFIG_DEFAULT, ...loadJSON(SK_CONFIG, {}) }));
    setCuentas(loadJSON(SK_CUENTAS, []));
    setNegocios(loadJSON(SK_NEGOCIOS, []));
    setProyectos(loadJSON(SK_PROYECTOS, []));
  }, []);

  // ── Persistir datos ───────────────────────────────────────────────────
  useEffect(() => { saveJSON(SK_INGRESOS,  ingresos);  }, [ingresos]);
  useEffect(() => { saveJSON(SK_GASTOS,    gastos);    }, [gastos]);
  useEffect(() => { saveJSON(SK_CONFIG,    config);    }, [config]);
  useEffect(() => { saveJSON(SK_CUENTAS,   cuentas);   }, [cuentas]);
  useEffect(() => { saveJSON(SK_NEGOCIOS,  negocios);  }, [negocios]);
  useEffect(() => { saveJSON(SK_PROYECTOS, proyectos); }, [proyectos]);

  const fetchExchangeRate = async () => {
    try { setExchangeRate(await getCurrentExchangeRate()); }
    catch { showToast('Error al obtener tipo de cambio', 'error'); }
  };

  // Balance usa % configurable
  const balance = calcularBalanceGeneral(ingresos, gastos, config.porcentajeAhorro);

  // ── Handlers transacciones ────────────────────────────────────────────
  const handleGuardarIngreso = (nuevoIngreso) => {
    if (!exchangeRate) return;
    const ing = processTransactionWithCurrency(nuevoIngreso, exchangeRate);
    if (transaccionEditar) {
      setIngresos(prev => prev.map(i => i.id === transaccionEditar.id ? ing : i));
      showToast('Ingreso actualizado exitosamente');
      setTransaccionEditar(null);
    } else {
      setIngresos(prev => [...prev, ing]);
      showToast('Ingreso guardado exitosamente');
    }
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  const handleGuardarGasto = (nuevoGasto) => {
    if (!exchangeRate) return;
    const g = processTransactionWithCurrency(nuevoGasto, exchangeRate);
    if (transaccionEditar) {
      setGastos(prev => prev.map(x => x.id === transaccionEditar.id ? g : x));
      showToast('Gasto actualizado exitosamente');
      setTransaccionEditar(null);
    } else {
      setGastos(prev => [...prev, g]);
      showToast('Gasto guardado exitosamente');
    }
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  const handleEliminar = (id, tipo) => {
    if (tipo === 'ingreso') setIngresos(prev => prev.filter(i => i.id !== id));
    else setGastos(prev => prev.filter(g => g.id !== id));
    showToast('Transacción eliminada');
  };

  const handleEditar = (transaccion, tipo) => {
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
    if (tipo === 'ingreso')    setVistaActual('nuevoIngreso');
    else if (tipo === 'gasto') setVistaActual('nuevoGasto');
    else                       setMostrarModalTipo(true);
  };

  const handleToggleLang = () => {
    const l = language === 'es' ? 'en' : 'es';
    setLanguage(l); setStoredLanguage(l);
  };
  const handleToggleCurrency = () => {
    const c = displayCurrency === 'USD' ? 'ARS' : 'USD';
    setDisplayCurrency(c); setStoredDisplayCurrency(c);
  };
  const handleGuardarAhorro = (pct) => {
    setConfig(prev => ({ ...prev, porcentajeAhorro: pct }));
    setMostrarModalAhorro(false);
    showToast(`Ahorro sagrado actualizado: ${pct}%`);
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Render ────────────────────────────────────────────────────────────
  const renderVista = () => {
    const cp = { language, displayCurrency, exchangeRate };
    switch (vistaActual) {
      case 'dashboard':
        return <Dashboard balance={balance} onNuevaTransaccion={handleNuevaTransaccion} {...cp} />;
      case 'prioridades':
        return <SistemaPrioridades distribucion={balance.distribucion} {...cp} />;
      case 'nuevoIngreso':
        return <FormularioIngreso onGuardar={handleGuardarIngreso} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} />;
      case 'nuevoGasto':
        return <FormularioGasto onGuardar={handleGuardarGasto} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} />;
      case 'historial':
        return <Historial ingresos={ingresos} gastos={gastos} onEliminar={handleEliminar} onEditar={handleEditar} {...cp} />;
      case 'cuentas':
        return <Cuentas config={config} onConfigChange={setConfig} cuentas={cuentas} onCuentasChange={setCuentas} />;
      case 'negocios':
        return <Negocios negocios={negocios} onNegociosChange={setNegocios} />;
      case 'proyectos':
        return <Proyectos proyectos={proyectos} onProyectosChange={setProyectos} tasas={config.tasas} />;
      default:
        return <Dashboard balance={balance} onNuevaTransaccion={handleNuevaTransaccion} {...cp} />;
    }
  };

  const enFormulario = ['nuevoIngreso', 'nuevoGasto'].includes(vistaActual);

  const TITULOS = {
    dashboard: null, prioridades: 'PRIORIDADES', historial: 'HISTORIAL',
    cuentas: 'CUENTAS', negocios: 'NEGOCIOS', proyectos: 'PROYECTOS',
  };

  return (
    <div className="min-h-screen bg-dark-bg">

      {/* ── Header ── */}
      {!enFormulario && (
        <div className="fixed top-0 left-0 right-0 z-30 glass-card border-b border-white/[0.06] backdrop-blur-glass">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-silver text-sm tracking-[0.2em] select-none">DENARIUM</span>
              {TITULOS[vistaActual] && (
                <>
                  <span className="text-silver-dim/30 text-xs">·</span>
                  <span className="text-[10px] text-silver-dim tracking-widest">{TITULOS[vistaActual]}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botón % ahorro — visible en dashboard y prioridades */}
              {(vistaActual === 'dashboard' || vistaActual === 'prioridades') && (
                <button onClick={() => setMostrarModalAhorro(true)}
                  className="glass-card px-2.5 py-1.5 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium flex items-center gap-1.5"
                  title="Cambiar % ahorro sagrado">
                  <Cog6ToothIcon className="w-3.5 h-3.5 text-silver-dark" />
                  <span className="font-mono font-bold text-silver text-xs">{config.porcentajeAhorro}%</span>
                </button>
              )}
              <button onClick={handleToggleCurrency}
                className="glass-card px-3 py-1.5 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium">
                <span className="font-mono font-semibold text-silver text-xs">{displayCurrency}</span>
              </button>
              <button onClick={handleToggleLang}
                className="glass-card p-2 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium flex items-center gap-1">
                <LanguageIcon className="w-4 h-4 text-silver-dark" />
                <span className="text-[10px] font-semibold text-silver-dark">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contenido ── */}
      <div className={`max-w-7xl mx-auto p-4 ${!enFormulario ? 'pt-20' : ''}`}>
        {renderVista()}
      </div>

      {/* ── Barra navegación inferior ── */}
      {!enFormulario && (
        <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/[0.06] shadow-elevation-3 z-30 backdrop-blur-glass">
          <div className="max-w-7xl mx-auto px-1">

            {/* Fila superior — Prioridades & Historial */}
            <div className="flex border-b border-white/[0.04]">
              <NavSmall label="Prioridades" active={vistaActual === 'prioridades'} onClick={() => setVistaActual('prioridades')} />
              <NavSmall label="Historial"   active={vistaActual === 'historial'}   onClick={() => setVistaActual('historial')} />
            </div>

            {/* Fila principal */}
            <div className="flex justify-around items-center h-16">
              <NavButton icon={<ChartBarIcon className="w-5 h-5" />}   label="Dashboard" active={vistaActual === 'dashboard'}  onClick={() => setVistaActual('dashboard')} />
              <NavButton icon={<BanknotesIcon className="w-5 h-5" />}  label="Cuentas"   active={vistaActual === 'cuentas'}    onClick={() => setVistaActual('cuentas')} />

              {/* FAB */}
              <button onClick={() => handleNuevaTransaccion()} className="flex flex-col items-center justify-center flex-1 h-full transition-premium">
                <div className="bg-gradient-silver text-dark-bg rounded-full w-12 h-12 flex items-center justify-center shadow-glow-silver hover:shadow-glow-silver-lg transition-premium hover-scale mb-0.5">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-silver-dim">Agregar</span>
              </button>

              <NavButton icon={<BriefcaseIcon className="w-5 h-5" />}  label="Negocios"  active={vistaActual === 'negocios'}   onClick={() => setVistaActual('negocios')} />
              <NavButton icon={<FolderOpenIcon className="w-5 h-5" />} label="Proyectos" active={vistaActual === 'proyectos'}  onClick={() => setVistaActual('proyectos')} />
            </div>
          </div>
        </nav>
      )}

      {/* ── Modal tipo transacción ── */}
      {mostrarModalTipo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 animate-fadeIn"
          onClick={() => setMostrarModalTipo(false)}>
          <div className="glass-card rounded-premium shadow-elevation-3 p-6 max-w-sm w-full border border-silver/10 animate-slideUp"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold mb-2 text-silver tracking-widest">NUEVA TRANSACCIÓN</h2>
            <p className="text-dark-textSecondary text-sm mb-6">¿Qué deseas registrar?</p>
            <div className="space-y-3">
              <button onClick={() => { setVistaActual('nuevoIngreso'); setMostrarModalTipo(false); }}
                className="w-full btn-premium text-center py-4 text-sm tracking-widest">
                ↑&nbsp;&nbsp;INGRESO
              </button>
              <button onClick={() => { setVistaActual('nuevoGasto'); setMostrarModalTipo(false); }}
                className="w-full bg-silver-muted text-silver-bright py-4 rounded-button font-semibold hover:bg-silver-deep transition-premium shadow-elevation-1 tracking-widest text-sm">
                ↓&nbsp;&nbsp;GASTO
              </button>
              <button onClick={() => setMostrarModalTipo(false)}
                className="w-full bg-dark-bgSecondary text-dark-textSecondary py-4 rounded-button font-semibold border border-white/[0.06] text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ahorro % ── */}
      {mostrarModalAhorro && (
        <ModalAhorro
          porcentaje={config.porcentajeAhorro}
          onGuardar={handleGuardarAhorro}
          onCerrar={() => setMostrarModalAhorro(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 h-full transition-premium ${
      active ? 'text-silver' : 'text-dark-textSecondary hover:text-silver-dark'
    }`}>
    {icon}
    <span className="text-[10px] font-medium mt-0.5">{label}</span>
  </button>
);

const NavSmall = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`flex-1 py-2 text-[10px] font-semibold tracking-widest transition-premium ${
      active ? 'text-silver border-b-2 border-silver/40' : 'text-dark-textSecondary hover:text-silver-dim'
    }`}>
    {label.toUpperCase()}
  </button>
);

export default App;
