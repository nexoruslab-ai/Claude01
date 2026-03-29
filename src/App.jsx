import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SistemaPrioridades from './components/SistemaPrioridades.jsx';
import FormularioIngreso from './components/FormularioIngreso.jsx';
import FormularioGasto from './components/FormularioGasto.jsx';
import Historial from './components/Historial.jsx';
import Cuentas from './components/Cuentas.jsx';
import Negocios from './components/Negocios.jsx';
import Proyectos from './components/Proyectos.jsx';
import Registros from './components/Registros.jsx';
import Configuracion from './components/Configuracion.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import Toast from './components/Toast.jsx';
import { calcularBalanceGeneral } from './utils/calculations.js';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n.js';
import { initializeTheme } from './utils/theme.js';
import { getStoredDisplayCurrency, setStoredDisplayCurrency } from './utils/currency.js';
import { getCurrentExchangeRate, processTransactionWithCurrency } from './utils/exchangeRate.js';
import { LanguageIcon } from '@heroicons/react/24/solid';
import {
  ChartBarIcon      as ChartBarOutline,
  BanknotesIcon     as BanknotesOutline,
  BriefcaseIcon     as BriefcaseOutline,
  FolderOpenIcon    as FolderOutline,
  ClockIcon         as ClockOutline,
  PlusIcon, Cog6ToothIcon, XMarkIcon,
  ArrowUpIcon, ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon      as ChartBarSolid,
  BanknotesIcon     as BanknotesSolid,
  BriefcaseIcon     as BriefcaseSolid,
  FolderOpenIcon    as FolderSolid,
  ClockIcon         as ClockSolid,
} from '@heroicons/react/24/solid';

// ── Storage keys ──────────────────────────────────────────────────────────
const SK_INGRESOS  = 'denarium_ingresos';
const SK_GASTOS    = 'denarium_gastos';
const SK_CONFIG    = 'denarium_config';
const SK_CUENTAS   = 'denarium_cuentas';
const SK_NEGOCIOS  = 'denarium_negocios';
const SK_PROYECTOS = 'denarium_proyectos';

// ── Config por defecto — 100% configurable por cualquier usuario ──────────
const CONFIG_DEFAULT = {
  // Finanzas
  porcentajeAhorro: 40,
  // Tasas de cambio (USD como moneda base)
  tasas: { usdToArs: 1453.73, usdtToUsd: 0.999 },
  // Monedas activas (el usuario elige cuáles usa)
  monedasActivas: ['USD', 'ARS', 'USDT'],
  // Monedas extra disponibles
  monedasDisponibles: [
    { code: 'USD',  nombre: 'Dólar (USD)',         simbolo: '$',  tasaVsUSD: 1 },
    { code: 'ARS',  nombre: 'Peso argentino (ARS)',simbolo: '$',  tasaVsUSD: null }, // de tasas.usdToArs
    { code: 'USDT', nombre: 'Tether (USDT)',        simbolo: '₮',  tasaVsUSD: null }, // de tasas.usdtToUsd
    { code: 'EUR',  nombre: 'Euro (EUR)',            simbolo: '€',  tasaVsUSD: 1.08 },
    { code: 'BRL',  nombre: 'Real (BRL)',            simbolo: 'R$', tasaVsUSD: 0.19 },
    { code: 'CLP',  nombre: 'Peso chileno (CLP)',    simbolo: '$',  tasaVsUSD: 0.00106 },
    { code: 'MXN',  nombre: 'Peso mexicano (MXN)',   simbolo: '$',  tasaVsUSD: 0.058 },
    { code: 'COP',  nombre: 'Peso colombiano (COP)', simbolo: '$',  tasaVsUSD: 0.00024 },
    { code: 'UYU',  nombre: 'Peso uruguayo (UYU)',   simbolo: '$',  tasaVsUSD: 0.025 },
    { code: 'PYG',  nombre: 'Guaraní (PYG)',         simbolo: '₲',  tasaVsUSD: 0.000133 },
    { code: 'GBP',  nombre: 'Libra esterlina (GBP)', simbolo: '£',  tasaVsUSD: 1.27 },
  ],
  // Listas editables — el usuario define las suyas
  empresas:      ['Mi Empresa', 'Cliente Freelance', 'Otro'],
  metodosCobro:  ['Transferencia', 'Efectivo USD', 'Efectivo ARS', 'PayPal', 'Stripe', 'Binance', 'Mercado Pago'],
  tiposPago:     ['Pago Completo', 'Cuota', 'Adelanto', 'Pago Parcial'],
  categoriasGastos: ['Vivienda', 'Comida', 'Transporte', 'Salud', 'Educación', 'Entretenimiento', 'Ropa', 'Servicios', 'Suscripciones', 'Inversión', 'Otros'],
  // Fees de plataformas
  fees: [
    { id: 'wise_binance',   origen: 'Wise',       destino: 'Binance (USDT)', tipo: 'ACH Transfer', fee: 0,    nota: 'ACH gratis hasta 1M/mo' },
    { id: 'p2p_binance',    origen: 'P2P Binance', destino: 'Wallet',        tipo: 'P2P',          fee: 0.1,  nota: 'Comisión maker/taker' },
    { id: 'binance_wallet', origen: 'Binance',     destino: 'Wallet externo',tipo: 'Withdraw',     fee: 1,    nota: 'Fee red TRC20 aprox.' },
    { id: 'wallbit_ars',    origen: 'Wallbit',     destino: 'ARS local',     tipo: 'Conversión',   fee: 2,    nota: 'Spread estimado' },
    { id: 'paypal_out',     origen: 'PayPal',      destino: 'Banco',         tipo: 'Retiro',       fee: 2.5,  nota: 'Fee transferencia' },
    { id: 'stripe_out',     origen: 'Stripe',      destino: 'Banco',         tipo: 'Payout',       fee: 0.25, nota: '0.25% por payout' },
  ],
};

