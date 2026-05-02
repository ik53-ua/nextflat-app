import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import TenantFeed from './pages/TenantFeed';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PropertyDetails from './pages/PropertyDetails';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import MatchesPage from './pages/MatchesPage';
import OwnerFeed from './pages/OwnerFeed';
import MisInmuebles from './pages/MisInmuebles'; // Tu importación
import './App.css';

// Redirect raíz según rol del usuario logueado
function RootRedirect() {
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  if (user?.rol === 'PROPIETARIO') {
    return <Navigate to="/owner-feed" replace />;
  }
  return <Navigate to="/feed" replace />;
}

// Placeholder pages — will be built by the team later
function MatchesPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center space-y-2">
        <p className="text-5xl">💬</p>
        <p className="text-lg font-semibold">Matches</p>
        <p className="text-sm">Próximamente</p>
      </div>
    </div>
  );
}

function PerfilPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center space-y-2">
        <p className="text-5xl">👤</p>
        <p className="text-lg font-semibold">Mi Perfil</p>
        <p className="text-sm">Próximamente</p>
      </div>
    </div>
  );
}

function FiltrosPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="text-center space-y-2">
        <p className="text-5xl">🔍</p>
        <p className="text-lg font-semibold">Filtros</p>
        <p className="text-sm">Próximamente</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/feed" element={<TenantFeed />} />
          <Route path="/owner-feed" element={<OwnerFeed />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/filtros" element={<FiltrosPlaceholder />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          {/* Tu ruta integrada en el nuevo sistema */}
          <Route path="/mis-inmuebles" element={<MisInmuebles />} />
          
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;