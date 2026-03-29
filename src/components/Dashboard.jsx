import React, { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { isExchangeRateOutdated } from '../utils/exchangeRate.js';
import useCountUp from '../hooks/useCountUp.js';
import {
  BanknotesIcon, LockClosedIcon, ClockIcon, BriefcaseIcon,
  ChevronRightIcon, PlusCircleIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Helpers cuentas ───────────────────────────────────────────────────────
const calcRetenido   = (c) => (c.retenciones||[]).filter(r=>!r.liberado).reduce((s,r)=>s+Number(r.monto||0),0);
const calcDisponible = (c) => Math.max(0, Number(c.saldo||0) - calcRetenido(c));

const toUSD = (monto, moneda, tasas) => {
  const n = Number(monto || 0);
  if (!tasas) return n;
  if (moneda === 'ARS')  return n / (tasas.usdToArs  || 1453.73);
  if (moneda === 'USDT') return n * (tasas.usdtToUsd || 0.999);
  return n;
};

const diasHasta = (f) => {
  if (!f) return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  return Math.round((new Date(f+'T00:00:00') - hoy) / 86400000);
};
const fmtD  = (f) => { if(!f) return ''; const [,m,d]=f.split('-'); return `${d}/${m}`; };
const fmt2  = (n) => Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});

// ── Ganancia de un pago ───────────────────────────────────────────────────
const ganPago = (pago, pctNeg) => {
  if (pago.ganancia !== '' && pago.ganancia !== undefined) return Number(pago.ganancia) || 0;
  return (Number(pago.facturacion||0) * Number(pago.porcentajePago ?? pctNeg ?? 100)) / 100;
};

