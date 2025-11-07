// API de tipo de cambio
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const DEFAULT_RATE_ARS = 1427.99; // Tasa por defecto si la API falla
const STORAGE_KEY = 'exchange_rate_data';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Obtener datos de tipo de cambio guardados
 */
export const getStoredExchangeRate = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading exchange rate from storage:', error);
  }
  return null;
};

/**
 * Guardar datos de tipo de cambio
 */
export const saveExchangeRate = (rateData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rateData));
  } catch (error) {
    console.error('Error saving exchange rate to storage:', error);
  }
};

/**
 * Verificar si la tasa de cambio necesita actualización
 */
export const needsUpdate = (storedData) => {
  if (!storedData || !storedData.timestamp) {
    return true;
  }

  const now = Date.now();
  const timeSinceUpdate = now - storedData.timestamp;

  return timeSinceUpdate >= UPDATE_INTERVAL;
};

/**
 * Obtener tasa de cambio de la API
 */
export const fetchExchangeRate = async () => {
  try {
    const response = await fetch(EXCHANGE_RATE_API);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();

    if (data && data.rates && data.rates.ARS) {
      const rateData = {
        USD_ARS: data.rates.ARS,
        timestamp: Date.now(),
        success: true
      };

      saveExchangeRate(rateData);
      return rateData;
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);

    // Usar tasa por defecto si falla
    const rateData = {
      USD_ARS: DEFAULT_RATE_ARS,
      timestamp: Date.now(),
      success: false,
      error: error.message
    };

    return rateData;
  }
};

/**
 * Obtener tasa de cambio actual (desde storage o API)
 */
export const getCurrentExchangeRate = async () => {
  const storedData = getStoredExchangeRate();

  // Si no hay datos guardados o necesitan actualización, obtener de API
  if (needsUpdate(storedData)) {
    return await fetchExchangeRate();
  }

  return storedData;
};

/**
 * Convertir ARS a USD
 */
export const convertARStoUSD = (amountARS, rate) => {
  return amountARS / rate;
};

/**
 * Convertir USD a ARS
 */
export const convertUSDtoARS = (amountUSD, rate) => {
  return amountUSD * rate;
};

/**
 * Verificar si la tasa está desactualizada (más de 24 horas)
 */
export const isExchangeRateOutdated = (timestamp) => {
  if (!timestamp) return true;

  const now = Date.now();
  const timeSinceUpdate = now - timestamp;

  return timeSinceUpdate >= UPDATE_INTERVAL;
};

/**
 * Formatear timestamp para mostrar
 */
export const formatUpdateTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Procesar transacción y agregar conversión de moneda
 */
export const processTransactionWithCurrency = (transaction, exchangeRate) => {
  const rate = exchangeRate.USD_ARS;

  // Si la transacción es en ARS, convertir a USD
  if (transaction.moneda === 'ARS' || transaction.monedaOriginal === 'ARS') {
    return {
      ...transaction,
      monedaOriginal: transaction.moneda || transaction.monedaOriginal,
      montoOriginal: transaction.monto || transaction.montoOriginal,
      montoUSD: convertARStoUSD(transaction.monto || transaction.montoOriginal, rate),
      tasaCambio: rate
    };
  }

  // Si la transacción es en USD
  return {
    ...transaction,
    monedaOriginal: 'USD',
    montoOriginal: transaction.monto,
    montoUSD: transaction.monto,
    tasaCambio: rate
  };
};
