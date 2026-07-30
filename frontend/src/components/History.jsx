import { money, fecha } from '../format';

export default function History({ transfers, limit }) {
  if (transfers === null) {
    return (
      <div aria-label="Cargando historial">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="empty">
        <span className="empty-icon">🗒️</span>
        <p>Todavía no hay movimientos.</p>
        <p className="muted">Cuando envíes o recibas dinero, va a aparecer acá.</p>
      </div>
    );
  }

  const visible = limit ? transfers.slice(0, limit) : transfers;

  return (
    <ul className="history">
      {visible.map((t, i) => {
        const sent = t.type === 'sent';
        return (
          <li
            key={t.id}
            className="history-item"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div>
              <p className="history-title">
                {sent ? 'Enviado a' : 'Recibido de'} {t.counterparty.name}
                <span className="muted"> ({t.counterparty.email})</span>
              </p>
              {t.description && <p className="muted">“{t.description}”</p>}
              <p className="muted">{fecha(t.date)}</p>
            </div>
            <span className={sent ? 'amount amount-sent' : 'amount amount-received'}>
              {sent ? '−' : '+'} {money(t.amount)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
