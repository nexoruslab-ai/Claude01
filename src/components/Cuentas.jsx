import React, { useState } from 'react';
import {
  PencilIcon, CheckIcon, XMarkIcon, PlusIcon, TrashIcon,
  ArrowsRightLeftIcon, BanknotesIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

// ─── Cuentas predeterminadas ───────────────────────────────────────────────
const CUENTAS_DEFAULT = [
  { id: 'wise',          nombre: 'Wise',              moneda: 'USD', saldo: 0, grupo: 'usa' },
  { id: 'lilibank',      nombre: 'Lilibank',           moneda: 'USD', saldo: 0, grupo: 'usa' },
  { id: 'stripe',        nombre: 'Stripe',             moneda: 'USD', saldo: 0, grupo: 'usa' },
  { id: 'paypal',        nombre: 'PayPal',             moneda: 'USD', saldo: 0, grupo: 'usa' },
  { id: 'wallbit',       nombre: 'Wallbit',            moneda: 'USD', saldo: 0, grupo: 'usa', nota: 'Pasarela USD→ARS' },
  { id: 'binance_usdt',  nombre: 'Binance',            moneda: 'USDT', saldo: 0, grupo: 'crypto' },
  { id: 'mercadopago',   nombre: 'MercadoPago',        moneda: 'ARS', saldo: 0, grupo: 'arg' },
  { id: 'lemoncash',     nombre: 'LemonCash',          moneda: 'ARS', saldo: 0, grupo: 'arg' },
  { id: 'patagonia_ars', nombre: 'Bco. Patagonia',     moneda: 'ARS', saldo: 0, grupo: 'arg' },
  { id: 'patagonia_usd', nombre: 'Bco. Patagonia',     moneda: 'USD', saldo: 0, grupo: 'arg' },
  { id: 'galicia_ars',   nombre: 'Bco. Galicia',       moneda: 'ARS', saldo: 0, grupo: 'arg' },
  { id: 'galicia_usd',   nombre: 'Bco. Galicia',       moneda: 'USD', saldo: 0, grupo: 'arg' },
];

const FEES_DEFAULT = [
  { id: 'wise_binance',    origen: 'Wise',       destino: 'Binance (USDT)',  tipo: 'ACH Transfer',  fee: 0,    nota: 'ACH gratis hasta 1M/mo' },
  { id: 'p2p_binance',     origen: 'P2P Binance', destino: 'Wallet',        tipo: 'P2P',           fee: 0.1,  nota: 'Comisión maker/taker' },
  { id: 'binance_wallet',  origen: 'Binance',    destino: 'Wallet externo', tipo: 'Withdraw',      fee: 1,    nota: 'Fee red TRC20 aprox.' },
  { id: 'wallbit_ars',     origen: 'Wallbit',    destino: 'ARS local',      tipo: 'Conversión',    fee: 2,    nota: 'Spread estimado' },
  { id: 'paypal_out',      origen: 'PayPal',     destino: 'Banco',          tipo: 'Retiro',        fee: 2.5,  nota: 'Fee transferencia' },
  { id: 'stripe_out',      origen: 'Stripe',     destino: 'Banco',          tipo: 'Payout',        fee: 0.25, nota: '0.25% por payout' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtNum = (n, dec = 2) => Number(n).toLocaleString('es-AR', {
  minimumFractionDigits: dec,
  maximumFractionDigits: dec
});

export default function Cuentas({ config, onConfigChange, cuentas, onCuentasChange }) {
  const [tab, setTab] = useState('cuentas'); // 'cuentas' | 'tasas' | 'fees'
  const [editandoSaldo, setEditandoSaldo]   = useState(null); // id de cuenta
  const [saldoTemp, setSaldoTemp]           = useState('');
  const [editandoTasa, setEditandoTasa]     = useState(null);
  const [tasaTemp, setTasaTemp]             = useState('');
  const [editandoFee, setEditandoFee]       = useState(null);
  const [feeTemp, setFeeTemp]               = useState({});
  const [mostrarNuevaCuenta, setMostrarNuevaCuenta] = useState(false);
  const [mostrarNuevoFee, setMostrarNuevoFee]       = useState(false);
  const [nuevaCuenta, setNuevaCuenta]       = useState({ nombre: '', moneda: 'USD', saldo: 0, grupo: 'usa', nota: '' });
  const [nuevoFee, setNuevoFee]             = useState({ origen: '', destino: '', tipo: '', fee: 0, nota: '' });

  const { tasas = { usdToArs: 1453.73, usdtToUsd: 0.999 }, fees = FEES_DEFAULT } = config;
  const lista = cuentas.length > 0 ? cuentas : CUENTAS_DEFAULT;

  // ── Conversión a USD para totales ─────────────────────────────────────────
  const toUSD = (saldo, moneda) => {
    if (moneda === 'USD')  return saldo;
    if (moneda === 'USDT') return saldo * tasas.usdtToUsd;
    if (moneda === 'ARS')  return saldo / tasas.usdToArs;
    return saldo;
  };

  const toARS = (saldo, moneda) => {
    if (moneda === 'ARS')  return saldo;
    if (moneda === 'USD')  return saldo * tasas.usdToArs;
    if (moneda === 'USDT') return saldo * tasas.usdtToUsd * tasas.usdToArs;
    return saldo;
  };

  const totalUSD = lista.reduce((acc, c) => acc + toUSD(c.saldo, c.moneda), 0);
  const totalARS = lista.reduce((acc, c) => acc + toARS(c.saldo, c.moneda), 0);
  const totalUSDT = lista.filter(c => c.moneda === 'USDT').reduce((acc, c) => acc + c.saldo, 0);

  // ── Editar saldo ──────────────────────────────────────────────────────────
  const iniciarEditSaldo = (cuenta) => {
    setEditandoSaldo(cuenta.id);
    setSaldoTemp(String(cuenta.saldo));
  };
  const guardarSaldo = (id) => {
    const val = parseFloat(saldoTemp.replace(',', '.')) || 0;
    const updated = lista.map(c => c.id === id ? { ...c, saldo: val } : c);
    onCuentasChange(updated);
    setEditandoSaldo(null);
  };

  // ── Editar tasa ───────────────────────────────────────────────────────────
  const iniciarEditTasa = (key, valor) => {
    setEditandoTasa(key);
    setTasaTemp(String(valor));
  };
  const guardarTasa = (key) => {
    const val = parseFloat(tasaTemp.replace(',', '.')) || 0;
    onConfigChange({ ...config, tasas: { ...tasas, [key]: val } });
    setEditandoTasa(null);
  };

  // ── Editar fee ────────────────────────────────────────────────────────────
  const iniciarEditFee = (fee) => {
    setEditandoFee(fee.id);
    setFeeTemp({ ...fee });
  };
  const guardarFee = () => {
    const updated = fees.map(f => f.id === editandoFee ? { ...feeTemp, fee: parseFloat(feeTemp.fee) || 0 } : f);
    onConfigChange({ ...config, fees: updated });
    setEditandoFee(null);
  };
  const eliminarFee = (id) => {
    onConfigChange({ ...config, fees: fees.filter(f => f.id !== id) });
  };

  // ── Nueva cuenta ──────────────────────────────────────────────────────────
  const agregarCuenta = () => {
    if (!nuevaCuenta.nombre.trim()) return;
    const id = 'custom_' + Date.now();
    onCuentasChange([...lista, { ...nuevaCuenta, id, saldo: parseFloat(nuevaCuenta.saldo) || 0 }]);
    setNuevaCuenta({ nombre: '', moneda: 'USD', saldo: 0, grupo: 'usa', nota: '' });
    setMostrarNuevaCuenta(false);
  };
  const eliminarCuenta = (id) => {
    onCuentasChange(lista.filter(c => c.id !== id));
  };

  // ── Nuevo fee ─────────────────────────────────────────────────────────────
  const agregarFee = () => {
    if (!nuevoFee.origen.trim()) return;
    const nuevo = { ...nuevoFee, id: 'fee_' + Date.now(), fee: parseFloat(nuevoFee.fee) || 0 };
    onConfigChange({ ...config, fees: [...fees, nuevo] });
    setNuevoFee({ origen: '', destino: '', tipo: '', fee: 0, nota: '' });
    setMostrarNuevoFee(false);
  };

  const grupos = { usa: '🇺🇸 USA', crypto: '₿ Cripto', arg: '🇦🇷 Argentina' };

  return (
    <div className="space-y-4 pb-24">

      {/* ── Tabs ── */}
      <div className="flex gap-1 glass-card rounded-premium p-1 border border-white/[0.06]">
        {[
          { key: 'cuentas', label: 'Cuentas', Icon: BanknotesIcon },
          { key: 'tasas',   label: 'Tasas',   Icon: ArrowsRightLeftIcon },
          { key: 'fees',    label: 'Fees',    Icon: Cog6ToothIcon },
        ].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-button text-xs font-semibold tracking-widest transition-premium ${
              tab === key
                ? 'bg-gradient-silver text-dark-bg shadow-glow-silver'
                : 'text-silver-dim hover:text-silver'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: CUENTAS ══════════════════ */}
      {tab === 'cuentas' && (
        <>
          {/* Resumen total */}
          <div className="glass-card rounded-premium p-4 border border-silver/10 shadow-glow-silver">
            <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">PATRIMONIO TOTAL</div>
            <div className="text-3xl font-bold font-display text-gradient-silver tracking-wider mb-1">
              USD {fmtNum(totalUSD)}
            </div>
            <div className="flex gap-4 text-xs text-silver-dim">
              <span>≈ ARS {fmtNum(totalARS, 0)}</span>
              <span>USDT {fmtNum(totalUSDT)}</span>
            </div>
          </div>

          {/* Cuentas por grupo */}
          {Object.entries(grupos).map(([grupoKey, grupoLabel]) => {
            const cuentasGrupo = lista.filter(c => c.grupo === grupoKey);
            if (cuentasGrupo.length === 0) return null;
            const subtotalUSD = cuentasGrupo.reduce((a, c) => a + toUSD(c.saldo, c.moneda), 0);
            return (
              <div key={grupoKey} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-silver-dim tracking-widest font-display">{grupoLabel}</span>
                  <span className="text-[10px] text-silver-dim font-mono">USD {fmtNum(subtotalUSD)}</span>
                </div>
                {cuentasGrupo.map(cuenta => (
                  <div key={cuenta.id}
                    className="glass-card rounded-button p-3 border border-white/[0.06] flex items-center gap-3"
                  >
                    {/* Moneda badge */}
                    <div className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                      cuenta.moneda === 'USD'  ? 'bg-silver-muted/40 text-silver-bright' :
                      cuenta.moneda === 'USDT' ? 'bg-silver-deep/40 text-silver' :
                      'bg-silver-dim/20 text-silver-dim'
                    }`}>
                      {cuenta.moneda}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-silver truncate">{cuenta.nombre}</div>
                      {cuenta.nota && <div className="text-[10px] text-silver-dim truncate">{cuenta.nota}</div>}
                      <div className="text-[10px] text-silver-dim">
                        ≈ USD {fmtNum(toUSD(cuenta.saldo, cuenta.moneda))}
                      </div>
                    </div>

                    {/* Saldo editable */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {editandoSaldo === cuenta.id ? (
                        <>
                          <input
                            type="number"
                            value={saldoTemp}
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
                          <span className="text-sm font-bold font-mono text-silver-bright w-24 text-right">
                            {fmtNum(cuenta.saldo)}
                          </span>
                          <button onClick={() => iniciarEditSaldo(cuenta)} className="text-silver-dim hover:text-silver ml-1">
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
                ))}
              </div>
            );
          })}

          {/* Agregar cuenta custom */}
          {mostrarNuevaCuenta ? (
            <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
              <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVA CUENTA</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Nombre" value={nuevaCuenta.nombre}
                  onChange={e => setNuevaCuenta(p => ({...p, nombre: e.target.value}))}
                  className="input-premium col-span-2 text-sm" />
                <select value={nuevaCuenta.moneda}
                  onChange={e => setNuevaCuenta(p => ({...p, moneda: e.target.value}))}
                  className="input-premium text-sm">
                  <option value="USD">USD</option>
                  <option value="USDT">USDT</option>
                  <option value="ARS">ARS</option>
                </select>
                <select value={nuevaCuenta.grupo}
                  onChange={e => setNuevaCuenta(p => ({...p, grupo: e.target.value}))}
                  className="input-premium text-sm">
                  <option value="usa">🇺🇸 USA</option>
                  <option value="crypto">₿ Cripto</option>
                  <option value="arg">🇦🇷 Argentina</option>
                </select>
                <input placeholder="Saldo inicial" type="number" value={nuevaCuenta.saldo}
                  onChange={e => setNuevaCuenta(p => ({...p, saldo: e.target.value}))}
                  className="input-premium text-sm" />
                <input placeholder="Nota (opcional)" value={nuevaCuenta.nota}
                  onChange={e => setNuevaCuenta(p => ({...p, nota: e.target.value}))}
                  className="input-premium text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={agregarCuenta} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
                <button onClick={() => setMostrarNuevaCuenta(false)}
                  className="flex-1 py-2 text-xs tracking-widest text-silver-dim border border-white/10 rounded-button hover:border-silver/30 transition-premium">
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

      {/* ══════════════════ TAB: TASAS ══════════════════ */}
      {tab === 'tasas' && (
        <div className="space-y-3">
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div className="text-[10px] text-silver-dim tracking-widest mb-4 font-display">TIPOS DE CAMBIO</div>

            {/* USD → ARS */}
            <TasaRow
              label="1 USD ="
              sufijo="ARS"
              valor={tasas.usdToArs}
              editando={editandoTasa === 'usdToArs'}
              temp={tasaTemp}
              onEdit={() => iniciarEditTasa('usdToArs', tasas.usdToArs)}
              onChangeTemp={setTasaTemp}
              onSave={() => guardarTasa('usdToArs')}
              onCancel={() => setEditandoTasa(null)}
              nota={`100 USD = ${fmtNum(tasas.usdToArs * 100, 0)} ARS`}
            />

            <div className="border-t border-white/[0.04] my-3" />

            {/* USDT → USD */}
            <TasaRow
              label="1 USDT ="
              sufijo="USD"
              valor={tasas.usdtToUsd}
              editando={editandoTasa === 'usdtToUsd'}
              temp={tasaTemp}
              onEdit={() => iniciarEditTasa('usdtToUsd', tasas.usdtToUsd)}
              onChangeTemp={setTasaTemp}
              onSave={() => guardarTasa('usdtToUsd')}
              onCancel={() => setEditandoTasa(null)}
              nota={`100 USDT = ${fmtNum(tasas.usdtToUsd * 100, 2)} USD`}
            />
          </div>

          {/* Calculadora rápida */}
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
                    <input placeholder="Origen" value={feeTemp.origen}
                      onChange={e => setFeeTemp(p => ({...p, origen: e.target.value}))}
                      className="input-premium text-xs" />
                    <input placeholder="Destino" value={feeTemp.destino}
                      onChange={e => setFeeTemp(p => ({...p, destino: e.target.value}))}
                      className="input-premium text-xs" />
                    <input placeholder="Tipo" value={feeTemp.tipo}
                      onChange={e => setFeeTemp(p => ({...p, tipo: e.target.value}))}
                      className="input-premium text-xs" />
                    <div className="relative">
                      <input placeholder="Fee %" type="number" value={feeTemp.fee}
                        onChange={e => setFeeTemp(p => ({...p, fee: e.target.value}))}
                        className="input-premium text-xs w-full pr-6" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-xs">%</span>
                    </div>
                    <input placeholder="Nota" value={feeTemp.nota}
                      onChange={e => setFeeTemp(p => ({...p, nota: e.target.value}))}
                      className="input-premium text-xs col-span-2" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={guardarFee} className="btn-premium flex-1 py-1.5 text-xs tracking-widest">GUARDAR</button>
                    <button onClick={() => setEditandoFee(null)}
                      className="flex-1 py-1.5 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
                      CANCELAR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-silver truncate">{fee.origen}</span>
                      <span className="text-silver-dim text-xs">→</span>
                      <span className="text-xs text-silver-dim truncate">{fee.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-silver-dim bg-white/[0.04] px-1.5 py-0.5 rounded">{fee.tipo}</span>
                      {fee.nota && <span className="text-[10px] text-silver-dim truncate">{fee.nota}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold font-mono ${fee.fee === 0 ? 'text-silver-bright' : 'text-silver'}`}>
                      {fee.fee}%
                    </span>
                    <button onClick={() => iniciarEditFee(fee)} className="text-silver-dim hover:text-silver">
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => eliminarFee(fee.id)} className="text-silver-dim hover:text-silver">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Agregar fee */}
          {mostrarNuevoFee ? (
            <div className="glass-card rounded-premium p-4 border border-silver/20 space-y-3">
              <div className="text-[10px] text-silver-dim tracking-widest font-display">NUEVO FEE</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Origen (ej: Wise)" value={nuevoFee.origen}
                  onChange={e => setNuevoFee(p => ({...p, origen: e.target.value}))}
                  className="input-premium text-sm" />
                <input placeholder="Destino (ej: Binance)" value={nuevoFee.destino}
                  onChange={e => setNuevoFee(p => ({...p, destino: e.target.value}))}
                  className="input-premium text-sm" />
                <input placeholder="Tipo (ej: ACH)" value={nuevoFee.tipo}
                  onChange={e => setNuevoFee(p => ({...p, tipo: e.target.value}))}
                  className="input-premium text-sm" />
                <div className="relative">
                  <input placeholder="Fee" type="number" value={nuevoFee.fee}
                    onChange={e => setNuevoFee(p => ({...p, fee: e.target.value}))}
                    className="input-premium text-sm w-full pr-7" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-dim text-sm">%</span>
                </div>
                <input placeholder="Nota" value={nuevoFee.nota}
                  onChange={e => setNuevoFee(p => ({...p, nota: e.target.value}))}
                  className="input-premium text-sm col-span-2" />
              </div>
              <div className="flex gap-2">
                <button onClick={agregarFee} className="btn-premium flex-1 py-2 text-xs tracking-widest">AGREGAR</button>
                <button onClick={() => setMostrarNuevoFee(false)}
                  className="flex-1 py-2 text-xs border border-white/10 rounded-button text-silver-dim hover:border-silver/30 transition-premium">
                  CANCELAR
                </button>
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

// ─── Sub-componente: fila de tasa ─────────────────────────────────────────
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
            <input
              type="number"
              value={temp}
              onChange={e => onChangeTemp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSave()}
              autoFocus
              className="w-28 bg-dark-bgSecondary border border-silver/30 rounded px-2 py-1 text-sm text-silver text-right font-mono focus:outline-none focus:border-silver/60"
            />
            <span className="text-silver-dim text-xs">{sufijo}</span>
            <button onClick={onSave} className="text-silver-bright hover:text-silver">
              <CheckIcon className="w-4 h-4" />
            </button>
            <button onClick={onCancel} className="text-silver-dim hover:text-silver">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-lg font-bold font-mono text-silver-bright">{valor.toLocaleString('es-AR')}</span>
            <span className="text-silver-dim text-xs">{sufijo}</span>
            <button onClick={onEdit} className="text-silver-dim hover:text-silver ml-1">
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-componente: calculadora rápida ──────────────────────────────────
function CalculadoraRapida({ tasas }) {
  const [montoCalc, setMontoCalc] = useState('');
  const [monedaCalc, setMonedaCalc] = useState('USD');

  const monto = parseFloat(montoCalc) || 0;
  const enUSD   = monedaCalc === 'USD'  ? monto : monedaCalc === 'USDT' ? monto * tasas.usdtToUsd : monto / tasas.usdToArs;
  const enARS   = enUSD * tasas.usdToArs;
  const enUSDT  = enUSD / tasas.usdtToUsd;

  return (
    <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
      <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">CALCULADORA RÁPIDA</div>
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          placeholder="Monto..."
          value={montoCalc}
          onChange={e => setMontoCalc(e.target.value)}
          className="input-premium flex-1 text-sm"
        />
        <select value={monedaCalc} onChange={e => setMonedaCalc(e.target.value)}
          className="input-premium w-24 text-sm">
          <option value="USD">USD</option>
          <option value="USDT">USDT</option>
          <option value="ARS">ARS</option>
        </select>
      </div>
      {monto > 0 && (
        <div className="space-y-1.5">
          {monedaCalc !== 'USD'  && <ConvRow label="USD"  valor={enUSD}  decimales={2} />}
          {monedaCalc !== 'USDT' && <ConvRow label="USDT" valor={enUSDT} decimales={2} />}
          {monedaCalc !== 'ARS'  && <ConvRow label="ARS"  valor={enARS}  decimales={0} />}
        </div>
      )}
    </div>
  );
}

function ConvRow({ label, valor, decimales }) {
  return (
    <div className="flex justify-between items-center py-1 border-t border-white/[0.04]">
      <span className="text-xs text-silver-dim font-mono">{label}</span>
      <span className="text-sm font-bold font-mono text-silver-bright">
        {valor.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}
      </span>
    </div>
  );
}
