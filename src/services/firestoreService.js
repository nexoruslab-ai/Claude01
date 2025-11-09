import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

/**
 * SERVICIO DE FIRESTORE
 *
 * Este servicio maneja la sincronización de datos entre localStorage y Firestore.
 * Estructura de datos en Firestore:
 *
 * users/
 *   {userId}/
 *     data/
 *       ingresos: { data: [...] }
 *       gastos: { data: [...] }
 *       prioridades: { data: [...] }
 *       config: { language, displayCurrency, theme, etc }
 */

/**
 * Sincronizar datos específicos a Firestore
 * @param {string} userId - ID del usuario autenticado
 * @param {string} dataType - Tipo de datos: 'ingresos', 'gastos', 'prioridades', 'config'
 * @param {any} data - Datos a guardar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncToFirestore = async (userId, dataType, data) => {
  if (!userId) {
    console.error('❌ Firestore - No userId provided');
    return { success: false, error: 'No user ID' };
  }

  try {
    console.log(`🔵 Firestore - Guardando ${dataType} para user:`, userId);

    const docRef = doc(db, 'users', userId, 'data', dataType);

    await setDoc(docRef, {
      data: data,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Firestore - ${dataType} guardado exitosamente`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Firestore - Error guardando ${dataType}:`, error);

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cargar datos específicos desde Firestore
 * @param {string} userId - ID del usuario autenticado
 * @param {string} dataType - Tipo de datos a cargar
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const loadFromFirestore = async (userId, dataType) => {
  if (!userId) {
    console.error('❌ Firestore - No userId provided');
    return { success: false, error: 'No user ID' };
  }

  try {
    console.log(`🔵 Firestore - Cargando ${dataType} para user:`, userId);

    const docRef = doc(db, 'users', userId, 'data', dataType);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      console.log(`✅ Firestore - ${dataType} cargado exitosamente`);

      return {
        success: true,
        data: firestoreData.data
      };
    } else {
      console.log(`ℹ️ Firestore - No hay ${dataType} guardado para este usuario`);

      return {
        success: true,
        data: null // No hay datos, es válido para usuarios nuevos
      };
    }
  } catch (error) {
    console.error(`❌ Firestore - Error cargando ${dataType}:`, error);

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sincronizar todos los datos de localStorage a Firestore
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncAllToFirestore = async (userId) => {
  if (!userId) {
    return { success: false, error: 'No user ID' };
  }

  try {
    console.log('🔵 Firestore - Sincronizando TODOS los datos a Firestore');

    // Obtener datos de localStorage
    const ingresos = JSON.parse(localStorage.getItem('finflow_ingresos') || '[]');
    const gastos = JSON.parse(localStorage.getItem('finflow_gastos') || '[]');
    const prioridades = JSON.parse(localStorage.getItem('finflow_prioridades_custom') || 'null');

    const config = {
      language: localStorage.getItem('language') || 'es',
      displayCurrency: localStorage.getItem('displayCurrency') || 'USD',
      theme: localStorage.getItem('theme') || 'dark'
    };

    // Sincronizar cada tipo de datos
    await syncToFirestore(userId, 'ingresos', ingresos);
    await syncToFirestore(userId, 'gastos', gastos);

    if (prioridades) {
      await syncToFirestore(userId, 'prioridades', prioridades);
    }

    await syncToFirestore(userId, 'config', config);

    console.log('✅ Firestore - Sincronización completa exitosa');

    return { success: true };
  } catch (error) {
    console.error('❌ Firestore - Error en syncAllToFirestore:', error);

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cargar todos los datos desde Firestore a localStorage
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const loadAllFromFirestore = async (userId) => {
  if (!userId) {
    return { success: false, error: 'No user ID' };
  }

  try {
    console.log('🔵 Firestore - Cargando TODOS los datos desde Firestore');

    // Cargar cada tipo de datos
    const ingresosResult = await loadFromFirestore(userId, 'ingresos');
    const gastosResult = await loadFromFirestore(userId, 'gastos');
    const prioridadesResult = await loadFromFirestore(userId, 'prioridades');
    const configResult = await loadFromFirestore(userId, 'config');

    // Guardar en localStorage si existen
    if (ingresosResult.success && ingresosResult.data) {
      localStorage.setItem('finflow_ingresos', JSON.stringify(ingresosResult.data));
      console.log('✅ Ingresos sincronizados a localStorage');
    }

    if (gastosResult.success && gastosResult.data) {
      localStorage.setItem('finflow_gastos', JSON.stringify(gastosResult.data));
      console.log('✅ Gastos sincronizados a localStorage');
    }

    if (prioridadesResult.success && prioridadesResult.data) {
      localStorage.setItem('finflow_prioridades_custom', JSON.stringify(prioridadesResult.data));
      console.log('✅ Prioridades sincronizadas a localStorage');
    }

    if (configResult.success && configResult.data) {
      const config = configResult.data;
      localStorage.setItem('language', config.language || 'es');
      localStorage.setItem('displayCurrency', config.displayCurrency || 'USD');
      localStorage.setItem('theme', config.theme || 'dark');
      console.log('✅ Config sincronizada a localStorage');
    }

    console.log('✅ Firestore - Carga completa exitosa');

    return { success: true };
  } catch (error) {
    console.error('❌ Firestore - Error en loadAllFromFirestore:', error);

    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  syncToFirestore,
  loadFromFirestore,
  syncAllToFirestore,
  loadAllFromFirestore
};
