import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { getAuth, setAuth } from '../utils/storage';
import { useEffect } from 'react';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth, navigate]);

  const handleLogout = () => {
    setAuth(false);
    navigate('/login');
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="layout">
      <header className="header">
        <h1>Sistema de Conferência de Frete</h1>
        <nav className="nav">
          <NavLink to="/dashboard/taxas">Taxas e Fretes</NavLink>
          <NavLink to="/dashboard/conferencia">Conferência de Frete</NavLink>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

