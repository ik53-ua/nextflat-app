import React, { useState, useEffect } from "react";
import { Filter, RefreshCcw, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import HoverPropertyCard from "../components/ui/HoverPropertyCard";
import { getFeedForUser, processSwipe, undoLastSwipe, getPublicFeed } from "../services/api";
import { useLocation, useNavigate } from 'react-router-dom';


export default function TenantFeed() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showIncompleteProfileGate, setShowIncompleteProfileGate] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const [municipioFilter, setMunicipioFilter] = useState("");
  const [precioMinFilter, setPrecioMinFilter] = useState(0);
  const [precioMaxFilter, setPrecioMaxFilter] = useState(2000);
  const [numHabitacionesFilter, setNumHabitacionesFilter] = useState(null);
  const [numBanosFilter, setNumBanosFilter] = useState(null);
  const [tieneAscensorFilter, setTieneAscensorFilter] = useState(null);
  const [admiteMascotasFilter, setAdmiteMascotasFilter] = useState(null);
  const [esCompartidoFilter, setEsCompartidoFilter] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({
    municipio: "",
    precioMin: null,
    precioMax: null,
    numHabitaciones: null,
    numBanos: null,
    tieneAscensor: null,
    admiteMascotas: null,
    esCompartido: null,
  });

  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser ? currentUser.id : null;

  // Un perfil se considera completo si tiene foto, profesión y biografía
  const isProfileComplete = currentUser &&
    currentUser.fotoPerfil &&
    currentUser.profesion &&
    currentUser.bio;

  const fetchFeed = async (filtros = appliedFilters) => {
    setLoading(true);
    try {
      let data;
      // Si no hay ID, llamamos al endpoint público; si lo hay, al feed personalizado
      if (!userId) {
        data = await getPublicFeed(filtros);
      } else {
        data = await getFeedForUser(userId, filtros);
      }

      if (Array.isArray(data)) {
        const formattedFlats = data.map((dbFlat) => ({
          id: dbFlat.id,
          title: dbFlat.direccion,
          location: dbFlat.municipio,
          price: dbFlat.precio,
          features: [
            `${dbFlat.numHabitaciones} Hab`,
            `${dbFlat.numBanos} Baños`,
          ],
          images:
            dbFlat.fotos && dbFlat.fotos.length > 0
              ? dbFlat.fotos
              : ["https://via.placeholder.com/800x600?text=Sin+Foto"],
        }));
        setFlats(formattedFlats);
      } else {
        setFlats([]);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFlats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [userId]);

  useEffect(() => {
    if (location.pathname === '/filtros') {
      setShowFilters(true);
    } else {
      setShowFilters(false);
    }
  }, [location]);

  const handleCloseModal = () => {
    navigate('/feed');
  };

  const handleSwipe = async (type, item) => {
    // If not logged in → intercept and show login gate modal
    if (!userId) {
      setShowLoginGate(true);
      return;
    }

    // Si falta información del perfil, bloqueamos la acción y mostramos el aviso
    if (!isProfileComplete) {
      setShowIncompleteProfileGate(true);
      return;
    }

    setFlats((prev) => prev.filter((f) => f.id !== item.id));

    try {
      await processSwipe({
        usuarioOrigenId: userId,
        inmuebleDestinoId: item.id,
        tipoInteraccion: type,
      });
    } catch (error) {
      console.error("Failed to record swipe:", error);
    }
  };

  const handleLike = (item) => handleSwipe("LIKE", item);
  const handleDislike = (item) => handleSwipe("DISLIKE", item);

  const handleRewind = async () => {
    if (!userId) return;

    try {
      const dbFlat = await undoLastSwipe(userId);

      const formattedRestoredFlat = {
        id: dbFlat.id,
        title: dbFlat.direccion,
        location: dbFlat.municipio,
        price: dbFlat.precio,
        features: [
          `${dbFlat.numHabitaciones} Hab`,
          `${dbFlat.numBanos} Baños`,
        ],
        images:
          dbFlat.fotos && dbFlat.fotos.length > 0
            ? dbFlat.fotos
            : ["https://via.placeholder.com/800x600?text=Sin+Foto"],
      };

      // 3. Lo metemos al array para que aparezca en pantalla con su foto y sus etiquetas
      setFlats((prev) => [...prev, formattedRestoredFlat]);
    } catch (error) {
      alert(error.response?.data || "No se puede deshacer esta acción");
    }
  };



  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative pt-6">
      <div className="flex-1 relative flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center text-slate-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-lg font-medium">Buscando pisos recomendados...</p>
          </div>
        ) : flats.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-500 space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 m-4">
            <div className="bg-slate-100 p-5 rounded-full mb-2">
              <Filter className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">¡Has visto todo!</p>
            <p className="text-slate-500">
              Ajusta tus filtros o vuelve más tarde para ver nuevos pisos en tu zona.
            </p>
            <div className="flex gap-3 mt-4 w-full">
              <Button onClick={handleRewind} variant="outline" className="flex-1 text-[#e8385d] border-[#e8385d]/30 hover:bg-[#e8385d]/10">
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer
              </Button>
              <Button onClick={() => fetchFeed()} variant="primary" className="flex-[2]">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Recargar
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {flats.map((flat, index) => {
                if (index > flats.length - 4) {
                  return (
                    <HoverPropertyCard
                      key={flat.id}
                      item={flat}
                      onLike={handleLike}
                      onDislike={handleDislike}
                      onRewind={handleRewind}
                    />
                  );
                }
                return null;
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ═══ Login Gate Modal ═══ */}
      {showLoginGate && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            paddingBottom: "env(safe-area-inset-bottom, 24px)",
          }}
          onClick={() => setShowLoginGate(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: "nfSlideUp 0.38s cubic-bezier(0.34,1.56,0.64,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent gradient strip */}
            <div
              style={{
                height: "5px",
                background: "linear-gradient(90deg, #e8385d 0%, #ff6b6b 100%)",
              }}
            />

            <div className="px-7 pt-6 pb-7 text-center">
              {/* Emoji icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #ffe0e6 0%, #ffd6dc 100%)" }}
              >
                <span style={{ fontSize: "2rem" }}>🏠</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                ¿Te gusta este piso?
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed px-2">
                Inicia sesión para guardar favoritos, contactar con el propietario y mucho más.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/login"
                  id="login-gate-login-btn"
                  className="block w-full py-3.5 rounded-xl font-bold text-white text-center text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #e8385d 0%, #ff6b6b 100%)" }}
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  id="login-gate-register-btn"
                  className="block w-full py-3.5 rounded-xl font-bold text-center text-sm border-2 border-slate-200 text-slate-700 transition-all duration-200 hover:border-[#e8385d] hover:text-[#e8385d] active:scale-95"
                >
                  Crear cuenta gratis
                </a>
              </div>

              <button
                onClick={() => setShowLoginGate(false)}
                className="mt-5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Seguir explorando sin cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Incomplete Profile Gate Modal ═══ */}
      {showIncompleteProfileGate && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            paddingBottom: "env(safe-area-inset-bottom, 24px)",
          }}
          onClick={() => setShowIncompleteProfileGate(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: "nfSlideUp 0.38s cubic-bezier(0.34,1.56,0.64,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: "5px",
                background: "linear-gradient(90deg, #e8385d 0%, #ff6b6b 100%)",
              }}
            />

            <div className="px-7 pt-6 pb-7 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #ffe0e6 0%, #ffd6dc 100%)" }}
              >
                <span style={{ fontSize: "2rem" }}>👤</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                Completa tu perfil
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed px-2">
                Los propietarios necesitan saber un poco sobre ti antes de poder interactuar. ¡Sube una foto y cuéntales a qué te dedicas!
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/perfil"
                  className="block w-full py-3.5 rounded-xl font-bold text-white text-center text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #e8385d 0%, #ff6b6b 100%)" }}
                >
                  Completar perfil ahora
                </a>
              </div>

              <button
                onClick={() => setShowIncompleteProfileGate(false)}
                className="mt-5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Cerrar aviso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Filters Bottom Sheet Modal ═══ */}
      {/* ═══ Filters Bottom Sheet Modal ═══ */}
      {showFilters && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-h-[85vh] bg-slate-50 shadow-2xl p-8 pt-12 pb-12 overflow-y-auto"
            style={{ animation: "nfSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Filtros</h2>
              <button 
                onClick={handleCloseModal} 
                className="w-12 h-12 flex items-center justify-center bg-white text-slate-800 rounded-full hover:bg-slate-200 transition-colors shadow-sm"
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>

            {/* Filtro: Municipio */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Municipio</label>
              <input
                type="text"
                placeholder="Ej: Madrid, Barcelona, Alicante..."
                value={municipioFilter}
                onChange={(e) => setMunicipioFilter(e.target.value)}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#e8385d] focus:outline-none transition-all text-slate-700 font-medium"
              />
            </div>

            {/* Filtro: Precio */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">Presupuesto</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{precioMinFilter}€</span>
                  <span className="text-slate-300">─</span>
                  <span className="text-sm font-black text-[#e8385d] bg-[#e8385d]/10 px-3 py-1 rounded-lg">{precioMaxFilter}€</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Mínimo</p>
                   <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={precioMinFilter}
                    onChange={(e) => setPrecioMinFilter(Number(e.target.value))}
                    className="w-full accent-[#e8385d] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Máximo</p>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={precioMaxFilter}
                    onChange={(e) => setPrecioMaxFilter(Number(e.target.value))}
                    className="w-full accent-[#e8385d] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Habitaciones y Baños */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Habitaciones</label>
                <select 
                  value={numHabitacionesFilter || ""} 
                  onChange={(e) => setNumHabitacionesFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#e8385d] focus:outline-none transition-all font-bold text-slate-700"
                >
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Baños</label>
                <select 
                  value={numBanosFilter || ""} 
                  onChange={(e) => setNumBanosFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#e8385d] focus:outline-none transition-all font-bold text-slate-700"
                >
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            {/* Características */}
            <div className="mb-10">
              <label className="block text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Extras</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Ascensor", state: tieneAscensorFilter, setter: setTieneAscensorFilter, icon: "🛗" },
                  { label: "Mascotas", state: admiteMascotasFilter, setter: setAdmiteMascotasFilter, icon: "🐾" },
                  { label: "Compartido", state: esCompartidoFilter, setter: setEsCompartidoFilter, icon: "👥" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.setter(item.state === null ? true : item.state === true ? false : null)}
                    className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${
                      item.state === true 
                        ? "bg-[#e8385d] border-[#e8385d] text-white shadow-lg shadow-[#e8385d]/20" 
                        : item.state === false
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    {item.state === false && <span className="text-[10px] opacity-60 ml-1">NO</span>}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 px-1 font-medium italic">
                * Pulsa una vez para incluir, dos para excluir, tres para ignorar.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMunicipioFilter("");
                  setPrecioMinFilter(0);
                  setPrecioMaxFilter(2000);
                  setNumHabitacionesFilter(null);
                  setNumBanosFilter(null);
                  setTieneAscensorFilter(null);
                  setAdmiteMascotasFilter(null);
                  setEsCompartidoFilter(null);
                  
                  // No navegamos ni cerramos, solo reseteamos los estados locales de los inputs
                }}
                className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  const newFilters = {
                    municipio: municipioFilter,
                    precioMin: precioMinFilter,
                    precioMax: precioMaxFilter,
                    numHabitaciones: numHabitacionesFilter,
                    numBanos: numBanosFilter,
                    tieneAscensor: tieneAscensorFilter,
                    admiteMascotas: admiteMascotasFilter,
                    esCompartido: esCompartidoFilter,
                  };
                  setAppliedFilters(newFilters);
                  navigate('/feed');
                  fetchFeed(newFilters);
                }}
                className="flex-[2] py-4 rounded-2xl font-black text-white shadow-xl shadow-[#e8385d]/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
                style={{ background: "linear-gradient(135deg, #e8385d 0%, #ff6b6b 100%)" }}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes nfSlideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
