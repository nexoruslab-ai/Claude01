import { PRIORIDADES } from '../data/constants.js';
import { convertUSDtoARS } from './exchangeRate.js';

/**
 * SISTEMA DE CASCADA AUTOMÁTICA - LÓGICA CORE
 *
 * Regla fundamental "Sagrado 40%":
 * 1. El 40% de TODOS los ingresos se aparta automáticamente SIEMPRE
 * 2. El 60% restante se distribuye en cascada por 4 niveles de prioridad
 * 3. Una prioridad solo recibe dinero si las anteriores están completadas
 *
 * IMPORTANTE: Todos los cálculos internos se hacen en USD (moneda base)
 * Las conversiones a ARS solo se hacen para visualización
 */

/**
 * Calcula el total de ingresos en USD
 * SIEMPRE usa montoComision (lo que realmente recibes) para cálculos correctos
 * Si es ingreso con comisión empresarial, usa montoComision, NO montoTotal
 */
export const calcularTotalIngresos = (ingresos) => {
  return ingresos.reduce((total, ingreso) => {
    // Prioridad: montoComision > montoUSD > monto
    let monto;
    if (ingreso.montoComision !== undefined) {
      monto = ingreso.montoComision; // Para ingresos con comisión
    } else if (ingreso.montoUSD !== undefined) {
      monto = ingreso.montoUSD; // Compatibilidad
    } else {
      monto = ingreso.monto; // Fallback
    }
    return total + Number(monto);
  }, 0);
};

/**
 * Calcula el total de gastos en USD
 * SIEMPRE usa montoUSD para cálculos correctos
 */
