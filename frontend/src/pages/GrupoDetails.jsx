import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Briefcase, ShieldCheck, X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { swipeCandidato } from '../services/api';
import Button from '../components/ui/Button';

export default function GrupoDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Sacamos los datos de la "mochila"
    const grupo = location.state?.datos;
    const readOnly = location.state?.readOnly === true;

    // Obtener el propietario logueado para poder hacer swipe
    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    const currentUser = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const propietarioId = currentUser ? currentUser.id : null;

    if (!grupo || !grupo.esGrupo) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
                <p className="text-xl font-bold text-slate-700 mb-4">No se encontraron los datos del grupo.</p>
                <Button onClick={() => navigate(-1)} variant="primary">Volver al Feed</Button>
            </div>
        );
    }

    // Función para manejar el Like/Dislike desde los detalles
    const handleInteraction = async (type) => {
        if (!propietarioId) { navigate('/login'); return; }
        try {
            await swipeCandidato({
                propietarioId: propietarioId,
                candidatoId: grupo.id, // ID del representante del grupo
                tipoInteraccion: type,
            });
            // Al hacer swipe, volvemos al feed automáticamente
            navigate('/owner-feed');
        } catch (error) {
            console.error(`Error al registrar ${type}:`, error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 overflow-y-auto relative">
            {/* Cabecera con botón de volver */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center shadow-sm">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 mr-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#e8385d]" /> Perfil del Grupo
                </h1>
            </div>

            {/* Contenido Principal con padding inferior extra para los botones */}
            <div className="p-6 max-w-4xl mx-auto w-full space-y-8 pb-36">
                
                {/* Info de interés común y Bio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Buscan en:</h2>
                        <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-lg">
                            <MapPin className="w-6 h-6 text-[#e8385d] flex-shrink-0" />
                            <span>{grupo.interesadoEnDireccion ? `${grupo.interesadoEnDireccion}, ` : ''}{grupo.interesadoEnMunicipio || 'Cualquier zona'}</span>
                        </div>
                    </div>
                    
                    {grupo.bio && (
                        <div className="md:col-span-2 bg-gradient-to-br from-[#e8385d] to-[#c0284a] p-6 rounded-2xl shadow-md text-white">
                            <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Sobre nosotros
                            </h2>
                            <p className="text-white text-lg leading-relaxed italic">"{grupo.bio}"</p>
                        </div>
                    )}
                </div>

                {/* Sección de Miembros */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight border-b border-slate-200 pb-2">
                        Conoce a los inquilinos
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {grupo.usuarios.map((user) => (
                            <div key={user.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all hover:shadow-md hover:border-slate-200">
                                
                                {/* NUEVO: Contenedor Vertical (Retrato 4:5) para que la foto encaje perfecta sin fondos borrosos */}
                                <div className="w-full aspect-[4/5] relative bg-slate-100 overflow-hidden">
                                    
                                    {/* La foto encuadrada de forma natural */}
                                    <img 
                                        src={user.fotoPerfil || `https://ui-avatars.com/api/?name=${user.nombre}&size=400&background=e8385d&color=fff`} 
                                        alt={user.nombre}
                                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                    />
                                    
                                    {/* Gradiente oscuro abajo para que se lea el nombre */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                                    
                                    <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{user.nombre}</h3>
                                                <span className="text-white/90 font-medium text-lg">{user.edad} años</span>
                                            </div>
                                            {/* Etiqueta de verificado */}
                                            <div className="bg-emerald-500/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 shadow-sm flex-shrink-0 ml-4 pointer-events-auto">
                                                <ShieldCheck className="w-4 h-4 text-white" />
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Verificado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Detalles inferiores */}
                                <div className="p-5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                                    {user.profesion ? (
                                        <div className="flex items-center gap-3 text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 w-full">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Briefcase className="w-5 h-5 text-[#e8385d]" />
                                            </div>
                                            <span className="capitalize font-semibold text-sm">{user.profesion}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic p-2">Sin profesión especificada</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                BOTONES FIJOS DE ACCIÓN (SWIPE)
            ══════════════════════════════════════ */}
            {!readOnly && (
                <div className="fixed bottom-0 right-0 left-0 p-6 pb-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-50 flex justify-center">
                    <div className="flex gap-8 pointer-events-auto items-center">
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: -10, boxShadow: "0 20px 25px -5px rgba(220, 38, 38, 0.15)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('DISLIKE')}
                            className="w-16 h-16 rounded-full bg-white shadow-xl shadow-red-100 flex items-center justify-center text-red-500 border border-red-50 border-b-4 border-b-red-100"
                            title="Rechazar grupo"
                        >
                            <X className="w-6 h-6" strokeWidth={4} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.15, rotate: 10, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleInteraction('LIKE')}
                            className="w-16 h-16 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-200 flex items-center justify-center text-white border-4 border-white"
                            title="Aceptar grupo"
                        >
                            <Heart className="w-6 h-6" fill="currentColor" />
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    );
}