const loadJSON = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ── Modal: selección tipo transacción ─────────────────────────────────────
function ModalTipoTransaccion({ onIngreso, onGasto, onCerrar }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end justify-center z-50 animate-fadeIn"
      onClick={onCerrar}>
      <div className="glass-card rounded-t-premium shadow-elevation-3 p-5 w-full max-w-lg border-t border-x border-silver/10 animate-slideUp"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
        <p className="text-[10px] text-silver-dim tracking-widest text-center mb-4 font-display">¿QUÉ DESEAS REGISTRAR?</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button onClick={onIngreso}
            className="flex flex-col items-center gap-2 py-5 rounded-button border border-silver/20 bg-silver/5 hover:bg-silver/10 transition-premium">
            <ArrowUpIcon className="w-6 h-6 text-silver-bright" />
            <span className="text-sm font-semibold text-silver tracking-widest">INGRESO</span>
          </button>
          <button onClick={onGasto}
            className="flex flex-col items-center gap-2 py-5 rounded-button border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-premium">
            <ArrowDownIcon className="w-6 h-6 text-silver-dim" />
            <span className="text-sm font-semibold text-silver-dim tracking-widest">GASTO</span>
          </button>
        </div>
        <button onClick={onCerrar}
          className="w-full py-3 text-xs text-silver-dim border border-white/[0.06] rounded-button hover:border-white/20 transition-premium tracking-widest">
          CANCELAR
        </button>
      </div>
    </div>
  );
}

// ── Modal: editar % ahorro sagrado ────────────────────────────────────────
function ModalAhorro({ porcentaje, onGuardar, onCerrar }) {
  const [val, setVal] = useState(String(porcentaje));
  const n = parseFloat(val) || 0;
  const valido = n >= 0 && n <= 100;
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
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

// ── Configuración de secciones de navegación ──────────────────────────────
const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Inicio',
    iconOutline: <ChartBarOutline className="w-5 h-5" />,
    iconSolid:   <ChartBarSolid   className="w-5 h-5" />,
    fabLabel: 'TRANSACCIÓN',
    fabAccion: 'transaccion',
  },
  {
    id: 'cuentas',
    label: 'Cuentas',
    iconOutline: <BanknotesOutline className="w-5 h-5" />,
    iconSolid:   <BanknotesSolid   className="w-5 h-5" />,
    fabLabel: 'CUENTA',
    fabAccion: 'nueva',
  },
  {
    id: 'negocios',
    label: 'Negocios',
    iconOutline: <BriefcaseOutline className="w-5 h-5" />,
    iconSolid:   <BriefcaseSolid   className="w-5 h-5" />,
    fabLabel: 'NEGOCIO',
    fabAccion: 'nueva',
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    iconOutline: <FolderOutline className="w-5 h-5" />,
    iconSolid:   <FolderSolid   className="w-5 h-5" />,
    fabLabel: 'PROYECTO',
    fabAccion: 'nueva',
  },
  {
    id: 'registros',
    label: 'Registros',
    iconOutline: <ClockOutline className="w-5 h-5" />,
    iconSolid:   <ClockSolid   className="w-5 h-5" />,
    fabLabel: 'TRANSACCIÓN',
    fabAccion: 'transaccion',
  },
];

