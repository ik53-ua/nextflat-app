import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import TenantFeed from './pages/TenantFeed';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PropertyDetails from './pages/PropertyDetails';
import CandidatoDetails from './pages/CandidatoDetails';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import MatchesPage from './pages/MatchesPage';
import OwnerFeed from './pages/OwnerFeed';
import MisInmuebles from './pages/MisInmuebles';
import EditarInmueble from './pages/EditarInmueble';
import AltaInmueble from './pages/AltaInmueble';
import SupervisorPage from './pages/SupervisorPage';
import ChatPage from './pages/ChatPage';
import './App.css';
import GrupoDetails from './pages/GrupoDetails';

// Redirect raíz según rol del usuario logueado
function RootRedirect() {
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  if (user?.rol === 'SUPERVISOR') {
    return <Navigate to="/supervisor" replace />;
  }
  if (user?.rol === 'PROPIETARIO') {
    return <Navigate to="/owner-feed" replace />;
  }
  return <Navigate to="/feed" replace />;
}

// Protected Route para el Supervisor
function SupervisorRoute({ children }) {
  const usuarioGuardado = localStorage.getItem('usuarioLogueado');
  const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  if (!user || user.rol !== 'SUPERVISOR') {
    return <Navigate to="/" replace />;
  }

  return children;
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
          <Route path="/candidato/:id" element={<CandidatoDetails />} />
          <Route path="/filtros" element={<TenantFeed />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/chat/:matchId" element={<ChatPage />} />

          {/* Tu ruta integrada en el nuevo sistema */}
          <Route path="/mis-inmuebles" element={<MisInmuebles />} />
          <Route path="/mis-inmuebles/nuevo" element={<AltaInmueble />} />
          <Route path="/mis-inmuebles/editar/:id" element={<EditarInmueble />} />
          <Route path="/supervisor" element={
            <SupervisorRoute>
              <SupervisorPage />
            </SupervisorRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          <Route path="/grupo/:id" element={<GrupoDetails />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;