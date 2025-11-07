import React from 'react';
import { formatearMoneda } from '../utils/calculations.js';

const SistemaPrioridades = ({ distribucion }) => {
  // Agrupar por nivel de prioridad
  const prioridades = {
    1: [],
    2: [],
    3: [],
    4: []
  };

  distribucion.forEach(item => {
    if (!item.esSagrado) {
      prioridades[item.prioridad].push(item);
    }
  });

  // Encontrar el Sagrado 40%
  const sagrado = distribucion.find(item => item.esSagrado);

  const renderBarraProgreso = (porcentaje, color) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(porcentaje, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  const renderFilaCategoria = (item) => {
    const estaCompleto = item.estado === 'OK';

    return (
      <tr key={item.numero} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-600">{item.numero}</td>
        <td className="px-4 py-3 font-medium text-gray-800">{item.categoria}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatearMoneda(item.meta, 'USD')}
        </td>
        <td className="px-4 py-3 text-sm font-semibold" style={{ color: item.color }}>
          {formatearMoneda(item.asignado, 'USD')}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatearMoneda(item.gastado, 'USD')}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatearMoneda(item.disponible, 'USD')}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {renderBarraProgreso(item.porcentajeCumplido, item.color)}
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-[45px]">
              {item.porcentajeCumplido}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              estaCompleto
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {item.estado}
          </span>
        </td>
      </tr>
    );
  };

  const renderNivelPrioridad = (nivel, items, color, colorBg, nombre) => {
    if (items.length === 0) return null;

    return (
      <div key={nivel} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        {/* Header del nivel */}
        <div
          className="px-4 py-3 font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {nombre}
        </div>

        {/* Tabla de categorías */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => renderFilaCategoria(item))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Sistema de Prioridades</h1>
        <p className="text-purple-100">Distribución en Cascada Automática</p>
      </div>

      {/* Sagrado 40% destacado */}
      {sagrado && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-yellow-900 mb-1 font-semibold">
                🔒 {sagrado.categoria}
              </div>
              <div className="text-4xl font-bold text-yellow-900">
                {formatearMoneda(sagrado.asignado, 'USD')}
              </div>
              <div className="text-sm text-yellow-800 mt-1">
                Apartado automáticamente SIEMPRE antes de cualquier distribución
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-900">40%</div>
              <div className="text-xs text-yellow-800">Intocable</div>
            </div>
          </div>
        </div>
      )}

      {/* Explicación del sistema */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">¿Cómo funciona la cascada?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El 60% restante se distribuye en orden estricto de prioridad</li>
          <li>• Una categoría solo recibe dinero si las anteriores están completas</li>
          <li>• El dinero "cae en cascada" hasta donde alcance</li>
          <li>• Estado "OK" = Meta cumplida, "PENDIENTE" = Necesita más fondos</li>
        </ul>
      </div>

      {/* Niveles de prioridad */}
      {renderNivelPrioridad(
        1,
        prioridades[1],
        '#dc2626',
        '#fee2e2',
        'PRIORIDAD 01 - Crítico'
      )}

      {renderNivelPrioridad(
        2,
        prioridades[2],
        '#ea580c',
        '#ffedd5',
        'PRIORIDAD 02 - Importante'
      )}

      {renderNivelPrioridad(
        3,
        prioridades[3],
        '#ca8a04',
        '#fef9c3',
        'PRIORIDAD 03 - Inversiones'
      )}

      {renderNivelPrioridad(
        4,
        prioridades[4],
        '#16a34a',
        '#dcfce7',
        'PRIORIDAD 04 - Calidad de vida'
      )}
    </div>
  );
};

export default SistemaPrioridades;
