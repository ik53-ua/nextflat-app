import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating — componente de 5 estrellas interactivo.
 *
 * Props:
 *   value      (number)   — estrella seleccionada (0 = ninguna)
 *   onChange   (fn)       — callback(n) cuando el usuario selecciona
 *   readonly   (boolean)  — modo sólo lectura (para mostrar media)
 *   size       (number)   — tamaño del icono en px (default 28)
 */
export default function StarRating({ value = 0, onChange, readonly = false, size = 28 }) {
    const [hovered, setHovered] = useState(0);

    const active = readonly ? value : (hovered || value);

    return (
        <div className="flex gap-1" role="group" aria-label="Valoración en estrellas">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(n)}
                    onMouseEnter={() => !readonly && setHovered(n)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                >
                    <Star
                        width={size}
                        height={size}
                        className={`transition-colors ${n <= active
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}