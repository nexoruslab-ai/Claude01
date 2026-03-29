import React, { useState, useEffect } from 'react';
import {
  PencilIcon, CheckIcon, XMarkIcon, PlusIcon, TrashIcon,
  ArrowsRightLeftIcon, BanknotesIcon, Cog6ToothIcon,
  LockClosedIcon, LockOpenIcon, ClockIcon, BellIcon
} from '@heroicons/react/24/outline';

// ─── Días de retención por plataforma (defaults) ───────────────────────────
const RETENCION_DEFAULT = {
  wise:          2,
  lilibank:      0,
  stripe:        15,
  paypal:        21,
  wallbit:       2,
  binance_usdt:  0,
  mercadopago:   14,
  lemoncash:     0,
  patagonia_ars: 1,
  patagonia_usd: 1,
  galicia_ars:   1,
  galicia_usd:   1,
};

// ─── Cuentas predeterminadas ───────────────────────────────────────────────
const CUENTAS_DEFAULT = [
  { id: 'wise',          nombre: 'Wise',           moneda: 'USD',  saldo: 0, grupo: 'usa',    diasRetencion: 2,  retenciones: [] },
  { id: 'lilibank',      nombre: 'Lilibank',        moneda: 'USD',  saldo: 0, grupo: 'usa',    diasRetencion: 0,  retenciones: [] },
  { id: 'stripe',        nombre: 'Stripe',          moneda: 'USD',  saldo: 0, grupo: 'usa',    diasRetencion: 15, retenciones: [] },
  { id: 'paypal',        nombre: 'PayPal',          moneda: 'USD',  saldo: 0, grupo: 'usa',    diasRetencion: 21, retenciones: [] },
  { id: 'wallbit',       nombre: 'Wallbit',         moneda: 'USD',  saldo: 0, grupo: 'usa',    diasRetencion: 2,  retenciones: [], nota: 'Pasarela USD→ARS' },
  { id: 'binance_usdt',  nombre: 'Binance',         moneda: 'USDT', saldo: 0, grupo: 'crypto', diasRetencion: 0,  retenciones: [] },
  { id: 'mercadopago',   nombre: 'MercadoPago',     moneda: 'ARS',  saldo: 0, grupo: 'arg',    diasRetencion: 14, retenciones: [] },
  { id: 'lemoncash',     nombre: 'LemonCash',       moneda: 'ARS',  saldo: 0, grupo: 'arg',    diasRetencion: 0,  retenciones: [] },
  { id: 'patagonia_ars', nombre: 'Bco. Patagonia',  moneda: 'ARS',  saldo: 0, grupo: 'arg',    diasRetencion: 1,  retenciones: [] },
  { id: 'patagonia_usd', nombre: 'Bco. Patagonia',  moneda: 'USD',  saldo: 0, grupo: 'arg',    diasRetencion: 1,  retenciones: [] },
  { id: 'galicia_ars',   nombre: 'Bco. Galicia',    moneda: 'ARS',  saldo: 0, grupo: 'arg',    diasRetencion: 1,  retenciones: [] },
  { id: 'galicia_usd',   nombre: 'Bco. Galicia',    moneda: 'USD',  saldo: 0, grupo: 'arg',    diasRetencion: 1,  retenciones: [] },
];

