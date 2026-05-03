import React, { useState, useEffect } from "react";
import { Filter, RefreshCcw, Loader2, RotateCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import HoverPropertyCard from "../components/ui/HoverPropertyCard";
import { getFeedForUser, processSwipe, undoLastSwipe } from "../services/api";

// Dummy data for initial dev / fallback (shown when user is not logged in)
const DUMMY_FLATS = [
  {
    id: 1,
    title: "Loft Moderno Centro",
    location: "Madrid Centro",
    price: 950,
    features: ["1 Hab", "Luminoso", "Mascotas OK"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    title: "Estudio Acogedor",
    location: "Malasaña",
    price: 780,
    features: ["Estudio", "Amueblado", "Ascensor"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    title: "Piso Compartido",
    location: "Chamberí",
    price: 450,
    features: ["Habitación Privada", "Gastos Incluidos"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    title: "Ático con Terraza",
    location: "Retiro",
    price: 1200,
    features: ["2 Habs", "Vistas", "Lujo"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&auto=format&fit=crop",
    ],
  },
];

export default function TenantFeed() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [showIncompleteProfileGate, setShowIncompleteProfileGate] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  
  const [municipioFilter, setMunicipioFilter] = useState("");
  const [precioMaxFilter, setPrecioMaxFilter] = useState(1500); 
  
  const [appliedMunicipio, setAppliedMunicipio] = useState("");
  const [appliedPrecioMax, setAppliedPrecioMax] = useState(null);

  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser ? currentUser.id : null;
  
  // Un perfil se considera completo si tiene foto, profesión y biografía
  const isProfileComplete = currentUser && 
    currentUser.fotoPerfil && 
    currentUser.profesion && 
    currentUser.bio;

  const fetchFeed = async (municipio = appliedMunicipio, precioMax = appliedPrecioMax) => {
    if (!userId) {
      setFlats(DUMMY_FLATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Pasamos los filtros actuales
      const data = await getFeedForUser(userId, { 
        municipio: municipio,
        precioMax: precioMax
      });

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
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {userId && (
        <button 
          onClick={() => setShowFilters(true)}
          className="absolute top-4 right-4 z-40 bg-white p-3 rounded-full shadow-md text-slate-700 hover:text-[#e8385d] transition-colors"
        >
          <Filter className="w-6 h-6" />
        </button>
      )}
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
              <Button onClick={handleRewind} variant="outline" className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50">
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
      {showFilters && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={() => setShowFilters(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl shadow-2xl p-6 pb-10"
            style={{ animation: "nfSlideUp 0.3s ease-out forwards" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Filtros de Búsqueda</h2>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 font-bold p-2">✕</button>
            </div>

            {/* Filtro: Municipio */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Municipio</label>
              <input 
                type="text" 
                placeholder="Ej: Madrid, Barcelona, Alicante..."
                value={municipioFilter}
                onChange={(e) => setMunicipioFilter(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e8385d] focus:outline-none"
              />
            </div>

            {/* Filtro: Precio Máximo */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-slate-600">Precio Máximo</label>
                <span className="font-bold text-[#e8385d]">{precioMaxFilter}€</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="3000" 
                step="50"
                value={precioMaxFilter}
                onChange={(e) => setPrecioMaxFilter(Number(e.target.value))}
                className="w-full accent-[#e8385d]"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button 
                onClick={() => { 
                  // 1. Reseteamos los borradores del modal
                  setMunicipioFilter(""); 
                  setPrecioMaxFilter(1500); 
                  // 2. Reseteamos los filtros activos de la base de datos
                  setAppliedMunicipio("");
                  setAppliedPrecioMax(null);
                  // 3. Cerramos modal y recargamos pisos limpios
                  setShowFilters(false);
                  fetchFeed("", null); 
                }}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={() => { 
                  // 1. Guardamos el borrador como filtro activo
                  setAppliedMunicipio(municipioFilter);
                  setAppliedPrecioMax(precioMaxFilter);
                  // 2. Cerramos modal y recargamos mandando los nuevos datos
                  setShowFilters(false);
                  fetchFeed(municipioFilter, precioMaxFilter); 
                }}
                className="flex-[2] py-3 rounded-xl font-bold text-white transition-colors"
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
