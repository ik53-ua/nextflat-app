import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchesForUser } from '../services/api';
import { Eye } from 'lucide-react';


function formatFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function AvatarFallback({ nombre }) {
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
      <span className="text-violet-600 font-bold text-xl">{inicial}</span>
    </div>
  );
}

// Añadimos "index" a las props
function MatchCard({ match, onClick, onAvatarClick, index }) {
  const [imgError, setImgError] = useState(false);

  // Lógica para alternar colores: Pares (rosa suave), Impares (blanco)
  const bgColor = index % 2 === 0 ? 'bg-[#fff1f3]' : 'bg-white';

  return (
    <button
      onClick={() => onClick(match.matchId)}
      className={`w-full flex items-center gap-4 px-4 py-3 hover:opacity-80 active:opacity-60 transition-colors text-left ${bgColor}`}
    >
      {/* Avatar — clic independiente abre el perfil del candidato */}
      <div
        className="relative flex-shrink-0 group"
        onClick={(e) => { e.stopPropagation(); onAvatarClick(match.contactoId); }}
        title="Ver perfil"
      >
        {match.imagenContacto && !imgError ? (
          <img
            src={match.imagenContacto}
            alt={match.nombreContacto}
            className="w-14 h-14 rounded-full object-cover shadow-sm transition-opacity group-hover:opacity-75"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback nombre={match.nombreContacto} />
        )}
        {/* Ícono de ojo al hacer hover */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <Eye className="w-5 h-5 text-white" />
        </div>
      </div>
      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{match.nombreContacto}</p>
        {match.subtitulo && (
          <p className="text-sm text-slate-500 truncate">{match.subtitulo}</p>
        )}
      </div>
      {/* Fecha */}
      <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
        {formatFecha(match.fechaMatch)}
      </span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
      <span className="text-6xl">🏠</span>
      <h2 className="text-xl font-bold text-slate-700">Aún no tienes matches</h2>
      <p className="text-slate-500 text-sm">
        Sigue deslizando para encontrar tu match perfecto
      </p>
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userGuardado = localStorage.getItem('usuarioLogueado');
    const user = userGuardado ? JSON.parse(userGuardado) : null;
    const userId = user ? user.id : 1;

    getMatchesForUser(userId)
      .then(setMatches)
      .catch(() => setError('No se pudieron cargar los matches. Inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMatchClick = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  const handleAvatarClick = (contactoId) => {
    if (contactoId) navigate(`/candidato/${contactoId}`, { state: { readOnly: true } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full px-8 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        {matches.map((match, index) => (
          <MatchCard
            key={match.matchId}
            match={match}
            onClick={handleMatchClick}
            onAvatarClick={handleAvatarClick}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}