// ─────────────────────────────────────────────────────────────────────────
const Dashboard = ({
  balance, onNuevaTransaccion, onNavigate,
  language, displayCurrency, exchangeRate,
  cuentas=[], config={}, negocios=[],
}) => {
  const { t } = useTranslation(language);
  const tasas     = config.tasas || {};
  const pctAhorro = config.porcentajeAhorro ?? 40;
  const rate      = exchangeRate?.USD_ARS || tasas.usdToArs || 1427.99;
  const isOutdated= isExchangeRateOutdated(exchangeRate?.timestamp);

  // ── Balance de transacciones formales (en USD) ────────────────────────
  const {
    totalIngresos: ingTx, totalGastos: gastTx,
    ingresosPorEmpresa,
  } = balance;

  // ── Ingresos de negocios (pagos cobrados) en USD ──────────────────────
  const ingNegocios = negocios.reduce((sum, n) =>
    sum + (n.pagos||[]).filter(p=>p.estado==='cobrado')
      .reduce((s,p) => s + toUSD(ganPago(p,n.porcentaje), p.moneda||n.moneda||'USD', tasas), 0)
  , 0);

  // ── Totales integrados (USD) ──────────────────────────────────────────
  const totalIngresosInt  = ingTx + ingNegocios;
  const totalGastosInt    = gastTx;
  const balanceNetoInt    = totalIngresosInt - totalGastosInt;
  const sagradoInt        = totalIngresosInt * (pctAhorro / 100);
  const disponible60Int   = totalIngresosInt * ((100 - pctAhorro) / 100);
  const disponibleRealInt = disponible60Int - totalGastosInt;

  // ── Patrimonio en cuentas ─────────────────────────────────────────────
  const totalDisp  = cuentas.reduce((s,c)=>s+toUSD(calcDisponible(c),c.moneda,tasas),0);
  const totalReten = cuentas.reduce((s,c)=>s+toUSD(calcRetenido(c),c.moneda,tasas),0);
  const totalBruto = totalDisp + totalReten;

  const proximasLib = cuentas
    .flatMap(c=>(c.retenciones||[]).filter(r=>!r.liberado).map(r=>({
      nombre: c.nombre||c.id, monto: Number(r.monto||0),
      moneda: c.moneda||'USD', fecha: r.fechaLiberacion,
      dias: diasHasta(r.fechaLiberacion),
    })))
    .filter(r=>r.fecha)
    .sort((a,b)=>(a.dias??999)-(b.dias??999))
    .slice(0,4);

  // ── Negocios resumen ──────────────────────────────────────────────────
  const negActivos = negocios.filter(n=>n.activo!==false);
  const pendienteUSD = negocios.reduce((sum,n)=>
    sum + (n.pagos||[]).filter(p=>p.estado==='pendiente')
      .reduce((s,p)=>s+toUSD(ganPago(p,n.porcentaje), p.moneda||n.moneda||'USD', tasas), 0)
  ,0);

  // ── Gráficos ──────────────────────────────────────────────────────────
  const empresasConIng = Object.entries(ingresosPorEmpresa).filter(([,m])=>m>0);
  const datosTorta = {
    labels: empresasConIng.map(([e])=>e),
    datasets:[{ data: empresasConIng.map(([,m])=>m),
      backgroundColor: empresasConIng.map(([e])=>COLORES_EMPRESAS[e]),
      borderColor:'rgba(255,255,255,0.05)', borderWidth:1 }],
  };
  const datosBarras = {
    labels: empresasConIng.map(([e])=>e),
    datasets:[{ label:'Ingresos', data: empresasConIng.map(([,m])=>m),
      backgroundColor: empresasConIng.map(([e])=>COLORES_EMPRESAS[e]), borderRadius:6 }],
  };
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{ position:'bottom', labels:{ padding:12, font:{size:10}, color:'#a8a8b8' }},
      tooltip:{
        backgroundColor:'rgba(22,22,29,0.97)', titleColor:'#e8e8f0',
        bodyColor:'#e8e8f0', borderColor:'rgba(192,192,192,0.2)', borderWidth:1, padding:10,
        callbacks:{ label(ctx){
          const v=ctx.parsed.y!==undefined?ctx.parsed.y:ctx.parsed;
          const tot=ctx.dataset.data.reduce((a,b)=>a+b,0);
          return `${formatearMoneda(v,displayCurrency,rate)} (${((v/tot)*100).toFixed(1)}%)`;
        }}
      }
    },
    scales:{
      y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#a8a8b8',font:{size:10}} },
      x:{ grid:{display:false}, ticks:{color:'#a8a8b8',font:{size:10}} },
    }
  };

  // ── Animaciones numéricas ─────────────────────────────────────────────
  const animBalance   = useCountUp(Math.abs(balanceNetoInt),  900);
  const animIngresos  = useCountUp(totalIngresosInt,           750);
  const animSagrado   = useCountUp(sagradoInt,                 800);

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ── Header ── */}
      <div className="card-enter flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient-silver tracking-widest leading-none number-glow">DENARIUM</h1>
          <p className="text-dark-textSecondary text-xs mt-0.5">{t('dashboard.subtitle')}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs font-semibold text-silver">
            1 USD = {rate.toLocaleString('es-AR',{minimumFractionDigits:0})} ARS
          </div>
          <div className={`text-[9px] mt-0.5 ${isOutdated?'text-silver-dim':'text-silver-dark'}`}>
            {isOutdated ? '⚠ desactualizado' : '✓ actualizado'}
          </div>
        </div>
      </div>

      {/* ── PATRIMONIO EN CUENTAS ── */}
      {cuentas.length > 0 ? (
        <button onClick={()=>onNavigate('cuentas')}
          className="card-enter-1 w-full text-left glass-card rounded-premium border border-silver/10 shadow-glow-silver overflow-hidden hover:border-silver/25 transition-premium group card-shimmer border-animated">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-silver-dim"/>
              <span className="text-[10px] text-silver-dim tracking-widest font-display">PATRIMONIO EN CUENTAS</span>
            </div>
            <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
          </div>
          <div className="grid grid-cols-3 border-y border-white/[0.04]">
            {[
              { label:'BRUTO',     val:totalBruto, cls:'text-silver' },
              { label:'● LIBRE',   val:totalDisp,  cls:'text-silver-bright', border:true },
              { label:'🔒 RETENIDO',val:totalReten, cls:'text-silver-dim' },
            ].map(({label,val,cls,border})=>(
              <div key={label} className={`px-3 py-2.5 text-center ${border?'border-x border-white/[0.04]':''}`}>
                <div className="text-[9px] text-silver-dim mb-0.5">{label}</div>
                <div className={`text-base font-bold font-mono ${cls}`}>{fmt2(val)}</div>
                <div className="text-[9px] text-silver-dim">USD</div>
              </div>
            ))}
          </div>
          {totalBruto > 0 && (
            <div className="px-4 py-2">
              <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-silver/30 to-silver/60 transition-all duration-700"
                  style={{width:`${(totalDisp/totalBruto)*100}%`}}/>
              </div>
            </div>
          )}
          {proximasLib.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1 mb-1.5">
                <ClockIcon className="w-3 h-3 text-silver-dim"/>
                <span className="text-[9px] text-silver-dim tracking-widest">PRÓXIMAS LIBERACIONES</span>
              </div>
              <div className="space-y-1">
                {proximasLib.map((lib,i)=>{
                  const d=lib.dias;
                  const badge = d===0?{l:'¡HOY!',c:'text-emerald-400 bg-emerald-400/10'}
                    : d===1?{l:'mañana',c:'text-yellow-400 bg-yellow-400/10'}
                    : d<0 ?{l:'vencido',c:'text-red-400 bg-red-400/10'}
                    :     {l:`${d}d`,  c:'text-silver-dim bg-white/[0.04]'};
                  return (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${badge.c}`}>{badge.l}</span>
                        <span className="text-silver-dim truncate">{lib.nombre}</span>
                      </div>
                      <span className="font-mono text-silver flex-shrink-0 ml-2">
                        {lib.moneda} {fmt2(lib.monto)}
                        <span className="text-silver-dim ml-1 text-[9px]">{fmtD(lib.fecha)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </button>
      ) : (
        <button onClick={()=>onNavigate('cuentas')}
          className="w-full text-left glass-card rounded-premium border border-dashed border-white/10 p-4 hover:border-silver/20 transition-premium group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BanknotesIcon className="w-8 h-8 text-silver-dim/40"/>
              <div>
                <div className="text-sm font-semibold text-silver-dim">Configurá tus cuentas</div>
                <div className="text-[11px] text-silver-dim/60">Wise, PayPal, Stripe, Binance y más</div>
              </div>
            </div>
            <PlusCircleIcon className="w-5 h-5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
          </div>
        </button>
      )}

      {/* ── NEGOCIOS ── */}
      {negActivos.length > 0 ? (
        <button onClick={()=>onNavigate('negocios')}
          className="card-enter-2 w-full text-left glass-card rounded-premium border border-white/[0.06] overflow-hidden hover:border-silver/15 transition-premium group card-shimmer">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-silver-dim"/>
              <span className="text-[10px] text-silver-dim tracking-widest font-display">NEGOCIOS</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-silver-dim">
                {negActivos.length} activo{negActivos.length!==1?'s':''}
              </span>
            </div>
            <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
          </div>
          <div className={`grid ${pendienteUSD>0?'grid-cols-2':'grid-cols-1'} border-t border-white/[0.04]`}>
            <div className="px-4 py-3">
              <div className="text-[9px] text-silver-dim mb-0.5">COBRADO</div>
              <div className="text-xl font-bold font-display text-gradient-silver">
                {fmt2(ingNegocios)}<span className="text-[10px] font-normal text-silver-dim ml-1">USD</span>
              </div>
            </div>
            {pendienteUSD > 0 && (
              <div className="px-4 py-3 border-l border-white/[0.04]">
                <div className="text-[9px] text-yellow-400/70 mb-0.5 flex items-center gap-1">
                  <ClockIcon className="w-2.5 h-2.5"/> PENDIENTE DE COBRO
                </div>
                <div className="text-xl font-bold font-mono text-yellow-300/80">
                  {fmt2(pendienteUSD)}<span className="text-[10px] font-normal text-silver-dim ml-1">USD</span>
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        <button onClick={()=>onNavigate('negocios')}
          className="w-full text-left glass-card rounded-premium border border-dashed border-white/10 p-4 hover:border-silver/20 transition-premium group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-8 h-8 text-silver-dim/40"/>
              <div>
                <div className="text-sm font-semibold text-silver-dim">Registrá tus negocios</div>
                <div className="text-[11px] text-silver-dim/60">Fuentes de ingresos, comisiones, freelance</div>
              </div>
            </div>
            <PlusCircleIcon className="w-5 h-5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
          </div>
        </button>
      )}

      {/* ── BALANCE FINANCIERO INTEGRADO ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1 pt-1">
          <span className="text-[10px] text-silver-dim tracking-widest font-display">BALANCE FINANCIERO</span>
          <div className="flex-1 h-px bg-white/[0.04]"/>
          {ingNegocios > 0 && (
            <span className="text-[9px] text-silver-dim/60 italic">transacciones + negocios</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="TOTAL INGRESOS" value={formatearMoneda(totalIngresosInt,displayCurrency,rate)} accent="silver"
            stagger="card-enter-3"
            sub={ingNegocios>0?`Tx: ${formatearMoneda(ingTx,displayCurrency,rate)} · Neg: ${formatearMoneda(ingNegocios,displayCurrency,rate)}`:null}/>
          <StatCard label="TOTAL GASTOS"   value={formatearMoneda(totalGastosInt,displayCurrency,rate)} accent="dim" stagger="card-enter-3"/>
        </div>

        <StatCard label="BALANCE NETO"
          value={(balanceNetoInt<0?'-':'')+formatearMoneda(Math.abs(balanceNetoInt),displayCurrency,rate)}
          accent={balanceNetoInt>=0?'positive':'negative'} large stagger="card-enter-4"/>

        {/* Sagrado % */}
        <div className="card-enter-5 glass-card rounded-premium p-4 shadow-glow-silver border border-silver/15 relative overflow-hidden card-shimmer">
          <div className="absolute inset-0 bg-gradient-silver opacity-[0.03] pointer-events-none"/>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-silver-dark mb-1 flex items-center gap-1.5 uppercase tracking-widest">
                <SparklesIcon className="w-3 h-3"/> {t('dashboard.sacred40')}
              </div>
              <div className="text-3xl font-bold number-silver font-mono number-glow">
                {formatearMoneda(sagradoInt,displayCurrency,rate)}
              </div>
              <div className="text-[10px] text-dark-textSecondary mt-1">
                de {formatearMoneda(totalIngresosInt,displayCurrency,rate)} totales
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold number-silver shimmer font-display leading-none">{pctAhorro}%</div>
              <div className="text-[9px] text-silver-dim mt-1 tracking-widest">{t('dashboard.sacred40Subtitle')}</div>
            </div>
          </div>
        </div>

        {/* Disponible real */}
        <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
          <div className="text-[10px] text-silver-dim mb-1 uppercase tracking-wider">{t('dashboard.available')}</div>
          <div className={`text-2xl font-bold font-mono ${disponibleRealInt>=0?'text-silver':'text-silver-dim'}`}>
            {formatearMoneda(disponibleRealInt,displayCurrency,rate)}
          </div>
          <div className="text-[10px] text-dark-textSecondary mt-1">
            del disponible {formatearMoneda(disponible60Int,displayCurrency,rate)}
          </div>
        </div>
      </div>

      {/* ── Link Prioridades ── */}
      <button onClick={()=>onNavigate('prioridades')}
        className="w-full flex items-center justify-between glass-card rounded-premium px-4 py-3 border border-white/[0.06] hover:border-silver/20 transition-premium group">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-silver-dim"/>
          <span className="text-xs text-silver-dim tracking-widest">VER CASCADA DE PRIORIDADES</span>
        </div>
        <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
      </button>

      {/* ── Link Registros ── */}
      <button onClick={()=>onNavigate('registros')}
        className="w-full flex items-center justify-between glass-card rounded-premium px-4 py-3 border border-white/[0.06] hover:border-silver/20 transition-premium group">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-silver-dim"/>
          <span className="text-xs text-silver-dim tracking-widest">VER REGISTROS Y ESTADÍSTICAS</span>
        </div>
        <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/40 group-hover:text-silver-dim transition-colors"/>
      </button>

      {/* ── Gráficos transacciones ── */}
      {empresasConIng.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-silver-dim tracking-widest font-display">INGRESOS POR FUENTE</span>
            <div className="flex-1 h-px bg-white/[0.04]"/>
          </div>
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div style={{height:'220px'}}><Pie data={datosTorta} options={{...chartOpts,scales:undefined}}/></div>
          </div>
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div style={{height:'180px'}}><Bar data={datosBarras} options={chartOpts}/></div>
          </div>
        </div>
      ) : (
        <button onClick={onNuevaTransaccion}
          className="w-full text-center glass-card rounded-premium p-8 border border-dashed border-white/10 hover:border-silver/20 transition-premium group">
          <div className="text-4xl text-silver-dim/30 mb-3">∅</div>
          <p className="text-dark-textSecondary text-sm mb-1">{t('dashboard.noIncome')}</p>
          <p className="text-xs text-silver-dim/50 group-hover:text-silver-dim transition-colors">
            Tap para registrar tu primera transacción →
          </p>
        </button>
      )}
    </div>
  );
};

const StatCard = ({ label, value, accent='silver', large=false, sub=null, stagger='' }) => {
  const cls = {
    silver:   'number-silver',
    bright:   'text-silver-bright',
    dim:      'text-silver-dim',
    positive: 'value-positive',
    negative: 'value-negative',
  };
  const borderCls = {
    positive: 'border-emerald-500/20',
    negative: 'border-red-500/20',
    silver:   'border-white/[0.06]',
    default:  'border-white/[0.06]',
  };
  return (
    <div className={`glass-card rounded-premium p-4 border card-shimmer transition-premium hover:border-silver/20 ${borderCls[accent]||borderCls.default} ${stagger}`}>
      <div className="text-[10px] text-dark-textSecondary mb-1.5 uppercase tracking-wider">{label}</div>
      <div className={`font-bold font-mono ${large?'text-3xl':'text-xl'} ${cls[accent]||'text-silver'} ${large?'number-glow':''}`}>{value}</div>
      {sub && <div className="text-[9px] text-silver-dim/60 mt-1">{sub}</div>}
    </div>
  );
};

export default Dashboard;
