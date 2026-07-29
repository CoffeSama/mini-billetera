export default function History({ transfers }) {
  if (transfers === null) {
    return <p className="muted">Cargando historial…</p>;
  }

  if (transfers.length === 0) {
    return <p className="muted">Todavía no hay movimientos.</p>;
  }

  return (
    <ul className="history">
      {transfers.map((t) => {
        const sent = t.type === 'sent';
        return (
          <li key={t.id} className="history-item">
            <div>
              <p className="history-title">
                {sent ? 'Enviado a' : 'Recibido de'} {t.counterparty.name}
                <span className="muted"> ({t.counterparty.email})</span>
              </p>
              {t.description && <p className="muted">{t.description}</p>}
              <p className="muted">{new Date(t.date).toLocaleString('es-BO')}</p>
            </div>
            <span className={sent ? 'amount amount-sent' : 'amount amount-received'}>
              {sent ? '−' : '+'} Bs {Number(t.amount).toFixed(2)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
