import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

// AÑADIDO userRol AL FINAL DE ESTA LÍNEA 👇
export default function AgendarCitaModal({ isOpen, onClose, onSubmit, inmuebleId = null, userRol }) {
  const [fecha, setFecha] = useState(format(addDays(startOfToday(), 1), 'yyyy-MM-dd'));
  const [hora, setHora] = useState('10:00');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMotivo(userRol === 'PROPIETARIO' ? '¿Te gustaría venir a ver el piso?' : 'Me gustaría visitar el piso.');
    }
  }, [isOpen, userRol]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const fechaHora = `${fecha}T${hora}:00`;
    onSubmit({ fechaHora, motivo, inmuebleId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#e8385d] to-[#ff7b93] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={20} />
            Agendar Visita
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Día de la visita</label>
            <div className="relative">
              <input
                type="date"
                required
                min={format(startOfToday(), 'yyyy-MM-dd')}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e8385d]/50 focus:border-[#e8385d] outline-none transition-all text-slate-700"
              />
              <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hora (Aprox)</label>
            <div className="relative">
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e8385d]/50 focus:border-[#e8385d] outline-none transition-all text-slate-700"
              />
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">La duración estimada es de 30 mins a 1 hora.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
            <textarea
              rows="3"
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#e8385d]/50 focus:border-[#e8385d] outline-none transition-all text-slate-700 resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#e8385d] hover:bg-[#d42d50] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#e8385d]/20 transition-all active:scale-[0.98]"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}