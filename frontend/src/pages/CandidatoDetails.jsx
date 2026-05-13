import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Briefcase, User, Calendar, ShieldCheck, 
    Heart, X, Loader2, Info, Users, Maximize2
} from 'lucide-react';

import { getUserDetails, swipeCandidato } from '../services/api';
import Button from '../components/ui/Button';

export default function CandidatoDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const readOnly = location.state?.readOnly === true;
    const [candidato, setCandidato] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullImage, setShowFullImage] = useState(false);

    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const propietarioId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getUserDetails(id);
                setCandidato(data);
            } catch (error) {
                console.error("Error fetching candidato details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleInteraction = async (type) => {
        if (!propietarioId) { navigate('/login'); return; }
        try {
            await swipeCandidato({
                propietarioId: propietarioId,
                candidatoId: candidato.id,
                tipoInteraccion: type,
            });
            navigate('/owner-feed');
        } catch (error) {
            console.error(`Failed to record ${type} interaction:`, error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#e8385d]" />
                <p className="text-slate-500 font-medium">Cargando perfil del candidato...</p>
            </div>
        );
    }

    if (!candidato) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Info className="w-12 h-12 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">No encontramos al candidato</h2>
                <p className="text-slate-500 mt-2">Puede que su perfil ya no esté disponible.</p>
                <Button onClick={() => navigate(-1)} variant="secondary" className="mt-6">
                    Volver atrás
                </Button>
            </div>
        );
    }

    // Calcular edad
    let edadText = null;
    if (candidato.fechaNacimiento) {
        const birthDate = new Date(candidato.fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        edadText = `${age} años`;
    }

    const isVerified = candidato.estadoVerificacion === 'VERIFICADO' || candidato.verificado;

    const avatarUrl = candidato.fotoPerfil
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidato.nombre || 'User')}&size=800&background=e8385d&color=fff&bold=true`;

    return (
        <div className="relative flex h-full w-full bg-slate-50 overflow-hidden">

            {/* ══════════════════════════
                BOTÓN VOLVER
            ══════════════════════════ */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors shadow-lg"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* ══════════════════════════════════════
                LAYOUT: Mobile (columna) / Desktop (fila)
            ══════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row w-full h-full">

                {/* ──────────────────────────────────
                    PANEL IMAGEN — sin ningún gradiente
                ────────────────────────────────── */}
                <div
                    className="relative w-full h-[45vh] md:h-full md:w-2/5 flex-shrink-0 overflow-hidden cursor-zoom-in"
                    onClick={() => setShowFullImage(true)}
                >
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${avatarUrl})` }}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Botón "Ver imagen completa" */}
                    <div className="absolute bottom-3 right-3 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-semibold">
                            <Maximize2 className="w-3.5 h-3.5" />
                            Ver foto
                        </div>
                    </div>
                </div>

                {/* ──────────────────────────────────
                    PANEL DATOS
                ────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">

                    {/* Cabecera con gradiente de marca */}
                    <div
                        className="px-6 md:px-10 pt-8 pb-8 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)' }}
                    >
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                    {candidato.nombre}
                                </h1>
                                {isVerified && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-white text-xs font-black shadow-md flex-shrink-0">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        VERIFICADO
                                    </div>
                                )}
                            </div>
                            {edadText && (
                                <p className="text-white/70 font-medium text-base mb-3">{edadText}</p>
                            )}
                            {candidato.profesion && (
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full">
                                    <Briefcase className="w-3.5 h-3.5 text-white" />
                                    <span className="text-white text-sm font-semibold capitalize">{candidato.profesion}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cuerpo */}
                    <div className="px-6 md:px-10 py-6 pb-36">

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {edadText && (
                                <SpecCard icon={<Calendar />} label={edadText} colorClass="text-indigo-500" bg="bg-indigo-50" border="border-indigo-100" />
                            )}
                            <SpecCard
                                icon={<User />}
                                label={candidato.rol || 'CANDIDATO'}
                                colorClass="text-amber-500"
                                bg="bg-amber-50"
                                border="border-amber-100"
                            />
                            <SpecCard
                                icon={<ShieldCheck />}
                                label={isVerified ? 'Verificado' : 'No Verificado'}
                                colorClass={isVerified ? 'text-emerald-500' : 'text-slate-400'}
                                bg={isVerified ? 'bg-emerald-50' : 'bg-slate-50'}
                                border={isVerified ? 'border-emerald-100' : 'border-slate-100'}
                            />
                            {candidato.grupo && (
                                <SpecCard icon={<Users />} label="En Grupo" colorClass="text-blue-500" bg="bg-blue-50" border="border-blue-100" />
                            )}
                        </div>

                        <section className="mb-8">
                            <h3 className="text-[10px] font-black text-[#e8385d] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e8385d]" />
                                Sobre mí
                            </h3>
                            {candidato.bio ? (
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap italic text-sm">
                                        "{candidato.bio}"
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <p className="text-slate-400 italic text-sm">Este candidato no ha escrito una biografía todavía.</p>
                                </div>
                            )}
                        </section>

                        {candidato.grupo && (
                            <section className="bg-white rounded-3xl p-5 border-l-[6px] border-blue-500 shadow-sm relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500 opacity-[0.05] rounded-full pointer-events-none" />
                                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Grupo de Búsqueda
                                </h3>
                                <h4 className="text-base font-black text-slate-900 mb-1">Pertenece a un grupo</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Este candidato busca piso junto con otros usuarios. Aceptarlo podría implicar alquilar a todo el grupo.
                                </p>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                BOTONES FIJOS — solo visibles si NO es readOnly
            ══════════════════════════════════════ */}
            {!readOnly && (
                <div className="fixed bottom-0 right-0 left-0 md:left-[40%] p-8 pb-10 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-50 flex justify-center">
                    <div className="flex gap-8 pointer-events-auto items-center">
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: -10, boxShadow: "0 20px 25px -5px rgba(220, 38, 38, 0.15)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('DISLIKE')}
                            className="w-16 h-16 rounded-full bg-white shadow-xl shadow-red-100 flex items-center justify-center text-red-500 border border-red-50 border-b-4 border-b-red-100"
                        >
                            <X className="w-6 h-6" strokeWidth={4} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.15, rotate: 10, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('LIKE')}
                            className="w-16 h-16 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-200 flex items-center justify-center text-white border-4 border-white"
                        >
                            <Heart className="w-5 h-5" fill="currentColor" />
                        </motion.button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════
                LIGHTBOX — imagen completa
            ══════════════════════════════════════ */}
            <AnimatePresence>
                {showFullImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-zoom-out"
                        onClick={() => setShowFullImage(false)}
                    >
                        <button
                            className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/20 z-10"
                            onClick={() => setShowFullImage(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            src={avatarUrl}
                            alt={candidato.nombre}
                            className="max-w-full max-h-full object-contain select-none"
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SpecCard({ icon, label, colorClass, bg, border }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${bg} ${border}`}>
            <span className={colorClass}>
                {React.cloneElement(icon, { size: 18 })}
            </span>
            <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
    );
}
