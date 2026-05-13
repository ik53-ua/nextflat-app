import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Briefcase, Calendar, FileText, Camera, CheckCircle2, Loader2, Copy, Users, Star, MessageSquareText } from 'lucide-react';
import { uploadImage } from '../services/supabase';
import VerificacionPerfil from '../components/VerificacionPerfil';
import StarRating from '../components/ui/StarRating';
import ValoracionModal from '../components/ui/ValoracionModal';
import { crearGrupoBusqueda, abandonarGrupoBusqueda, unirseAGrupoBusqueda, getMiembrosGrupo, getValoracionesUsuario, getStatsValoracion, checkYaValorado } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado del formulario original
  const [formData, setFormData] = useState({
    nombre: '',
    profesion: '',
    fechaNacimiento: '',
    bio: ''
  });

  const [usuarioId, setUsuarioId] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Estados para la gestión del grupo
  const [grupoInfo, setGrupoInfo] = useState(null);
  const [loadingGrupo, setLoadingGrupo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [miembrosGrupo, setMiembrosGrupo] = useState([]);

  const fileInputRef = useRef(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');


  const [statsValoracion, setStatsValoracion] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [showValoraciones, setShowValoraciones] = useState(false);
  const [loadingValoraciones, setLoadingValoraciones] = useState(false);
  const [showValoracionModal, setShowValoracionModal] = useState(false);
  const [destinoValoracion, setDestinoValoracion] = useState(null);
  const [yaValorado, setYaValorado] = useState(false);

  const cargarMiembros = async (uid) => {
    try {
      const miembros = await getMiembrosGrupo(uid);
      setMiembrosGrupo(miembros);
    } catch (e) {
      console.error("Error al cargar miembros del grupo");
    }
  };

  const cargarValoraciones = async (uid) => {
    setLoadingValoraciones(true);
    try {
      const [stats, lista] = await Promise.all([
        getStatsValoracion(uid),
        getValoracionesUsuario(uid),
      ]);
      setStatsValoracion(stats);
      setValoraciones(lista);
    } catch (e) {
      console.error('Error al cargar valoraciones');
    } finally {
      setLoadingValoraciones(false);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuarioId(user.id);
      setUserRole(user.rol || '');
      setGrupoInfo(user.grupo || null);

      if (user.grupo) {
        cargarMiembros(user.id);
      }

      setFormData({
        nombre: user.nombre || '',
        profesion: user.profesion || '',
        fechaNacimiento: user.fechaNacimiento || '',
        bio: user.bio || '',
        fotoPerfil: user.fotoPerfil || ''
      });
      setFotoPreview(user.fotoPerfil || null);

      // Cargar stats de valoraciones propias
      cargarValoraciones(user.id);

    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
      setPhotoFile(file);
      setFormData({ ...formData, fotoPerfil: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setPasswordError('');

    try {
      let finalPhotoUrl = formData.fotoPerfil;

      // 1. Gestión de contraseña
      if (showPasswordFields && passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setPasswordError('Las nuevas contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const passResponse = await fetch(`${apiUrl}/api/usuarios/${usuarioId}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
          })
        });

        if (!passResponse.ok) {
          const errorMsg = await passResponse.text();
          setPasswordError(errorMsg);
          setLoading(false);
          return;
        }

        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordFields(false);
      }

      // 2. Subida de imagen a Supabase
      if (photoFile) {
        const uploadedUrl = await uploadImage('avatars', photoFile);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        }
      }

      // 3. Actualización del perfil
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, fotoPerfil: finalPhotoUrl }),
      });

      if (response.ok) {
        const userUpdated = await response.json();
        localStorage.setItem('usuarioLogueado', JSON.stringify(userUpdated));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error en el guardado:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de gestión de grupo
  const handleCrearGrupo = async () => {
    setLoadingGrupo(true);
    try {
      const updatedUser = await crearGrupoBusqueda(usuarioId);
      localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
      setGrupoInfo(updatedUser.grupo);
      cargarMiembros(updatedUser.id);
    } catch (error) {
      alert("Error al crear el grupo: " + (error.response?.data || error.message));
    } finally {
      setLoadingGrupo(false);
    }
  };

  const handleUnirseGrupo = async () => {
    if (!codigoInput.trim()) return;
    setLoadingGrupo(true);
    try {
      const updatedUser = await unirseAGrupoBusqueda(usuarioId, codigoInput.trim());
      localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
      setGrupoInfo(updatedUser.grupo);
      cargarMiembros(updatedUser.id);
      setCodigoInput('');
    } catch (error) {
      alert(error.response?.data || "Error al unirse al grupo. Verifica el código e inténtalo de nuevo.");
    } finally {
      setLoadingGrupo(false);
    }
  };

  const handleAbandonarGrupo = async () => {
    if (!window.confirm("¿Seguro que deseas abandonar este grupo de búsqueda?")) return;
    setLoadingGrupo(true);
    try {
      const updatedUser = await abandonarGrupoBusqueda(usuarioId);
      localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
      setGrupoInfo(null);
      setMiembrosGrupo([]);
    } catch (error) {
      alert("Error al abandonar el grupo.");
    } finally {
      setLoadingGrupo(false);
    }
  };

  const handleCopiarCodigo = () => {
    if (grupoInfo?.codigoInvitacion) {
      navigator.clipboard.writeText(grupoInfo.codigoInvitacion);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };



  const handleAbrirModalValorar = async (destino) => {
    const ya = await checkYaValorado(usuarioId, destino.id);
    setYaValorado(ya);
    setDestinoValoracion(destino);
    setShowValoracionModal(true);
  };



  // Validar si el perfil tiene todos los campos requeridos
  const isPerfilCompleto = Boolean(
    formData.nombre?.trim() &&
    formData.profesion?.trim() &&
    formData.fechaNacimiento &&
    formData.bio?.trim() &&
    formData.fotoPerfil
  );




  // Render de una tarjeta de valoración 
  const ValoracionCard = ({ v }) => (
    <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      {v.autorFoto ? (
        <img src={v.autorFoto} alt={v.autorNombre} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#e8385d] font-black flex-shrink-0">
          {v.autorNombre?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-slate-800 text-sm truncate">{v.autorNombre}</p>
          <StarRating value={v.puntuacion} readonly size={14} />
        </div>
        {v.comentario && (
          <p className="text-sm text-slate-600 leading-snug">{v.comentario}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          {new Date(v.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );




  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden pb-20 relative" style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)' }}>
      {/* Burbujas decorativas de fondo */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

      <div className="px-6 py-8 max-w-lg mx-auto w-full relative z-10 mt-4 mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8">



          {/* ── Sección de valoraciones recibidas (COS #3 y #4) ──────────── */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="font-black text-slate-800">Mis valoraciones</h3>
                </div>
                {/* Estadísticas en vivo (COS #3) */}
                {statsValoracion === null ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                ) : statsValoracion.total > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-slate-800">
                      {statsValoracion.media?.toFixed(1) ?? '—'}
                    </span>
                    <div>
                      <StarRating value={Math.round(statsValoracion.media ?? 0)} readonly size={14} />
                      <p className="text-xs text-slate-400 leading-tight">
                        {statsValoracion.total} reseña{statsValoracion.total !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Sin reseñas aún</p>
                )}

              </div>

              {/* Botón para expandir el listado (COS #4) */}
              {statsValoracion && statsValoracion.total > 0 && (
                <button
                  onClick={() => setShowValoraciones(!showValoraciones)}
                  className="mt-3 w-full text-center text-xs font-bold text-[#e8385d] uppercase tracking-wider hover:underline flex items-center justify-center gap-1"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  {showValoraciones ? 'Ocultar reseñas' : `Ver las ${statsValoracion.total} reseña${statsValoracion.total !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>

            {/* Listado expandible */}
            {showValoraciones && (
              <div className="border-t border-slate-100 p-4 space-y-3 max-h-80 overflow-y-auto">
                {loadingValoraciones ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#e8385d]" />
                  </div>
                ) : valoraciones.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-3">No hay reseñas todavía</p>
                ) : (
                  valoraciones.map((v) => <ValoracionCard key={v.id} v={v} />)
                )}
              </div>
            )}
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}


          {/* Cabecera con Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full text-white shadow-lg transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-800">Mi Perfil</h2>
          </div>

          {/* Notificación de éxito */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold">¡Perfil actualizado correctamente!</span>
            </div>
          )}

          {/* Formulario Original */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo: Nombre */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                <User className="w-4 h-4 text-[#e8385d]" /> Nombre completo
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            {/* Campo: Profesión */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                <Briefcase className="w-4 h-4 text-[#e8385d]" /> Profesión
              </label>
              <input
                name="profesion"
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={formData.profesion}
                onChange={handleChange}
              />
            </div>

            {/* Campo: Fecha de Nacimiento */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                <Calendar className="w-4 h-4 text-[#e8385d]" /> Fecha de nacimiento
              </label>
              <input
                name="fechaNacimiento"
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
            </div>

            {/* Campo: Biografía */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                <FileText className="w-4 h-4 text-[#e8385d]" /> Sobre mí
              </label>
              <textarea
                name="bio"
                rows="3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* SECCIÓN DE SEGURIDAD: Cambio de Password */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-xs font-black text-[#e8385d] uppercase tracking-wider hover:underline"
              >
                {showPasswordFields ? '− Cancelar cambio de contraseña' : '+ Cambiar contraseña'}
              </button>

              {showPasswordFields && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  />
                  {passwordError && (
                    <p className="text-[10px] font-bold text-[#e8385d] px-1 uppercase tracking-tight">
                      {passwordError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
              >
                {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : 'Guardar cambios'}
              </button>
            </div>
          </form>

          {/* Sección: Grupo de Búsqueda (Solo visible para Inquilinos) */}
          {/* Sección: Grupo de Búsqueda (Solo visible para Inquilinos) */}
          {userRole === 'INQUILINO' && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#e8385d]" />
                Buscar en pareja/grupo
              </h3>

              {/* Aviso si el perfil está incompleto */}
              {!isPerfilCompleto && !grupoInfo && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
                  Debes rellenar todos tus datos personales y añadir una foto de perfil para poder crear o unirte a un grupo.
                </div>
              )}

              {!grupoInfo ? (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Crea un código para que tu pareja o amig@ se una a tu búsqueda. Podréis ver los mismos pisos y hacer match en conjunto.
                  </p>
                  <button
                    type="button"
                    onClick={handleCrearGrupo}
                    disabled={loadingGrupo || !isPerfilCompleto}
                    className="w-full px-6 py-3 bg-white border-2 border-[#e8385d] text-[#e8385d] font-bold rounded-xl hover:bg-rose-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                  >
                    {loadingGrupo ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Generar código de invitación'}
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">O ÚNETE A UNO</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: NX-A7F9"
                      value={codigoInput}
                      onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                      disabled={!isPerfilCompleto}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#e8385d] uppercase disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleUnirseGrupo}
                      disabled={loadingGrupo || !codigoInput.trim() || !isPerfilCompleto}
                      className="px-6 py-3 bg-[#e8385d] text-white font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Unirse
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <p className="text-sm text-rose-800 font-medium mb-2">Tu código de invitación activo:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white px-4 py-3 rounded-xl border border-rose-200 font-mono font-bold text-lg text-slate-800 text-center tracking-widest select-all">
                      {grupoInfo.codigoInvitacion}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopiarCodigo}
                      className="p-3 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                      title="Copiar código al portapapeles"
                    >
                      {copySuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>

                  {miembrosGrupo.length > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-rose-100">
                      <p className="text-sm font-semibold text-rose-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Buscando piso junto a: {miembrosGrupo.join(', ')}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAbandonarGrupo}
                    disabled={loadingGrupo}
                    className="mt-4 text-xs font-bold text-slate-500 hover:text-red-500 underline text-center w-full"
                  >
                    Abandonar grupo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verificación de identidad */}
          {usuarioId && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <VerificacionPerfil usuarioId={usuarioId} />
            </div>
          )}

        </div>
      </div>

      {/* Modal de valoración */}
      {showValoracionModal && destinoValoracion && (
        <ValoracionModal
          autorId={usuarioId}
          destino={destinoValoracion}
          onClose={() => setShowValoracionModal(false)}
          onSuccess={() => cargarValoraciones(usuarioId)}
        />
      )}

    </div>
  );
}