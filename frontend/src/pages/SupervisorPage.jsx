import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, User, FileText, Loader2 } from 'lucide-react';

export default function SupervisorPage() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPendientes = () => {
    setCargando(true);
    fetch(`${apiUrl}/api/supervisor/pendientes`)
      .then(res => res.json())
      .then(data => {
        setPendientes(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error fetching pendientes:", err);
        setCargando(false);
      });
  };

  useEffect(() => {
    fetchPendientes();
  }, [apiUrl]);

  const handleAccion = async (id, accion) => {
    try {
      const res = await fetch(`${apiUrl}/api/supervisor/${accion}/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        // Remove the user from the list
        setPendientes(pendientes.filter(p => p.id !== id));
      } else {
        alert(`Error al ${accion} la verificación`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  if (cargando) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-800">Panel de Supervisor</h1>
        </div>

        {pendientes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-slate-700">¡Todo al día!</h2>
            <p className="text-slate-500 mt-2">No hay verificaciones pendientes de revisar.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendientes.map(usuario => (
              <div key={usuario.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  {usuario.fotoPerfil ? (
                    <img src={usuario.fotoPerfil} alt={usuario.nombre} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{usuario.nombre}</h3>
                    <p className="text-sm text-slate-500">{usuario.email}</p>
                    <span className="inline-block mt-2 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                      {usuario.rol}
                    </span>
                  </div>
                </div>

                {/* Document Link */}
                <div className="flex-1">
                  <a 
                    href={usuario.documentoVerificacionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium border border-slate-200"
                  >
                    <FileText className="w-5 h-5 text-blue-500" />
                    Ver Documento
                  </a>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleAccion(usuario.id, 'denegar')}
                    className="flex-1 sm:flex-none p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="Denegar"
                  >
                    <XCircle className="w-6 h-6 mx-auto" />
                  </button>
                  <button 
                    onClick={() => handleAccion(usuario.id, 'aprobar')}
                    className="flex-1 sm:flex-none p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                    title="Aprobar"
                  >
                    <CheckCircle2 className="w-6 h-6 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
