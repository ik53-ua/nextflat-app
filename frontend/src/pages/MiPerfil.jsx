import VerificacionPerfil from '../components/VerificacionPerfil';

export default function MiPerfil() {
  const usuarioId = 1; // Por implementar

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Mi Perfil</h2>
      <p style={{ color: '#555' }}>Aquí irían los datos personales del usuario...</p>
      
      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
      
      <VerificacionPerfil usuarioId={usuarioId} estadoInicial="no_verificado" />
      
    </div>
  );
}