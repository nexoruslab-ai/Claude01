/**
 * Utilidades para manejar el tema (modo claro/oscuro)
 */

// Obtener tema guardado o usar oscuro por defecto
export const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem('theme');
    return theme || 'dark'; // Default: modo oscuro
  } catch (error) {
    return 'dark';
  }
};

// Guardar tema seleccionado
export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// Aplicar tema al documento
export const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Alternar entre temas
export const toggleTheme = (currentTheme) => {
  return currentTheme === 'dark' ? 'light' : 'dark';
};

// Inicializar tema
export const initializeTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
};
