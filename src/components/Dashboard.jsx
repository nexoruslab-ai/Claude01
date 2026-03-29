import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { isExchangeRateOutdated } from '../utils/exchangeRate.js';
import { PlusIcon, BanknotesIcon, LockClosedIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Helpers para cuentas ──────────────────────────────────────────────────
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
  return num; // USD
};

const diasHasta = (fechaStr) => {
  if (!fechaStr) return null;
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaStr + 'T00:00:00');
  return Math.round((fecha - hoy) / 86400000);
};

const fmtFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
};

const fmt2 = (n) =>
  Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = ({ balance, onNuevaTransaccion, language, displayCurrency, exchangeRate, cuentas = [], config = {}, negocios = [] }) => {
  const { t } = useTranslation(language);

  const {
    totalIngresos,
    totalGastos,
    balanceNeto,
    sagrado40,
    disponible60,
    disponibleReal,
    ingresosPorEmpresa
  } = balance;

  const tasas      = config.tasas || {};
  const pctAhorro  = config.porcentajeAhorro ?? 40;
  const rate       = exchangeRate?.USD_ARS || tasas.usdToArs || 1427.99;
  const isOutdated = isExchangeRateOutdated(exchangeRate?.timestamp);

  // ── Patrimonio en cuentas ─────────────────────────────────────────────────
  const totalCuentasDisp  = cuentas.reduce((s, c) => s + toUSD(calcDisponible(c), c.moneda, tasas), 0);
  const totalCuentasReten = cuentas.reduce((s, c) => s + toUSD(calcRetenido(c),   c.moneda, tasas), 0);
  const totalCuentasBruto = totalCuentasDisp + totalCuentasReten;

  // próximas liberaciones (máx 5)
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
    .slice(0, 5);

  // ── Negocios resumen ──────────────────────────────────────────────────────
  const negociosActivos = negocios.filter(n => n.activo !== false);
  // Ingreso estimado mensual por moneda
  const ingEstimadoPorMoneda = negociosActivos.reduce((acc, n) => {
    const moneda = n.moneda || 'USD';
    const comision = (Number(n.ingresoBase || 0) * Number(n.porcentaje || 100)) / 100;
    acc[moneda] = (acc[moneda] || 0) + comision;
    return acc;
  }, {});
  // Total en USD
  const ingEstimadoUSD = negociosActivos.reduce((sum, n) => {
    const comision = (Number(n.ingresoBase || 0) * Number(n.porcentaje || 100)) / 100;
    return sum + toUSD(comision, n.moneda || 'USD', tasas);
  }, 0);

  // ── Gráficos ──────────────────────────────────────────────────────────────
  const empresasConIngresos = Object.entries(ingresosPorEmpresa).filter(([_, m]) => m > 0);

  const datosTorta = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [{
      label: t('dashboard.totalIncome'),
      data: empresasConIngresos.map(([_, m]) => m),
      backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
      borderColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
    }],
  };

  const datosBarras = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [{
      label: t('dashboard.totalIncome'),
      data: empresasConIngresos.map(([_, m]) => m),
      backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
      borderRadius: 6,
    }],
  };

  const opcionesGraficos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 11, family: 'Inter' },
          color: '#a8a8b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22,22,29,0.97)',
        titleColor: '#e8e8f0',
        bodyColor: '#e8e8f0',
        borderColor: 'rgba(192,192,192,0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label(context) {
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            const formatted = formatearMoneda(value, displayCurrency, rate);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct   = ((value / total) * 100).toFixed(1);
            return `${formatted} (${pct}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        grid:  { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#a8a8b8', font: { size: 11 } }
      },
      x: {
        grid:  { display: false },
        ticks: { color: '#a8a8b8', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">

      {/* ── Header DENARIUM ── */}
      <div className="glass-card rounded-premium p-6 shadow-elevation-2 border border-silver/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient-silver mb-1 tracking-widest">
              DENARIUM
            </h1>
            <p className="text-dark-textSecondary text-sm">{t('dashboard.subtitle')}</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-dark-textSecondary mb-1">{t('dashboard.exchangeRate')}</div>
            <div className="font-mono text-base font-semibold text-silver">
              1 USD = {rate.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
            </div>
            <div className={`text-xs mt-1 ${isOutdated ? 'text-silver-dim' : 'text-silver-dark'}`}>
              {isOutdated ? `⚠ ${t('dashboard.outdated')}` : `✓ ${t('dashboard.updatedToday')}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── PATRIMONIO EN CUENTAS ── */}
      {cuentas.length > 0 && (
        <div className="glass-card rounded-premium border border-silver/10 shadow-glow-silver overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <BanknotesIcon className="w-4 h-4 text-silver-dim" />
            <span className="text-[10px] text-silver-dim tracking-widest font-display">PATRIMONIO EN CUENTAS</span>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-3 gap-0 border-b border-white/[0.04]">
            <div className="px-4 py-3 text-center">
              <div className="text-[10px] text-silver-dim mb-1 tracking-widest">BRUTO</div>
              <div className="text-lg font-bold font-mono text-silver">
                USD {fmt2(totalCuentasBruto)}
              </div>
            </div>
            <div className="px-4 py-3 text-center border-x border-white/[0.04]">
              <div className="text-[10px] text-silver-dim mb-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 inline-block" />
                DISPONIBLE
              </div>
              <div className="text-lg font-bold font-mono text-silver-bright">
                USD {fmt2(totalCuentasDisp)}
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-[10px] text-silver-dim mb-1 flex items-center justify-center gap-1">
                <LockClosedIcon className="w-3 h-3" />
                RETENIDO
              </div>
              <div className="text-lg font-bold font-mono text-silver-dim">
                USD {fmt2(totalCuentasReten)}
              </div>
            </div>
          </div>

          {/* Barra disponible vs retenido */}
          {totalCuentasBruto > 0 && (
            <div className="px-4 py-2">
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-silver/40 to-silver/70 transition-all duration-500"
                  style={{ width: `${(totalCuentasDisp / totalCuentasBruto) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-silver-dim">
                  {((totalCuentasDisp / totalCuentasBruto) * 100).toFixed(0)}% libre
                </span>
                <span className="text-[9px] text-silver-dim">
                  {((totalCuentasReten / totalCuentasBruto) * 100).toFixed(0)}% retenido
                </span>
              </div>
            </div>
          )}

          {/* Próximas liberaciones */}
          {proximasLib.length > 0 && (
            <div className="border-t border-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ClockIcon className="w-3 h-3 text-silver-dim" />
                <span className="text-[9px] text-silver-dim tracking-widest">PRÓXIMAS LIBERACIONES</span>
              </div>
              <div className="space-y-1.5">
                {proximasLib.map((lib, i) => {
                  const d = lib.dias;
                  const badge =
                    d === 0 ? { label: '¡HOY!',   cls: 'text-emerald-400 bg-emerald-400/10' } :
                    d === 1 ? { label: 'mañana',   cls: 'text-yellow-400 bg-yellow-400/10'  } :
                    d < 0   ? { label: 'vencido',  cls: 'text-red-400 bg-red-400/10'        } :
                               { label: `en ${d}d`, cls: 'text-silver-dim bg-white/[0.04]'  };
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-silver-dim truncate">{lib.cuentaNombre}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="font-mono text-silver text-[11px]">
                          {lib.moneda} {fmt2(lib.monto)}
                        </span>
                        <span className="text-[9px] text-silver-dim">{fmtFecha(lib.fecha)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NEGOCIOS ACTIVOS ── */}
      {negociosActivos.length > 0 && (
        <div className="glass-card rounded-premium border border-silver/10 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-silver-dim" />
              <span className="text-[10px] text-silver-dim tracking-widest font-display">NEGOCIOS ACTIVOS</span>
            </div>
            <span className="text-[10px] text-silver-dim bg-white/[0.04] px-2 py-0.5 rounded">
              {negociosActivos.length} fuente{negociosActivos.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="border-t border-white/[0.04] px-4 py-3">
            <div className="text-[10px] text-silver-dim mb-2 tracking-widest">INGRESO ESTIMADO / MES</div>

            {/* Total en USD */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xs text-silver-dim font-mono">≈ USD</span>
              <span className="text-2xl font-bold font-display text-gradient-silver">
                {fmt2(ingEstimadoUSD)}
              </span>
            </div>

            {/* Desglose por moneda */}
            {Object.entries(ingEstimadoPorMoneda).map(([moneda, total]) => (
              <div key={moneda} className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-silver-dim font-mono">{moneda}</span>
                <span className="text-silver font-semibold font-mono">{fmt2(total)}</span>
              </div>
            ))}

            {/* Mini lista de negocios */}
            <div className="mt-3 space-y-1 border-t border-white/[0.04] pt-2">
              {negociosActivos.slice(0, 4).map(n => {
                const comision = (Number(n.ingresoBase || 0) * Number(n.porcentaje || 100)) / 100;
                return (
                  <div key={n.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-silver-dim truncate">{n.nombre}</span>
                    <span className="text-silver font-mono flex-shrink-0 ml-2">
                      {n.moneda} {fmt2(comision)}
                    </span>
                  </div>
                );
              })}
              {negociosActivos.length > 4 && (
                <div className="text-[9px] text-silver-dim text-right">
                  +{negociosActivos.length - 4} más
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cards de balance (transacciones) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Total Ingresos */}
        <div className="glass-card rounded-premium p-5 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
          <div className="text-xs text-dark-textSecondary mb-2 font-medium uppercase tracking-wider">
            {t('dashboard.totalIncome')}
          </div>
          <div className="text-3xl font-bold text-gradient-silver font-mono">
            {formatearMoneda(totalIngresos, displayCurrency, rate)}
          </div>
        </div>

        {/* Total Gastos */}
        <div className="glass-card rounded-premium p-5 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
          <div className="text-xs text-dark-textSecondary mb-2 font-medium uppercase tracking-wider">
            {t('dashboard.totalExpenses')}
          </div>
          <div className="text-3xl font-bold text-silver-dim font-mono">
            {formatearMoneda(totalGastos, displayCurrency, rate)}
          </div>
        </div>

        {/* Balance Neto */}
        <div className="glass-card rounded-premium p-5 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
          <div className="text-xs text-dark-textSecondary mb-2 font-medium uppercase tracking-wider">
            {t('dashboard.netBalance')}
          </div>
          <div className={`text-3xl font-bold font-mono ${balanceNeto >= 0 ? 'text-silver-bright' : 'text-silver-dim'}`}>
            {formatearMoneda(balanceNeto, displayCurrency, rate)}
          </div>
        </div>

        {/* Sagrado % — card destacada */}
        <div className="md:col-span-2 glass-card rounded-premium p-6 shadow-glow-silver border border-silver/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-silver opacity-[0.04] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-silver-dark mb-2 font-bold flex items-center gap-2 uppercase tracking-widest">
                  <span>⬡</span>
                  <span>{t('dashboard.sacred40')}</span>
                </div>
                <div className="text-5xl font-bold text-gradient-silver font-mono mb-2">
                  {formatearMoneda(sagrado40, displayCurrency, rate)}
                </div>
                <div className="text-xs text-dark-textSecondary">
                  {t('dashboard.automaticallySet')} {formatearMoneda(totalIngresos, displayCurrency, rate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-7xl font-bold text-gradient-silver shimmer font-display">{pctAhorro}%</div>
                <div className="text-xs text-silver-dim mt-1 tracking-widest">{t('dashboard.sacred40Subtitle')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disponible Real */}
        <div className="glass-card rounded-premium p-5 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
          <div className="text-xs text-dark-textSecondary mb-2 font-medium uppercase tracking-wider">
            {t('dashboard.available')}
          </div>
          <div className={`text-3xl font-bold font-mono ${disponibleReal >= 0 ? 'text-silver' : 'text-silver-dim'}`}>
            {formatearMoneda(disponibleReal, displayCurrency, rate)}
          </div>
          <div className="text-xs text-dark-textSecondary mt-2">
            {t('dashboard.availableOf')}: {formatearMoneda(disponible60, displayCurrency, rate)}
          </div>
        </div>
      </div>

      {/* ── Gráficos ── */}
      {empresasConIngresos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card rounded-premium p-6 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
            <h2 className="text-sm font-semibold mb-4 text-silver-dark uppercase tracking-wider">
              {t('dashboard.incomeByCompany')}
            </h2>
            <div style={{ height: '280px' }}>
              <Pie data={datosTorta} options={{ ...opcionesGraficos, scales: undefined }} />
            </div>
          </div>

          <div className="glass-card rounded-premium p-6 shadow-elevation-1 hover-lift border border-white/[0.06] transition-premium">
            <h2 className="text-sm font-semibold mb-4 text-silver-dark uppercase tracking-wider">
              {t('dashboard.companyComparison')}
            </h2>
            <div style={{ height: '280px' }}>
              <Bar data={datosBarras} options={opcionesGraficos} />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-premium p-12 text-center shadow-elevation-1 border border-white/[0.06]">
          <p className="text-dark-textSecondary text-lg mb-3">{t('dashboard.noIncome')}</p>
          <p className="text-silver-deep text-sm">{t('dashboard.startAdding')}</p>
        </div>
      )}

      {/* ── FAB flotante ── */}
      <button
        onClick={() => onNuevaTransaccion()}
        className="fixed bottom-24 right-5 bg-gradient-silver text-dark-bg rounded-full w-14 h-14 shadow-glow-silver hover:shadow-glow-silver-lg transition-premium hover-scale flex items-center justify-center z-10"
        title={t('nav.add')}
      >
        <PlusIcon className="w-7 h-7" />
      </button>
    </div>
  );
};

export default Dashboard;
