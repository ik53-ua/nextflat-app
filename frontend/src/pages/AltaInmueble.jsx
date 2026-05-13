import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Upload, X, Loader2 } from 'lucide-react';
import { uploadPropertyPhoto } from '../services/supabase';
import { crearInmueble } from '../services/api';

export default function AltaInmueble() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const propietarioId = user ? user.id : null;

  const [formData, setFormData] = useState({
    direccion: '',
    municipio: '',
    precio: '',
    descripcion: '',
    numHabitaciones: '',
    numBanos: '',
    tieneAscensor: false,
    admiteMascotas: false,
    esCompartido: false
  });
  
  const [archivosFotos, setArchivosFotos] = useState([]);
  const [previewsFotos, setPreviewsFotos] = useState([]);
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addArchivos(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addArchivos(files);
  };

  const addArchivos = (files) => {
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setArchivosFotos(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviewsFotos(prev => [...prev, ...newPreviews]);
  };

  const removeFoto = (index) => {
    setArchivosFotos(prev => prev.filter((_, i) => i !== index));
    setPreviewsFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    
    if (!propietarioId) {
      setError("Error de sesión. Vuelve a iniciar sesión.");
      return;
    }
    if (archivosFotos.length === 0) {
      setError("Debes añadir al menos una fotografía del inmueble.");
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        ...formData,
        precio: Number(formData.precio),
        numHabitaciones: Number(formData.numHabitaciones),
        numBanos: Number(formData.numBanos),
        propietario: { id: propietarioId }
      };

      const nuevoInmueble = await crearInmueble(payload);
      const inmuebleId = nuevoInmueble.id;

      for (const archivo of archivosFotos) {
         
         const result = await uploadPropertyPhoto(archivo);
         if (result) {
            
            await fetch(`${apiUrl}/api/inmuebles/${inmuebleId}/fotos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: result.url })
            });
         }
      }

      // PASO C: Feedback Visual y redirección (COS)
      alert("¡Inmueble publicado con éxito!");
      navigate('/mis-inmuebles');

    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al publicar el inmueble. Inténtalo de nuevo.");
      setGuardando(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Acceso denegado</div>;

  return (
    <div 
      className="min-h-screen relative p-4 pb-24 flex justify-center"
      style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)' }}
    >
      <div className="max-w-3xl w-full relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-white/90 mb-6 hover:text-white transition drop-shadow-sm font-medium"
        >
          <ArrowLeft className="mr-2" size={20} /> Volver
        </button>

        <div className="bg-white rounded-xl shadow-2xl border border-pink-100 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Publicar Nuevo Inmueble</h2>
            <p className="text-gray-500 mt-1">Completa los datos para publicar tu anuncio</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium border border-red-200">
                  {error}
               </div>
            )}

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fotografías (Obligatorio)</h3>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-pink-300 rounded-lg bg-pink-50/50 hover:bg-pink-50 transition mb-4 relative"
              >
                <Upload size={32} className="text-pink-400 mb-2" />
                <p className="text-gray-700 font-medium text-center">Arrastra aquí tus fotos o haz clic para subir</p>
                <p className="text-sm text-gray-500 mt-1">Sube imágenes en formato JPG o PNG</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                />
              </div>

              {/* Grid de Previews Locales */}
              {previewsFotos.length > 0 && (
                 <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                   {previewsFotos.map((preview, index) => (
                     <div key={index} className="relative group aspect-square">
                       <img 
                         src={preview} 
                         alt="Preview"
                         className="w-full h-full object-cover rounded-lg border border-gray-200"
                       />
                       <button
                         type="button"
                         onClick={() => removeFoto(index)}
                         className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ))}
                 </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6"></div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€/mes)</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                <input type="number" name="numHabitaciones" value={formData.numHabitaciones} onChange={handleChange} required min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <input type="number" name="numBanos" value={formData.numBanos} onChange={handleChange} required min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Describe los aspectos más destacados del inmueble..."></textarea>
              </div>

              {/* Checkboxes Persistentes (COS) */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
                <h3 className="font-medium text-gray-800 mb-2">Características adicionales</h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="tieneAscensor" checked={formData.tieneAscensor} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">El edificio tiene ascensor</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="admiteMascotas" checked={formData.admiteMascotas} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">Se admiten mascotas</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 bg-pink-50 rounded-lg border border-pink-100">
                  <input type="checkbox" name="esCompartido" checked={formData.esCompartido} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-pink-900 font-medium">Se alquila por habitaciones (piso compartido)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={guardando}
                className="flex items-center px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 focus:ring-4 focus:ring-pink-200 transition disabled:opacity-50 shadow-md"
              >
                {guardando ? (
                  <><Loader2 className="mr-2 animate-spin" size={20} /> Publicando piso...</>
                ) : (
                  <><PlusCircle className="mr-2" size={20} /> Publicar Inmueble</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}