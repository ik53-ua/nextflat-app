import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRol, setUserRol] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('usuarioLogueado')) || { id: 1, rol: 'INQUILINO' };

  useEffect(() => {
    setUserRol(currentUser.rol);
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/citas/usuario/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (error) {
      console.error('Error fetching citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (citaId, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/api/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        fetchCitas(); // Reload
      }
    } catch (error) {
      console.error('Error actualizando cita:', error);
    }
  };

  const handleEliminarDeVista = async (citaId) => {
    if (!window.confirm("¿Quieres quitar esta cita de tu calendario? La otra persona la seguirá viendo.")) return;

    try {
      const res = await fetch(`${API_URL}/api/citas/${citaId}/usuario/${currentUser.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // La quitamos del estado local para que desaparezca visualmente al momento
        setCitas(prev => prev.filter(c => c.id !== citaId));
      }
    } catch (error) {
      console.error('Error al ocultar cita:', error);
    }
  };

  // Calendar logic (Weekly view)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getCitasForDay = (day) => {
    return citas.filter(cita => isSameDay(parseISO(cita.fechaHora), day));
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMADA': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELADA': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'REALIZADA': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="text-[#e8385d]" />
              Mi Calendario
            </h1>
            <p className="text-slate-500 mt-1">Gestiona tus visitas y citas programadas</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="text-slate-600" />
            </button>
            <span className="font-semibold text-slate-700 min-w-[120px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#e8385d] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="px-2 py-4 text-center border-r border-slate-100 last:border-r-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold ${isSameDay(day, new Date()) ? 'bg-[#e8385d] text-white' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map(day => {
                  const dayCitas = getCitasForDay(day);
                  return (
                    <div key={day.toISOString()} className="p-2 border-r border-slate-100 last:border-r-0 min-h-[120px]">
                      <div className="space-y-2">
                        {dayCitas.map(cita => (
                          <div
                            key={cita.id}
                            className={`p-3 rounded-xl border ${getStatusColor(cita.estado)} shadow-sm relative group`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Clock size={12} className="opacity-70" />
                              <span className="text-xs font-bold">
                                {format(parseISO(cita.fechaHora), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-xs font-medium truncate mb-1" title={userRol === 'PROPIETARIO' ? cita.inquilinoNombre : cita.propietarioNombre}>
                              Con: {userRol === 'PROPIETARIO' ? cita.inquilinoNombre : cita.propietarioNombre}
                            </p>
                            {cita.inmuebleDireccion && (
                              <div className="flex items-start gap-1 mt-1 opacity-80">
                                <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] leading-tight line-clamp-2">{cita.inmuebleDireccion}</span>
                              </div>
                            )}

                            {/* Acciones para el que RECIBE la solicitud (Solo si NO eres Delegado) */}
                            {userRol !== 'DELEGADO' && cita.creadorId && cita.creadorId !== currentUser.id && cita.estado === 'PENDIENTE' && (
                              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => handleEstadoChange(cita.id, 'CONFIRMADA')}
                                  className="bg-emerald-500 text-white p-1.5 rounded-full hover:bg-emerald-600 shadow-md"
                                  title="Confirmar"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleEstadoChange(cita.id, 'CANCELADA')}
                                  className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600 shadow-md"
                                  title="Rechazar"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}

                            {/* Acción de Cancelar (Solo si NO eres Delegado) */}
                            {userRol !== 'DELEGADO' && ((cita.creadorId === currentUser.id && cita.estado === 'PENDIENTE') || cita.estado === 'CONFIRMADA') && (
                              <div className="absolute -bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => handleEstadoChange(cita.id, 'CANCELADA')}
                                  className="bg-rose-500 text-white px-2 py-1 text-xs rounded-full hover:bg-rose-600 shadow-md"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}

                            {/* Papelera si la cita ya está CANCELADA (Solo si NO eres Delegado) */}
                            {userRol !== 'DELEGADO' && cita.estado === 'CANCELADA' && (
                              <div className="absolute -bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={() => handleEliminarDeVista(cita.id)}
                                  className="bg-slate-500 text-white p-1.5 rounded-full hover:bg-slate-600 shadow-md"
                                  title="Quitar de mi vista"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}

                          </div>
                        ))}
                        {dayCitas.length === 0 && (
                          <div className="flex items-center justify-center h-full opacity-0">.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List View for mobile or summary */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Próximas Citas</h3>
            <div className="space-y-3">
              {citas.filter(c => parseISO(c.fechaHora) >= new Date()).length === 0 ? (
                <p className="text-slate-500 text-sm">No tienes citas próximas programadas.</p>
              ) : (
                citas
                  .filter(c => parseISO(c.fechaHora) >= new Date())
                  .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
                  .slice(0, 5)
                  .map(cita => (
                    <div key={`list-${cita.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center flex-shrink-0 ${getStatusColor(cita.estado).replace('border', '')}`}>
                          <span className="text-xs font-bold">{format(parseISO(cita.fechaHora), 'd')}</span>
                          <span className="text-[10px] uppercase">{format(parseISO(cita.fechaHora), 'MMM', { locale: es })}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            Visita con {userRol === 'PROPIETARIO' ? cita.inquilinoNombre : cita.propietarioNombre}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-slate-500">
                            <span className="text-xs flex items-center gap-1"><Clock size={12} /> {format(parseISO(cita.fechaHora), 'HH:mm')}</span>
                            {cita.inmuebleDireccion && <span className="text-xs flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]"><MapPin size={12} /> {cita.inmuebleDireccion}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Estado actual siempre visible */}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(cita.estado)}`}>
                          {cita.estado}
                        </span>

                        {/* Botón para eliminar de MI vista si está CANCELADA (Solo si NO eres Delegado) */}
                        {userRol !== 'DELEGADO' && cita.estado === 'CANCELADA' && (
                          <button
                            onClick={() => handleEliminarDeVista(cita.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar de mi calendario"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* BOTONES DE ACCIÓN: (Solo si NO eres Delegado) */}
                        {userRol !== 'DELEGADO' && cita.creadorId && (
                          <div className="flex items-center gap-2">
                            {/* 1. Si NO eres el creador y está PENDIENTE */}
                            {cita.creadorId !== currentUser.id && cita.estado === 'PENDIENTE' && (
                              <>
                                <button
                                  onClick={() => handleEstadoChange(cita.id, 'CONFIRMADA')}
                                  className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                  title="Confirmar"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleEstadoChange(cita.id, 'CANCELADA')}
                                  className="bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                                  title="Rechazar"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}

                            {/* 2. Si ERES el creador y está PENDIENTE, o si ya está CONFIRMADA */}
                            {((cita.creadorId === currentUser.id && cita.estado === 'PENDIENTE') || cita.estado === 'CONFIRMADA') && (
                              <button
                                onClick={() => handleEstadoChange(cita.id, 'CANCELADA')}
                                className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors border border-rose-100"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}