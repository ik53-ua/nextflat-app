import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchesForUser } from '../services/api';

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

function MatchCard({ match, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={() => onClick(match.matchId)}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <div className="flex-shrink-0">
        {match.imagenContacto && !imgError ? (
          <img
            src={match.imagenContacto}
            alt={match.nombreContacto}
            className="w-14 h-14 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback nombre={match.nombreContacto} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{match.nombreContacto}</p>
        {match.subtitulo && (
          <p className="text-sm text-slate-500 truncate">{match.subtitulo}</p>
        )}
      </div>

      <span className="text-xs text-slate-400 flex-shrink-0">
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
  const [usuarioId, setUsuarioId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuarioId(user.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!usuarioId) return;
    setLoading(true);
    getMatchesForUser(usuarioId)
      .then(setMatches)
      .catch(() => setError('No se pudieron cargar los matches. Inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  const handleMatchClick = (matchId) => {
    navigate(`/chat/${matchId}`);
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
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800">Matches</h1>
        <p className="text-sm text-slate-500">{matches.length} conexiones activas</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {matches.map((match) => (
          <MatchCard key={match.matchId} match={match} onClick={handleMatchClick} />
        ))}
      </div>
    </div>
  );
}