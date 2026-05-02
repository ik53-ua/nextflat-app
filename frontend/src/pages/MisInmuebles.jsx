import { useState, useEffect } from 'react';
import TarjetaInmueble from '../components/TarjetaInmueble';
// Asegúrate de que la ruta coincida con donde guardaste el componente
import CandidatoCard from '../components/CandidatoCard/CandidatoCard'; 

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
      
      {/* 1. TUS INMUEBLES REALES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {inmuebles.map(piso => (
          <TarjetaInmueble key={piso.id} piso={piso} />
        ))}
      </div>

      {/* 2. LA PRUEBA DEL SPRINT 2 (US-014) */}
      <div style={{ marginTop: '60px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '15px', border: '1px dashed #ccc' }}>
        <h3 style={{ textAlign: 'center', color: '#374151', marginBottom: '20px' }}>
          👀 Vista Previa Sprint 2: Evaluación de Candidatos (US-014)
        </h3>
        
        {/* Aquí llamamos al componente y le inyectamos los datos de prueba */}
        <CandidatoCard 
          candidatos={[
            { 
              id: 101, 
              nombre: "Carlos Inquilino", 
              edad: 27, 
              profesion: "Arquitecto", 
              bio: "Buscamos un piso luminoso para entrar en junio.", 
              foto_perfil: "https://i.pravatar.cc/150?img=12" 
            },
            { 
              id: 102, 
              nombre: "Lucía Pareja", 
              edad: 25, 
              profesion: "Diseñadora", 
              bio: "Somos una pareja tranquila y sin mascotas.", 
              foto_perfil: "https://i.pravatar.cc/150?img=32" 
            }
          ]} 
          onLike={() => alert("¡Has aprobado a este grupo de inquilinos! 💚")}
          onDislike={() => alert("Has descartado a este grupo ❌")}
        />
      </div>

    </div>
  );
}