import React, { useState, useEffect } from "react";
import { Filter, RefreshCcw, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import HoverPropertyCard from "../components/ui/HoverPropertyCard";
import { getFeedForUser, processSwipe } from "../services/api";

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

  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser ? currentUser.id : null;
  
  // Un perfil se considera completo si tiene foto, profesión y biografía
  const isProfileComplete = currentUser && 
    currentUser.fotoPerfil && 
    currentUser.profesion && 
    currentUser.bio;

  const fetchFeed = async () => {
    // If user is not logged in → show dummy cards immediately
    if (!userId) {
      setFlats(DUMMY_FLATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getFeedForUser(userId);

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

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* Card Stack */}
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
            <Button onClick={fetchFeed} variant="primary" className="mt-4 w-full">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Volver a cargar
            </Button>
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
