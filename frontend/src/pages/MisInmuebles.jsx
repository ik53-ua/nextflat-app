import { useState, useEffect } from 'react';
import TarjetaInmueble from '../components/TarjetaInmueble';

export default function MisInmuebles() {
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // 1. Recuperamos el usuario que se acaba de loguear del localStorage
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  
  // 2. Usamos su ID real (o null si no hay nadie logueado)
  const propietarioId = user ? user.id : null; 
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Si no hay propietarioId (no está logueado), cortamos aquí para no dar error
    if (!propietarioId) {
      setCargando(false);
      return;
    }

    fetch(`${apiUrl}/api/inmuebles/mis-inmuebles/${propietarioId}`)
      .then(res => res.json())
      .then(datos => {
        setInmuebles(datos);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error cargando inmuebles:", error);
        setCargando(false);
      });
  }, [apiUrl, propietarioId]);

  const handleToggleActivo = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/inmuebles/${id}/estado`, { method: 'PATCH' });
      if (res.ok) {
        setInmuebles(inmuebles.map(piso => piso.id === id ? { ...piso, activo: !piso.activo } : piso));
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este inmueble permanentemente?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/inmuebles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInmuebles(inmuebles.filter(piso => piso.id !== id));
      }
    } catch (error) {
      console.error("Error eliminando inmueble:", error);
    }
  };

  if (cargando) return <div style={{ padding: '20px' }}>Cargando tus propiedades... ⏳</div>;

  // 3. Mensaje por si alguien entra a "Mis Inmuebles" sin haber pasado por el login
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Acceso Denegado 🛑</h2>
        <p>Por favor, inicia sesión para ver tus propiedades.</p>
      </div>
    );
  }

  if (inmuebles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Aún no tienes propiedades 🏠</h2>
        <p>Empieza a rentabilizar tus espacios publicando tu primer inmueble.</p>
        <button style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}>Crear Inmueble</button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative p-6"
      style={{
        background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)',
      }}
    >
      <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {inmuebles.map(piso => (
          <TarjetaInmueble 
            key={piso.id} 
            piso={piso} 
            onToggleActivo={handleToggleActivo} 
            onEliminar={handleEliminar} 
          />
        ))}
      </div>
    </div>
  );
}