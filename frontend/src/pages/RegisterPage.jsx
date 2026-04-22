import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'INQUILINO',
    profesion: '',
    fechaNacimiento: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/usuarios/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          fechaNacimiento: formData.fechaNacimiento,
          profesion: formData.profesion
        })
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('usuarioLogueado', JSON.stringify(userData));
        // Aquí usamos la navegación correcta
        navigate('/onboarding');
      } else {
        // Evitamos el error del JSON cuando el servidor falla
        alert('Error en el registro. Es posible que el email ya esté en uso.');
      }

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      alert('No se ha podido conectar con el servidor.');
    }
  };

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 relative"
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
      <div style={{
        position: 'absolute', top: '40%', left: '-40px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />

      {/* Logo mark */}
      <div className="text-center mb-6 relative z-10">
        <span className="text-white text-3xl font-extrabold tracking-tight drop-shadow-md">
          Next<span style={{ color: 'rgba(255,255,255,0.65)' }}>Flat</span>
        </span>
      </div>

      <div className="max-w-lg w-full mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Crear cuenta
            </h2>
            <p className="text-gray-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold transition-colors" style={{ color: '#e8385d' }}>
                Inicia sesión
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#e8385d' }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none transition-colors"
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Rol — solo Inquilino o Propietario */}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                Soy...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'INQUILINO', label: '🏠 Inquilino', desc: 'Busco piso' },
                  { value: 'PROPIETARIO', label: '🔑 Propietario', desc: 'Alquilo mi piso' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rol: value })}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all duration-200"
                    style={{
                      borderColor: formData.rol === value ? '#e8385d' : '#e5e7eb',
                      background: formData.rol === value ? '#fff1f3' : 'white',
                      color: formData.rol === value ? '#e8385d' : '#374151',
                    }}
                  >
                    <span className="text-lg mb-0.5">{label.split(' ')[0]}</span>
                    <span className="font-bold">{label.split(' ')[1]}</span>
                    <span className="text-xs font-normal mt-0.5" style={{ color: formData.rol === value ? '#e8385d99' : '#9ca3af' }}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
              {/* Hidden select to keep form data aligned */}
              <input type="hidden" name="rol" value={formData.rol} />
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                required
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none transition-colors"
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
            </div>

            {/* Profesión */}
            <div>
              <label htmlFor="profesion" className="block text-sm font-medium text-gray-700 mb-1">
                Profesión <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="profesion"
                name="profesion"
                type="text"
                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none transition-colors"
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #e8385d55'}
                onBlur={e => e.target.style.boxShadow = ''}
                placeholder="Tu profesión"
                value={formData.profesion}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
              >
                Crear cuenta
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-white/60 text-xs mt-6 pb-4">
          Al registrarte aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;