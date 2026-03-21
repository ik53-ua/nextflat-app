import { useState } from 'react';

export default function VerificacionPerfil({ usuarioId, estadoInicial }) {
  const [archivo, setArchivo] = useState(null);
  const [estado, setEstado] = useState(estadoInicial || 'no_verificado'); 
  const [subiendo, setSubiendo] = useState(false);

  // Leemos las variables seguras desde el .env
  const apiUrl = import.meta.env.VITE_API_URL;
  const cloudBaseUrl = import.meta.env.VITE_CLOUD_BASE_URL; // Tu nueva variable

  const solicitarVerificacion = async (e) => {
    e.preventDefault();
    if (!archivo) return alert('Por favor, selecciona un archivo.');

    setSubiendo(true);
    try {
      // Construimos la URL uniendo la base del .env con el nombre del archivo
      const urlFinal = `${cloudBaseUrl}${archivo.name}`;

      // Petición al backend
      const respuesta = await fetch(`${apiUrl}/usuarios/${usuarioId}/solicitar-verificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlFinal })
      });

      if (respuesta.ok) {
        setEstado('en_revision');
      } else {
        alert('Error al contactar con el servidor');
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubiendo(false);
    }
  };

  if (estado === 'verificado') {
    return <div style={{ padding: '15px', background: '#dcfce7', color: '#166534', borderRadius: '6px' }}>✅ Tu identidad está verificada. Tienes el Check Azul.</div>;
  }

  if (estado === 'en_revision') {
    return <div style={{ padding: '15px', background: '#fef08a', color: '#854d0e', borderRadius: '6px' }}>⏳ Tu documento está en revisión por un administrador.</div>;
  }

  return (
    <form onSubmit={solicitarVerificacion} style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <h3>Verificar mi Cuenta</h3>
      <p>Sube tu DNI o matrícula para conseguir el Check Azul y destacar tu perfil.</p>
      
      <input type="file" accept=".pdf, .jpg, .png" onChange={(e) => setArchivo(e.target.files[0])} />
      
      <button type="submit" disabled={!archivo || subiendo} style={{ padding: '10px', cursor: 'pointer' }}>
        {subiendo ? 'Subiendo...' : 'Solicitar Verificación'}
      </button>
    </form>
  );
}