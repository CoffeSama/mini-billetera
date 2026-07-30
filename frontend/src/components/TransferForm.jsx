import { useEffect, useState } from 'react';
import { api } from '../api';

export default function TransferForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // El mensaje de éxito se oculta solo a los 4 segundos.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api('/transfers', {
        method: 'POST',
        body: {
          email,
          amount: Number(amount),
          description: description || null,
        },
      });
      setSuccess('✓ Transferencia realizada.');
      setEmail('');
      setAmount('');
      setDescription('');
      await onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

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
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          placeholder="0.00"
          required
        />
      </label>

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
  );
}
