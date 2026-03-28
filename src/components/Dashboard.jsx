import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { isExchangeRateOutdated } from '../utils/exchangeRate.js';
import { PlusIcon } from '@heroicons/react/24/solid';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = ({ balance, onNuevaTransaccion, language, displayCurrency, exchangeRate }) => {
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

  const rate      = exchangeRate?.USD_ARS || 1427.99;
  const isOutdated = isExchangeRateOutdated(exchangeRate?.timestamp);

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

      {/* ── Cards de balance ── */}
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

        {/* Sagrado 40% — card destacada */}
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
                <div className="text-7xl font-bold text-gradient-silver shimmer font-display">40%</div>
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
