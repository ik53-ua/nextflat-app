import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, Star, MessageSquareText, X, Loader2 } from 'lucide-react';
import ValoracionModal from '../components/ui/ValoracionModal';
import StarRating from '../components/ui/StarRating';
import { checkYaValorado, getStatsValoracion, getValoracionesUsuario } from '../services/api';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [contacto, setContacto] = useState(null); // {id, nombre, imagen}
  const messagesEndRef = useRef(null);


  const [showValoracionModal, setShowValoracionModal] = useState(false);
  const [yaValorado, setYaValorado] = useState(false);
  const [checkingValoracion, setCheckingValoracion] = useState(false);

  const [showResenasPanel, setShowResenasPanel] = useState(false);
  const [statsContacto, setStatsContacto] = useState(null);
  const [resenasContacto, setResenasContacto] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(false);

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('usuarioLogueado')) || { id: 1 };
  const currentUserId = currentUser.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Load chat and initial messages
  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        const chatRes = await fetch(`${API_URL}/api/chats/match/${matchId}`);
        if (!chatRes.ok) throw new Error('Chat no encontrado');
        const chatData = await chatRes.json();
        setChatId(chatData.id);

        // Cargar el match para obtener datos del contacto
        const matchesRes = await fetch(`${API_URL}/api/matches/${currentUserId}`);
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          const thisMatch = matchesData.find(m => m.matchId === Number(matchId));
          if (thisMatch) {
            setContacto({
              id: thisMatch.contactoId,
              nombre: thisMatch.nombreContacto,
              imagen: thisMatch.imagenContacto,
            });
          }
        }

        const msgRes = await fetch(`${API_URL}/api/chats/${chatData.id}/mensajes`);
        const msgData = await msgRes.json();
        setMessages(msgData);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChatAndMessages();
  }, [matchId]);


  useEffect(() => {
    if (!currentUserId || !contacto?.id) return;
    checkYaValorado(currentUserId, contacto.id)
      .then(setYaValorado)
      .catch(() => { });
  }, [currentUserId, contacto?.id]);

  useEffect(() => {
    if (!showResenasPanel || !contacto?.id) return;
    setLoadingResenas(true);
    Promise.all([
      getStatsValoracion(contacto.id),
      getValoracionesUsuario(contacto.id),
    ])
      .then(([stats, lista]) => {
        setStatsContacto(stats);
        setResenasContacto(lista);
      })
      .catch(() => { })
      .finally(() => setLoadingResenas(false));
  }, [showResenasPanel, contacto?.id]);


  // Polling for new messages
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await fetch(`${API_URL}/api/chats/${chatId}/mensajes`);
        const msgData = await msgRes.json();
        setMessages(msgData);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatId) return;

    const content = inputMessage.trim();
    setInputMessage(''); // clear early for better UX

    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emisorId: currentUserId,
          contenido: content
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      } else {
        const errorText = await res.text();
        console.error('Server returned error:', res.status, errorText);
        alert('Error al enviar el mensaje. Código: ' + res.status);
        setInputMessage(content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error de red al enviar el mensaje');
      setInputMessage(content); // restore on error
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#e8385d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden font-sans">
      {/* Premium Glassmorphism Header */}
      <div className="absolute top-0 w-full z-10">
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {contacto?.nombre || 'Chat del Match'}
            </h1>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              En línea
            </span>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setShowValoracionModal(true)}
                disabled={yaValorado}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                  ${yaValorado
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 active:scale-95'}`}
              >
                <Star className={`w-3 h-3 ${yaValorado ? '' : 'fill-amber-400'}`} />
                {yaValorado ? 'Valorado' : 'Valorar'}
              </button>

              <button
                onClick={() => setShowResenasPanel(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <MessageSquareText className="w-3 h-3" />
                Ver reseñas
              </button>
            </div>
          </div>
          {/* Avatar del contacto — clic abre el perfil */}
          <button
            onClick={() => contacto?.id && navigate(`/candidato/${contacto.id}`, { state: { readOnly: true } })}
            className="relative group focus:outline-none"
            title="Ver perfil"
          >
            {contacto?.imagen ? (
              <img
                src={contacto.imagen}
                alt={contacto.nombre}
                className="w-10 h-10 rounded-full object-cover shadow-md transition-opacity group-hover:opacity-75"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e8385d] to-[#ff7b93] flex items-center justify-center shadow-md text-white font-bold">
                {contacto?.nombre?.charAt(0)?.toUpperCase() || 'NF'}
              </div>
            )}
            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-[-10%] w-64 h-64 bg-[#e8385d]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-[-10%] w-64 h-64 bg-[#ff7b93]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-24 pb-20 space-y-4 z-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-gray-500 font-medium">¡Rompe el hielo!</p>
            <p className="text-xs text-gray-400 mt-1">Este es el comienzo de vuestra conversación.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.emisorId === currentUserId;
            // Simple animation for new messages
            const isNew = idx === messages.length - 1;
            return (
              <div
                key={msg.id || idx}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isNew ? 'animate-fade-in-up' : ''}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm relative ${isMe
                    ? 'bg-gradient-to-br from-[#e8385d] to-[#c0284a] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.contenido}</p>
                  <span className={`text-[10px] mt-1 block text-right opacity-70 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                    {msg.fecha ? new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200/50 p-4 z-10">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full bg-gray-100 border-none text-gray-800 px-5 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e8385d]/50 transition-all placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`p-3.5 rounded-full flex items-center justify-center transition-all ${inputMessage.trim()
              ? 'bg-[#e8385d] text-white shadow-md hover:bg-[#c0284a] active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send size={20} className={inputMessage.trim() ? "ml-0.5" : ""} />
          </button>
        </form>
      </div>

      {showValoracionModal && contacto && (
        <ValoracionModal
          autorId={currentUserId}
          destino={{ id: contacto.id, nombre: contacto.nombre, fotoPerfil: contacto.imagen }}
          onClose={() => setShowValoracionModal(false)}
          onSuccess={() => setYaValorado(true)}
        />
      )}

      {showResenasPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowResenasPanel(false)} />
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300">

            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {contacto?.imagen ? (
                  <img src={contacto.imagen} alt={contacto.nombre} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-[#e8385d] font-black">
                    {contacto?.nombre?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-black text-slate-800 text-sm">{contacto?.nombre}</p>
                  <p className="text-xs text-slate-400">Reseñas recibidas</p>
                </div>
              </div>
              <button onClick={() => setShowResenasPanel(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {statsContacto && (
              <div className="flex items-center gap-4 px-5 py-4 bg-amber-50 border-b border-amber-100">
                <span className="text-4xl font-black text-slate-800">
                  {statsContacto.total > 0 ? statsContacto.media?.toFixed(1) : '—'}
                </span>
                <div>
                  <StarRating value={Math.round(statsContacto.media ?? 0)} readonly size={18} />
                  <p className="text-xs text-slate-500 mt-0.5">
                    {statsContacto.total} reseña{statsContacto.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingResenas ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#e8385d]" />
                </div>
              ) : resenasContacto.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <MessageSquareText className="w-10 h-10 text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Sin reseñas todavía</p>
                  <p className="text-xs text-slate-300 mt-1">Sé el primero en valorar a {contacto?.nombre?.split(' ')[0]}</p>
                </div>
              ) : (
                resenasContacto.map((v) => (
                  <div key={v.id} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {v.autorFoto ? (
                      <img src={v.autorFoto} alt={v.autorNombre} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-[#e8385d] font-black text-sm flex-shrink-0">
                        {v.autorNombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800 text-sm truncate">{v.autorNombre}</p>
                        <StarRating value={v.puntuacion} readonly size={13} />
                      </div>
                      {v.comentario && (
                        <p className="text-sm text-slate-600 leading-snug">{v.comentario}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(v.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Inject custom animation styles */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
