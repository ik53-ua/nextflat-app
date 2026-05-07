import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import AgendarCitaModal from '../components/ui/AgendarCitaModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [contacto, setContacto] = useState(null); // {id, nombre, imagen}
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('usuarioLogueado')) || { id: 1 };
  const currentUserId = currentUser.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const fetchChatAndMessages = async () => {
    try {
      const chatRes = await fetch(`${API_URL}/api/chats/match/${matchId}`);
      if (!chatRes.ok) throw new Error('Chat no encontrado');
      const chatData = await chatRes.json();
      setChat(chatData);
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

  // Load chat and initial messages
  useEffect(() => {
    fetchChatAndMessages();
  }, [matchId]);

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

  const handleAgendarSubmit = async (citaData) => {
    try {
      if (!contacto || !contacto.id) {
        alert('Cargando datos del contacto, inténtalo de nuevo.');
        return;
      }
      const isPropietario = currentUser.rol === 'PROPIETARIO';
      const propietarioId = isPropietario ? currentUserId : contacto.id;
      const inquilinoId = isPropietario ? contacto.id : currentUserId;

      const res = await fetch(`${API_URL}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propietarioId: propietarioId,
          inquilinoId: inquilinoId,
          inmuebleId: null, // No disponemos del inmuebleId exacto en esta vista
          ...citaData
        })
      });

      if (res.ok) {
        await fetch(`${API_URL}/api/chats/${chatId}/mensajes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emisorId: currentUserId,
            contenido: `🗓️ He propuesto una visita para el ${citaData.fechaHora.replace('T', ' a las ')}. Motivo: ${citaData.motivo}`
          })
        });
        fetchChatAndMessages();
        setIsModalOpen(false);
        alert('Cita solicitada correctamente.');
      } else {
        alert('Error al solicitar la cita.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
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
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-[#e8385d] hover:bg-rose-50 rounded-full transition-colors"
              title="Agendar visita"
            >
              <CalendarIcon size={20} />
            </button>
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
      
      <AgendarCitaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAgendarSubmit} 
        inmuebleId={chat?.inmuebleId}
      />
    </div>
  );
}
