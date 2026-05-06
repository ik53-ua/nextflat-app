import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Heart, X, MapPin, Briefcase, RotateCcw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * CandidatoCard — Tarjeta swipeable de persona para el feed del propietario (US-008).
 *
 * Props:
 *   item     — CandidatoFeedDTO { id, nombre, edad, profesion, fotoPerfil, bio,
 *                                  interesadoEnDireccion, interesadoEnMunicipio }
 *   onLike   — callback cuando el propietario acepta al candidato
 *   onDislike — callback cuando el propietario rechaza al candidato
 *   onRewind — callback cuando el propietario deshace el último rechazo
 */
export default function CandidatoCard({ item, onLike, onDislike, onRewind }) {
    const [hoverState, setHoverState] = useState('center');
    const cardRef = useRef(null);
    const controls = useAnimation();
    const navigate = useNavigate();

    useEffect(() => {
        if (hoverState === 'left') {
            controls.start({
                x: '25%', rotate: 2,
                transition: { type: 'spring', stiffness: 200, damping: 20 }
            });
        } else if (hoverState === 'right') {
            controls.start({
                x: '-25%', rotate: -2,
                transition: { type: 'spring', stiffness: 200, damping: 20 }
            });
        } else {
            controls.start({
                x: 0, rotate: 0,
                transition: { type: 'spring', stiffness: 300, damping: 24 }
            });
        }
    }, [hoverState, controls]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        setHoverState(mouseX < rect.width / 2 ? 'left' : 'right');
    };

    const handleMouseLeave = () => setHoverState('center');

    const handleClick = () => {
        if (hoverState === 'left' && onDislike) onDislike(item);
        if (hoverState === 'right' && onLike) onLike(item);
        if (hoverState === 'center') navigate(`/candidato/${item.id}`);
    };

    // Fallback avatar si no hay foto de perfil
    const avatarUrl = item.fotoPerfil
        ? item.fotoPerfil
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre || 'User')}&size=400&background=e8385d&color=fff&bold=true`;

    const leftPanelClipPath = 'polygon(0 0, 40% 0, 60% 100%, 0 100%)';
    const rightPanelClipPath = 'polygon(40% 0, 100% 0, 100% 100%, 60% 100%)';

    const ubicacionInteres = item.interesadoEnDireccion
        ? `${item.interesadoEnDireccion}, ${item.interesadoEnMunicipio || ''}`
        : item.interesadoEnMunicipio || '';

    return (
        <div
            ref={cardRef}
            className="absolute inset-0 w-full h-full overflow-hidden cursor-pointer select-none rounded-xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform: 'translateZ(0)' }}
        >
            {/* ═══ LEFT PANEL: RECHAZAR (rojo) ═══ */}
            <div
                className="absolute inset-0 z-0 overflow-hidden rounded-xl"
                style={{ clipPath: leftPanelClipPath }}
                onClick={(e) => { e.stopPropagation(); if (onDislike) onDislike(item); }}
            >
                <div className="absolute inset-0"
                    style={{
                        background: hoverState === 'left'
                            ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                            : 'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%)',
                        transition: 'background 0.4s ease',
                    }}
                />
                <div className="absolute inset-y-0 left-0 w-[35%] pr-8 flex items-center justify-center pointer-events-none">
                    <div style={{
                        transform: 'rotate(-10deg)',
                        opacity: hoverState === 'left' ? 1 : 0,
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <X className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-md mb-2" strokeWidth={3} />
                        <span className="text-white text-lg md:text-2xl font-black tracking-widest uppercase drop-shadow-md">
                            PASAR
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT PANEL: ACEPTAR (verde) ═══ */}
            <div
                className="absolute inset-0 z-0 overflow-hidden rounded-xl"
                style={{ clipPath: rightPanelClipPath }}
                onClick={(e) => { e.stopPropagation(); if (onLike) onLike(item); }}
            >
                <div className="absolute inset-0"
                    style={{
                        background: hoverState === 'right'
                            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                            : 'linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 100%)',
                        transition: 'background 0.4s ease',
                    }}
                />
                <div className="absolute inset-y-0 right-0 w-[35%] pl-8 flex items-center justify-center pointer-events-none">
                    <div style={{
                        transform: 'rotate(10deg)',
                        opacity: hoverState === 'right' ? 1 : 0,
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <Heart className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-md mb-2" fill="white" strokeWidth={2.5} />
                        <span className="text-white text-lg md:text-2xl font-black tracking-widest uppercase drop-shadow-md">
                            ACEPTAR
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══ TARJETA PRINCIPAL (foto + info) ═══ */}
            <motion.div
                className="absolute inset-0 z-10 w-full h-full origin-center overflow-hidden flex bg-white rounded-xl"
                animate={controls}
                onClick={handleClick}
                style={{
                    boxShadow: hoverState !== 'center'
                        ? '0 20px 60px -10px rgba(0,0,0,0.7), 0 0 30px -5px rgba(0,0,0,0.4)'
                        : 'none',
                }}
            >
                {/* 1/3 Izquierdo: Foto de perfil */}
                <div
                    className="w-1/3 h-full bg-cover bg-center bg-no-repeat relative"
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                >
                    {/* Sutil sombra interior para profundidad */}
                    <div className="absolute inset-0 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />
                </div>

                {/* 2/3 Derecho: Información */}
                <div
                    className="w-2/3 h-full flex flex-col p-5 sm:p-8 relative"
                    style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 40%, #8b1a35 100%)' }}
                >

                    {/* Badge contextual (Piso de interés) */}
                    {ubicacionInteres && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-[#e8385d] mb-4 sm:mb-6 shadow-sm w-fit bg-white">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="line-clamp-1">Interesado en {ubicacionInteres}</span>
                        </div>
                    )}

                    {/* Nombre y Edad */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-4">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none break-words">
                            {item.nombre || 'Sin nombre'}
                        </h2>
                        {item.edad != null && (
                            <span className="text-xl sm:text-2xl font-light text-white/70">
                                {item.edad} años
                            </span>
                        )}
                    </div>

                    {/* Profesión */}
                    {item.profesion && (
                        <div className="flex items-center gap-2 text-white/90 font-medium mb-6">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <span className="text-sm sm:text-base capitalize">{item.profesion}</span>
                        </div>
                    )}

                    {/* Bio */}
                    {item.bio && (
                        <div className="flex-1 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 overflow-y-auto shadow-sm mb-2">
                            <p className="text-white text-sm sm:text-base leading-relaxed italic">
                                "{item.bio}"
                            </p>
                        </div>
                    )}

                </div>
            </motion.div>

            {/* ═══ FIXED UI ELEMENTS (No se mueven con la imagen) ═══ */}
            <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-4 pointer-events-auto">
                {onRewind && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRewind(); }}
                        className="flex items-center justify-center w-11 h-11 bg-white hover:bg-slate-100 text-[#e8385d] rounded-full shadow-xl transition-transform active:scale-95 z-50"
                        title="Deshacer último rechazo"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/candidato/${item.id}`); }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/30 backdrop-blur-xl hover:bg-white/40 text-white rounded-full border border-white/50 font-bold text-sm transition-all active:scale-95 shadow-xl group z-50"
                >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Ver Detalles
                </button>
            </div>
        </div>
    );
}
