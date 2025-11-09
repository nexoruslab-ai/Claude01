import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Login = ({ onSwitchToSignup }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('✅ Login - Inicio de sesión exitoso');
        // El AuthContext ya maneja el estado del usuario
        // App.jsx detectará el cambio y cargará los datos
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('❌ Login - Error inesperado:', err);
      setError('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de login con glassmorphism */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-premium p-8 shadow-elevation-3 border border-white/10">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient-gold mb-2">FinFlow</h1>
            <p className="text-gray-400 text-sm">Panel de Control Financiero</p>
          </div>

          {/* Título de la sección */}
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-gold text-black font-semibold rounded-button hover:brightness-110 transition-all shadow-elevation-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divisor */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-sm text-gray-500">o</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Link a signup */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-gold hover:text-yellow-300 font-semibold transition-colors"
                disabled={loading}
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 text-center text-gray-500 text-xs">
          <p>🔒 Tus datos están protegidos con Firebase Authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
