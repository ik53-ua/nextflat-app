import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Briefcase, Calendar, FileText, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadImage } from '../services/supabase';

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

  // Al cargar la página, sacamos los datos del usuario logueado
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

    try {
      let finalPhotoUrl = formData.fotoPerfil;

      // 1. Si el usuario seleccionó una foto nueva, la subimos a la nube
      if (photoFile) {
        const uploadedUrl = await uploadImage('avatars', photoFile);
        
        if (!uploadedUrl) {
          alert("Error al subir la imagen a la nube");
          setLoading(false);
          return;
        }
        
        finalPhotoUrl = uploadedUrl; // Guardamos la URL pública real (https://...)
      }

      // 2. Preparamos el objeto final con la URL buena (la de Supabase o la que ya tenía)
      const payload = { ...formData, fotoPerfil: finalPhotoUrl };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // 3. Enviamos el payload al backend
      const response = await fetch(`${apiUrl}/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Hubo un problema al actualizar el perfil.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Cabecera estilo NextFlat */}
      <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Editar Perfil</h1>
        <div className="w-10"></div> 
      </div>

      {/* Contenedor principal que se había borrado */}
      <div className="px-6 py-6 max-w-lg mx-auto w-full">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            
            {/* Input oculto real */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
            
            {/* Botón visual de la cámara */}
            <button 
              type="button" 
              onClick={handleCameraClick}
              disabled={subiendoFoto}
              className={`absolute bottom-0 right-0 p-2.5 rounded-full text-white shadow-lg transition-transform ${subiendoFoto ? 'animate-spin opacity-50' : 'hover:scale-105'}`}
              style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
            >
              {subiendoFoto ? <Loader2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Toca para cambiar foto</p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold">¡Perfil actualizado correctamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
              <User className="w-4 h-4 text-[#e8385d]" /> Nombre completo
            </label>
            <input
              name="nombre"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none transition-shadow shadow-sm"
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px #e8385d22'}
              onBlur={e => e.target.style.boxShadow = ''}
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Profesión */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
              <Briefcase className="w-4 h-4 text-[#e8385d]" /> Profesión
            </label>
            <input
              name="profesion"
              type="text"
              className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none transition-shadow shadow-sm"
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px #e8385d22'}
              onBlur={e => e.target.style.boxShadow = ''}
              placeholder="Ej. Estudiante, Ingeniera..."
              value={formData.profesion}
              onChange={handleChange}
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 text-[#e8385d]" /> Fecha de nacimiento
            </label>
            <input
              name="fechaNacimiento"
              type="date"
              className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none transition-shadow shadow-sm"
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px #e8385d22'}
              onBlur={e => e.target.style.boxShadow = ''}
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
              <FileText className="w-4 h-4 text-[#e8385d]" /> Sobre mí
            </label>
            <textarea
              name="bio"
              rows="4"
              className="appearance-none block w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none transition-shadow shadow-sm resize-none"
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px #e8385d22'}
              onBlur={e => e.target.style.boxShadow = ''}
              placeholder="Cuéntale a los demás sobre ti..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Botón de Guardar */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-white text-sm transition-all duration-200 shadow-xl ${loading ? 'opacity-70' : 'hover:opacity-90 active:scale-[0.98]'}`}
              style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}