import React, { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';
import { crearValoracion } from '../../services/api';

/**
 * ValoracionModal
 *
 * Props:
 *   autorId      (number)  — id del usuario logueado
 *   destino      (object)  — { id, nombre, fotoPerfil }
 *   onClose      (fn)      — cierra el modal
 *   onSuccess    (fn)      — callback tras valoración exitosa
 */
export default function ValoracionModal({ autorId, destino, onClose, onSuccess }) {
    const [puntuacion, setPuntuacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (puntuacion < 1) {
            setError('Selecciona al menos 1 estrella');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await crearValoracion({
                autorId,
                destinoId: destino.id,
                puntuacion,
                comentario: comentario.trim() || null,
            });
            setDone(true);
            setTimeout(() => {
                onSuccess && onSuccess();
                onClose();
            }, 1500);
        } catch (e) {
            const data = e.response?.data;
            if (typeof data === 'string') {
                setError(data);
            } else if (data?.message) {
                setError(data.message);
            } else if (data?.error) {
                setError(data.error);
            } else {
                setError('Error al enviar la valoración');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Panel */}
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pb-8 animate-in slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-slate-800">Valorar usuario</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {done ? (
                    /* Estado de éxito */
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                        <p className="text-lg font-bold text-slate-800">¡Valoración enviada!</p>
                        <p className="text-sm text-slate-500">Gracias por tu reseña</p>
                    </div>
                ) : (
                    <>
                        {/* Avatar + nombre del destino */}
                        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-2xl">
                            {destino.fotoPerfil ? (
                                <img
                                    src={destino.fotoPerfil}
                                    alt={destino.nombre}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-[#e8385d] font-black text-xl">
                                    {destino.nombre?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-slate-800">{destino.nombre}</p>
                                <p className="text-xs text-slate-400">¿Cómo fue tu experiencia?</p>
                            </div>
                        </div>

                        {/* Estrellas (COS #2 — mínimo 1) */}
                        <div className="flex flex-col items-center gap-2 mb-6">
                            <StarRating value={puntuacion} onChange={setPuntuacion} size={36} />
                            {puntuacion > 0 && (
                                <p className="text-xs text-slate-400 font-medium">
                                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][puntuacion]}
                                </p>
                            )}
                        </div>

                        {/* Comentario opcional */}
                        <textarea
                            rows={3}
                            maxLength={500}
                            placeholder="Deja un comentario (opcional)..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#e8385d] resize-none text-sm text-slate-700 mb-1"
                        />
                        <p className="text-right text-xs text-slate-300 mb-4">{comentario.length}/500</p>

                        {/* Error */}
                        {error && (
                            <p className="text-xs font-bold text-[#e8385d] mb-3 text-center uppercase tracking-tight">
                                {error}
                            </p>
                        )}

                        {/* Botón enviar */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || puntuacion < 1}
                            className="w-full py-4 rounded-xl font-black text-white text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #e8385d 0%, #c0284a 100%)' }}
                        >
                            {loading
                                ? <Loader2 className="animate-spin mx-auto w-5 h-5" />
                                : 'Enviar valoración'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}