const FEES_DEFAULT = [
  { id: 'wise_binance',    origen: 'Wise',        destino: 'Binance (USDT)',  tipo: 'ACH Transfer', fee: 0,    nota: 'ACH gratis hasta 1M/mo' },
  { id: 'p2p_binance',     origen: 'P2P Binance', destino: 'Wallet',         tipo: 'P2P',          fee: 0.1,  nota: 'Comisión maker/taker' },
  { id: 'binance_wallet',  origen: 'Binance',     destino: 'Wallet externo', tipo: 'Withdraw',     fee: 1,    nota: 'Fee red TRC20 aprox.' },
  { id: 'wallbit_ars',     origen: 'Wallbit',     destino: 'ARS local',      tipo: 'Conversión',   fee: 2,    nota: 'Spread estimado' },
  { id: 'paypal_out',      origen: 'PayPal',      destino: 'Banco',          tipo: 'Retiro',       fee: 2.5,  nota: 'Fee transferencia' },
  { id: 'stripe_out',      origen: 'Stripe',      destino: 'Banco',          tipo: 'Payout',       fee: 0.25, nota: '0.25% por payout' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtNum = (n, dec = 2) =>
  Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const hoy = () => new Date().toISOString().split('T')[0];

const diasHasta = (fechaStr) => {
  const diff = new Date(fechaStr) - new Date(hoy());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const addDias = (fechaStr, dias) => {
  const d = new Date(fechaStr);
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
};

const fmtFecha = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
};

// Calcula el saldo retenido (suma de retenciones no liberadas)
const calcRetenido = (cuenta) => {
  const rets = cuenta.retenciones || [];
  return rets.filter(r => !r.liberado).reduce((a, r) => a + Number(r.monto), 0);
};

// Calcula el saldo disponible real
const calcDisponible = (cuenta) => Math.max(0, Number(cuenta.saldo) - calcRetenido(cuenta));

// ─── Componente principal ──────────────────────────────────────────────────
export default function Cuentas({ config, onConfigChange, cuentas, onCuentasChange, addNewSignal = 0 }) {
  // FAB signal → abrir formulario nueva cuenta
  useEffect(() => {
    if (addNewSignal > 0) {
      setTab('cuentas');
      setMostrarNuevaCuenta(true);
      setTimeout(() => window.scrollTo({ top: 99999, behavior: 'smooth' }), 100);
    }
  }, [addNewSignal]);

  const [tab, setTab] = useState('cuentas');

  // Estado saldo
  const [editandoSaldo, setEditandoSaldo] = useState(null);
  const [saldoTemp, setSaldoTemp]         = useState('');

  // Estado retenciones
  const [cuentaExpandida, setCuentaExpandida]     = useState(null);
  const [mostrarNuevaRet, setMostrarNuevaRet]     = useState(null); // cuentaId
  const [nuevaRet, setNuevaRet]                   = useState({ monto: '', concepto: '', fechaIngreso: hoy(), fechaLiberacion: '' });
  const [editandoDias, setEditandoDias]           = useState(null);
  const [diasTemp, setDiasTemp]                   = useState('');

  // Estado tasas
  const [editandoTasa, setEditandoTasa] = useState(null);
  const [tasaTemp, setTasaTemp]         = useState('');

  // Estado fees
  const [editandoFee, setEditandoFee] = useState(null);
  const [feeTemp, setFeeTemp]         = useState({});
  const [mostrarNuevoFee, setMostrarNuevoFee] = useState(false);
  const [nuevoFee, setNuevoFee]         = useState({ origen: '', destino: '', tipo: '', fee: 0, nota: '' });

  // Nueva cuenta
  const [mostrarNuevaCuenta, setMostrarNuevaCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: '', moneda: 'USD', saldo: 0, grupo: 'usa', nota: '', diasRetencion: 0 });

  const { tasas = { usdToArs: 1453.73, usdtToUsd: 0.999 }, fees = FEES_DEFAULT } = config;

  // Normalizar cuentas: agregar campos nuevos si faltan
  const lista = (cuentas.length > 0 ? cuentas : CUENTAS_DEFAULT).map(c => ({
    diasRetencion: RETENCION_DEFAULT[c.id] ?? 0,
    retenciones: [],
    ...c,
  }));

  // ── Conversión a USD ───────────────────────────────────────────────────
  const toUSD = (saldo, moneda) => {
    if (moneda === 'USD')  return Number(saldo);
    if (moneda === 'USDT') return Number(saldo) * tasas.usdtToUsd;
    if (moneda === 'ARS')  return Number(saldo) / tasas.usdToArs;
    return Number(saldo);
  };
  const toARS = (saldo, moneda) => {
    if (moneda === 'ARS')  return Number(saldo);
    if (moneda === 'USD')  return Number(saldo) * tasas.usdToArs;
    if (moneda === 'USDT') return Number(saldo) * tasas.usdtToUsd * tasas.usdToArs;
    return Number(saldo);
  };

  // Totales: disponible vs retenido
  const totalDispUSD   = lista.reduce((a, c) => a + toUSD(calcDisponible(c), c.moneda), 0);
  const totalRetenUSD  = lista.reduce((a, c) => a + toUSD(calcRetenido(c),   c.moneda), 0);
  const totalBrutoUSD  = lista.reduce((a, c) => a + toUSD(c.saldo,           c.moneda), 0);
  const totalDispARS   = lista.reduce((a, c) => a + toARS(calcDisponible(c), c.moneda), 0);

  // Todas las retenciones activas, ordenadas por fecha
  const todasRetenciones = lista.flatMap(c =>
    (c.retenciones || [])
      .filter(r => !r.liberado)
      .map(r => ({ ...r, cuentaNombre: c.nombre, cuentaMoneda: c.moneda, cuentaId: c.id }))
  ).sort((a, b) => new Date(a.fechaLiberacion) - new Date(b.fechaLiberacion));

  // ── Mutaciones de cuentas ──────────────────────────────────────────────
  const updateCuenta = (id, patch) =>
    onCuentasChange(lista.map(c => c.id === id ? { ...c, ...patch } : c));

  // Guardar saldo
  const guardarSaldo = (id) => {
    const val = parseFloat(saldoTemp.replace(',', '.')) || 0;
    updateCuenta(id, { saldo: val });
    setEditandoSaldo(null);
  };

  // Guardar días de retención
  const guardarDias = (id) => {
    const val = parseInt(diasTemp) || 0;
    updateCuenta(id, { diasRetencion: val });
    setEditandoDias(null);
  };

  // Agregar retención
  const agregarRetencion = (cuentaId) => {
    const montoNum = parseFloat(nuevaRet.monto);
    if (!montoNum || montoNum <= 0) return; // solo bloquear si no hay monto válido
    const cuenta = lista.find(c => c.id === cuentaId);
    // Si la fecha de liberación no fue editada, recalcular desde fechaIngreso
    const fechaLib = nuevaRet.fechaLiberacion || autoFechaLib(cuentaId, nuevaRet.fechaIngreso);
    const nueva = {
      id: 'ret_' + Date.now(),
      monto: montoNum,
      concepto: nuevaRet.concepto || 'Sin concepto',
      fechaIngreso: nuevaRet.fechaIngreso || hoy(),
      fechaLiberacion: fechaLib,
      liberado: false,
    };
    updateCuenta(cuentaId, { retenciones: [...(cuenta.retenciones || []), nueva] });
    setNuevaRet({ monto: '', concepto: '', fechaIngreso: hoy(), fechaLiberacion: '' });
    setMostrarNuevaRet(null);
  };

  // Liberar / eliminar retención
  const liberarRetencion = (cuentaId, retId) => {
    const cuenta = lista.find(c => c.id === cuentaId);
    updateCuenta(cuentaId, {
      retenciones: cuenta.retenciones.map(r => r.id === retId ? { ...r, liberado: true } : r)
    });
  };
  const eliminarRetencion = (cuentaId, retId) => {
    const cuenta = lista.find(c => c.id === cuentaId);
    updateCuenta(cuentaId, { retenciones: cuenta.retenciones.filter(r => r.id !== retId) });
  };

  // Calcular fecha de liberación: fechaIngreso + diasRetencion
  // Si diasRetencion === 0, disponible el mismo día → devuelve fechaIngreso
  const autoFechaLib = (cuentaId, fechaIngreso) => {
    const cuenta = lista.find(c => c.id === cuentaId);
    if (!cuenta) return fechaIngreso || hoy();
    return addDias(fechaIngreso || hoy(), cuenta.diasRetencion || 0);
  };

  // ── Tasas y fees ───────────────────────────────────────────────────────
  const guardarTasa = (key) => {
    const val = parseFloat(tasaTemp.replace(',', '.')) || 0;
    onConfigChange({ ...config, tasas: { ...tasas, [key]: val } });
    setEditandoTasa(null);
  };
  const guardarFee = () => {
    const updated = fees.map(f => f.id === editandoFee ? { ...feeTemp, fee: parseFloat(feeTemp.fee) || 0 } : f);
    onConfigChange({ ...config, fees: updated });
    setEditandoFee(null);
  };
  const eliminarFee = (id) => onConfigChange({ ...config, fees: fees.filter(f => f.id !== id) });
  const agregarFee = () => {
    if (!nuevoFee.origen.trim()) return;
    const nuevo = { ...nuevoFee, id: 'fee_' + Date.now(), fee: parseFloat(nuevoFee.fee) || 0 };
    onConfigChange({ ...config, fees: [...fees, nuevo] });
    setNuevoFee({ origen: '', destino: '', tipo: '', fee: 0, nota: '' });
    setMostrarNuevoFee(false);
  };

  // Nueva cuenta
  const agregarCuenta = () => {
    if (!nuevaCuenta.nombre.trim()) return;
    const id = 'custom_' + Date.now();
    onCuentasChange([...lista, { ...nuevaCuenta, id, saldo: parseFloat(nuevaCuenta.saldo) || 0, retenciones: [] }]);
    setNuevaCuenta({ nombre: '', moneda: 'USD', saldo: 0, grupo: 'usa', nota: '', diasRetencion: 0 });
    setMostrarNuevaCuenta(false);
  };
  const eliminarCuenta = (id) => onCuentasChange(lista.filter(c => c.id !== id));

  const grupos = { usa: '🇺🇸 USA', crypto: '₿ Cripto', arg: '🇦🇷 Argentina' };

  return (
    <div className="space-y-4 pb-24">

      {/* ── Tabs ── */}
      <div className="flex gap-1 glass-card rounded-premium p-1 border border-white/[0.06]">
        {[
          { key: 'cuentas',     label: 'Cuentas',     Icon: BanknotesIcon },
          { key: 'retenciones', label: 'Retenciones', Icon: LockClosedIcon },
          { key: 'tasas',       label: 'Tasas',        Icon: ArrowsRightLeftIcon },
          { key: 'fees',        label: 'Fees',         Icon: Cog6ToothIcon },
        ].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-button text-[10px] font-semibold tracking-widest transition-premium ${
              tab === key
                ? 'bg-gradient-silver text-dark-bg shadow-glow-silver'
                : 'text-silver-dim hover:text-silver'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: CUENTAS ══════════════════ */}
      {tab === 'cuentas' && (
        <>
          {/* Resumen disponible vs retenido */}
          <div className="glass-card rounded-premium p-4 border border-silver/10 shadow-glow-silver">
            <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">PATRIMONIO</div>
            <div className="text-3xl font-bold font-display text-gradient-silver tracking-wider">
              USD {fmtNum(totalDispUSD)}
            </div>
            <div className="text-[10px] text-silver-dim mt-0.5">disponible ahora</div>

            <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.04]">
              <div>
                <div className="text-[10px] text-silver-dim mb-0.5">BRUTO TOTAL</div>
                <div className="text-sm font-mono font-semibold text-silver">USD {fmtNum(totalBrutoUSD)}</div>
              </div>
              {totalRetenUSD > 0 && (
                <div>
                  <div className="text-[10px] text-silver-dim mb-0.5 flex items-center gap-1">
                    <LockClosedIcon className="w-3 h-3" /> RETENIDO
                  </div>
                  <div className="text-sm font-mono font-semibold text-silver-dim">USD {fmtNum(totalRetenUSD)}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-silver-dim mb-0.5">≈ ARS</div>
                <div className="text-sm font-mono font-semibold text-silver-dim">{fmtNum(totalDispARS, 0)}</div>
              </div>
            </div>

            {/* Barra disponible vs retenido */}
            {totalBrutoUSD > 0 && totalRetenUSD > 0 && (
              <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-silver rounded-full transition-all"
                  style={{ width: `${Math.round((totalDispUSD / totalBrutoUSD) * 100)}%` }} />
              </div>
            )}

            {/* Próximas liberaciones mini */}
            {todasRetenciones.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.04]">
                <div className="text-[10px] text-silver-dim tracking-widest mb-2 flex items-center gap-1">
                  <BellIcon className="w-3 h-3" /> PRÓXIMAS LIBERACIONES
                </div>
                <div className="space-y-1">
                  {todasRetenciones.slice(0, 3).map(r => {
                    const dias = diasHasta(r.fechaLiberacion);
                    return (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            dias <= 0 ? 'bg-silver/20 text-silver-bright' :
                            dias <= 3 ? 'bg-silver-muted/30 text-silver' :
                            'bg-white/[0.04] text-silver-dim'
                          }`}>
                            {dias <= 0 ? '¡HOY!' : dias === 1 ? 'mañana' : `${dias}d`}
                          </span>
                          <span className="text-silver-dim truncate">{r.cuentaNombre} · {r.concepto}</span>
                        </div>
                        <span className="font-mono font-semibold text-silver-bright flex-shrink-0 ml-2">
                          {r.cuentaMoneda} {fmtNum(r.monto)}
                        </span>
                      </div>
                    );
                  })}
                  {todasRetenciones.length > 3 && (
                    <button onClick={() => setTab('retenciones')}
                      className="text-[10px] text-silver-dim hover:text-silver transition-colors">
                      +{todasRetenciones.length - 3} más → ver todas
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cuentas por grupo */}
          {Object.entries(grupos).map(([grupoKey, grupoLabel]) => {
            const cuentasGrupo = lista.filter(c => c.grupo === grupoKey);
            if (!cuentasGrupo.length) return null;
            const subtotalDisp = cuentasGrupo.reduce((a, c) => a + toUSD(calcDisponible(c), c.moneda), 0);
            const subtotalRet  = cuentasGrupo.reduce((a, c) => a + toUSD(calcRetenido(c),   c.moneda), 0);

            return (
              <div key={grupoKey} className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-silver-dim tracking-widest font-display">{grupoLabel}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-silver-dim font-mono">USD {fmtNum(subtotalDisp)}</span>
                    {subtotalRet > 0 && (
                      <span className="text-[10px] text-silver-dim/50 font-mono ml-2">(+{fmtNum(subtotalRet)} ret.)</span>
                    )}
                  </div>
                </div>

                {cuentasGrupo.map(cuenta => {
                  const retenido   = calcRetenido(cuenta);
                  const disponible = calcDisponible(cuenta);
                  const tieneRets  = (cuenta.retenciones || []).filter(r => !r.liberado).length > 0;
                  const isExpanded = cuentaExpandida === cuenta.id;

                  return (
                    <div key={cuenta.id}
                      className={`glass-card rounded-button border transition-premium ${
                        tieneRets ? 'border-silver/10' : 'border-white/[0.06]'
                      }`}
                    >
                      {/* Fila principal */}
                      <div className="flex items-center gap-3 p-3">
                        {/* Moneda badge */}
                        <div className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                          cuenta.moneda === 'USD'  ? 'bg-silver-muted/40 text-silver-bright' :
                          cuenta.moneda === 'USDT' ? 'bg-silver-deep/40 text-silver' :
                          'bg-silver-dim/20 text-silver-dim'
                        }`}>
                          {cuenta.moneda}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setCuentaExpandida(isExpanded ? null : cuenta.id)}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-silver truncate">{cuenta.nombre}</span>
                            {cuenta.diasRetencion > 0 && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.04] text-silver-dim flex-shrink-0">
                                {cuenta.diasRetencion}d ret.
                              </span>
                            )}
                            {cuenta.nota && <span className="text-[9px] text-silver-dim/50 truncate">{cuenta.nota}</span>}
                          </div>

                          {/* Saldo disponible vs retenido */}
                          {retenido > 0 ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <LockOpenIcon className="w-3 h-3 text-silver" />
                                <span className="text-[10px] font-mono text-silver">{fmtNum(disponible)} disp.</span>
                              </div>
                              <span className="text-silver-dim/30 text-[10px]">|</span>
                              <div className="flex items-center gap-1">
                                <LockClosedIcon className="w-3 h-3 text-silver-dim" />
                                <span className="text-[10px] font-mono text-silver-dim">{fmtNum(retenido)} ret.</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-silver-dim">
                              ≈ USD {fmtNum(toUSD(disponible, cuenta.moneda))}
                            </div>
                          )}
                        </div>

                        {/* Saldo editable */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {editandoSaldo === cuenta.id ? (
                            <>
                              <input type="number" value={saldoTemp}
                                onChange={e => setSaldoTemp(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && guardarSaldo(cuenta.id)}
                                autoFocus
                                className="w-24 bg-dark-bgSecondary border border-silver/30 rounded px-2 py-1 text-xs text-silver text-right font-mono focus:outline-none focus:border-silver/60"
                              />
                              <button onClick={() => guardarSaldo(cuenta.id)} className="text-silver-bright hover:text-silver">
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditandoSaldo(null)} className="text-silver-dim hover:text-silver">
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-bold font-mono text-silver-bright w-20 text-right">
                                {fmtNum(cuenta.saldo)}
                              </span>
                              <button onClick={() => { setEditandoSaldo(cuenta.id); setSaldoTemp(String(cuenta.saldo)); }}
                                className="text-silver-dim hover:text-silver ml-1">
                                <PencilIcon className="w-3.5 h-3.5" />
                              </button>
                              {cuenta.id.startsWith('custom_') && (
                                <button onClick={() => eliminarCuenta(cuenta.id)} className="text-silver-dim hover:text-silver ml-0.5">
                                  <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Panel expandido: retenciones */}
                      {isExpanded && (
                        <div className="border-t border-white/[0.04] px-3 pb-3">

                          {/* Config días de retención */}
                          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                            <div className="flex items-center gap-1.5 text-[10px] text-silver-dim">
                              <ClockIcon className="w-3.5 h-3.5" />
                              DÍAS DE RETENCIÓN POR DEFECTO
                            </div>
                            {editandoDias === cuenta.id ? (
                              <div className="flex items-center gap-1">
                                <input type="number" min="0" value={diasTemp}
                                  onChange={e => setDiasTemp(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && guardarDias(cuenta.id)}
                                  autoFocus
                                  className="w-16 bg-dark-bgSecondary border border-silver/30 rounded px-2 py-0.5 text-xs text-silver text-right font-mono focus:outline-none"
                                />
                                <span className="text-[10px] text-silver-dim">días</span>
                                <button onClick={() => guardarDias(cuenta.id)} className="text-silver-bright">
                                  <CheckIcon className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditandoDias(null)} className="text-silver-dim">
                                  <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-silver">{cuenta.diasRetencion} días</span>
                                <button onClick={() => { setEditandoDias(cuenta.id); setDiasTemp(String(cuenta.diasRetencion)); }}
                                  className="text-silver-dim hover:text-silver">
                                  <PencilIcon className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Lista de retenciones */}
                          {(cuenta.retenciones || []).length > 0 && (
                            <div className="space-y-1.5 mt-2.5">
                              {cuenta.retenciones.map(r => {
                                const dias = diasHasta(r.fechaLiberacion);
                                const vencido = dias <= 0;
                                return (
                                  <div key={r.id}
                                    className={`rounded-button px-3 py-2 flex items-center gap-2 ${
                                      r.liberado ? 'bg-white/[0.02] opacity-50' : 'bg-white/[0.04]'
                                    }`}
                                  >
                                    {/* Estado */}
                                    <div className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                      r.liberado ? 'bg-silver-deep/20 text-silver-dim' :
                                      vencido    ? 'bg-silver/20 text-silver-bright' :
                                      dias <= 3  ? 'bg-silver-muted/30 text-silver' :
                                      'bg-white/[0.04] text-silver-dim'
                                    }`}>
                                      {r.liberado ? 'LIB.' : vencido ? '¡YA!' : dias === 1 ? 'MAÑANA' : `${dias}d`}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[10px] font-semibold text-silver truncate">{r.concepto}</div>
                                      <div className="text-[9px] text-silver-dim">
                                        Ingresó {fmtFecha(r.fechaIngreso)} · Libera {fmtFecha(r.fechaLiberacion)}
                                      </div>
                                    </div>

                                    {/* Monto */}
                                    <span className={`font-mono font-bold text-xs flex-shrink-0 ${r.liberado ? 'text-silver-dim' : 'text-silver-bright'}`}>
                                      {cuenta.moneda} {fmtNum(r.monto)}
                                    </span>

                                    {/* Acciones */}
                                    {!r.liberado && (
                                      <button onClick={() => liberarRetencion(cuenta.id, r.id)}
                                        title="Marcar como liberado"
                                        className="text-silver-dim hover:text-silver-bright transition-premium flex-shrink-0">
                                        <LockOpenIcon className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => eliminarRetencion(cuenta.id, r.id)}
                                      className="text-silver-dim hover:text-silver transition-premium flex-shrink-0">
                                      <TrashIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Form nueva retención */}
                          {mostrarNuevaRet === cuenta.id ? (
                            <div className="mt-3 space-y-2 bg-white/[0.02] rounded-button p-3">
                              <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVA RETENCIÓN</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <input type="number" placeholder="Monto retenido" value={nuevaRet.monto}
                                    onChange={e => setNuevaRet(p => ({ ...p, monto: e.target.value }))}
                                    className="input-premium text-sm w-full pr-10"
                                    autoFocus />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-[10px]">{cuenta.moneda}</span>
                                </div>
                                <input placeholder="Concepto (ej: Venta X)" value={nuevaRet.concepto}
                                  onChange={e => setNuevaRet(p => ({ ...p, concepto: e.target.value }))}
                                  className="input-premium text-sm" />
                                <div>
                                  <div className="text-[9px] text-silver-dim mb-1">Fecha que ingresó</div>
                                  <input type="date" value={nuevaRet.fechaIngreso}
                                    onChange={e => {
                                      const fi = e.target.value;
                                      // Siempre recalcular fecha liberación desde fecha ingreso
                                      setNuevaRet(p => ({
                                        ...p,
                                        fechaIngreso: fi,
                                        fechaLiberacion: autoFechaLib(cuenta.id, fi),
                                      }));
                                    }}
                                    className="input-premium text-sm w-full" />
                                </div>
                                <div>
                                  <div className="text-[9px] text-silver-dim mb-1 flex items-center gap-1">
                                    Fecha liberación
                                    <span className="text-silver-dim/50">
                                      {cuenta.diasRetencion > 0
                                        ? `(+${cuenta.diasRetencion}d — editable)`
                                        : '(mismo día — editable)'}
                                    </span>
                                  </div>
                                  <input type="date" value={nuevaRet.fechaLiberacion}
                                    onChange={e => setNuevaRet(p => ({ ...p, fechaLiberacion: e.target.value }))}
                                    className="input-premium text-sm w-full" />
                                </div>
                              </div>
                              {/* Preview días restantes */}
                              {nuevaRet.fechaLiberacion && (
                                <div className="text-[10px] text-silver-dim bg-white/[0.03] rounded px-3 py-1.5">
                                  {(() => {
                                    const d = diasHasta(nuevaRet.fechaLiberacion);
                                    if (d <= 0) return '✓ Disponible hoy o ya liberado';
                                    if (d === 1) return '⏱ Libera mañana';
                                    return `⏱ Libera en ${d} días (${fmtFecha(nuevaRet.fechaLiberacion)})`;
                                  })()}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button onClick={() => agregarRetencion(cuenta.id)}
                                  className="btn-premium flex-1 py-2 text-xs tracking-widest">
                                  REGISTRAR
                                </button>
                                <button onClick={() => { setMostrarNuevaRet(null); setNuevaRet({ monto: '', concepto: '', fechaIngreso: hoy(), fechaLiberacion: '' }); }}
                                  className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim">
                                  CANCELAR
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => {
                              setMostrarNuevaRet(cuenta.id);
                              setNuevaRet({ monto: '', concepto: '', fechaIngreso: hoy(), fechaLiberacion: autoFechaLib(cuenta.id, hoy()) });
                            }}
                              className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 text-[10px] text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
                              <LockClosedIcon className="w-3.5 h-3.5" /> REGISTRAR RETENCIÓN
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Agregar cuenta */}
          {mostrarNuevaCuenta ? (
            <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
              <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVA CUENTA</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Nombre" value={nuevaCuenta.nombre}
                  onChange={e => setNuevaCuenta(p => ({ ...p, nombre: e.target.value }))}
                  className="input-premium col-span-2 text-sm" />
                <select value={nuevaCuenta.moneda}
                  onChange={e => setNuevaCuenta(p => ({ ...p, moneda: e.target.value }))}
                  className="input-premium text-sm">
                  {['USD','USDT','ARS'].map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={nuevaCuenta.grupo}
                  onChange={e => setNuevaCuenta(p => ({ ...p, grupo: e.target.value }))}
                  className="input-premium text-sm">
                  <option value="usa">🇺🇸 USA</option>
                  <option value="crypto">₿ Cripto</option>
                  <option value="arg">🇦🇷 Argentina</option>
                </select>
                <input type="number" placeholder="Saldo inicial" value={nuevaCuenta.saldo}
                  onChange={e => setNuevaCuenta(p => ({ ...p, saldo: e.target.value }))}
                  className="input-premium text-sm" />
                <div className="relative">
                  <input type="number" placeholder="Días de retención" value={nuevaCuenta.diasRetencion}
                    onChange={e => setNuevaCuenta(p => ({ ...p, diasRetencion: e.target.value }))}
                    className="input-premium text-sm w-full pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-silver-dim">días</span>
                </div>
                <input placeholder="Nota (opcional)" value={nuevaCuenta.nota}
                  onChange={e => setNuevaCuenta(p => ({ ...p, nota: e.target.value }))}
                  className="input-premium col-span-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={agregarCuenta} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
                <button onClick={() => setMostrarNuevaCuenta(false)}
                  className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
                  CANCELAR
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setMostrarNuevaCuenta(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
              <PlusIcon className="w-4 h-4" /> AGREGAR CUENTA
            </button>
          )}
        </>
      )}

      {/* ══════════════════ TAB: RETENCIONES ══════════════════ */}
      {tab === 'retenciones' && (
        <div className="space-y-3">

          {/* Resumen rápido */}
          {totalRetenUSD > 0 && (
            <div className="glass-card rounded-premium p-4 border border-silver/10">
              <div className="text-[10px] text-silver-dim tracking-widest mb-2 font-display">TOTAL RETENIDO</div>
              <div className="text-2xl font-bold font-display text-silver">
                USD {fmtNum(totalRetenUSD)}
              </div>
              <div className="text-[10px] text-silver-dim mt-0.5">en {todasRetenciones.length} retenciones activas</div>
            </div>
          )}

          {todasRetenciones.length === 0 ? (
            <div className="glass-card rounded-premium p-8 border border-white/[0.06] text-center">
              <LockOpenIcon className="w-8 h-8 text-silver-dim mx-auto mb-2" />
              <div className="text-sm text-silver-dim">No hay fondos retenidos</div>
              <div className="text-[10px] text-silver-dim/50 mt-1">Cargá retenciones desde cada cuenta</div>
            </div>
          ) : (
            <div className="space-y-2">
              {todasRetenciones.map(r => {
                const dias = diasHasta(r.fechaLiberacion);
                return (
                  <div key={r.id}
                    className={`glass-card rounded-button p-3 border flex items-center gap-3 ${
                      dias <= 0 ? 'border-silver/20' : dias <= 3 ? 'border-silver/10' : 'border-white/[0.06]'
                    }`}
                  >
                    {/* Badge días */}
                    <div className={`flex-shrink-0 w-14 text-center text-[10px] font-bold px-1.5 py-1.5 rounded font-mono ${
                      dias <= 0 ? 'bg-silver/20 text-silver-bright' :
                      dias <= 3 ? 'bg-silver-muted/30 text-silver' :
                      dias <= 7 ? 'bg-white/[0.06] text-silver-dim' :
                      'bg-white/[0.03] text-silver-dim/60'
                    }`}>
                      {dias <= 0 ? '¡HOY!' : dias === 1 ? 'mañana' : `en ${dias}d`}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-silver">{r.concepto}</div>
                      <div className="text-[10px] text-silver-dim">{r.cuentaNombre} · libera el {fmtFecha(r.fechaLiberacion)}</div>
                    </div>

                    {/* Monto */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold font-mono text-silver-bright">
                        {r.cuentaMoneda} {fmtNum(r.monto)}
                      </div>
                      <div className="text-[9px] text-silver-dim font-mono">
                        ≈ USD {fmtNum(toUSD(r.monto, r.cuentaMoneda))}
                      </div>
                    </div>

                    {/* Liberar */}
                    <button onClick={() => liberarRetencion(r.cuentaId, r.id)}
                      title="Marcar fondos como liberados"
                      className="text-silver-dim hover:text-silver-bright transition-premium flex-shrink-0">
                      <LockOpenIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historial de liberados */}
          {lista.some(c => (c.retenciones || []).some(r => r.liberado)) && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-silver-dim tracking-widest px-1 font-display">LIBERADOS RECIENTEMENTE</div>
              {lista.flatMap(c =>
                (c.retenciones || [])
                  .filter(r => r.liberado)
                  .map(r => (
                    <div key={r.id} className="glass-card rounded-button px-3 py-2 border border-white/[0.03] opacity-50 flex items-center gap-3">
                      <LockOpenIcon className="w-4 h-4 text-silver-dim flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-silver-dim truncate">{r.concepto} · {c.nombre}</div>
                      </div>
                      <span className="font-mono text-xs text-silver-dim font-bold">{c.moneda} {fmtNum(r.monto)}</span>
                      <button onClick={() => eliminarRetencion(c.id, r.id)} className="text-silver-dim hover:text-silver">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ TAB: TASAS ══════════════════ */}
      {tab === 'tasas' && (
        <div className="space-y-3">
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div className="text-[10px] text-silver-dim tracking-widest mb-4 font-display">TIPOS DE CAMBIO</div>
            <TasaRow label="1 USD =" sufijo="ARS"
              valor={tasas.usdToArs} editando={editandoTasa === 'usdToArs'} temp={tasaTemp}
              onEdit={() => { setEditandoTasa('usdToArs'); setTasaTemp(String(tasas.usdToArs)); }}
              onChangeTemp={setTasaTemp} onSave={() => guardarTasa('usdToArs')} onCancel={() => setEditandoTasa(null)}
              nota={`100 USD = ${fmtNum(tasas.usdToArs * 100, 0)} ARS`} />
            <div className="border-t border-white/[0.04] my-3" />
            <TasaRow label="1 USDT =" sufijo="USD"
              valor={tasas.usdtToUsd} editando={editandoTasa === 'usdtToUsd'} temp={tasaTemp}
              onEdit={() => { setEditandoTasa('usdtToUsd'); setTasaTemp(String(tasas.usdtToUsd)); }}
              onChangeTemp={setTasaTemp} onSave={() => guardarTasa('usdtToUsd')} onCancel={() => setEditandoTasa(null)}
              nota={`100 USDT = ${fmtNum(tasas.usdtToUsd * 100, 2)} USD`} />
          </div>
          <CalculadoraRapida tasas={tasas} />
        </div>
      )}

      {/* ══════════════════ TAB: FEES ══════════════════ */}
      {tab === 'fees' && (
        <div className="space-y-2">
          <div className="px-1">
            <div className="text-[10px] text-silver-dim tracking-widest font-display">FEES ENTRE PLATAFORMAS</div>
          </div>

          {fees.map(fee => (
            <div key={fee.id} className="glass-card rounded-button p-3 border border-white/[0.06]">
              {editandoFee === fee.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Origen" value={feeTemp.origen} onChange={e => setFeeTemp(p => ({...p, origen: e.target.value}))} className="input-premium text-xs" />
                    <input placeholder="Destino" value={feeTemp.destino} onChange={e => setFeeTemp(p => ({...p, destino: e.target.value}))} className="input-premium text-xs" />
                    <input placeholder="Tipo" value={feeTemp.tipo} onChange={e => setFeeTemp(p => ({...p, tipo: e.target.value}))} className="input-premium text-xs" />
                    <div className="relative">
                      <input placeholder="Fee %" type="number" value={feeTemp.fee} onChange={e => setFeeTemp(p => ({...p, fee: e.target.value}))} className="input-premium text-xs w-full pr-6" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
                    </div>
                    <input placeholder="Nota" value={feeTemp.nota} onChange={e => setFeeTemp(p => ({...p, nota: e.target.value}))} className="input-premium text-xs col-span-2" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={guardarFee} className="btn-premium flex-1 py-1.5 text-xs tracking-widest">GUARDAR</button>
                    <button onClick={() => setEditandoFee(null)} className="flex-1 py-1.5 text-xs border border-white/10 rounded-button text-silver-dim">CANCELAR</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-silver">{fee.origen}</span>
                      <span className="text-silver-dim text-xs">→</span>
                      <span className="text-xs text-silver-dim">{fee.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-silver-dim bg-white/[0.04] px-1.5 py-0.5 rounded">{fee.tipo}</span>
                      {fee.nota && <span className="text-[10px] text-silver-dim truncate">{fee.nota}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold font-mono ${fee.fee === 0 ? 'text-silver-bright' : 'text-silver'}`}>{fee.fee}%</span>
                    <button onClick={() => { setEditandoFee(fee.id); setFeeTemp({ ...fee }); }} className="text-silver-dim hover:text-silver"><PencilIcon className="w-3.5 h-3.5" /></button>
                    <button onClick={() => eliminarFee(fee.id)} className="text-silver-dim hover:text-silver"><TrashIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {mostrarNuevoFee ? (
            <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
              <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVO FEE</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Origen" value={nuevoFee.origen} onChange={e => setNuevoFee(p => ({...p, origen: e.target.value}))} className="input-premium text-sm" />
                <input placeholder="Destino" value={nuevoFee.destino} onChange={e => setNuevoFee(p => ({...p, destino: e.target.value}))} className="input-premium text-sm" />
                <input placeholder="Tipo" value={nuevoFee.tipo} onChange={e => setNuevoFee(p => ({...p, tipo: e.target.value}))} className="input-premium text-sm" />
                <div className="relative">
                  <input placeholder="Fee" type="number" value={nuevoFee.fee} onChange={e => setNuevoFee(p => ({...p, fee: e.target.value}))} className="input-premium text-sm w-full pr-7" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-sm">%</span>
                </div>
                <input placeholder="Nota" value={nuevoFee.nota} onChange={e => setNuevoFee(p => ({...p, nota: e.target.value}))} className="input-premium text-sm col-span-2" />
              </div>
              <div className="flex gap-2">
                <button onClick={agregarFee} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
                <button onClick={() => setMostrarNuevoFee(false)} className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim">CANCELAR</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setMostrarNuevoFee(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs text-silver-dim border border-dashed border-white/10 rounded-button hover:border-silver/30 hover:text-silver transition-premium tracking-widest">
              <PlusIcon className="w-4 h-4" /> AGREGAR FEE
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TasaRow ──────────────────────────────────────────────────────────────
function TasaRow({ label, sufijo, valor, editando, temp, onEdit, onChangeTemp, onSave, onCancel, nota }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <div className="text-sm text-silver-dim">{label}</div>
        {nota && <div className="text-[10px] text-silver-dim/60 mt-0.5">{nota}</div>}
      </div>
      <div className="flex items-center gap-1.5">
        {editando ? (
          <>
            <input type="number" value={temp} onChange={e => onChangeTemp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSave()} autoFocus
              className="w-28 bg-dark-bgSecondary border border-silver/30 rounded px-2 py-1 text-sm text-silver text-right font-mono focus:outline-none focus:border-silver/60" />
            <span className="text-silver-dim text-xs">{sufijo}</span>
            <button onClick={onSave} className="text-silver-bright hover:text-silver"><CheckIcon className="w-4 h-4" /></button>
            <button onClick={onCancel} className="text-silver-dim hover:text-silver"><XMarkIcon className="w-4 h-4" /></button>
          </>
        ) : (
          <>
            <span className="text-lg font-bold font-mono text-silver-bright">{valor.toLocaleString('es-AR')}</span>
            <span className="text-silver-dim text-xs">{sufijo}</span>
            <button onClick={onEdit} className="text-silver-dim hover:text-silver ml-1"><PencilIcon className="w-3.5 h-3.5" /></button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CalculadoraRapida ────────────────────────────────────────────────────
function CalculadoraRapida({ tasas }) {
  const [montoCalc, setMontoCalc] = useState('');
  const [monedaCalc, setMonedaCalc] = useState('USD');
  const monto  = parseFloat(montoCalc) || 0;
  const enUSD  = monedaCalc === 'USD'  ? monto : monedaCalc === 'USDT' ? monto * tasas.usdtToUsd : monto / tasas.usdToArs;
  const enARS  = enUSD * tasas.usdToArs;
  const enUSDT = enUSD / tasas.usdtToUsd;

  return (
    <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
      <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">CALCULADORA RÁPIDA</div>
      <div className="flex gap-2 mb-3">
        <input type="number" placeholder="Monto..." value={montoCalc} onChange={e => setMontoCalc(e.target.value)} className="input-premium flex-1 text-sm" />
        <select value={monedaCalc} onChange={e => setMonedaCalc(e.target.value)} className="input-premium w-24 text-sm">
          {['USD','USDT','ARS'].map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
      {monto > 0 && (
        <div className="space-y-1.5">
          {monedaCalc !== 'USD'  && <ConvRow label="USD"  valor={enUSD}  dec={2} />}
          {monedaCalc !== 'USDT' && <ConvRow label="USDT" valor={enUSDT} dec={2} />}
          {monedaCalc !== 'ARS'  && <ConvRow label="ARS"  valor={enARS}  dec={0} />}
        </div>
      )}
    </div>
  );
}

function ConvRow({ label, valor, dec }) {
  return (
    <div className="flex justify-between items-center py-1 border-t border-white/[0.04]">
      <span className="text-xs text-silver-dim font-mono">{label}</span>
      <span className="text-sm font-bold font-mono text-silver-bright">
        {valor.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
      </span>
    </div>
  );
}
