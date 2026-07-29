import { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegister, onGoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api('/register', {
        method: 'POST',
        body: { name, email, password },
      });
      onRegister(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>BeePay</h1>
        <h2>Crear cuenta</h2>

        {error && <p className="alert alert-error">{error}</p>}

        <label>
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña (mínimo 8 caracteres)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <p className="switch">
          ¿Ya tenés cuenta?{' '}
          <button type="button" className="link" onClick={onGoLogin}>
            Iniciá sesión
          </button>
        </p>
      </form>
    </div>
  );
}