// ── App principal ─────────────────────────────────────────────────────────
function App() {
  const [ingresos,   setIngresos]   = useState([]);
  const [gastos,     setGastos]     = useState([]);
  const [config,     setConfig]     = useState(CONFIG_DEFAULT);
  const [cuentas,    setCuentas]    = useState([]);
  const [negocios,   setNegocios]   = useState([]);
  const [proyectos,  setProyectos]  = useState([]);

  const [vistaActual, setVistaActual]              = useState('dashboard');
  const [prevVista,   setPrevVista]                = useState(null);
  const [mostrarModalTipo,   setMostrarModalTipo]  = useState(false);
  const [mostrarModalAhorro, setMostrarModalAhorro]= useState(false);
  const [transaccionEditar,  setTransaccionEditar] = useState(null);

  // Signal para que secciones abran su formulario "nuevo" via FAB
  const [addNewSignal, setAddNewSignal] = useState(0);

  const [language,        setLanguage]        = useState('es');
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRate,    setExchangeRate]    = useState(null);
  const [toast,           setToast]           = useState(null);

  // ── Tutorial ──────────────────────────────────────────────────────────
  const [tutorialActivo, setTutorialActivo] = useState(false);
  const [tutorialStep,   setTutorialStep]   = useState(0);

  // ── Cargar todo al inicio ─────────────────────────────────────────────
  useEffect(() => {
    initializeTheme();
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

  const balance = calcularBalanceGeneral(ingresos, gastos, config.porcentajeAhorro);

  // ── Navegación ────────────────────────────────────────────────────────
  const navigate = (vista) => {
    setPrevVista(vistaActual);
    setVistaActual(vista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── FAB contextual ────────────────────────────────────────────────────
  const handleFAB = () => {
    const seccion = NAV_ITEMS.find(n => n.id === vistaActual);
    if (!seccion || seccion.fabAccion === 'transaccion') {
      setMostrarModalTipo(true);
    } else {
      // Signal a la sección activa para abrir su formulario "nuevo"
      setAddNewSignal(s => s + 1);
    }
  };

  // ── Handlers transacciones ────────────────────────────────────────────
  const handleGuardarIngreso = (nuevoIngreso) => {
    if (!exchangeRate) return;
    const ing = processTransactionWithCurrency(nuevoIngreso, exchangeRate);
    if (transaccionEditar) {
      setIngresos(prev => prev.map(i => i.id === transaccionEditar.id ? ing : i));
      showToast('Ingreso actualizado');
      setTransaccionEditar(null);
    } else {
      setIngresos(prev => [...prev, ing]);
      showToast('Ingreso registrado ✓');
    }
    navigate('dashboard');
    setMostrarModalTipo(false);
  };

  const handleGuardarGasto = (nuevoGasto) => {
    if (!exchangeRate) return;
    const g = processTransactionWithCurrency(nuevoGasto, exchangeRate);
    if (transaccionEditar) {
      setGastos(prev => prev.map(x => x.id === transaccionEditar.id ? g : x));
      showToast('Gasto actualizado');
      setTransaccionEditar(null);
    } else {
      setGastos(prev => [...prev, g]);
      showToast('Gasto registrado ✓');
    }
    navigate('dashboard');
    setMostrarModalTipo(false);
  };

  const handleEliminar = (id, tipo) => {
    if (tipo === 'ingreso') setIngresos(prev => prev.filter(i => i.id !== id));
    else setGastos(prev => prev.filter(g => g.id !== id));
    showToast('Transacción eliminada');
  };

  const handleEditar = (transaccion, tipo) => {
    setTransaccionEditar(transaccion);
    navigate(tipo === 'ingreso' ? 'nuevoIngreso' : 'nuevoGasto');
  };

  const handleCancelar = () => {
    navigate(prevVista || 'dashboard');
    setTransaccionEditar(null);
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
    showToast(`Ahorro sagrado: ${pct}%`);
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Render principal ──────────────────────────────────────────────────
  const enFormulario = ['nuevoIngreso', 'nuevoGasto'].includes(vistaActual);
  const cp = { language, displayCurrency, exchangeRate };
  const navActivo = NAV_ITEMS.find(n => n.id === vistaActual);

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return (
          <Dashboard
            balance={balance}
            onNuevaTransaccion={() => setMostrarModalTipo(true)}
            onNavigate={navigate}
            cuentas={cuentas}
            config={config}
            negocios={negocios}
            {...cp}
          />
        );
      case 'prioridades':
        return <SistemaPrioridades distribucion={balance.distribucion} {...cp} />;
      case 'nuevoIngreso':
        return <FormularioIngreso onGuardar={handleGuardarIngreso} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} config={config} />;
      case 'nuevoGasto':
        return <FormularioGasto onGuardar={handleGuardarGasto} onCancelar={handleCancelar} language={language} transaccion={transaccionEditar} config={config} />;
      case 'configuracion':
        return (
          <Configuracion
            config={config}
            onConfigChange={newConfig => setConfig(prev => ({ ...prev, ...newConfig }))}
            displayCurrency={displayCurrency}
            onDisplayCurrencyChange={c => { setDisplayCurrency(c); setStoredDisplayCurrency(c); }}
            language={language}
            onLanguageChange={l => { setLanguage(l); setStoredLanguage(l); }}
          />
        );
      case 'historial':
        return <Historial ingresos={ingresos} gastos={gastos} onEliminar={handleEliminar} onEditar={handleEditar} {...cp} />;
      case 'registros':
        return (
          <Registros
            ingresos={ingresos} gastos={gastos} negocios={negocios}
            config={config} onEliminar={handleEliminar} onEditar={handleEditar}
            {...cp}
          />
        );
      case 'cuentas':
        return <Cuentas config={config} onConfigChange={setConfig} cuentas={cuentas} onCuentasChange={setCuentas} addNewSignal={addNewSignal} />;
      case 'negocios':
        return <Negocios negocios={negocios} onNegociosChange={setNegocios} addNewSignal={addNewSignal} />;
      case 'proyectos':
        return <Proyectos proyectos={proyectos} onProyectosChange={setProyectos} tasas={config.tasas} addNewSignal={addNewSignal} />;
      default:
        return <Dashboard balance={balance} onNuevaTransaccion={() => setMostrarModalTipo(true)} onNavigate={navigate} cuentas={cuentas} config={config} negocios={negocios} {...cp} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">

      {/* ── Header ── */}
      {!enFormulario && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-dark-bg/80 backdrop-blur-glass border-b border-white/[0.05]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">

            {/* Logo + breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={() => navigate('dashboard')}
                className="font-display text-silver text-sm tracking-[0.2em] select-none hover:text-silver-bright transition-colors flex-shrink-0">
                DENARIUM
              </button>
              {vistaActual !== 'dashboard' && navActivo && (
                <>
                  <span className="text-silver-dim/30 text-xs flex-shrink-0">›</span>
                  <span className="text-[10px] text-silver-dim tracking-widest truncate">{navActivo.label.toUpperCase()}</span>
                </>
              )}
            </div>

            {/* Controles derechos */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Tutorial button — purple */}
              <button
                onClick={() => { setTutorialStep(0); setTutorialActivo(true); }}
                className="tutorial-btn-ring relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  boxShadow: '0 0 12px rgba(139,92,246,0.45)',
                }}
                title="Tutorial"
              >
                <span className="text-[13px] tutorial-float select-none">✦</span>
              </button>

              <button onClick={() => navigate('configuracion')}
                className={`glass-card px-2.5 py-1.5 rounded-button border transition-premium flex items-center gap-1.5 ${
                  vistaActual === 'configuracion' ? 'border-silver/40 bg-silver/10' : 'border-white/[0.06] hover:border-silver/30'
                }`}
                title="Configuración">
                <Cog6ToothIcon className={`w-3.5 h-3.5 ${vistaActual === 'configuracion' ? 'text-silver' : 'text-silver-dark'}`} />
                <span className="font-mono font-bold text-silver text-xs">{config.porcentajeAhorro}%</span>
              </button>
              <button onClick={handleToggleCurrency}
                className="glass-card px-2.5 py-1.5 rounded-button border border-white/[0.06] hover:border-silver/30 transition-premium">
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

      {/* ── Contenido principal (con fade al cambiar sección) ── */}
      <div className={`max-w-lg mx-auto px-4 ${!enFormulario ? 'pt-20 pb-24' : 'pt-4 pb-8'}`}>
        <div key={vistaActual} className="animate-fadeIn">
          {renderVista()}
        </div>
      </div>

      {/* ── Navegación inferior ── */}
      {!enFormulario && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-dark-bg/90 backdrop-blur-glass border-t border-white/[0.06]">
          <div className="max-w-lg mx-auto px-2">
            <div className="flex items-end h-[60px]">

              {/* Items izquierdos */}
              {NAV_ITEMS.slice(0, 2).map(item => (
                <NavItem key={item.id} item={item} active={vistaActual === item.id} onClick={() => navigate(item.id)} />
              ))}

              {/* FAB central */}
              <div className="flex flex-col items-center justify-end pb-2 flex-1">
                <button
                  onClick={handleFAB}
                  className="bg-gradient-silver text-dark-bg rounded-full w-12 h-12 flex items-center justify-center shadow-glow-silver hover:shadow-glow-silver-lg transition-premium hover-scale mb-0.5"
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
                <span className="text-[9px] font-semibold text-silver-dim tracking-widest">
                  {navActivo?.fabLabel || 'AGREGAR'}
                </span>
              </div>

              {/* Items derechos */}
              {NAV_ITEMS.slice(2).map(item => (
                <NavItem key={item.id} item={item} active={vistaActual === item.id} onClick={() => navigate(item.id)} />
              ))}

            </div>
          </div>
        </nav>
      )}

      {/* ── Modales ── */}
      {mostrarModalTipo && (
        <ModalTipoTransaccion
          onIngreso={() => { navigate('nuevoIngreso'); setMostrarModalTipo(false); }}
          onGasto={()   => { navigate('nuevoGasto');  setMostrarModalTipo(false); }}
          onCerrar={() => setMostrarModalTipo(false)}
        />
      )}

      {mostrarModalAhorro && (
        <ModalAhorro
          porcentaje={config.porcentajeAhorro}
          onGuardar={handleGuardarAhorro}
          onCerrar={() => setMostrarModalAhorro(false)}
        />
      )}

      {/* ── Tutorial Overlay ── */}
      {tutorialActivo && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={()     => setTutorialStep(s => Math.min(s + 1, 7))}
          onPrev={()     => setTutorialStep(s => Math.max(s - 1, 0))}
          onClose={()    => setTutorialActivo(false)}
          onNavigate={navigate}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── Componente NavItem ────────────────────────────────────────────────────
const NavItem = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-end pb-2 flex-1 h-full relative transition-premium group"
  >
    {/* Indicador activo: línea superior */}
    <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
      active ? 'w-8 bg-silver/60' : 'w-0 bg-transparent'
    }`} />

    {/* Ícono */}
    <span className={`transition-all duration-200 mb-0.5 ${
      active ? 'text-silver scale-110' : 'text-dark-textSecondary group-hover:text-silver-dim'
    }`}>
      {active ? item.iconSolid : item.iconOutline}
    </span>

    {/* Label */}
    <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${
      active ? 'text-silver' : 'text-dark-textSecondary group-hover:text-silver-dim'
    }`}>
      {item.label.toUpperCase()}
    </span>
  </button>
);

export default App;
