import { useState, useEffect } from 'react';
import { uploadImage } from '../services/supabase';
import { ShieldCheck, Upload, FileCheck2, Loader2, BadgeCheck } from 'lucide-react';

export default function VerificacionPerfil({ usuarioId }) {
  const [estado, setEstado] = useState(null); // null = cargando
  const [archivo, setArchivo] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Carga el estado real desde el servidor al montar
  useEffect(() => {
    if (!usuarioId) return;
    fetch(`${apiUrl}/api/usuarios/${usuarioId}`)
      .then(res => res.json())
      .then(user => {
        if (user.estadoVerificacion) {
          setEstado(user.estadoVerificacion.toLowerCase());
        } else {
          setEstado('no_verificado');
        }
      })
      .catch(() => setEstado('no_verificado'));
  }, [usuarioId, apiUrl]);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setNombreArchivo(file.name);
      setError('');
    }
  };

  const solicitarVerificacion = async (e) => {
    e.preventDefault();
    if (!archivo) return setError('Selecciona un archivo antes de continuar.');

    setSubiendo(true);
    setError('');

    try {
      // 1. Subimos el archivo real a Supabase (bucket 'documentos')
      const urlSubida = await uploadImage('documentos', archivo);

      if (!urlSubida) {
        setError('Error al subir el archivo a la nube. Inténtalo de nuevo.');
        setSubiendo(false);
        return;
      }

      // 2. Persistimos la URL en el backend
      const respuesta = await fetch(`${apiUrl}/api/usuarios/${usuarioId}/solicitar-verificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlSubida })
      });

      if (respuesta.ok) {
        // 3. Actualizamos también el localStorage para que el resto de la app lo sepa
        const usuarioGuardado = localStorage.getItem('usuarioLogueado');
        if (usuarioGuardado) {
          const user = JSON.parse(usuarioGuardado);
          localStorage.setItem('usuarioLogueado', JSON.stringify({
            ...user,
            estadoVerificacion: 'EN_REVISION',
            documentoVerificacionUrl: urlSubida
          }));
        }
        setEstado('en_revision');
      } else {
        setError('El servidor rechazó la solicitud. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error en verificación:', err);
      setError('Error de conexión. Comprueba tu red.');
    } finally {
      setSubiendo(false);
    }
  };

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (estado === null) {
    return (
      <div className="flex items-center gap-2 py-3 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Comprobando estado de verificación...</span>
      </div>
    );
  }

  // ── VERIFICADO ───────────────────────────────────────────────────────────────
  if (estado === 'verificado') {
    return (
      <div className="rounded-2xl overflow-hidden border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <BadgeCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-blue-800 text-sm">¡Identidad Verificada!</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Tienes el <span className="font-bold">✓ Check Azul</span> — tu perfil destaca sobre el resto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── EN REVISIÓN ──────────────────────────────────────────────────────────────
  if (estado === 'en_revision') {
    return (
      <div className="rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center shadow-lg flex-shrink-0">
            <FileCheck2 className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-amber-800 text-sm">Documento en revisión</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Un administrador revisará tu documento pronto. Recibirás el Check Azul cuando sea aprobado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── NO VERIFICADO / DENEGADO — Formulario ───────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Cabecera azul */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)' }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <BadgeCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-black text-white text-sm">Obtén el Check Azul ✓</p>
          <p className="text-xs text-blue-100 mt-0.5">Sube tu DNI, nómina o matrícula universitaria</p>
        </div>
      </div>

      {estado === 'denegado' && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          Tu solicitud anterior fue denegada. Por favor, sube un documento válido y legible.
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={solicitarVerificacion} className="px-5 py-4 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Los usuarios verificados generan más confianza y aparecen destacados en el feed.
          Tu documento es privado y solo lo verán los administradores.
        </p>

        {/* Zona de subida */}
        <label
          htmlFor="doc-verificacion"
          className="flex flex-col items-center justify-center gap-2 w-full py-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: archivo ? '#2563eb' : '#cbd5e1',
            background: archivo ? '#eff6ff' : '#f8fafc'
          }}
        >
          {archivo ? (
            <>
              <FileCheck2 className="w-7 h-7 text-blue-500" />
              <span className="text-xs font-bold text-blue-700 text-center px-2 truncate max-w-full">{nombreArchivo}</span>
              <span className="text-[10px] text-blue-500">Toca para cambiar el archivo</span>
            </>
          ) : (
            <>
              <Upload className="w-7 h-7 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Toca para seleccionar archivo</span>
              <span className="text-[10px] text-slate-400">PDF, JPG o PNG · Máx. 5 MB</span>
            </>
          )}
          <input
            id="doc-verificacion"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleArchivoChange}
            className="hidden"
          />
        </label>

        {error && (
          <p className="text-[11px] font-semibold text-red-500 px-1">{error}</p>
        )}

        {/* Botón azul */}
        <button
          type="submit"
          disabled={!archivo || subiendo}
          className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
        >
          {subiendo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subiendo documento...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Solicitar verificación ✓
            </>
          )}
        </button>
      </form>
    </div>
  );
}