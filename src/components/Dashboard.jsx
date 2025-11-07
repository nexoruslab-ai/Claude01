import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { formatearMoneda } from '../utils/calculations.js';
import { COLORES_EMPRESAS } from '../data/constants.js';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = ({ balance, onNuevaTransaccion }) => {
  const {
    totalIngresos,
    totalGastos,
    balanceNeto,
    sagrado40,
    disponible60,
    disponibleReal,
    ingresosPorEmpresa
  } = balance;

  // Datos para gráfico de torta - Distribución de ingresos por empresa
  const empresasConIngresos = Object.entries(ingresosPorEmpresa).filter(([_, monto]) => monto > 0);

  const datosTorta = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [
      {
        label: 'Ingresos',
        data: empresasConIngresos.map(([_, monto]) => monto),
        backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Datos para gráfico de barras - Comparación entre empresas
  const datosBarras = {
    labels: empresasConIngresos.map(([empresa]) => empresa),
    datasets: [
      {
        label: 'Ingresos por Empresa',
        data: empresasConIngresos.map(([_, monto]) => monto),
        backgroundColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
        borderColor: empresasConIngresos.map(([empresa]) => COLORES_EMPRESAS[empresa]),
        borderWidth: 1,
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
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            label += formatearMoneda(value, 'USD');

            // Calcular porcentaje
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const porcentaje = ((value / total) * 100).toFixed(1);
            label += ` (${porcentaje}%)`;

            return label;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">FinFlow</h1>
        <p className="text-blue-100">Panel de Control Financiero</p>
      </div>

      {/* Balance General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Ingresos</div>
          <div className="text-2xl font-bold text-green-600">
            {formatearMoneda(totalIngresos, 'USD')}
          </div>
        </div>

        {/* Total Gastos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Gastos</div>
          <div className="text-2xl font-bold text-red-600">
            {formatearMoneda(totalGastos, 'USD')}
          </div>
        </div>

        {/* Balance Neto */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Balance Neto</div>
          <div className={`text-2xl font-bold ${balanceNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatearMoneda(balanceNeto, 'USD')}
          </div>
        </div>

        {/* Sagrado 40% - DESTACADO */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-lg shadow-lg md:col-span-2">
          <div className="text-sm text-yellow-900 mb-1 font-semibold">🔒 SAGRADO 40% (Intocable)</div>
          <div className="text-3xl font-bold text-yellow-900">
            {formatearMoneda(sagrado40, 'USD')}
          </div>
          <div className="text-xs text-yellow-800 mt-1">
            Apartado automáticamente de {formatearMoneda(totalIngresos, 'USD')}
          </div>
        </div>

        {/* Disponible Real */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Disponible Real</div>
          <div className={`text-2xl font-bold ${disponibleReal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatearMoneda(disponibleReal, 'USD')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Del 60% disponible: {formatearMoneda(disponible60, 'USD')}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {empresasConIngresos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Torta */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Distribución por Empresa</h2>
            <div style={{ height: '300px' }}>
              <Pie data={datosTorta} options={opcionesGraficos} />
            </div>
          </div>

          {/* Gráfico de Barras */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Comparación entre Empresas</h2>
            <div style={{ height: '300px' }}>
              <Bar data={datosBarras} options={opcionesGraficos} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg mb-4">No hay ingresos registrados</p>
          <p className="text-gray-400 text-sm">Comienza agregando tu primer ingreso</p>
        </div>
      )}

      {/* Botón flotante para agregar */}
      <button
        onClick={() => onNuevaTransaccion('ingreso')}
        className="fixed bottom-20 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-2xl font-bold z-10"
        title="Nueva transacción"
      >
        +
      </button>
    </div>
  );
};

export default Dashboard;
