import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, SlidersHorizontal, Users, Building2, BadgeCheck, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

// Profile Avatar
function ProfileAvatar({ user }) {
    const isPropietario = user.rol === 'PROPIETARIO';
    const initial = user.nombre?.charAt(0)?.toUpperCase() || '?';

    if (user.fotoPerfil) {
        return (
            <img
                src={user.fotoPerfil}
                alt={user.nombre}
                className={`w-9 h-9 rounded-full object-cover shadow-md ${user.rol === 'PROPIETARIO' ? 'border-2 border-rose-400' : 'border-2 border-indigo-400'
                    }`}
            />
        );
    }

    return (
        <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-md select-none"
            title={user.nombre}
        >
            {initial}
        </div>
    );
}

// Bottom Tab Item — defined outside to stay pure (tabs array is now role-dynamic)
function BottomTab({ to, label, Icon, activeAlso }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => {
                // also highlight when on a related sub-route (activeAlso list)
                const extraActive = activeAlso?.some(path => window.location.pathname.startsWith(path));
                return `flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 ${isActive || extraActive
                    ? 'text-[#e8385d]'
                    : 'text-slate-400 hover:text-slate-600'
                    }`;
            }}
        >
            <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[11px] font-semibold tracking-wide">{label}</span>
        </NavLink>
    );
}

// Main Layout
export default function AppLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [toastDenegado, setToastDenegado] = useState(false);

    // Rutas en las que ocultamos el header y la nav inferior (vistas de detalle inmersivas)
    const isDetailPage = location.pathname.startsWith('/property/') || location.pathname.startsWith('/candidato/');

    useEffect(() => {
        if (sessionStorage.getItem('toastVerificacion') === 'denegado') {
            setToastDenegado(true);
            sessionStorage.removeItem('toastVerificacion');
            setTimeout(() => setToastDenegado(false), 5000);
        }
    }, [location]);

    // Recuperamos los datos del usuario logueado
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    // Función para cerrar la sesión
    const handleLogout = () => {
        localStorage.removeItem('usuarioLogueado');
        navigate('/login'); // Forzamos la redirección al login
    };

    const isPropietario = user?.rol === 'PROPIETARIO';
    const homeRoute = isPropietario ? '/owner-feed' : '/feed';

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
            {!isDetailPage && <header className="flex justify-between items-center px-5 py-3 bg-white shadow-sm z-20 relative">
                <h1 className="text-2xl font-extrabold tracking-tight"
                    style={{ color: '#e8385d' }}>
                    <Link to={homeRoute}>NextFlat</Link>
                </h1>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="flex items-center gap-1 hidden sm:flex">
                                {/* Si es premium, aplicamos un gradiente dorado, si no, gris normal */}
                                <span className={`text-sm ${user.esPremium
                                    ? 'font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500'
                                    : 'font-medium text-slate-700'
                                    }`}>
                                    {user.nombre}
                                </span>

                                {/* Corona si es Premium */}
                                {user.esPremium && (
                                    <span className="text-xs mr-0.5 animate-pulse" title="Usuario Premium"></span>
                                )}

                                {/* Badge azul si está verificado */}
                                {user.estadoVerificacion === 'VERIFICADO' && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500" title="Verificado" />
                                )}
                            </div>
                            <Link to="/perfil" className="focus:outline-none">
                                <ProfileAvatar user={user} />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-slate-400 hover:text-red-600 font-semibold transition-colors ml-2"
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-[#e8385d]">
                                Entrar
                            </Link>
                            <Link to="/register" className="text-sm font-semibold bg-[#e8385d] text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors">
                                Registro
                            </Link>
                        </div>
                    )}
                </div>
            </header>}

            {/* Page Content */}
            <main className="flex-1 relative overflow-auto">
                {/* Toast de verificación denegada */}
                {toastDenegado && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm">
                        <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">Verificación Denegada</h4>
                                <p className="text-xs text-red-100 mt-1">
                                    Tu documento fue rechazado. Por favor, intenta subir uno nuevo desde tu perfil.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {children}
            </main>

            {!isDetailPage && user && user.rol !== 'SUPERVISOR' && (() => {
                const isPropietario = user.rol === 'PROPIETARIO';
                const tabs = isPropietario
                    ? [
                        { to: '/owner-feed', label: 'Candidatos', Icon: Users },
                        { to: '/mis-inmuebles', label: 'Mis Pisos', Icon: Building2 },
                        { to: '/matches', label: 'Matches', Icon: MessageCircle },
                        { to: '/calendario', label: 'Agenda', Icon: CalendarIcon },
                    ]
                    : [
                        { to: '/feed', label: 'Descubrir', Icon: Home },
                        { to: '/filtros', label: 'Filtros', Icon: SlidersHorizontal },
                        { to: '/matches', label: 'Matches', Icon: MessageCircle },
                        { to: '/calendario', label: 'Agenda', Icon: CalendarIcon },
                    ];
                return (
                    <nav className="flex bg-white border-t border-slate-200 z-20 safe-area-bottom">
                        {tabs.map(tab => (
                            <BottomTab key={tab.to} {...tab} />
                        ))}
                    </nav>
                );
            })()}
        </div>
    );
}