import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { loadAllFromFirestore } from './services/firestoreService.js';
import FinFlowApp from './components/FinFlowApp.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';

/**
 * AppContent - Componente interno que usa useAuth
 * Maneja la lógica de autenticación y carga de datos
 */
const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos desde Firestore cuando el usuario se autentica
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !dataLoaded) {
        console.log('🔵 App - Usuario autenticado, cargando datos desde Firestore');
        setDataLoading(true);

        try {
          const result = await loadAllFromFirestore(user.uid);

          if (result.success) {
            console.log('✅ App - Datos cargados exitosamente desde Firestore');
          } else {
            console.log('ℹ️ App - No hay datos previos o error al cargar:', result.error);
            // Es normal para usuarios nuevos, no mostrar error
          }

          setDataLoaded(true);
        } catch (error) {
          console.error('❌ App - Error inesperado cargando datos:', error);
          setDataLoaded(true); // Continuar de todas formas
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadUserData();
  }, [user, dataLoaded]);

  // Mostrar spinner mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent mb-4"></div>
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar Login o Signup
  if (!user) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  // Usuario autenticado, mostrar spinner mientras carga datos
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent mb-4"></div>
          <p className="text-gray-400 text-sm">Sincronizando datos...</p>
          <p className="text-gray-500 text-xs mt-2">☁️ Cargando desde la nube</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado y datos cargados, mostrar app principal
  return <FinFlowApp />;
};

/**
 * App - Componente raíz que envuelve todo en AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
