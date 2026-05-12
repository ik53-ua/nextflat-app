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

  // (Debajo de los estados del pago simulado)
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitErrorMsg, setLimitErrorMsg] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  // --- ESTADOS PARA EL PAGO SIMULADO ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSuperLikeItem, setPendingSuperLikeItem] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paymentError, setPaymentError] = useState("");

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

  // 1. Primero leemos del localStorage
  const usuarioGuardado = localStorage.getItem("usuarioLogueado");

  // 2. Luego definimos currentUser
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  // 3. AHORA SÍ podemos sacar el ID y el Rol, porque currentUser ya existe
  const userId = currentUser ? currentUser.id : null;
  const userRol = currentUser?.rol || null;

  // 4. Y después la comprobación del perfil completo
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
        setFlats(Array.from(new Map(formattedFlats.map(item => [item.id, item])).values()));
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

  useEffect(() => {
    if (userRol === 'PROPIETARIO' || userRol === 'DELEGADO') {
      navigate('/owner-feed', { replace: true });
    }
  }, [userRol, navigate]);

  const handleCloseModal = () => {
    navigate('/feed');
  };

  const handleSwipe = async (type, item, isSuperLike = false) => {
    if (!userId) {
      setShowLoginGate(true);
      return;
    }

    if (!isProfileComplete) {
      setShowIncompleteProfileGate(true);
      return;
    }

    // Quitamos la tarjeta temporalmente de la pantalla
    setFlats((prev) => prev.filter((f) => f.id !== item.id));

    try {
      await processSwipe({
        usuarioOrigenId: userId,
        inmuebleDestinoId: item.id,
        tipoInteraccion: type,
        esSuperLike: isSuperLike,
      });
    } catch (error) {
      console.error("Failed to record swipe:", error);

      let errorMsg = "No se ha podido procesar la acción.";
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
      }

      // QUITAMOS EL HORRIBLE ALERT Y USAMOS NUESTRO MODAL
      setLimitErrorMsg(errorMsg);
      setShowLimitModal(true);

      // La tarjeta vuelve a su sitio sigilosamente detrás del modal
      setFlats((prev) => [...prev, item]);
    }
  };

  const handleLike = (item) => handleSwipe("LIKE", item, false);
  const handleDislike = (item) => handleSwipe("DISLIKE", item, false);
  const handleSuperLike = (item) => {
    if (!userId) {
      setShowLoginGate(true);
      return;
    }
    if (!isProfileComplete) {
      setShowIncompleteProfileGate(true);
      return;
    }

    // Si ya es Premium (lo comprobamos del localStorage), hace el swipe directamente
    if (currentUser?.esPremium) {
      handleSwipe("LIKE", item, true);
    } else {
      // Si no es Premium, le pedimos la tarjeta y guardamos el piso en "espera"
      setPendingSuperLikeItem(item);
      setShowPaymentModal(true);
      setPaymentError(""); // Limpiamos errores anteriores
      setCardNumber("");
      setExpiry("");
      setCvc("");
    }
  };

  const handleSimulatePayment = async () => {
    // 1. Quitar espacios y comprobar que solo haya números
    const cleanCard = cardNumber.replace(/\s|-/g, '');
    const cleanCvc = cvc.replace(/\s/g, '');
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/; // Formato MM/AA

    // 2. Validaciones
    if (!/^\d+$/.test(cleanCard) || cleanCard.length !== 16) {
      setPaymentError("La tarjeta debe tener 16 números exactos.");
      return;
    }
    if (!expiryRegex.test(expiry)) {
      setPaymentError("La fecha de caducidad debe tener formato MM/AA.");
      return;
    }
    if (!/^\d+$/.test(cleanCvc) || cleanCvc.length !== 3) {
      setPaymentError("El CVC debe tener 3 números exactos.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      // 1. Avisamos al backend para que lo guarde en la BD
      const response = await fetch(`${apiUrl}/api/usuarios/${userId}/premium`, {
        method: 'PUT'
      });

      if (response.ok) {
        const userUpdated = await response.json();
        // 2. Ahora sí, guardamos en LocalStorage la respuesta real del servidor
        localStorage.setItem("usuarioLogueado", JSON.stringify(userUpdated));

        alert("¡Pago con éxito! 🎉 Ahora eres usuario Premium.");

        if (pendingSuperLikeItem) {
          handleSwipe("LIKE", pendingSuperLikeItem, true);
        }
        setShowPaymentModal(false);
        setPendingSuperLikeItem(null);
      } else {
        setPaymentError("No se pudo activar el premium en el servidor.");
      }
    } catch (error) {
      setPaymentError("Error al procesar el pago en el servidor.");
    }
  };

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
        images: dbFlat.fotos && dbFlat.fotos.length > 0
          ? dbFlat.fotos
          : ["https://via.placeholder.com/800x600?text=Sin+Foto"],
      };

      setFlats((prev) => [...prev, formattedRestoredFlat]);
    } catch (error) {
      const errorMsg = error.response?.data || "No se puede deshacer esta acción";
      // Si el backend nos avisa del límite, mostramos el modal Premium
      if (errorMsg.includes("Premium") || errorMsg.includes("agotado")) {
        setShowPremiumModal(true);
      } else {
        alert(errorMsg);
      }
    }
  };



  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative pt-0">
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
                      onSuperLike={handleSuperLike}
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
                    className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${item.state === true
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
      {/* ═══ Premium Gate Modal ═══ */}
      {showPremiumModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-tr from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500/30">
              <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">¡Límite alcanzado!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Has agotado tus usos diarios para deshacer *Swipes*. Pásate a <b>NextFlat Premium</b> para tener usos ilimitados y destacar tu perfil con Super Likes.
            </p>
            <button
              onClick={() => {
                setShowPremiumModal(false);
                setShowPaymentModal(true); // ¡Esto abre la pasarela de pago simulada!
              }}
              className="w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-yellow-500/30 bg-gradient-to-r from-yellow-400 to-amber-500"
            >
              Obtener Premium (9.99€/mes)
            </button>
            <button
              onClick={() => setShowPremiumModal(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      )}

      {/* ═══ Payment Gate Modal (Simulado) ═══ */}
      {showPaymentModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(5px)" }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "nfSlideUp 0.3s ease-out forwards" }}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
                <span className="text-2xl text-white">💳</span>
              </div>
              <h2 className="text-xl font-black text-slate-800">Mejora a Premium</h2>
              <p className="text-slate-500 text-xs mt-1">
                Destaca tu perfil con Super Likes para que los propietarios te vean primero. Solo 9.99€/mes.
              </p>
            </div>

            {/* Formulario de Pago */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="1234 5678 1234 5678"
                  maxLength="19" // 16 números + 3 espacios
                  value={cardNumber}
                  onChange={(e) => {
                    // 1. Quitamos todo lo que NO sea un número
                    let val = e.target.value.replace(/\D/g, '');
                    // 2. Agrupamos de 4 en 4 y unimos con un espacio
                    let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                    setCardNumber(formatted);
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#e8385d] focus:outline-none text-sm font-medium transition-colors"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Caducidad</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength="5" // 4 números + 1 barra
                    value={expiry}
                    onChange={(e) => {
                      // 1. Quitamos todo lo que NO sea número
                      let val = e.target.value.replace(/\D/g, '');
                      // 2. Ponemos la barra automáticamente después del segundo número
                      if (val.length > 2) {
                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      }
                      setExpiry(val);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#e8385d] focus:outline-none text-sm font-medium transition-colors text-center"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength="3"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#e8385d] focus:outline-none text-sm font-medium transition-colors text-center"
                  />
                </div>
              </div>

              {/* Mensaje de Error */}
              {paymentError && (
                <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">
                  ⚠️ {paymentError}
                </p>
              )}

              <button
                onClick={handleSimulatePayment}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Pagar 9.99€ de forma segura
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full mt-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )
      }
      {/* ═══ Limit/Error Modal ═══ */}
      {showLimitModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowLimitModal(false)}
        >
          <div
            className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden p-6 text-center"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "nfSlideUp 0.3s ease-out forwards" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 shadow-md">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Acción denegada</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium px-2">
              {limitErrorMsg}
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-red-500/30 bg-gradient-to-r from-[#e8385d] to-[#ff6b6b]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
