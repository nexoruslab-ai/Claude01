import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * CONFIGURACIÓN DE FIREBASE
 *
 * Para configurar Firebase correctamente:
 *
 * 1. Crear proyecto en Firebase Console (https://console.firebase.google.com/)
 * 2. Habilitar Authentication con Email/Password:
 *    - Ir a Authentication > Sign-in method
 *    - Habilitar Email/Password
 *
 * 3. Crear Firestore Database:
 *    - Ir a Firestore Database
 *    - Crear base de datos en modo producción
 *    - Configurar reglas de seguridad (ver abajo)
 *
 * 4. Obtener credenciales:
 *    - Ir a Project Settings > General
 *    - En "Your apps" agregar una Web app
 *    - Copiar las credenciales del firebaseConfig
 *
 * 5. Crear archivo .env en la raíz del proyecto con:
 *    REACT_APP_FIREBASE_API_KEY=tu_api_key
 *    REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
 *    REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
 *    REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
 *    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
 *    REACT_APP_FIREBASE_APP_ID=tu_app_id
 *
 * 6. REGLAS DE SEGURIDAD RECOMENDADAS para Firestore:
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        // Usuarios solo pueden leer/escribir sus propios datos
 *        match /users/{userId}/{document=**} {
 *          allow read, write: if request.auth != null && request.auth.uid == userId;
 *        }
 *      }
 *    }
 */

// Configuración de Firebase usando variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  console.warn('⚠️  Asegúrate de configurar las variables de entorno en .env');
}

export { auth, db };
export default app;
