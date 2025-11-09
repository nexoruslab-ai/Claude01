import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sincronizar estado del usuario con Firebase
  useEffect(() => {
    console.log('🔵 AuthContext - Iniciando listener de autenticación');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔵 AuthContext - Estado de auth cambió:', currentUser ? currentUser.email : 'No autenticado');
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup al desmontar
    return () => {
      console.log('🔵 AuthContext - Limpiando listener');
      unsubscribe();
    };
  }, []);

  // Función para crear cuenta (signup)
  const signup = async (email, password) => {
    try {
      console.log('🔵 AuthContext - Intentando crear cuenta para:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthContext - Cuenta creada exitosamente:', userCredential.user.email);

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('❌ AuthContext - Error en signup:', error.code, error.message);

      // Mensajes de error más amigables
      let errorMessage = 'Error al crear cuenta';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet.';
          break;
        default:
          errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Función para iniciar sesión (login)
  const login = async (email, password) => {
    try {
      console.log('🔵 AuthContext - Intentando login para:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthContext - Login exitoso:', userCredential.user.email);

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('❌ AuthContext - Error en login:', error.code, error.message);

      // Mensajes de error más amigables
      let errorMessage = 'Error al iniciar sesión';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde.';
          break;
        default:
          errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Función para cerrar sesión (logout)
  const logout = async () => {
    try {
      console.log('🔵 AuthContext - Cerrando sesión');
      await signOut(auth);
      console.log('✅ AuthContext - Sesión cerrada');

      return {
        success: true
      };
    } catch (error) {
      console.error('❌ AuthContext - Error en logout:', error);

      return {
        success: false,
        error: error.message
      };
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
