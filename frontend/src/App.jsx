import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [view, setView] = useState('login');

  // Si hay un token guardado, intentamos recuperar la sesión.
  useEffect(() => {
    if (!getToken()) return;
    api('/me')
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  function handleAuth(data) {
    setToken(data.token);
    setUser(data.user);
  }

  async function handleLogout() {
    try {
      await api('/logout', { method: 'POST' });
    } catch {
      // Si el logout falla en el servidor, igual cerramos la sesión local.
    }
    setToken(null);
    setUser(null);
    setView('login');
  }

  if (checking) {
    return <p className="page-status">Cargando…</p>;
  }

  if (!user) {
    return view === 'login' ? (
      <Login onLogin={handleAuth} onGoRegister={() => setView('register')} />
    ) : (
      <Register onRegister={handleAuth} onGoLogin={() => setView('login')} />
    );
  }

  return <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />;
}
