import React, { useState, useMemo } from 'react';
import { formatearMoneda } from '../utils/calculations.js';
import {
  ArrowUpIcon, ArrowDownIcon, BriefcaseIcon, TrashIcon,
  PencilIcon, FunnelIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Helpers ───────────────────────────────────────────────────────────────
const toUSD = (monto, moneda, tasas) => {
  const n = Number(monto || 0);
  if (!tasas) return n;
  if (moneda === 'ARS')  return n / (tasas.usdToArs  || 1453.73);
  if (moneda === 'USDT') return n * (tasas.usdtToUsd || 0.999);
  return n;
};
const fmt2  = (n) => Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtFecha = (f) => {
  if (!f) return '';
  try {
    const [y,m,d] = f.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  } catch { return f; }
};
const ganPago = (pago, pctNeg) => {
  if (pago.ganancia !== '' && pago.ganancia !== undefined) return Number(pago.ganancia) || 0;
  return (Number(pago.facturacion||0) * Number(pago.porcentajePago ?? pctNeg ?? 100)) / 100;
};

const TABS = [
  { id:'estadisticas', label:'ESTADÍSTICAS' },
  { id:'movimientos',  label:'MOVIMIENTOS'  },
  { id:'negocios',     label:'POR NEGOCIO'  },
];

const FILTROS = [
  { id:'todos',     label:'Todos'    },
  { id:'ingreso',   label:'Ingresos' },
  { id:'gasto',     label:'Gastos'   },
  { id:'negocio',   label:'Negocios' },
];

// ─────────────────────────────────────────────────────────────────────────
export default function Registros({
  ingresos=[], gastos=[], negocios=[],
  config={}, onEliminar, onEditar,
  language, displayCurrency, exchangeRate,
}) {
  const [tab,    setTab]    = useState('estadisticas');
  const [filtro, setFiltro] = useState('todos');

  const tasas  = config.tasas || {};
  const rate   = exchangeRate?.USD_ARS || tasas.usdToArs || 1427.99;
  const pct    = config.porcentajeAhorro ?? 40;

  // ── Totales ───────────────────────────────────────────────────────────
  const totalIngTx = useMemo(()=>
    ingresos.reduce((s,i)=>s+Number(i.montoUSD??i.monto??0),0), [ingresos]);

  const totalGasTx = useMemo(()=>
    gastos.reduce((s,g)=>s+Number(g.montoUSD??g.monto??0),0), [gastos]);

  const totalCobradoNeg = useMemo(()=>
    negocios.reduce((sum,n)=>
      sum + (n.pagos||[]).filter(p=>p.estado==='cobrado')
        .reduce((s,p)=>s+toUSD(ganPago(p,n.porcentaje),p.moneda||n.moneda||'USD',tasas),0)
    ,0), [negocios, tasas]);

  const totalPendienteNeg = useMemo(()=>
    negocios.reduce((sum,n)=>
      sum + (n.pagos||[]).filter(p=>p.estado==='pendiente')
        .reduce((s,p)=>s+toUSD(ganPago(p,n.porcentaje),p.moneda||n.moneda||'USD',tasas),0)
    ,0), [negocios, tasas]);

  const totalIngresos = totalIngTx + totalCobradoNeg;
  const balanceNeto   = totalIngresos - totalGasTx;
  const sagrado       = totalIngresos * pct / 100;

  // ── Movimientos unificados ────────────────────────────────────────────
  const movimientos = useMemo(() => {
    const lista = [];

    ingresos.forEach(i => lista.push({
      id: i.id, tipo: 'ingreso',
      fecha: i.fecha || i.createdAt || '',
      descripcion: i.empresa || i.descripcion || 'Ingreso',
      monto: Number(i.montoUSD??i.monto??0),
      monedaOrig: i.moneda || 'USD',
      montoOrig: Number(i.monto||0),
      raw: i,
    }));

    gastos.forEach(g => lista.push({
      id: g.id, tipo: 'gasto',
      fecha: g.fecha || g.createdAt || '',
      descripcion: g.categoria || g.descripcion || 'Gasto',
      monto: Number(g.montoUSD??g.monto??0),
      monedaOrig: g.moneda || 'USD',
      montoOrig: Number(g.monto||0),
      raw: g,
    }));

    negocios.forEach(n => {
      (n.pagos||[]).forEach(p => lista.push({
        id: `neg_${n.id}_${p.id}`,
        tipo: 'negocio',
        estado: p.estado,
        fecha: p.fechaPago || '',
        descripcion: `${n.nombre}${p.concepto ? ` · ${p.concepto}` : ''}`,
        monto: toUSD(ganPago(p,n.porcentaje), p.moneda||n.moneda||'USD', tasas),
        monedaOrig: p.moneda || n.moneda || 'USD',
        montoOrig: ganPago(p,n.porcentaje),
        negocioId: n.id,
      }));
    });

    return lista.sort((a,b) => (b.fecha||'').localeCompare(a.fecha||''));
  }, [ingresos, gastos, negocios, tasas]);

  const movsFiltrados = filtro === 'todos' ? movimientos
    : movimientos.filter(m => m.tipo === filtro);

  // ── Stats por negocio ─────────────────────────────────────────────────
  const statsNegocios = useMemo(() => negocios.map(n => {
    const cobrado   = (n.pagos||[]).filter(p=>p.estado==='cobrado')
      .reduce((s,p)=>s+toUSD(ganPago(p,n.porcentaje),p.moneda||n.moneda||'USD',tasas),0);
    const pendiente = (n.pagos||[]).filter(p=>p.estado==='pendiente')
      .reduce((s,p)=>s+toUSD(ganPago(p,n.porcentaje),p.moneda||n.moneda||'USD',tasas),0);
    const totalPagos = (n.pagos||[]).length;
    return { id:n.id, nombre:n.nombre, cobrado, pendiente, totalPagos, activo:n.activo!==false };
  }).sort((a,b)=>b.cobrado-a.cobrado), [negocios, tasas]);

  const maxCobrado = Math.max(...statsNegocios.map(s=>s.cobrado), 1);

  // ── Chart por negocio ─────────────────────────────────────────────────
  const negConData = statsNegocios.filter(n=>n.cobrado>0||n.pendiente>0).slice(0,8);
  const barData = {
    labels: negConData.map(n=>n.nombre.length>10?n.nombre.slice(0,10)+'…':n.nombre),
    datasets:[
      { label:'Cobrado', data:negConData.map(n=>n.cobrado),
        backgroundColor:'rgba(192,192,192,0.5)', borderRadius:4 },
      { label:'Pendiente', data:negConData.map(n=>n.pendiente),
        backgroundColor:'rgba(250,204,21,0.3)', borderRadius:4 },
    ],
  };
  const barOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ color:'#a8a8b8', font:{size:10}, padding:10 } },
      tooltip:{ backgroundColor:'rgba(22,22,29,0.97)', titleColor:'#e8e8f0', bodyColor:'#e8e8f0',
        borderColor:'rgba(192,192,192,0.15)', borderWidth:1 }
    },
    scales:{
      y:{ stacked:false, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#a8a8b8',font:{size:10}} },
      x:{ grid:{display:false}, ticks:{color:'#a8a8b8',font:{size:10}} },
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">

      {/* ── Header ── */}
      <div className="px-1 pt-1">
        <h2 className="font-display text-lg font-bold text-gradient-silver tracking-widest">REGISTROS</h2>
        <p className="text-dark-textSecondary text-xs mt-0.5">Vista integral de todos tus movimientos</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-white/[0.06]">
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex-1 py-2.5 text-[10px] font-semibold tracking-widest transition-premium relative ${
              tab===t.id ? 'text-silver' : 'text-dark-textSecondary hover:text-silver-dim'
            }`}>
            {t.label}
            {tab===t.id && <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-silver/50 rounded-full"/>}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 — ESTADÍSTICAS
      ══════════════════════════════════════════════════════════════════ */}
      {tab==='estadisticas' && (
        <div className="space-y-4">

          {/* KPIs principales */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="TOTAL INGRESOS" value={formatearMoneda(totalIngresos,displayCurrency,rate)}
              accent="silver" sub={`Tx: ${formatearMoneda(totalIngTx,displayCurrency,rate)}`}/>
            <KpiCard label="TOTAL GASTOS"   value={formatearMoneda(totalGasTx,displayCurrency,rate)} accent="dim"/>
            <KpiCard label="BALANCE NETO"   value={formatearMoneda(balanceNeto,displayCurrency,rate)}
              accent={balanceNeto>=0?'bright':'dim'} wide/>
          </div>

          {/* Sagrado */}
          <div className="glass-card rounded-premium p-4 border border-silver/15 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-silver-dim mb-1 tracking-widest">SAGRADO {pct}%</div>
                <div className="text-2xl font-bold font-mono text-gradient-silver">
                  {formatearMoneda(sagrado,displayCurrency,rate)}
                </div>
                <div className="text-[9px] text-silver-dim mt-0.5">
                  Disponible: {formatearMoneda(totalIngresos*(100-pct)/100-totalGasTx,displayCurrency,rate)}
                </div>
              </div>
              <div className="text-4xl font-bold font-display text-gradient-silver shimmer">{pct}%</div>
            </div>
          </div>

          {/* Negocios breakdown */}
          <div className="glass-card rounded-premium border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <span className="text-[10px] text-silver-dim tracking-widest font-display">INGRESOS DE NEGOCIOS</span>
            </div>
            <div className="grid grid-cols-2 border-b border-white/[0.04]">
              <div className="px-4 py-3">
                <div className="text-[9px] text-silver-dim mb-0.5">COBRADO</div>
                <div className="text-xl font-bold font-mono text-silver-bright">{formatearMoneda(totalCobradoNeg,displayCurrency,rate)}</div>
              </div>
              <div className="px-4 py-3 border-l border-white/[0.04]">
                <div className="text-[9px] text-yellow-400/70 mb-0.5">PENDIENTE</div>
                <div className="text-xl font-bold font-mono text-yellow-300/80">{formatearMoneda(totalPendienteNeg,displayCurrency,rate)}</div>
              </div>
            </div>
            {negConData.length > 0 && (
              <div className="p-4">
                <div style={{height:'180px'}}><Bar data={barData} options={barOpts}/></div>
              </div>
            )}
          </div>

          {/* Ingresos de transacciones formales */}
          {totalIngTx > 0 && (
            <div className="glass-card rounded-premium border border-white/[0.06] p-4">
              <div className="text-[10px] text-silver-dim tracking-widest font-display mb-3">INGRESOS DE TRANSACCIONES</div>
              <div className="text-2xl font-bold font-mono text-silver">
                {formatearMoneda(totalIngTx,displayCurrency,rate)}
              </div>
              <div className="text-[10px] text-silver-dim mt-1">
                {ingresos.length} transacción{ingresos.length!==1?'es':''} registrada{ingresos.length!==1?'s':''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 — MOVIMIENTOS (timeline unificado)
      ══════════════════════════════════════════════════════════════════ */}
      {tab==='movimientos' && (
        <div className="space-y-3">

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTROS.map(f=>(
              <button key={f.id} onClick={()=>setFiltro(f.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-button text-[10px] font-semibold tracking-wide transition-premium ${
                  filtro===f.id
                    ? 'bg-silver/20 text-silver border border-silver/30'
                    : 'bg-white/[0.04] text-silver-dim border border-white/[0.06] hover:border-silver/20'
                }`}>
                {f.label}
                <span className="ml-1.5 opacity-60">
                  {f.id==='todos'   ? movimientos.length
                  :f.id==='ingreso' ? movimientos.filter(m=>m.tipo==='ingreso').length
                  :f.id==='gasto'   ? movimientos.filter(m=>m.tipo==='gasto').length
                  : movimientos.filter(m=>m.tipo==='negocio').length}
                </span>
              </button>
            ))}
          </div>

          {/* Lista */}
          {movsFiltrados.length === 0 ? (
            <div className="glass-card rounded-premium p-8 text-center border border-white/[0.06]">
              <div className="text-3xl text-silver-dim/30 mb-2">∅</div>
              <p className="text-silver-dim text-sm">Sin movimientos en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {movsFiltrados.map(mov => {
                const isNeg    = mov.tipo === 'negocio';
                const isGasto  = mov.tipo === 'gasto';
                const isPending= isNeg && mov.estado === 'pendiente';
                const isCanceled= isNeg && mov.estado === 'cancelado';
                return (
                  <div key={mov.id}
                    className={`glass-card rounded-button px-3 py-2.5 border flex items-center gap-3 transition-premium ${
                      isCanceled ? 'border-white/[0.03] opacity-50'
                      : isGasto  ? 'border-white/[0.05]'
                      : isPending? 'border-yellow-400/10'
                      :            'border-white/[0.06]'
                    }`}>

                    {/* Ícono tipo */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isGasto   ? 'bg-silver-dim/10'
                      : isPending? 'bg-yellow-400/10'
                      : isCanceled?'bg-white/[0.04]'
                      :            'bg-silver/10'
                    }`}>
                      {isGasto    ? <ArrowDownIcon  className="w-3.5 h-3.5 text-silver-dim"/>
                      : isPending  ? <BriefcaseIcon  className="w-3.5 h-3.5 text-yellow-400/70"/>
                      : isNeg      ? <BriefcaseIcon  className="w-3.5 h-3.5 text-silver"/>
                      :              <ArrowUpIcon    className="w-3.5 h-3.5 text-silver-bright"/>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-silver truncate">{mov.descripcion}</span>
                        {isPending   && <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400/80">PENDIENTE</span>}
                        {isCanceled  && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-silver-dim">CANCELADO</span>}
                      </div>
                      {mov.fecha && (
                        <div className="text-[9px] text-silver-dim mt-0.5">{fmtFecha(mov.fecha)}</div>
                      )}
                    </div>

                    {/* Monto */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold font-mono ${
                        isGasto    ? 'text-silver-dim'
                        : isPending ? 'text-yellow-300/70'
                        : isCanceled? 'text-silver-dim/50'
                        :             'text-silver'
                      }`}>
                        {isGasto?'−':'+'} {formatearMoneda(mov.monto,displayCurrency,rate)}
                      </div>
                      {mov.monedaOrig!=='USD' && (
                        <div className="text-[9px] text-silver-dim">
                          {mov.monedaOrig} {fmt2(mov.montoOrig)}
                        </div>
                      )}
                    </div>

                    {/* Acciones (solo transacciones formales) */}
                    {!isNeg && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {onEditar && (
                          <button onClick={()=>onEditar(mov.raw, mov.tipo)}
                            className="text-silver-dim hover:text-silver p-0.5">
                            <PencilIcon className="w-3 h-3"/>
                          </button>
                        )}
                        {onEliminar && (
                          <button onClick={()=>onEliminar(mov.id, mov.tipo)}
                            className="text-silver-dim hover:text-silver p-0.5">
                            <TrashIcon className="w-3 h-3"/>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3 — POR NEGOCIO
      ══════════════════════════════════════════════════════════════════ */}
      {tab==='negocios' && (
        <div className="space-y-3">

          {statsNegocios.length === 0 ? (
            <div className="glass-card rounded-premium p-8 text-center border border-white/[0.06]">
              <BriefcaseIcon className="w-10 h-10 text-silver-dim/30 mx-auto mb-3"/>
              <p className="text-silver-dim text-sm">Aún no tienes negocios registrados</p>
            </div>
          ) : (
            <>
              {/* Header totales */}
              <div className="glass-card rounded-premium border border-white/[0.06] overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="px-4 py-3">
                    <div className="text-[9px] text-silver-dim mb-0.5">TOTAL COBRADO</div>
                    <div className="text-xl font-bold font-mono text-silver-bright">
                      {formatearMoneda(totalCobradoNeg,displayCurrency,rate)}
                    </div>
                  </div>
                  <div className="px-4 py-3 border-l border-white/[0.04]">
                    <div className="text-[9px] text-yellow-400/70 mb-0.5">TOTAL PENDIENTE</div>
                    <div className="text-xl font-bold font-mono text-yellow-300/80">
                      {formatearMoneda(totalPendienteNeg,displayCurrency,rate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {negConData.length > 0 && (
                <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
                  <div className="text-[10px] text-silver-dim tracking-widest mb-3 font-display">COBRADO VS PENDIENTE</div>
                  <div style={{height:'180px'}}><Bar data={barData} options={barOpts}/></div>
                </div>
              )}

              {/* Lista por negocio */}
              <div className="space-y-2">
                {statsNegocios.map((n,i) => {
                  const pct100 = maxCobrado>0 ? (n.cobrado/maxCobrado)*100 : 0;
                  const totalN = n.cobrado + n.pendiente;
                  return (
                    <div key={n.id} className="glass-card rounded-premium border border-white/[0.06] overflow-hidden">
                      <div className="px-4 py-3 flex items-center gap-3">
                        {/* Rank */}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white/[0.04]">
                          <span className="text-[10px] font-bold text-silver-dim">{i+1}</span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-silver truncate">{n.nombre}</span>
                            {!n.activo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-silver-dim">INACTIVO</span>}
                          </div>
                          <div className="text-[9px] text-silver-dim">
                            {n.totalPagos} pago{n.totalPagos!==1?'s':''}
                            {totalN>0 && ` · total ${formatearMoneda(totalN,displayCurrency,rate)}`}
                          </div>
                        </div>
                        {/* Cobrado */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold font-mono text-silver">
                            {formatearMoneda(n.cobrado,displayCurrency,rate)}
                          </div>
                          {n.pendiente>0 && (
                            <div className="text-[9px] text-yellow-400/70">
                              +{formatearMoneda(n.pendiente,displayCurrency,rate)} pdte
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Barra de contribución */}
                      {pct100 > 0 && (
                        <div className="px-4 pb-3">
                          <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                            <div className="h-full rounded-full bg-silver/40 transition-all duration-500"
                              style={{width:`${pct100}%`}}/>
                          </div>
                          <div className="text-[8px] text-silver-dim mt-0.5 text-right">
                            {pct100.toFixed(0)}% del máximo
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── KPI Card helper ───────────────────────────────────────────────────────
const KpiCard = ({ label, value, accent='silver', sub=null, wide=false }) => {
  const cls = { silver:'text-gradient-silver', bright:'text-silver-bright', dim:'text-silver-dim' };
  return (
    <div className={`glass-card rounded-premium p-4 border border-white/[0.06] ${wide?'col-span-2':''}`}>
      <div className="text-[9px] text-dark-textSecondary mb-1.5 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono ${cls[accent]||'text-silver'}`}>{value}</div>
      {sub && <div className="text-[9px] text-silver-dim/60 mt-0.5">{sub}</div>}
    </div>
  );
};
