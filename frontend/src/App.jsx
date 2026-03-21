import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MisInmuebles from './pages/MisInmuebles';
import MiPerfil from './pages/MiPerfil';

function App() {
  return (
    <Router>
      <nav style={{ padding: '15px', background: '#1f2937', color: 'white', display: 'flex', gap: '20px' }}>
        <h2 style={{ margin: 0, marginRight: '20px' }}>NextFlat</h2>
        <Link to="/mis-inmuebles" style={{ color: 'white', textDecoration: 'none', marginTop: '5px' }}>
          Mis Inmuebles
        </Link>
        <Link to="/mi-perfil" style={{ color: 'white', textDecoration: 'none', marginTop: '5px' }}>
          Mi Perfil
        </Link>
      </nav>

      <div className="main-content">
        <Routes>
          <Route path="/mis-inmuebles" element={<MisInmuebles />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>Bienvenido a NextFlat 🏠</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;