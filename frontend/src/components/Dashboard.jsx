import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../format';
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

  const sent = transfers?.filter((t) => t.type === 'sent') ?? [];
  const received = transfers?.filter((t) => t.type === 'received') ?? [];
  const sum = (list) => list.reduce((acc, t) => acc + Number(t.amount), 0);

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
        <section className="card balance-card">
          <p className="greeting">Hola, {user.name.split(' ')[0]} 👋</p>
          <p className="balance-label">Saldo disponible</p>
          <p className="balance">{money(user.balance)}</p>

          {transfers !== null && (
            <div className="stats">
              <div className="stat">
                <span className="stat-label">↑ Enviado</span>
                <span className="stat-value">{money(sum(sent))}</span>
                <span className="stat-count">{sent.length} {sent.length === 1 ? 'movimiento' : 'movimientos'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">↓ Recibido</span>
                <span className="stat-value">{money(sum(received))}</span>
                <span className="stat-count">{received.length} {received.length === 1 ? 'movimiento' : 'movimientos'}</span>
              </div>
            </div>
          )}
        </section>

        {error && <p className="alert alert-error">{error}</p>}

        <section className="card">
          <h2>Enviar dinero</h2>
          <TransferForm balance={user.balance} onSuccess={refresh} />
        </section>

        <section className="card">
          <h2>Historial</h2>
          <History transfers={transfers} />
        </section>
      </main>
    </div>
  );
}
