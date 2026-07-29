import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import TransferForm from './TransferForm';
import History from './History';

export default function Dashboard({ user, setUser, onLogout }) {
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="brand">BeePay</span>
        <div className="topbar-right">
          <span>{user.name}</span>
          <button type="button" className="secondary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main>
        <section className="card balance-card">
          <p className="balance-label">Saldo disponible</p>
          <p className="balance">
            Bs {Number(user.balance).toFixed(2)}
          </p>
        </section>

        {error && <p className="alert alert-error">{error}</p>}

        <section className="card">
          <h2>Enviar dinero</h2>
          <TransferForm onSuccess={refresh} />
        </section>

        <section className="card">
          <h2>Historial</h2>
          <History transfers={transfers} />
        </section>
      </main>
    </div>
  );
}
