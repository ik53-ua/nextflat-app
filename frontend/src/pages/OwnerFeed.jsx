import React, { useState, useEffect } from "react";
import { Users, RefreshCcw, Loader2, ShieldAlert, RotateCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import CandidatoCard from "../components/ui/CandidatoCard";
import { getCandidatosParaPropietario, swipeCandidato, undoLastCandidatoSwipe } from "../services/api";

export default function OwnerFeed() {
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser?.id ?? null;
  const userRol = currentUser?.rol ?? null;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    // CAMBIO: Denegamos acceso SOLO si no es PROPIETARIO ni DELEGADO
    if (userRol !== "PROPIETARIO" && userRol !== "DELEGADO") {
      setAccessDenied(true);
      setLoading(false);
    }
  }, []);

  const fetchCandidatos = async () => {
    // CAMBIO: Permitir la petición si es PROPIETARIO o DELEGADO
    if (!userId || (userRol !== "PROPIETARIO" && userRol !== "DELEGADO")) return;
    setLoading(true);
    try {
      const data = await getCandidatosParaPropietario(userId);
      setCandidatos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching candidatos:", error);
      setCandidatos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // CAMBIO: Disparar la petición si es PROPIETARIO o DELEGADO
    if (userRol === "PROPIETARIO" || userRol === "DELEGADO") {
      fetchCandidatos();
    }
  }, [userId]);

  const handleSwipe = async (tipo, candidato) => {
    setCandidatos((prev) => prev.filter((c) => c.id !== candidato.id));

    try {
      await swipeCandidato({
        propietarioId: userId, // Este ID funciona para el dueño o el delegado en el backend
        candidatoId: candidato.id,
        tipoInteraccion: tipo,
      });
    } catch (error) {
      console.error("Failed to record swipe on candidato:", error);
    }
  };

  const handleLike = (candidato) => handleSwipe("LIKE", candidato);
  const handleDislike = (candidato) => handleSwipe("DISLIKE", candidato);

  const handleRewind = async () => {
    if (!userId) return;
    try {
      const restoredCandidato = await undoLastCandidatoSwipe(userId);
      setCandidatos((prev) => [...prev, restoredCandidato]);
    } catch (error) {
      const mensaje = typeof error.response?.data === 'string'
        ? error.response.data
        : "No se puede deshacer esta acción. El candidato no está disponible o hubo un error de conexión.";
      alert(mensaje);
    }
  };

  if (accessDenied) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Sección exclusiva para propietarios o gestores
          </h2>
          <p className="text-slate-500 text-sm">
            Solo los propietarios y delegados pueden ver el feed de candidatos.
          </p>
          <Button variant="primary" onClick={() => navigate("/feed")}>
            Ver pisos disponibles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-slate-50">

      {/* ESPACIO PARA FILTROS (Solo para Propietarios, los Delegados no lo ven) */}
      {userRol === "PROPIETARIO" && (
        <div className="filtros-futuros absolute top-4 right-4 z-50">
          {/* Aquí añadirás tus botones de filtros en el futuro si lo necesitas */}
        </div>
      )}

      <div className="flex-1 relative flex items-center justify-center p-0">
        {loading ? (
          <div className="flex flex-col items-center text-slate-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            <p className="text-lg font-medium">Cargando candidatos...</p>
          </div>
        ) : candidatos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-500 space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm">
            <div className="bg-slate-100 p-5 rounded-full mb-2">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">¡Sin candidatos!</p>
            <p className="text-slate-500 text-sm">
              Cuando un inquilino dé Like a uno de tus pisos delegados, aparecerá aquí para que lo evalúes.
            </p>
            <div className="flex gap-3 mt-4 w-full">
              <Button onClick={handleRewind} variant="outline" className="flex-1 text-[#e8385d] border-[#e8385d]/30 hover:bg-[#e8385d]/10">
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer
              </Button>
              <Button onClick={fetchCandidatos} variant="primary" className="flex-[2]">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {candidatos.map((candidato, index) => {
                if (index > candidatos.length - 4) {
                  return (
                    <CandidatoCard
                      key={candidato.id}
                      item={candidato}
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
    </div>
  );
}