import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, SlidersHorizontal } from 'lucide-react';

// ── Fake user for skeleton (will be replaced by real auth context later) ──
const MOCK_USER = {
    nombre: 'Iván',
    rol: 'INQUILINO', // 'INQUILINO' | 'PROPIETARIO'
    fotoPerfil: 'https://randomuser.me/api/portraits/men/32.jpg',
};

// ── Profile Avatar ──────────────────────────────────────────────────────────
function ProfileAvatar({ user }) {
    const isPropietario = user.rol === 'PROPIETARIO';
    const initial = user.nombre?.charAt(0)?.toUpperCase() || '?';

    if (isPropietario) {
        // Propietario → coloured circle with first letter
        return (
            <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-md select-none"
                title={user.nombre}
            >
                {initial}
            </div>
        );
    }

    // Inquilino → photo (with fallback to initial)
    return user.fotoPerfil ? (
        <img
            src={user.fotoPerfil}
            alt={user.nombre}
            className="w-9 h-9 rounded-full object-cover border-2 border-primary-400 shadow-md"
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

// ── Bottom Tab Item ─────────────────────────────────────────────────────────
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
                        ? 'text-primary-500'
                        : 'text-slate-400 hover:text-slate-600'
                }`
            }
        >
            <Icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[11px] font-semibold tracking-wide">{label}</span>
        </NavLink>
    );
}

// ── Main Layout ─────────────────────────────────────────────────────────────
export default function AppLayout({ children }) {
    const user = MOCK_USER; // Will be replaced by useAuth() or similar

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
            {/* ─── Top Header ─── */}
            <header className="flex justify-between items-center px-5 py-3 bg-white shadow-sm z-20 relative">
                <h1 className="text-2xl font-extrabold tracking-tight"
                    style={{ color: '#e8385d' }}>
                    NextFlat
                </h1>
                <Link to="/perfil" className="focus:outline-none">
                    <ProfileAvatar user={user} />
                </Link>
            </header>

            {/* ─── Page Content ─── */}
            <main className="flex-1 relative overflow-hidden">
                {children}
            </main>

            {/* ─── Bottom Navigation Bar ─── */}
            <nav className="flex bg-white border-t border-slate-200 z-20 safe-area-bottom">
                {tabs.map(tab => (
                    <BottomTab key={tab.to} {...tab} />
                ))}
            </nav>
        </div>
    );
}
