import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SistemaPrioridades from './components/SistemaPrioridades.jsx';
import FormularioIngreso from './components/FormularioIngreso.jsx';
import FormularioGasto from './components/FormularioGasto.jsx';
import Historial from './components/Historial.jsx';
import { calcularBalanceGeneral } from './utils/calculations.js';

// Constantes para localStorage
const STORAGE_KEY_INGRESOS = 'finflow_ingresos';
const STORAGE_KEY_GASTOS = 'finflow_gastos';

function App() {
  // Estado para datos
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);

  // Estado para navegación
  const [vistaActual, setVistaActual] = useState('dashboard'); // dashboard, prioridades, nuevoIngreso, nuevoGasto, historial

  // Estado para modal de selección de tipo de transacción
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    try {
      const ingresosGuardados = localStorage.getItem(STORAGE_KEY_INGRESOS);
      const gastosGuardados = localStorage.getItem(STORAGE_KEY_GASTOS);

      if (ingresosGuardados) {
        setIngresos(JSON.parse(ingresosGuardados));
      }

      if (gastosGuardados) {
        setGastos(JSON.parse(gastosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }, []);

  // Guardar ingresos en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INGRESOS, JSON.stringify(ingresos));
    } catch (error) {
      console.error('Error al guardar ingresos:', error);
    }
  }, [ingresos]);

  // Guardar gastos en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GASTOS, JSON.stringify(gastos));
    } catch (error) {
      console.error('Error al guardar gastos:', error);
    }
  }, [gastos]);

  // Calcular balance general
  const balance = calcularBalanceGeneral(ingresos, gastos);

  // Handlers para agregar transacciones
  const handleGuardarIngreso = (nuevoIngreso) => {
    setIngresos(prev => [...prev, nuevoIngreso]);
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  const handleGuardarGasto = (nuevoGasto) => {
    setGastos(prev => [...prev, nuevoGasto]);
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  // Handler para eliminar transacciones
  const handleEliminarTransaccion = (id, tipo) => {
    if (tipo === 'ingreso') {
      setIngresos(prev => prev.filter(i => i.id !== id));
    } else {
      setGastos(prev => prev.filter(g => g.id !== id));
    }
  };

  // Handler para cancelar formularios
  const handleCancelar = () => {
    setVistaActual('dashboard');
    setMostrarModalTipo(false);
  };

  // Handler para abrir modal de nueva transacción
  const handleNuevaTransaccion = (tipo) => {
    if (tipo === 'ingreso') {
      setVistaActual('nuevoIngreso');
    } else if (tipo === 'gasto') {
      setVistaActual('nuevoGasto');
    } else {
      setMostrarModalTipo(true);
    }
  };

  // Renderizar vista actual
  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return (
          <Dashboard
            balance={balance}
            onNuevaTransaccion={handleNuevaTransaccion}
          />
        );
      case 'prioridades':
        return <SistemaPrioridades distribucion={balance.distribucion} />;
      case 'nuevoIngreso':
        return (
          <FormularioIngreso
            onGuardar={handleGuardarIngreso}
            onCancelar={handleCancelar}
          />
        );
      case 'nuevoGasto':
        return (
          <FormularioGasto
            onGuardar={handleGuardarGasto}
            onCancelar={handleCancelar}
          />
        );
      case 'historial':
        return (
          <Historial
            ingresos={ingresos}
            gastos={gastos}
            onEliminar={handleEliminarTransaccion}
          />
        );
      default:
        return (
          <Dashboard
            balance={balance}
            onNuevaTransaccion={handleNuevaTransaccion}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4">
        {renderVista()}
      </div>

      {/* Barra de navegación inferior */}
      {!['nuevoIngreso', 'nuevoGasto'].includes(vistaActual) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setVistaActual('dashboard')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  vistaActual === 'dashboard'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">📊</span>
                <span className="text-xs font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => setVistaActual('prioridades')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  vistaActual === 'prioridades'
                    ? 'text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">🎯</span>
                <span className="text-xs font-medium">Prioridades</span>
              </button>

              <button
                onClick={() => handleNuevaTransaccion()}
                className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-green-600 hover:text-green-700"
              >
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg mb-1">
                  +
                </div>
                <span className="text-xs font-medium text-gray-700">Agregar</span>
              </button>

              <button
                onClick={() => setVistaActual('historial')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  vistaActual === 'historial'
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">📜</span>
                <span className="text-xs font-medium">Historial</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Modal para seleccionar tipo de transacción */}
      {mostrarModalTipo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4"
          onClick={() => setMostrarModalTipo(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Transacción</h2>
            <p className="text-gray-600 mb-6">¿Qué deseas registrar?</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setVistaActual('nuevoIngreso');
                  setMostrarModalTipo(false);
                }}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">↑</span>
                <span>Ingreso</span>
              </button>

              <button
                onClick={() => {
                  setVistaActual('nuevoGasto');
                  setMostrarModalTipo(false);
                }}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">↓</span>
                <span>Gasto</span>
              </button>

              <button
                onClick={() => setMostrarModalTipo(false)}
                className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
