import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Briefcase, Calendar, FileText, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadImage } from '../services/supabase';
import VerificacionPerfil from '../components/VerificacionPerfil';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    profesion: '',
    fechaNacimiento: '',
    bio: ''
  });

  const [usuarioId, setUsuarioId] = useState(null);
    
  const fileInputRef = useRef(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuarioId(user.id);
      setFormData({
        nombre: user.nombre || '',
        profesion: user.profesion || '',
        fechaNacimiento: user.fechaNacimiento || '',
        bio: user.bio || '',
        fotoPerfil: user.fotoPerfil || ''
      });
      setFotoPreview(user.fotoPerfil || null);
    } else {
      // Si no hay sesión, al login
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
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
    setPasswordError(''); // Limpiamos errores previos

    try {
      let finalPhotoUrl = formData.fotoPerfil;

      // 1. Gestión de contraseña si los campos están desplegados
      if (showPasswordFields && passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setPasswordError('Las nuevas contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const passResponse = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}/password`, {
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

      // 2. Subida de imagen a Supabase (usando el bucket 'avatars')
      if (photoFile) {
        const uploadedUrl = await uploadImage('avatars', photoFile);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        }
      }

      // 3. Actualización del perfil
      const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
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

  return (
  <div 
    className="flex flex-col h-full overflow-y-auto overflow-x-hidden pb-20 relative"
    style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)' }}
  >
    {/* Burbujas decorativas de fondo */}
    <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

    <div className="px-6 py-8 max-w-lg mx-auto w-full relative z-10 mt-4 mb-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        
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
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
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

        {/* Verificación de identidad */}
        {usuarioId && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <VerificacionPerfil usuarioId={usuarioId} />
          </div>
        )}

      </div>
    </div>
  </div>
);
}