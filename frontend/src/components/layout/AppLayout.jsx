import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, SlidersHorizontal } from 'lucide-react';

// Profile Avatar
function ProfileAvatar({ user }) {
    const isPropietario = user.rol === 'PROPIETARIO';
    const initial = user.nombre?.charAt(0)?.toUpperCase() || '?';

    if (isPropietario) {
        return (
            <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-md select-none"
                title={user.nombre}
            >
                {initial}
            </div>
        );
    }

    return user.fotoPerfil ? (
        <img
            src={user.fotoPerfil}
            alt={user.nombre}
            className="w-9 h-9 rounded-full object-cover border-2 border-rose-400 shadow-md"
        />
    ) : (
        <div
            className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shadow-md select-none"
            title={user.nombre}
        >
            {initial}
        </div>
    );
}

// Bottom Tab Item
const tabs = [
    { to: '/filtros', label: 'Filtros',   Icon: SlidersHorizontal },
    { to: '/feed',    label: 'Descubrir', Icon: Home },
    { to: '/matches', label: 'Matches',   Icon: MessageCircle },
];

function BottomTab({ to, label, Icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200 ${
                    isActive
                        ? 'text-[#e8385d]'
                        : 'text-slate-400 hover:text-slate-600'
                }`
            }
        >
            <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[11px] font-semibold tracking-wide">{label}</span>
        </NavLink>
    );
}

// Main Layout
export default function AppLayout({ children }) {
    const navigate = useNavigate();

    // Recuperamos los datos del usuario logueado
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    // Función para cerrar la sesión
    const handleLogout = () => {
        localStorage.removeItem('usuarioLogueado');
        navigate('/login'); // Forzamos la redirección al login
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
            <header className="flex justify-between items-center px-5 py-3 bg-white shadow-sm z-20 relative">
                <h1 className="text-2xl font-extrabold tracking-tight"
                    style={{ color: '#e8385d' }}>
                    <Link to="/">NextFlat</Link>
                </h1>
                
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                {user.nombre}
                            </span>
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
            </header>

            {/* Page Content */}
            <main className="flex-1 relative overflow-auto">
                {children}
            </main>

            {user && (
                <nav className="flex bg-white border-t border-slate-200 z-20 safe-area-bottom">
                    {tabs.map(tab => (
                        <BottomTab key={tab.to} {...tab} />
                    ))}
                </nav>
            )}
        </div>
    );
}