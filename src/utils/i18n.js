import { translations } from '../i18n/translations.js';

// Obtener idioma guardado o usar español por defecto
export const getStoredLanguage = () => {
  try {
    return localStorage.getItem('language') || 'es';
  } catch (error) {
    return 'es';
  }
};

// Guardar idioma seleccionado
export const setStoredLanguage = (language) => {
  try {
    localStorage.setItem('language', language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Obtener traducción
export const getTranslation = (language, path) => {
  const keys = path.split('.');
  let result = translations[language];

  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = result[key];
    } else {
      return path; // Devolver la clave si no se encuentra la traducción
    }
  }

  return result || path;
};

// Hook para usar traducciones (versión simplificada)
export const useTranslation = (language) => {
  const t = (path) => getTranslation(language, path);

  return { t };
};
