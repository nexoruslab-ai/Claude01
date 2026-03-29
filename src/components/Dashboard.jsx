import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { isExchangeRateOutdated } from '../utils/exchangeRate.js';
import {
  BanknotesIcon, LockClosedIcon, ClockIcon, BriefcaseIcon,
  ChevronRightIcon, PlusCircleIcon, SparklesIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Helpers ───────────────────────────────────────────────────────────────
const calcRetenido = (cuenta) =>
  (cuenta.retenciones || [])
    .filter(r => !r.liberado)
    .reduce((sum, r) => sum + Number(r.monto || 0), 0);

const calcDisponible = (cuenta) =>
  Math.max(0, Number(cuenta.saldo || 0) - calcRetenido(cuenta));

const toUSD = (monto, moneda, tasas) => {
  const num = Number(monto || 0);
  if (!tasas) return num;
  if (moneda === 'ARS')  return num / (tasas.usdToArs  || 1453.73);
  if (moneda === 'USDT') return num * (tasas.usdtToUsd || 0.999);
  return num;
};

const diasHasta = (fechaStr) => {
  if (!fechaStr) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f   = new Date(fechaStr + 'T00:00:00');
  return Math.round((f - hoy) / 86400000);
};

const fmtFecha = (f) => {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  return `${d}/${m}`;
};

const fmt2 = (n) =>
  Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Componente ────────────────────────────────────────────────────────────
const Dashboard = ({
  balance, onNuevaTransaccion, onNavigate,
  language, displayCurrency, exchangeRate,
  cuentas = [], config = {}, negocios = [],
}) => {
  const { t } = useTranslation(language);

  const {
    totalIngresos, totalGastos, balanceNeto,
    sagrado40, disponible60, disponibleReal,
    ingresosPorEmpresa,
  } = balance;

  const tasas      = config.tasas || {};
  const pctAhorro  = config.porcentajeAhorro ?? 40;
  const rate       = exchangeRate?.USD_ARS || tasas.usdToArs || 1427.99;
  const isOutdated = isExchangeRateOutdated(exchangeRate?.timestamp);

  // ── Patrimonio en cuentas ─────────────────────────────────────────────
  const totalCuentasDisp  = cuentas.reduce((s, c) => s + toUSD(calcDisponible(c), c.moneda, tasas), 0);
  const totalCuentasReten = cuentas.reduce((s, c) => s + toUSD(calcRetenido(c),   c.moneda, tasas), 0);
  const totalCuentasBruto = totalCuentasDisp + totalCuentasReten;

  const proximasLib = cuentas
    .flatMap(c =>
      (c.retenciones || [])
        .filter(r => !r.liberado)
        .map(r => ({
          cuentaNombre: c.nombre || c.id,
          monto:        Number(r.monto || 0),
          moneda:       c.moneda || 'USD',
          montoUSD:     toUSD(r.monto, c.moneda, tasas),
          fecha:        r.fechaLiberacion,
          dias:         diasHasta(r.fechaLiberacion),
        }))
    )
    .filter(r => r.fecha)
    .sort((a, b) => (a.dias ?? 999) - (b.dias ?? 999))
    .slice(0, 4);

  // ── Negocios ──────────────────────────────────────────────────────────
  const negociosActivos = negocios.filter(n => n.activo !== false);
  const ingEstimadoUSD  = negociosActivos.reduce((sum, n) => {
    const comision = (Number(n.ingresoBase || 0) * Number(n.porcentaje || 100)) / 100;
    return sum + toUSD(comision, n.moneda || 'USD', tasas);
  }, 0);

  // pendientes de cobro
  const pendienteUSD = negocios.reduce((sum, n) => {
    return sum + (n.pagos || [])
      .filter(p => p.estado === 'pendiente')
      .reduce((s, p) => {
        const g = p.ganancia !== '' && p.ganancia !== undefined
          ? Number(p.ganancia)
          : (Number(p.facturacion || 0) * Number(p.porcentajePago ?? n.porcentaje ?? 100)) / 100;
        return s + toUSD(g, p.moneda || n.moneda || 'USD', tasas);
      }, 0);
  }, 0);

  // ── Gráficos ──────────────────────────────────────────────────────────
  const empresasConIngresos = Object.entries(ingresosPorEmpresa).filter(([_, m]) => m > 0);

  const datosTorta = {
    labels: empresasConIngresos.map(([e]) => e),
    datasets: [{
      data: empresasConIngresos.map(([_, m]) => m),
      backgroundColor: empresasConIngresos.map(([e]) => COLORES_EMPRESAS[e]),
      borderColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
    }],
  };

  const datosBarras = {
    labels: empresasConIngresos.map(([e]) => e),
    datasets: [{
      label: t('dashboard.totalIncome'),
      data: empresasConIngresos.map(([_, m]) => m),
      backgroundColor: empresasConIngresos.map(([e]) => COLORES_EMPRESAS[e]),
      borderRadius: 6,
    }],
  };

  const opcionesBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 12, font: { size: 10, family: 'Inter' }, color: '#a8a8b8' }
      },
      tooltip: {
        backgroundColor: 'rgba(22,22,29,0.97)',
        titleColor: '#e8e8f0', bodyColor: '#e8e8f0',
        borderColor: 'rgba(192,192,192,0.2)', borderWidth: 1, padding: 10,
        callbacks: {
          label(ctx) {
            const v = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            return `${formatearMoneda(v, displayCurrency, rate)} (${((v / total) * 100).toFixed(1)}%)`;
          }
        }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#a8a8b8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#a8a8b8', font: { size: 10 } } },
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* ── Header tipo de cambio (mobile) ── */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient-silver tracking-widest leading-none">
            DENARIUM
          </h1>
          <p className="text-dark-textSecondary text-xs mt-0.5">{t('dashboard.subtitle')}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs font-semibold text-silver">
            1 USD = {rate.toLocaleString('es-AR', { minimumFractionDigits: 0 })} ARS
          </div>
          <div className={`text-[9px] mt-0.5 ${isOutdated ? 'text-silver-dim' : 'text-silver-dark'}`}>
            {isOutdated ? '⚠ desactualizado' : '✓ actualizado'}
          </div>
        </div>
      </div>

      {/* ── PATRIMONIO EN CUENTAS ── */}
      {cuentas.length > 0 ? (
        <button
          onClick={() => onNavigate('cuentas')}
          className="w-full text-left glass-card rounded-premium border border-silver/10 shadow-glow-silver overflow-hidden hover:border-silver/20 transition-premium group"
        >
          {/* Header sección */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-silver-dim" />
              <span className="text-[10px] text-silver-dim tracking-widest font-display">PATRIMONIO EN CUENTAS</span>
            </div>
            <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/50 group-hover:text-silver-dim transition-colors" />
          </div>

          {/* Totales */}
          <div className="grid grid-cols-3 gap-0 border-y border-white/[0.04]">
            <div className="px-3 py-2.5 text-center">
              <div className="text-[9px] text-silver-dim mb-0.5">BRUTO</div>
              <div className="text-base font-bold font-mono text-silver">
                {fmt2(totalCuentasBruto)}
              </div>
              <div className="text-[9px] text-silver-dim">USD</div>
            </div>
            <div className="px-3 py-2.5 text-center border-x border-white/[0.04]">
              <div className="text-[9px] text-silver-dim mb-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 inline-block" />
                LIBRE
              </div>
              <div className="text-base font-bold font-mono text-silver-bright">
                {fmt2(totalCuentasDisp)}
              </div>
              <div className="text-[9px] text-silver-dim">USD</div>
            </div>
            <div className="px-3 py-2.5 text-center">
              <div className="text-[9px] text-silver-dim mb-0.5 flex items-center justify-center gap-1">
                <LockClosedIcon className="w-2.5 h-2.5" />
                RETENIDO
              </div>
              <div className="text-base font-bold font-mono text-silver-dim">
                {fmt2(totalCuentasReten)}
              </div>
              <div className="text-[9px] text-silver-dim">USD</div>
            </div>
          </div>

          {/* Barra visual */}
          {totalCuentasBruto > 0 && (
            <div className="px-4 py-2">
              <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-silver/30 to-silver/60 transition-all duration-700"
                  style={{ width: `${(totalCuentasDisp / totalCuentasBruto) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Próximas liberaciones */}
          {proximasLib.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1 mb-1.5">
                <ClockIcon className="w-3 h-3 text-silver-dim" />
                <span className="text-[9px] text-silver-dim tracking-widest">PRÓXIMAS LIBERACIONES</span>
              </div>
              <div className="space-y-1">
                {proximasLib.map((lib, i) => {
                  const d = lib.dias;
                  const badge =
                    d === 0 ? { label: '¡HOY!',  cls: 'text-emerald-400 bg-emerald-400/10' } :
                    d === 1 ? { label: 'mañana', cls: 'text-yellow-400 bg-yellow-400/10'  } :
                    d  < 0  ? { label: 'vencido',cls: 'text-red-400 bg-red-400/10'        } :
                               { label: `${d}d`,  cls: 'text-silver-dim bg-white/[0.04]'  };
                  return (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-silver-dim truncate">{lib.cuentaNombre}</span>
                      </div>
                      <span className="font-mono text-silver flex-shrink-0 ml-2">
                        {lib.moneda} {fmt2(lib.monto)}
                        <span className="text-silver-dim ml-1 text-[9px]">{fmtFecha(lib.fecha)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </button>
      ) : (
        /* Empty state cuentas */
        <button
          onClick={() => onNavigate('cuentas')}
          className="w-full text-left glass-card rounded-premium border border-dashed border-white/10 p-4 hover:border-silver/20 transition-premium group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BanknotesIcon className="w-8 h-8 text-silver-dim/40" />
              <div>
                <div className="text-sm font-semibold text-silver-dim">Configura tus cuentas</div>
                <div className="text-[11px] text-silver-dim/60">Wise, PayPal, Stripe, Binance y más</div>
              </div>
            </div>
            <PlusCircleIcon className="w-5 h-5 text-silver-dim/40 group-hover:text-silver-dim transition-colors" />
          </div>
        </button>
      )}

      {/* ── NEGOCIOS ACTIVOS ── */}
      {negociosActivos.length > 0 ? (
        <button
          onClick={() => onNavigate('negocios')}
          className="w-full text-left glass-card rounded-premium border border-white/[0.06] overflow-hidden hover:border-silver/15 transition-premium group"
        >
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-silver-dim" />
              <span className="text-[10px] text-silver-dim tracking-widest font-display">NEGOCIOS</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-silver-dim">
                {negociosActivos.length} activo{negociosActivos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/50 group-hover:text-silver-dim transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-0 border-t border-white/[0.04]">
            <div className="px-4 py-3">
              <div className="text-[9px] text-silver-dim mb-0.5">EST. MENSUAL</div>
              <div className="text-lg font-bold font-display text-gradient-silver">
                {fmt2(ingEstimadoUSD)}
                <span className="text-[10px] font-normal text-silver-dim ml-1">USD</span>
              </div>
            </div>
            {pendienteUSD > 0 && (
              <div className="px-4 py-3 border-l border-white/[0.04]">
                <div className="text-[9px] text-yellow-400/70 mb-0.5 flex items-center gap-1">
                  <ClockIcon className="w-2.5 h-2.5" />
                  PENDIENTE DE COBRO
                </div>
                <div className="text-lg font-bold font-mono text-yellow-300/80">
                  {fmt2(pendienteUSD)}
                  <span className="text-[10px] font-normal text-silver-dim ml-1">USD</span>
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        /* Empty state negocios */
        <button
          onClick={() => onNavigate('negocios')}
          className="w-full text-left glass-card rounded-premium border border-dashed border-white/10 p-4 hover:border-silver/20 transition-premium group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-8 h-8 text-silver-dim/40" />
              <div>
                <div className="text-sm font-semibold text-silver-dim">Registra tus negocios</div>
                <div className="text-[11px] text-silver-dim/60">Fuentes de ingresos, comisiones, freelance</div>
              </div>
            </div>
            <PlusCircleIcon className="w-5 h-5 text-silver-dim/40 group-hover:text-silver-dim transition-colors" />
          </div>
        </button>
      )}

      {/* ── BALANCE FINANCIERO ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-silver-dim tracking-widest font-display">BALANCE FINANCIERO</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={t('dashboard.totalIncome')}
            value={formatearMoneda(totalIngresos, displayCurrency, rate)}
            accent="silver"
          />
          <StatCard
            label={t('dashboard.totalExpenses')}
            value={formatearMoneda(totalGastos, displayCurrency, rate)}
            accent="dim"
          />
        </div>

        <StatCard
          label={t('dashboard.netBalance')}
          value={formatearMoneda(balanceNeto, displayCurrency, rate)}
          accent={balanceNeto >= 0 ? 'bright' : 'dim'}
          large
        />

        {/* Sagrado % */}
        <div className="glass-card rounded-premium p-4 shadow-glow-silver border border-silver/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-silver opacity-[0.03] pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-silver-dark mb-1 flex items-center gap-1.5 uppercase tracking-widest">
                <SparklesIcon className="w-3 h-3" />
                {t('dashboard.sacred40')}
              </div>
              <div className="text-3xl font-bold text-gradient-silver font-mono">
                {formatearMoneda(sagrado40, displayCurrency, rate)}
              </div>
              <div className="text-[10px] text-dark-textSecondary mt-1">
                de {formatearMoneda(totalIngresos, displayCurrency, rate)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gradient-silver shimmer font-display leading-none">
                {pctAhorro}%
              </div>
              <div className="text-[9px] text-silver-dim mt-1 tracking-widest">{t('dashboard.sacred40Subtitle')}</div>
            </div>
          </div>
        </div>

        {/* Disponible */}
        <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
          <div className="text-[10px] text-silver-dim mb-1 uppercase tracking-wider">{t('dashboard.available')}</div>
          <div className={`text-2xl font-bold font-mono ${disponibleReal >= 0 ? 'text-silver' : 'text-silver-dim'}`}>
            {formatearMoneda(disponibleReal, displayCurrency, rate)}
          </div>
          <div className="text-[10px] text-dark-textSecondary mt-1">
            del total de {formatearMoneda(disponible60, displayCurrency, rate)}
          </div>
        </div>
      </div>

      {/* ── Link Prioridades ── */}
      <button
        onClick={() => onNavigate('prioridades')}
        className="w-full flex items-center justify-between glass-card rounded-premium px-4 py-3 border border-white/[0.06] hover:border-silver/20 transition-premium group"
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-silver-dim" />
          <span className="text-xs text-silver-dim tracking-widest">VER CASCADA DE PRIORIDADES</span>
        </div>
        <ChevronRightIcon className="w-3.5 h-3.5 text-silver-dim/40 group-hover:text-silver-dim transition-colors" />
      </button>

      {/* ── Gráficos de transacciones ── */}
      {empresasConIngresos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-silver-dim tracking-widest font-display">INGRESOS POR FUENTE</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div style={{ height: '220px' }}>
              <Pie data={datosTorta} options={{ ...opcionesBase, scales: undefined }} />
            </div>
          </div>
          <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
            <div style={{ height: '200px' }}>
              <Bar data={datosBarras} options={opcionesBase} />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onNuevaTransaccion}
          className="w-full text-center glass-card rounded-premium p-8 border border-dashed border-white/10 hover:border-silver/20 transition-premium group"
        >
          <div className="text-silver-dim/40 text-4xl mb-3">∅</div>
          <p className="text-dark-textSecondary text-sm mb-1">{t('dashboard.noIncome')}</p>
          <p className="text-xs text-silver-dim/50 group-hover:text-silver-dim transition-colors">
            Tap para registrar tu primera transacción →
          </p>
        </button>
      )}
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent = 'silver', large = false }) => {
  const colors = {
    silver: 'text-gradient-silver',
    bright: 'text-silver-bright',
    dim:    'text-silver-dim',
  };
  return (
    <div className="glass-card rounded-premium p-4 border border-white/[0.06]">
      <div className="text-[10px] text-dark-textSecondary mb-1.5 uppercase tracking-wider">{label}</div>
      <div className={`font-bold font-mono ${large ? 'text-3xl' : 'text-xl'} ${colors[accent] || 'text-silver'}`}>
        {value}
      </div>
    </div>
  );
};

export default Dashboard;
