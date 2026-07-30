import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
import TransferForm from './TransferForm';
import History from './History';

export default function Dashboard({ user, setUser, onLogout }) {
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('home'); // 'home' | 'history'

  // Refresca saldo e historial juntos (al entrar y después de cada transferencia).
  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [me, history] = await Promise.all([api('/me'), api('/transfers')]);
      setUser(me.user);
      setTransfers(history.transfers);
    } catch (err) {
      setError(err.message);
    }
  }, [setUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Contactos recientes: contrapartes únicas del historial (ya viene ordenado
  // por fecha desc), máximo 4, para reenviar sin tipear el email.
  const contacts = [];
  for (const t of transfers ?? []) {
    if (!contacts.some((c) => c.email === t.counterparty.email)) {
      contacts.push(t.counterparty);
    }
    if (contacts.length === 4) break;
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="brand">BeePay</span>
        <div className="topbar-right">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <span>{user.name}</span>
          <button type="button" className="secondary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main>
        {view === 'home' ? (
          <>
            <section className="card balance-card">
              <p className="greeting">Hola, {user.name.split(' ')[0]} 👋</p>
              <p className="balance-label">Saldo disponible</p>
              {/* key={balance}: al cambiar el saldo, React remonta el nodo
                  y la animación de "pop" se reproduce de nuevo. */}
              <p className="balance" key={user.balance}>{money(user.balance)}</p>
            </section>

            {error && <p className="alert alert-error">{error}</p>}

            <section className="card">
              <h2>Enviar dinero</h2>
              <TransferForm balance={user.balance} contacts={contacts} onSuccess={refresh} />
            </section>

            <section className="card">
              <div className="section-head">
                <h2>Movimientos recientes</h2>
                {transfers?.length > 0 && (
                  <button
                    type="button"
                    className="link"
                    onClick={() => setView('history')}
                  >
                    Ver historial completo →
                  </button>
                )}
              </div>
              <History transfers={transfers} limit={3} />
            </section>
          </>
        ) : (
          <section className="card">
            <div className="section-head">
              <h2>Historial</h2>
              <button type="button" className="link" onClick={() => setView('home')}>
                ← Volver
              </button>
            </div>
            {error && <p className="alert alert-error">{error}</p>}
            <History transfers={transfers} />
          </section>
        )}
      </main>
    </div>
  );
}
