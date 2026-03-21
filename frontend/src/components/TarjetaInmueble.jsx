export default function TarjetaInmueble({ piso }) {
  return (
    <div className="tarjeta-inmueble" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: 'white' }}>
      <img 
        src={piso.fotoPrincipal} 
        alt={`Foto de ${piso.direccion}`} 
        style={{ width: '100%', height: '200px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#f3f4f6' }}
      />
      
      <h3 style={{ margin: '10px 0 5px 0' }}>{piso.direccion}</h3>
      <p style={{ margin: '0 0 10px 0', color: '#666' }}>📍 {piso.municipio}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{piso.precio} €/mes</span>
        <span style={{ background: piso.esCompartido ? '#e0f2fe' : '#fef08a', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
          {piso.esCompartido ? 'Habitación' : 'Piso Completo'}
        </span>
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
         <button style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>Editar</button>
         <button style={{ flex: 1, padding: '8px', background: piso.activo ? '#ef4444' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           {piso.activo ? 'Desactivar' : 'Activar'}
         </button>
      </div>
    </div>
  );
}