import React, { useState, useEffect } from "react";
import { Users, RefreshCcw, Loader2, ShieldAlert } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import CandidatoCard from "../components/ui/CandidatoCard";
import { getCandidatosParaPropietario, swipeCandidato } from "../services/api";

export default function OwnerFeed() {
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Leer usuario del localStorage
  const usuarioGuardado = localStorage.getItem("usuarioLogueado");
  const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const userId = currentUser?.id ?? null;
  const userRol = currentUser?.rol ?? null;

  // Guard de rol: solo PROPIETARIO puede acceder
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (userRol !== "PROPIETARIO") {
      setAccessDenied(true);
      setLoading(false);
    }
  }, []);

  const fetchCandidatos = async () => {
    if (!userId || userRol !== "PROPIETARIO") return;
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
    if (userRol === "PROPIETARIO") {
      fetchCandidatos();
    }
  }, [userId]);

  const handleSwipe = async (tipo, candidato) => {
    // Optimistic: quitar de la pila
    setCandidatos((prev) => prev.filter((c) => c.id !== candidato.id));

    try {
      await swipeCandidato({
        propietarioId: userId,
        candidatoId: candidato.id,
        tipoInteraccion: tipo,
      });
    } catch (error) {
      console.error("Failed to record swipe on candidato:", error);
    }
  };

  const handleLike = (candidato) => handleSwipe("LIKE", candidato);
  const handleDislike = (candidato) => handleSwipe("DISLIKE", candidato);

  // ── Estado: Acceso denegado ────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Sección exclusiva para propietarios
          </h2>
          <p className="text-slate-500 text-sm">
            Solo los propietarios pueden ver el feed de candidatos.
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
      {/* ── Card Stack ──────────────────────────────────────────────── */}
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
              Cuando un inquilino dé Like a uno de tus pisos, aparecerá aquí para que lo evalúes.
            </p>
            <Button onClick={fetchCandidatos} variant="primary" className="mt-2 w-full">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <AnimatePresence>
              {candidatos.map((candidato, index) => {
                // Mostrar solo las últimas 3 cartas de la pila (las más próximas)
                if (index > candidatos.length - 4) {
                  return (
                    <CandidatoCard
                      key={candidato.id}
                      item={candidato}
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
    </div>
  );
}
