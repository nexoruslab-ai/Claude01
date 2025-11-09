import { PRIORIDADES as PRIORIDADES_DEFAULT } from '../data/constants.js';

const STORAGE_KEY = 'finflow_prioridades_custom';

/**
 * Cargar prioridades desde localStorage o usar las default
 */
export const loadPriorities = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading priorities:', error);
  }
  return PRIORIDADES_DEFAULT;
};

/**
 * Guardar prioridades en localStorage
 */
export const savePriorities = (priorities) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priorities));
    return true;
  } catch (error) {
    console.error('Error saving priorities:', error);
    return false;
  }
};

/**
 * Agregar una nueva categoría a una prioridad específica
 */
export const addCategory = (priorities, prioridadNivel, nuevaCategoria) => {
  // Encontrar el último numero usado
  const maxNumero = Math.max(...priorities.map(p => p.numero));

  // Obtener info de la prioridad
  const prioridadInfo = priorities.find(p => p.prioridad === prioridadNivel && !p.esSagrado);

  if (!prioridadInfo) {
    throw new Error('Prioridad no encontrada');
  }

  const nuevaPrioridad = {
    numero: maxNumero + 1,
    categoria: nuevaCategoria.nombre,
    meta: nuevaCategoria.meta || 0,
    prioridad: prioridadNivel,
    color: prioridadInfo.color,
    colorBg: prioridadInfo.colorBg,
    nivelNombre: prioridadInfo.nivelNombre,
    emoji: nuevaCategoria.emoji || '',
    nombreEn: nuevaCategoria.nombreEn || nuevaCategoria.nombre
  };

  return [...priorities, nuevaPrioridad];
};

/**
 * Actualizar una categoría existente
 */
export const updateCategory = (priorities, numero, cambios) => {
  return priorities.map(p => {
    if (p.numero === numero) {
      return { ...p, ...cambios };
    }
    return p;
  });
};

/**
 * Eliminar una categoría
 */
export const deleteCategory = (priorities, numero) => {
  // No permitir eliminar el Sagrado 40%
  const categoria = priorities.find(p => p.numero === numero);
  if (categoria && categoria.esSagrado) {
    throw new Error('No se puede eliminar el Sagrado 40%');
  }

  return priorities.filter(p => p.numero !== numero);
};

/**
 * Agregar un nuevo nivel de prioridad
 */
export const addPriorityLevel = (priorities, nuevoPrioridad) => {
  const maxPrioridad = Math.max(...priorities.map(p => p.prioridad));
  const nuevoPrioridadNumero = maxPrioridad + 1;

  // Crear una categoría placeholder para el nuevo nivel
  const maxNumero = Math.max(...priorities.map(p => p.numero));

  const nuevaCategoria = {
    numero: maxNumero + 1,
    categoria: `Placeholder ${nuevoPrioridad.nombre}`,
    meta: 0,
    prioridad: nuevoPrioridadNumero,
    color: nuevoPrioridad.color || '#6b7280',
    colorBg: nuevoPrioridad.colorBg || '#f3f4f6',
    nivelNombre: nuevoPrioridad.nombre,
    emoji: nuevoPrioridad.emoji || ''
  };

  return [...priorities, nuevaCategoria];
};

/**
 * Actualizar info de un nivel de prioridad (color, nombre, etc.)
 */
export const updatePriorityLevel = (priorities, prioridadNivel, cambios) => {
  return priorities.map(p => {
    if (p.prioridad === prioridadNivel && !p.esSagrado) {
      return {
        ...p,
        color: cambios.color || p.color,
        colorBg: cambios.colorBg || p.colorBg,
        nivelNombre: cambios.nombre || p.nivelNombre,
        emoji: cambios.emoji !== undefined ? cambios.emoji : p.emoji
      };
    }
    return p;
  });
};

/**
 * Eliminar un nivel de prioridad completo
 */
