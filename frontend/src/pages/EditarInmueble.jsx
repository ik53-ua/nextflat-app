import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';
import { uploadPropertyPhoto, deletePropertyPhoto } from '../services/supabase';

export default function EditarInmueble() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

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
  
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);

  // Cargar inmueble y fotos
  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/inmuebles/${id}`).then(res => res.json()),
      fetch(`${apiUrl}/api/inmuebles/${id}/fotos`).then(res => res.json())
    ])
    .then(([datos, fotosData]) => {
      setFormData({
        direccion: datos.direccion || '',
        municipio: datos.municipio || '',
        precio: datos.precio || '',
        descripcion: datos.descripcion || '',
        numHabitaciones: datos.numHabitaciones || '',
        numBanos: datos.numBanos || '',
        tieneAscensor: datos.tieneAscensor || false,
        admiteMascotas: datos.admiteMascotas || false,
        esCompartido: datos.esCompartido || false
      });
      setFotos(fotosData);
      setCargando(false);
    })
    .catch(err => {
      setError(err.message);
      setCargando(false);
    });
  }, [id, apiUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendo(true);
    try {
      const result = await uploadPropertyPhoto(file);
      if (!result) {
        alert('Error al subir la foto');
        setSubiendo(false);
        return;
      }

      // Agregar foto a la base de datos
      const res = await fetch(`${apiUrl}/api/inmuebles/${id}/fotos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.url })
      });

      if (res.ok) {
        const fotoNueva = await res.json();
        setFotos([...fotos, fotoNueva]);
      }
    } catch (err) {
      console.error('Error subiendo foto:', err);
      alert('Error al subir la foto');
    }
    setSubiendo(false);
    e.target.value = '';
  };

  const handleDeletePhoto = async (fotoId, fotoUrl) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;

    try {
      // Extraer la ruta del archivo de la URL
      const url = new URL(fotoUrl);
      const pathParts = url.pathname.split('/');
      // Corregido también el typo 'inmubles' por 'inmuebles' aquí:
      const filePath = pathParts.slice(pathParts.indexOf('inmuebles') + 1).join('/');

      // Eliminar de Supabase
      await deletePropertyPhoto(filePath);

      // Eliminar de la BD
      const res = await fetch(`${apiUrl}/api/inmuebles/${id}/fotos/${fotoId}`, { method: 'DELETE' });
      if (res.ok) {
        const nuevosFotos = fotos.filter(f => f.id !== fotoId);
        setFotos(nuevosFotos);
      }
    } catch (err) {
      console.error('Error eliminando foto:', err);
      alert('Error al eliminar la foto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await fetch(`${apiUrl}/api/inmuebles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: Number(formData.precio),
          numHabitaciones: Number(formData.numHabitaciones),
          numBanos: Number(formData.numBanos)
        })
      });

      if (!res.ok) throw new Error("Error al guardar los cambios");
      
      // Volver a la lista de inmuebles tras guardar con éxito
      navigate('/mis-inmuebles');
    } catch (err) {
      alert(err.message);
      setGuardando(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative p-4 pb-24 flex justify-center"
      style={{
        background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)',
      }}
    >
      <div className="max-w-3xl w-full relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-white/90 mb-6 hover:text-white transition drop-shadow-sm font-medium"
        >
          <ArrowLeft className="mr-2" size={20} /> Volver
        </button>

        <div className="bg-white rounded-xl shadow-2xl border border-pink-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* SECCIÓN DE FOTOS */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fotos del Inmueble</h3>
              
              {/* Grid de fotos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="relative group">
                    <img 
                      src={foto.url} 
                      alt="Foto inmueble"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(foto.id, foto.url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload de nuevas fotos */}
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:bg-pink-50 transition">
                <div className="flex items-center space-x-2">
                  <Upload size={20} className="text-pink-500" />
                  <span className="text-gray-700 font-medium">
                    {subiendo ? 'Subiendo...' : 'Agregar Fotos'}
                  </span>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  disabled={subiendo}
                  className="hidden"
                  multiple
                />
              </label>
            </div>

            <div className="border-t border-gray-200 pt-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
                <input 
                  type="text" name="direccion" value={formData.direccion} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              {/* Municipio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input 
                  type="text" name="municipio" value={formData.municipio} onChange={handleChange} required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€/mes)</label>
                <input 
                  type="number" name="precio" value={formData.precio} onChange={handleChange} required min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              {/* Habitaciones y Baños */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                <input 
                  type="number" name="numHabitaciones" value={formData.numHabitaciones} onChange={handleChange} required min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <input 
                  type="number" name="numBanos" value={formData.numBanos} onChange={handleChange} required min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Describe los aspectos más destacados del inmueble..."
                ></textarea>
              </div>

              {/* Checkboxes (Características) */}
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
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" name="esCompartido" checked={formData.esCompartido} onChange={handleChange} className="w-5 h-5 text-pink-600 rounded" />
                  <span className="text-gray-700">Se alquila por habitaciones (piso compartido)</span>
                </label>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={guardando}
                className="flex items-center px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 focus:ring-4 focus:ring-pink-200 transition disabled:opacity-50 shadow-md"
              >
                {guardando ? 'Guardando...' : <><Save className="mr-2" size={20} /> Guardar Cambios</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}