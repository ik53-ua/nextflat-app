import { Link } from 'react-router-dom';
import { EyeOff, Eye, Trash2, Edit } from 'lucide-react';

export default function TarjetaInmueble({ piso, onToggleActivo, onEliminar }) {
  return (
    <div className="tarjeta-inmueble" style={{ 
      border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: 'white',
      opacity: piso.activo ? 1 : 0.6,
      transition: 'opacity 0.2s'
    }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={piso.fotoPrincipal || 'https://via.placeholder.com/400x300?text=Sin+Foto'} 
          alt={`Foto de ${piso.direccion}`} 
          style={{ width: '100%', height: '200px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#f3f4f6' }}
        />
        {!piso.activo && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            Oculto
          </div>
        )}
      </div>
      
      <h3 style={{ margin: '10px 0 5px 0' }}>{piso.direccion}</h3>
      <p style={{ margin: '0 0 10px 0', color: '#666' }}>📍 {piso.municipio}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{piso.precio} €/mes</span>
        <span style={{ background: piso.esCompartido ? '#e0f2fe' : '#fef08a', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
          {piso.esCompartido ? 'Habitación' : 'Piso Completo'}
        </span>
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
         <Link 
           to={`/mis-inmuebles/editar/${piso.id}`} 
           style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: '#f8fafc', color: '#334155', textDecoration: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}
         >
           <Edit size={16} /> Editar
         </Link>
         <button 
           onClick={() => onToggleActivo(piso.id)}
           style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: piso.activo ? '#fef3c7' : '#dcfce7', color: piso.activo ? '#b45309' : '#166534', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
         >
           {piso.activo ? <><EyeOff size={16} /> Ocultar</> : <><Eye size={16} /> Mostrar</>}
         </button>
         <button 
           onClick={() => onEliminar(piso.id)}
           style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
           title="Eliminar permanentemente"
         >
           <Trash2 size={16} />
         </button>
      </div>
    </div>
  );
}