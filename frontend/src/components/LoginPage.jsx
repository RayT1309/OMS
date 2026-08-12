import { useState } from 'react';
import { api } from '../api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">OMS</div>
        <h1>Offender Management System</h1>
        <p className="subtitle">Sign in to continue</p>

        <label className="form-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 4 }}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="login-hint">Demo: admin@dcs.gov.za / admin123</p>
      </form>
    </div>
  );
}
