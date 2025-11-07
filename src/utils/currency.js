/**
 * Utilidades para manejar la preferencia de moneda de visualización
 */

// Obtener moneda de visualización guardada o usar USD por defecto
export const getStoredDisplayCurrency = () => {
  try {
    const currency = localStorage.getItem('display_currency');
    return currency || 'USD'; // Default: USD
  } catch (error) {
    return 'USD';
  }
};

// Guardar moneda de visualización seleccionada
export const setStoredDisplayCurrency = (currency) => {
  try {
    localStorage.setItem('display_currency', currency);
  } catch (error) {
    console.error('Error saving display currency:', error);
  }
};
