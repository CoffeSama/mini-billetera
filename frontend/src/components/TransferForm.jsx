import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { money } from '../format';

const QUICK_AMOUNTS = [10, 50, 100];

export default function TransferForm({ balance, contacts = [], onSuccess }) {
  const amountRef = useRef(null);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // El mensaje de éxito se oculta solo a los 4 segundos.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  // Aviso temprano de UX; la validación real siempre es del backend.
  const exceedsBalance = amount !== '' && Number(amount) > Number(balance);

  // Con el modal abierto, bloqueamos el scroll del fondo.
  useEffect(() => {
    document.body.style.overflow = confirming ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [confirming]);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setConfirming(true);
  }

  async function confirmTransfer() {
    setLoading(true);
    setError(null);
    try {
      await api('/transfers', {
        method: 'POST',
        body: {
          email,
          amount: Number(amount),
          description: description || null,
        },
      });
      // Cerramos el modal ANTES de limpiar los campos: si limpiáramos primero,
      // el modal abierto mostraría "Bs 0,00" por un instante.
      setConfirming(false);
      setSuccess('✓ Transferencia realizada.');
      setEmail('');
      setAmount('');
      setDescription('');
      await onSuccess();
    } catch (err) {
      setConfirming(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}

        {contacts.length > 0 && (
          <div className="contacts">
            <span className="contacts-label">Recientes:</span>
            {contacts.map((c) => (
              <button
                key={c.email}
                type="button"
                className={`contact ${email === c.email ? 'contact-active' : ''}`}
                title={c.email}
                onClick={() => {
                  setEmail(c.email);
                  amountRef.current?.focus();
                }}
              >
                <span className="contact-avatar">{c.name.charAt(0).toUpperCase()}</span>
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        <label>
          Email del destinatario
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="destinatario@ejemplo.com"
            required
          />
        </label>

        <label>
          Monto (Bs)
          <input
            ref={amountRef}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
          />
        </label>

        <div className="chips">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              className="chip"
              onClick={() => setAmount(String(q))}
            >
              Bs {q}
            </button>
          ))}
        </div>

        {exceedsBalance && (
          <p className="warn">El monto supera tu saldo disponible ({money(balance)}).</p>
        )}

        <label>
          Descripción (opcional)
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Para qué es?"
            maxLength={255}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      {/* Portal: el modal se renderiza en <body>, fuera de las tarjetas.
          Si quedara adentro, el transform de la animación de la tarjeta
          convertiría a la tarjeta en el contenedor del position:fixed. */}
      {confirming && createPortal(
        <div className="modal-overlay" onClick={() => !loading && setConfirming(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar transferencia</h3>
            <p className="modal-amount">{money(amount)}</p>
            <p className="modal-detail">
              para <b>{email}</b>
              {description && <><br /><span className="muted">“{description}”</span></>}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="button" onClick={confirmTransfer} disabled={loading}>
                {loading ? 'Enviando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
