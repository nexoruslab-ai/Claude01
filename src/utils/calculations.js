import { PRIORIDADES } from '../data/constants.js';

/**
 * SISTEMA DE CASCADA AUTOMÁTICA - LÓGICA CORE
 *
 * Regla fundamental "Sagrado 40%":
 * 1. El 40% de TODOS los ingresos se aparta automáticamente SIEMPRE
 * 2. El 60% restante se distribuye en cascada por 4 niveles de prioridad
 * 3. Una prioridad solo recibe dinero si las anteriores están completadas
 */

/**
 * Calcula el total de ingresos
 */
export const calcularTotalIngresos = (ingresos) => {
  return ingresos.reduce((total, ingreso) => total + Number(ingreso.monto), 0);
};

/**
 * Calcula el total de gastos
 */
export const calcularTotalGastos = (gastos) => {
  return gastos.reduce((total, gasto) => total + Number(gasto.monto), 0);
};

/**
 * Calcula el Sagrado 40% (siempre primero)
 */
export const calcularSagrado40 = (totalIngresos) => {
  return totalIngresos * 0.4;
};

/**
 * Calcula el disponible 60% para distribución
 */
export const calcularDisponible60 = (totalIngresos) => {
  return totalIngresos * 0.6;
};

/**
 * Suma gastos por categoría
 */
export const calcularGastosPorCategoria = (gastos) => {
  const gastosPorCategoria = {};

  gastos.forEach(gasto => {
    const categoria = gasto.categoria;
    if (!gastosPorCategoria[categoria]) {
      gastosPorCategoria[categoria] = 0;
    }
    gastosPorCategoria[categoria] += Number(gasto.monto);
  });

  return gastosPorCategoria;
};

/**
 * DISTRIBUCIÓN EN CASCADA AUTOMÁTICA
 *
 * Distribuye el disponible60 en orden estricto de prioridad:
 * - Para cada categoría: asignado = min(meta, dineroRestante)
 * - Resta el asignado del dineroRestante
 * - Solo pasa a la siguiente si hay dinero sobrante
 *
 * @param {number} totalIngresos - Total de ingresos
 * @param {object} gastosPorCategoria - Gastos agrupados por categoría
 * @returns {Array} - Array con información de distribución por categoría
 */
export const calcularDistribucionCascada = (totalIngresos, gastosPorCategoria) => {
  const sagrado40 = calcularSagrado40(totalIngresos);
  let disponible60 = calcularDisponible60(totalIngresos);

  const resultados = [];

  // Procesar cada categoría en orden de PRIORIDADES
  for (const prioridad of PRIORIDADES) {
    const categoria = prioridad.categoria;

    // Caso especial: SAGRADO 40%
    if (prioridad.esSagrado) {
      resultados.push({
        numero: prioridad.numero,
        categoria: categoria,
        meta: sagrado40,
        asignado: sagrado40,
        gastado: 0,
        disponible: sagrado40,
        porcentajeCumplido: 100,
        estado: 'OK',
        prioridad: prioridad.prioridad,
        color: prioridad.color,
        colorBg: prioridad.colorBg,
        nivelNombre: prioridad.nivelNombre,
        esSagrado: true
      });
      continue;
    }

    // Para las demás categorías
    const meta = prioridad.meta;
    const gastado = gastosPorCategoria[categoria] || 0;

    // Calcular cuánto asignar (mínimo entre meta y dinero disponible)
    const asignado = Math.min(meta, disponible60);

    // Restar lo asignado del dinero disponible
    disponible60 -= asignado;

    // Calcular disponible real (asignado - gastado)
    const disponibleReal = Math.max(0, asignado - gastado);

    // Calcular porcentaje cumplido
    const porcentajeCumplido = meta > 0 ? Math.round((asignado / meta) * 100) : 100;

    // Determinar estado (OK si asignado >= meta)
    const estado = asignado >= meta ? 'OK' : 'PENDIENTE';

    resultados.push({
      numero: prioridad.numero,
      categoria: categoria,
      meta: meta,
      asignado: asignado,
      gastado: gastado,
      disponible: disponibleReal,
      porcentajeCumplido: porcentajeCumplido,
      estado: estado,
      prioridad: prioridad.prioridad,
      color: prioridad.color,
      colorBg: prioridad.colorBg,
      nivelNombre: prioridad.nivelNombre
    });

    // Si no hay más dinero disponible, las siguientes categorías quedan sin asignar
    if (disponible60 <= 0) {
      // Continuar procesando pero sin asignar dinero
      disponible60 = 0;
    }
  }

  return resultados;
};

/**
 * Calcula ingresos por empresa
 */
export const calcularIngresosPorEmpresa = (ingresos) => {
  const ingresosPorEmpresa = {};

  ingresos.forEach(ingreso => {
    const empresa = ingreso.empresa;
    if (!ingresosPorEmpresa[empresa]) {
      ingresosPorEmpresa[empresa] = 0;
    }
    ingresosPorEmpresa[empresa] += Number(ingreso.monto);
  });

  return ingresosPorEmpresa;
};

/**
 * Calcula el balance general completo
 */
export const calcularBalanceGeneral = (ingresos, gastos) => {
  const totalIngresos = calcularTotalIngresos(ingresos);
  const totalGastos = calcularTotalGastos(gastos);
  const sagrado40 = calcularSagrado40(totalIngresos);
  const disponible60 = calcularDisponible60(totalIngresos);
  const balanceNeto = totalIngresos - totalGastos;
  const disponibleReal = disponible60 - totalGastos;

  const gastosPorCategoria = calcularGastosPorCategoria(gastos);
  const distribucion = calcularDistribucionCascada(totalIngresos, gastosPorCategoria);
  const ingresosPorEmpresa = calcularIngresosPorEmpresa(ingresos);

  return {
    totalIngresos,
    totalGastos,
    balanceNeto,
    sagrado40,
    disponible60,
    disponibleReal,
    distribucion,
    ingresosPorEmpresa,
    gastosPorCategoria
  };
};

/**
 * Formatear moneda
 */
export const formatearMoneda = (monto, moneda = 'USD') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
};

/**
 * Formatear fecha
 */
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