export const deletePriorityLevel = (priorities, prioridadNivel) => {
  // No permitir eliminar prioridad 1 (tiene el Sagrado 40%)
  if (prioridadNivel === 1) {
    throw new Error('No se puede eliminar la Prioridad 01 (contiene el Sagrado 40%)');
  }

  // Eliminar todas las categorías de ese nivel
  return priorities.filter(p => p.prioridad !== prioridadNivel);
};

/**
 * Resetear prioridades a los valores por defecto
 */
export const resetToDefault = () => {
  localStorage.removeItem(STORAGE_KEY);
  return PRIORIDADES_DEFAULT;
};

/**
 * Agrupar prioridades por nivel
 */
export const groupByLevel = (priorities) => {
  const grouped = {};

  priorities.forEach(p => {
    if (!p.esSagrado) {
      if (!grouped[p.prioridad]) {
        grouped[p.prioridad] = {
          nivel: p.prioridad,
          nombre: p.nivelNombre,
          color: p.color,
          colorBg: p.colorBg,
          emoji: p.emoji || '',
          categorias: []
        };
      }
      grouped[p.prioridad].categorias.push(p);
    }
  });

  return grouped;
};

/**
 * Validar que no haya nombres duplicados en la misma prioridad
 */
export const validateNoDuplicates = (priorities, categoria, prioridadNivel, excludeNumero = null) => {
  const categoriasEnNivel = priorities.filter(
    p => p.prioridad === prioridadNivel &&
         !p.esSagrado &&
         p.numero !== excludeNumero
  );

  return !categoriasEnNivel.some(
    p => p.categoria.toLowerCase() === categoria.toLowerCase()
  );
};

/**
 * Paletas de colores predefinidas
 */
export const COLOR_PALETTES = {
  rojo: { color: '#dc2626', colorBg: '#fee2e2', nombre: 'Rojo' },
  naranja: { color: '#ea580c', colorBg: '#ffedd5', nombre: 'Naranja' },
  amarillo: { color: '#ca8a04', colorBg: '#fef9c3', nombre: 'Amarillo' },
  verde: { color: '#16a34a', colorBg: '#dcfce7', nombre: 'Verde' },
  azul: { color: '#2563eb', colorBg: '#dbeafe', nombre: 'Azul' },
  indigo: { color: '#4f46e5', colorBg: '#e0e7ff', nombre: 'Índigo' },
  purpura: { color: '#9333ea', colorBg: '#f3e8ff', nombre: 'Púrpura' },
  rosa: { color: '#db2777', colorBg: '#fce7f3', nombre: 'Rosa' },
  gris: { color: '#6b7280', colorBg: '#f3f4f6', nombre: 'Gris' },
  oro: { color: '#d4af37', colorBg: '#fef3c7', nombre: 'Oro' }
};

/**
 * Emojis sugeridos para categorías
 */
export const EMOJI_SUGGESTIONS = {
  // Finanzas
  tarjeta: '💳',
  dinero: '💰',
  banco: '🏦',
  factura: '🧾',

  // Comida y bebida
  comida: '🍽️',
  restaurante: '🍴',
  cafe: '☕',
  pizza: '🍕',

  // Ejercicio y salud
  gym: '🏋️',
  yoga: '🧘',
  correr: '🏃',
  bici: '🚴',
  salud: '⚕️',

  // Viajes y transporte
  avion: '✈️',
  auto: '🚗',
  mapa: '🗺️',
  maleta: '🧳',

  // Hogar
  casa: '🏠',
  llave: '🔑',
  herramienta: '🔧',

  // Entretenimiento
  musica: '🎵',
  cine: '🎬',
  libro: '📚',
  juego: '🎮',

  // Trabajo y educación
  laptop: '💻',
  estudio: '📖',
  certificado: '🎓',
  cohete: '🚀',

  // Familia y regalos
  regalo: '🎁',
  corazon: '❤️',
  familia: '👨‍👩‍👧‍👦',
  bebe: '👶',

  // Inversiones
  grafico: '📈',
  objetivo: '🎯',
  estrella: '⭐',
  diamante: '💎'
};