export const calcularTotalGastos = (gastos) => {
  return gastos.reduce((total, gasto) => {
    // Usar montoUSD si existe, sino usar monto (compatibilidad)
    const monto = gasto.montoUSD !== undefined ? gasto.montoUSD : gasto.monto;
    return total + Number(monto);
  }, 0);
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
 * Suma gastos por categoría en USD
 */
export const calcularGastosPorCategoria = (gastos) => {
  const gastosPorCategoria = {};

  gastos.forEach(gasto => {
    const categoria = gasto.categoria;
    if (!gastosPorCategoria[categoria]) {
      gastosPorCategoria[categoria] = 0;
    }
    // Usar montoUSD si existe, sino monto
    const monto = gasto.montoUSD !== undefined ? gasto.montoUSD : gasto.monto;
    gastosPorCategoria[categoria] += Number(monto);
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
 * @param {Array} prioridadesCustom - Prioridades personalizadas (opcional, usa default si no se provee)
 * @returns {Array} - Array con información de distribución por categoría
 */
export const calcularDistribucionCascada = (totalIngresos, gastosPorCategoria, prioridadesCustom = null) => {
  const prioridadesAUsar = prioridadesCustom || PRIORIDADES;
  const sagrado40 = calcularSagrado40(totalIngresos);
  let disponible60 = calcularDisponible60(totalIngresos);

  const resultados = [];

  // Procesar cada categoría en orden de PRIORIDADES
  for (const prioridad of prioridadesAUsar) {
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
 * Calcula ingresos por empresa en USD (solo comisiones personales)
 */
export const calcularIngresosPorEmpresa = (ingresos) => {
  const ingresosPorEmpresa = {};

  ingresos.forEach(ingreso => {
    const empresa = ingreso.empresa;
    if (!ingresosPorEmpresa[empresa]) {
      ingresosPorEmpresa[empresa] = 0;
    }
    // Usar montoComision si existe (ingresos empresariales), sino montoUSD/monto
    let monto;
    if (ingreso.montoComision !== undefined) {
      monto = ingreso.montoComision;
    } else if (ingreso.montoUSD !== undefined) {
      monto = ingreso.montoUSD;
    } else {
      monto = ingreso.monto;
    }
    ingresosPorEmpresa[empresa] += Number(monto);
  });

  return ingresosPorEmpresa;
};

/**
 * Calcula métricas empresariales detalladas
 * Muestra facturación total vs comisiones personales por empresa
 */
export const calcularMetricasEmpresariales = (ingresos) => {
  const metricasPorEmpresa = {};

  ingresos.forEach(ingreso => {
    const empresa = ingreso.empresa;

    if (!metricasPorEmpresa[empresa]) {
      metricasPorEmpresa[empresa] = {
        facturacionTotal: 0,
        comisionesPersonales: 0,
        cantidadOperaciones: 0,
        cantidadConComision: 0,
        porcentajeComisionPromedio: 0
      };
    }

    const esComision = ingreso.esComision || false;
    const montoTotal = ingreso.montoTotal || ingreso.monto || 0;
    const montoComision = ingreso.montoComision || ingreso.monto || 0;
    const porcentajeComision = ingreso.porcentajeComision || 100;

    // Acumular facturación total
    metricasPorEmpresa[empresa].facturacionTotal += Number(montoTotal);

    // Acumular comisiones personales (lo que realmente recibes)
    metricasPorEmpresa[empresa].comisionesPersonales += Number(montoComision);

    // Contar operaciones
    metricasPorEmpresa[empresa].cantidadOperaciones += 1;

    if (esComision) {
      metricasPorEmpresa[empresa].cantidadConComision += 1;
    }
  });

  // Calcular porcentaje promedio de comisión por empresa
  Object.keys(metricasPorEmpresa).forEach(empresa => {
    const metrics = metricasPorEmpresa[empresa];
    if (metrics.facturacionTotal > 0) {
      metrics.porcentajeComisionPromedio =
        (metrics.comisionesPersonales / metrics.facturacionTotal) * 100;
    }
  });

  return metricasPorEmpresa;
};

/**
 * Calcula el balance general completo
 */
export const calcularBalanceGeneral = (ingresos, gastos, prioridadesCustom = null) => {
  const totalIngresos = calcularTotalIngresos(ingresos);
  const totalGastos = calcularTotalGastos(gastos);
  const sagrado40 = calcularSagrado40(totalIngresos);
  const disponible60 = calcularDisponible60(totalIngresos);
  const balanceNeto = totalIngresos - totalGastos;
  const disponibleReal = disponible60 - totalGastos;

  const gastosPorCategoria = calcularGastosPorCategoria(gastos);
  const distribucion = calcularDistribucionCascada(totalIngresos, gastosPorCategoria, prioridadesCustom);
  const ingresosPorEmpresa = calcularIngresosPorEmpresa(ingresos);
  const metricasEmpresariales = calcularMetricasEmpresariales(ingresos);

  return {
    totalIngresos,
    totalGastos,
    balanceNeto,
    sagrado40,
    disponible60,
    disponibleReal,
    distribucion,
    ingresosPorEmpresa,
    gastosPorCategoria,
    metricasEmpresariales
  };
};

/**
 * Formatear moneda con conversión automática
 * @param {number} montoUSD - Monto en USD (moneda base)
 * @param {string} displayCurrency - Moneda para mostrar ('USD' o 'ARS')
 * @param {number} exchangeRate - Tasa de cambio USD/ARS
 * @param {string} locale - Locale para formateo
 */
export const formatearMoneda = (montoUSD, displayCurrency = 'USD', exchangeRate = null, locale = 'es-AR') => {
  let montoFinal = montoUSD;

  // Si se quiere mostrar en ARS y hay tasa de cambio, convertir
  if (displayCurrency === 'ARS' && exchangeRate) {
    montoFinal = convertUSDtoARS(montoUSD, exchangeRate);
  }

  // Para USD, mostrar decimales, para ARS no
  const fractionDigits = displayCurrency === 'USD' ? 2 : 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(montoFinal);
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

/**
 * Convertir monto según preferencia de visualización
 */
export const convertirParaMostrar = (montoUSD, displayCurrency, exchangeRate) => {
  if (displayCurrency === 'ARS' && exchangeRate) {
    return convertUSDtoARS(montoUSD, exchangeRate);
  }
  return montoUSD;
};
