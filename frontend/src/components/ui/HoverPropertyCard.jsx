import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Heart, X, MapPin } from 'lucide-react';

export default function HoverPropertyCard({ item, onLike, onDislike }) {
    const [hoverState, setHoverState] = useState('center');
    const cardRef = useRef(null);
    const controls = useAnimation();

    useEffect(() => {
        if (hoverState === 'left') {
            controls.start({
                x: '25%', rotate: 2, // Desplazamiento del 25% y ligera rotación
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
    };

    const imgUrl = item.fotoPrincipalUrl || item.images?.[0] || '';

    // clip-path para una división diagonal central: de (40%, 0) a (60%, 100%)
    const leftPanelClipPath = 'polygon(0 0, 40% 0, 60% 100%, 0 100%)';
    const rightPanelClipPath = 'polygon(40% 0, 100% 0, 100% 100%, 60% 100%)';

    return (
        <div
            ref={cardRef}
            className="absolute inset-0 w-full h-full overflow-hidden cursor-pointer select-none rounded-xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform: 'translateZ(0)' }}
        >
            {/* ═══ LEFT PANEL: DISLIKE con división diagonal central (rojo) ═══ */}
            <div
                className="absolute inset-0 z-0 overflow-hidden rounded-xl"
                style={{ clipPath: leftPanelClipPath }}
                onClick={(e) => { e.stopPropagation(); if (onDislike) onDislike(item); }}
            >
                {/* Fondo degradado rojo */}
                <div className="absolute inset-0"
                    style={{
                        background: hoverState === 'left'
                            ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                            : 'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%)',
                        transition: 'background 0.4s ease',
                    }}
                />

                {/* TEXTO: RECHAZAR - Movido más a la izquierda */}
                {/* CAMBIO AQUÍ: Cambiado w-[40%] por w-[35%] y añadido pr-8 para empujarlo más */}
                <div className="absolute inset-y-0 left-0 w-[35%] pr-8 flex items-center justify-center pointer-events-none">
                    <div style={{
                        transform: 'rotate(-10deg)',
                        opacity: hoverState === 'left' ? 1 : 0,
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <X className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-md mb-2" strokeWidth={3} />
                        <span className="text-white text-lg md:text-2xl font-black tracking-widest uppercase drop-shadow-md">
                            RECHAZAR
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT PANEL: LIKE con división diagonal central (verde) ═══ */}
            <div
                className="absolute inset-0 z-0 overflow-hidden rounded-xl"
                style={{ clipPath: rightPanelClipPath }}
                onClick={(e) => { e.stopPropagation(); if (onLike) onLike(item); }}
            >
                {/* Fondo degradado verde */}
                <div className="absolute inset-0"
                    style={{
                        background: hoverState === 'right'
                            ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                            : 'linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 100%)',
                        transition: 'background 0.4s ease',
                    }}
                />

                {/* TEXTO: ACEPTAR - Movido más a la derecha */}
                {/* CAMBIO AQUÍ: Cambiado w-[40%] por w-[35%] y añadido pl-8 para empujarlo más */}
                <div className="absolute inset-y-0 right-0 w-[35%] pl-8 flex items-center justify-center pointer-events-none">
                    <div style={{
                        transform: 'rotate(10deg)',
                        opacity: hoverState === 'right' ? 1 : 0,
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <Heart className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-md mb-2" fill="white" strokeWidth={2.5} />
                        <span className="text-white text-lg md:text-2xl font-black tracking-widest uppercase drop-shadow-md">
                            ACEPTAR
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══ MAIN IMAGE (La tarjeta que se desliza) ═══ */}
            <motion.div
                className="absolute inset-0 z-10 w-full h-full bg-cover bg-center origin-center rounded-xl overflow-hidden"
                animate={controls}
                style={{
                    backgroundImage: `url(${imgUrl})`,
                    boxShadow: hoverState !== 'center'
                        ? '0 20px 60px -10px rgba(0,0,0,0.7), 0 0 30px -5px rgba(0,0,0,0.4)'
                        : 'none',
                }}
                onClick={handleClick}
            >
                {/* Degradados y Overlay de información ... */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20">
                    <div className="flex justify-between items-end">
                        <div className="flex-1 min-w-0 mr-4">
                            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-md truncate">
                                {item.title || item.direccion || item.municipio || 'Sin título'}
                            </h2>
                            <p className="flex items-center mt-1 text-white/90 text-sm md:text-base font-medium drop-shadow-md">
                                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{item.location || item.municipio || 'Ubicación desconocida'}</span>
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="inline-flex items-baseline px-3 py-1 rounded-lg bg-pink-600/90 backdrop-blur-md shadow-lg">
                                <span className="text-2xl md:text-3xl font-black text-white">
                                    {item.precio || item.price || 0}€
                                </span>
                            </div>
                            <span className="block text-xs text-white/80 font-bold mt-1 tracking-wider uppercase drop-shadow-md">/ mes</span>
                        </div>
                    </div>

                    {item.features && item.features.length > 0 && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {item.features.slice(0, 4).map((f, i) => (
                                <span key={i} className="px-3 py-1 text-xs font-bold rounded-md bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}