import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Calendar, FileText, Camera, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { uploadImage } from '../services/supabase';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profesion: '',
    fechaNacimiento: '',
    bio: '',
    fotoPerfil: ''
  });
  
  const [fotoPreview, setFotoPreview] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (!usuario) {
      navigate('/login');
    } else {
      setUsuarioId(usuario.id);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > 500) return; // Límite de 500 caracteres
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoUrl = formData.fotoPerfil;

      if (photoFile) {
        const uploadedUrl = await uploadImage('avatars', photoFile);
      
        if (!uploadedUrl) {
          alert("Error al subir la imagen a la nube");
          setLoading(false);
          return;
        }
      
        finalPhotoUrl = uploadedUrl;
      }

      
      const payload = { ...formData, fotoPerfil: finalPhotoUrl };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('usuarioLogueado', JSON.stringify(updatedUser));
        navigate('/feed'); 
      }
    } catch (error) {
      alert("Error al finalizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = !photoFile || !formData.profesion || !formData.bio;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900">¡Casi listo!</h1>
          <p className="text-slate-500 mt-2 font-medium">Completa tu perfil para empezar a buscar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subida de Foto Obligatoria */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`w-32 h-32 rounded-full border-4 flex items-center justify-center cursor-pointer overflow-hidden transition-all ${fotoPreview ? 'border-emerald-400' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
            >
              {fotoPreview ? (
                <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">Añadir foto</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {!fotoPreview && <p className="text-xs text-[#e8385d] font-bold mt-2">* La foto es obligatoria</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">¿A qué te dedicas?</label>
              <input 
                name="profesion" 
                type="text"
                required
                placeholder="Ej: Estudiante de Máster, Desarrollador..."
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={formData.profesion}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Fecha de nacimiento</label>
              <input 
                name="fechaNacimiento" 
                type="date"
                required
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={formData.fechaNacimiento}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-slate-700">Biografía</label>
                <span className={`text-[10px] font-bold ${formData.bio.length > 450 ? 'text-[#e8385d]' : 'text-slate-400'}`}>
                  {formData.bio.length} / 500
                </span>
              </div>
              <textarea 
                name="bio"
                rows="4"
                required
                placeholder="Cuéntale a los propietarios por qué serías un buen inquilino..."
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none resize-none"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isInvalid || loading}
            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all ${isInvalid || loading ? 'bg-slate-200 cursor-not-allowed' : 'shadow-lg hover:opacity-90'}`}
            style={!(isInvalid || loading) ? { background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' } : {}}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Finalizar perfil <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}