import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
        navigate('/');
      } else {
        alert('Credenciales incorrectas. Por favor, revisa tu correo y contraseña.');
      }

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('No se ha podido conectar con el servidor. ¿Está el backend encendido?');
    }
  };

  return (
    <div
      className="h-full overflow-hidden flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative"
      style={{
        background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div className="text-center mb-6 relative z-10">
        <span className="text-white text-3xl font-extrabold tracking-tight drop-shadow-md">
          Next<span style={{ color: 'rgba(255,255,255,0.65)' }}>Flat</span>
        </span>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold transition-colors" style={{ color: '#e8385d' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none transition-colors"
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none transition-colors"
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <a href="#" className="text-xs font-medium transition-colors" style={{ color: '#e8385d' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          © 2025 NextFlat · Encuentra tu próximo hogar
        </p>
      </div>
    </div>
  );
};

export default LoginPage;