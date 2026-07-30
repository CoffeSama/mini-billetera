import { useState } from 'react';
import { api } from '../api';

export default function Register({ onRegister, onGoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api('/register', {
        method: 'POST',
        body: {
          name,
          email,
          password,
          password_confirmation: confirm,
        },
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
            placeholder="Tu nombre completo"
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
            placeholder="tu@email.com"
            required
          />
        </label>

        <label>
          Contraseña (mínimo 8 caracteres)
          <div className="pw-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        <label>
          Repetir contraseña
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
