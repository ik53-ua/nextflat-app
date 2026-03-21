import { useState, useEffect } from 'react';
import TarjetaInmueble from '../components/TarjetaInmueble';

export default function MisInmuebles() {
  const [inmuebles, setInmuebles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Por implementar
  const propietarioId = 35; 
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/inmuebles/mis-inmuebles/${propietarioId}`)
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

  if (cargando) return <div style={{ padding: '20px' }}>Cargando tus propiedades... ⏳</div>;

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
    <div style={{ padding: '20px' }}>
      <h2>Mis Inmuebles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {inmuebles.map(piso => (
          <TarjetaInmueble key={piso.id} piso={piso} />
        ))}
      </div>
    </div>
  );
}