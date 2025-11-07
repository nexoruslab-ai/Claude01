import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';
import { useTranslation } from '../utils/i18n.js';
import { isExchangeRateOutdated } from '../utils/exchangeRate.js';
import { PlusIcon } from '@heroicons/react/24/solid';

// Registrar componentes de Chart.js
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

  const rate = exchangeRate?.USD_ARS || 1427.99;
  const isOutdated = isExchangeRateOutdated(exchangeRate?.timestamp);

  // Datos para gráfico de torta - Distribución de ingresos por empresa
  const empresasConIngresos = Object.entries(ingresosPorEmpresa).filter(([_, monto]) => monto > 0);

  const datosTorta = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [
      {
        label: t('dashboard.totalIncome'),
        data: empresasConIngresos.map(([_, monto]) => monto),
        backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
      },
    ],
  };

  // Datos para gráfico de barras
  const datosBarras = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [
      {
        label: t('dashboard.totalIncome'),
        data: empresasConIngresos.map(([_, monto]) => monto),
        backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
        borderRadius: 8,
      },
    ],
  };

  const opcionesGraficos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: 'Inter'
          },
          color: '#a8a8b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22, 22, 29, 0.95)',
        titleColor: '#e8e8f0',
        bodyColor: '#e8e8f0',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            const formatted = formatearMoneda(value, displayCurrency, rate);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const porcentaje = ((value / total) * 100).toFixed(1);
            return `${formatted} (${porcentaje}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a8a8b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a8a8b8'
        }
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header Premium con glassmorphism */}
      <div className="glass-card dark:glass-card rounded-premium p-6 shadow-elevation-2 border border-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient-gold mb-2">{t('dashboard.title')}</h1>
            <p className="text-dark-textSecondary dark:text-dark-textSecondary">{t('dashboard.subtitle')}</p>
          </div>

          {/* Indicador de tasa de cambio */}
          <div className="hidden md:block text-right">
            <div className="text-xs text-dark-textSecondary dark:text-dark-textSecondary mb-1">
              {t('dashboard.exchangeRate')}
            </div>
            <div className="font-mono text-lg font-semibold text-gold">
              1 USD = {rate.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS
            </div>
            <div className={`text-xs mt-1 ${isOutdated ? 'text-yellow-500' : 'text-green-500'}`}>
              {isOutdated ? `⚠ ${t('dashboard.outdated')}` : `✓ ${t('dashboard.updatedToday')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Balance General - Cards Premium con glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="glass-card dark:glass-card rounded-premium p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-premium hover-lift border border-white/10">
          <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mb-2 font-medium">
            {t('dashboard.totalIncome')}
          </div>
          <div className="text-3xl font-bold text-gradient-gold font-mono">
            {formatearMoneda(totalIngresos, displayCurrency, rate)}
          </div>
        </div>

        {/* Total Gastos */}
        <div className="glass-card dark:glass-card rounded-premium p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-premium hover-lift border border-white/10">
          <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mb-2 font-medium">
            {t('dashboard.totalExpenses')}
          </div>
          <div className="text-3xl font-bold text-red-500 font-mono">
            {formatearMoneda(totalGastos, displayCurrency, rate)}
          </div>
        </div>

        {/* Balance Neto */}
        <div className="glass-card dark:glass-card rounded-premium p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-premium hover-lift border border-white/10">
          <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mb-2 font-medium">
            {t('dashboard.netBalance')}
          </div>
          <div className={`text-3xl font-bold font-mono ${balanceNeto >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatearMoneda(balanceNeto, displayCurrency, rate)}
          </div>
        </div>

        {/* Sagrado 40% - DESTACADO con efecto especial */}
        <div className="md:col-span-2 glass-card rounded-premium p-6 shadow-glow-gold border-2 border-gold/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-gold opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-yellow-900 dark:text-gold mb-1 font-bold flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span>{t('dashboard.sacred40')}</span>
                </div>
                <div className="text-5xl font-bold text-gradient-gold font-mono mb-2">
                  {formatearMoneda(sagrado40, displayCurrency, rate)}
                </div>
                <div className="text-xs text-dark-textSecondary dark:text-dark-textSecondary">
                  {t('dashboard.automaticallySet')} {formatearMoneda(totalIngresos, displayCurrency, rate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-7xl font-bold text-gradient-gold shimmer">40%</div>
                <div className="text-xs text-gold-dark mt-1">{t('dashboard.sacred40Subtitle')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disponible Real */}
        <div className="glass-card dark:glass-card rounded-premium p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-premium hover-lift border border-white/10">
          <div className="text-sm text-dark-textSecondary dark:text-dark-textSecondary mb-2 font-medium">
            {t('dashboard.available')}
          </div>
          <div className={`text-3xl font-bold font-mono ${disponibleReal >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {formatearMoneda(disponibleReal, displayCurrency, rate)}
          </div>
          <div className="text-xs text-dark-textSecondary dark:text-dark-textSecondary mt-2">
            {t('dashboard.availableOf')}: {formatearMoneda(disponible60, displayCurrency, rate)}
          </div>
        </div>
      </div>

      {/* Gráficos Premium */}
      {empresasConIngresos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Torta */}
          <div className="glass-card dark:glass-card rounded-premium p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-premium border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-dark-text dark:text-dark-text">{t('dashboard.incomeByCompany')}</h2>
            <div style={{ height: '300px' }}>
              <Pie data={datosTorta} options={opcionesGraficos} />
            </div>
          </div>

          {/* Gráfico de Barras */}
          <div className="glass-card dark:glass-card rounded-premium p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-premium border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-dark-text dark:text-dark-text">{t('dashboard.companyComparison')}</h2>
            <div style={{ height: '300px' }}>
              <Bar data={datosBarras} options={opcionesGraficos} />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card dark:glass-card rounded-premium p-12 text-center shadow-elevation-1 border border-white/10">
          <p className="text-dark-textSecondary dark:text-dark-textSecondary text-lg mb-4">{t('dashboard.noIncome')}</p>
          <p className="text-dark-textSecondary dark:text-dark-textSecondary text-sm">{t('dashboard.startAdding')}</p>
        </div>
      )}

      {/* Botón flotante premium */}
      <button
        onClick={() => onNuevaTransaccion()}
        className="fixed bottom-24 right-6 bg-gradient-gold text-dark-bg rounded-full w-16 h-16 shadow-glow-gold hover:shadow-elevation-3 transition-premium hover-scale flex items-center justify-center z-10 btn-premium"
        title={t('nav.add')}
      >
        <PlusIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default Dashboard;
