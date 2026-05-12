import { Link } from 'react-router-dom';
import { EyeOff, Eye, Trash2, Edit, UserCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { delegarInmueble, quitarGestorInmueble } from '../services/api';

export default function TarjetaInmueble({ piso, onToggleActivo, onEliminar }) {
  const [emailGestor, setEmailGestor] = useState('');
  const [gestoresActuales, setGestoresActuales] = useState(piso.gestores || []);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleDelegar = async () => {
    if (!emailGestor) return;
    try {
      const res = await delegarInmueble(piso.id, emailGestor);
      setGestoresActuales([...gestoresActuales, { id: res.id, nombre: res.nombre }]);
      setMensaje({ texto: res.mensaje, tipo: 'success' });
      setEmailGestor('');
    } catch (error) {
      setMensaje({ texto: error.response?.data || 'Error al delegar.', tipo: 'error' });
    }
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const handleQuitarGestor = async (gestorId) => {
    try {
      await quitarGestorInmueble(piso.id, gestorId);
      setGestoresActuales(gestoresActuales.filter(g => g.id !== gestorId));
    } catch (error) {
      console.error("Error al quitar gestor", error);
    }
  };

  return (
    <div className="tarjeta-inmueble" style={{
      border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: 'white',
      opacity: piso.activo ? 1 : 0.6, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ position: 'relative' }}>
        <img
          src={piso.fotoPrincipal || 'https://via.placeholder.com/400x300?text=Sin+Foto'}
          alt={`Foto de ${piso.direccion}`}
          style={{ width: '100%', height: '200px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#f3f4f6' }}
        />
      </div>

      <h3 style={{ margin: '10px 0 5px 0' }}>{piso.direccion}</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <span style={{ fontWeight: 'bold' }}>{piso.precio} €/mes</span>
      </div>

      {/* SECCIÓN MÚLTIPLES GESTORES */}
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px dashed #cbd5e1' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <UserCheck size={16} /> Gestores del piso
        </div>

        {/* Lista de gestores con botón de borrar */}
        {gestoresActuales.map(gestor => (
          <div key={gestor.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#e0f2fe', padding: '5px 8px', borderRadius: '4px', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.85rem', color: '#0369a1' }}>{gestor.nombre}</span>
            <XCircle size={16} color="#0284c7" style={{ cursor: 'pointer' }} onClick={() => handleQuitarGestor(gestor.id)} />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <input
            type="email"
            placeholder="Email..."
            value={emailGestor}
            onChange={(e) => setEmailGestor(e.target.value)}
            style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
          />
          <button
            onClick={handleDelegar}
            style={{ padding: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Añadir
          </button>
        </div>

        {mensaje.texto && (
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: mensaje.tipo === 'error' ? 'red' : 'green' }}>
            {mensaje.texto}
          </p>
        )}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
        <button onClick={() => onToggleActivo(piso.id)} style={{ flex: 1, padding: '8px' }}>
          {piso.activo ? 'Ocultar' : 'Mostrar'}
        </button>
        <button onClick={() => onEliminar(piso.id)} style={{ background: '#fee2e2', color: 'red', padding: '8px' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}