import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { routeForRole } from '../utils/roleRoutes';

export function LoginPage() {
  const { user, login, register, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <LoadingSpinner label="Loading session..." />;
  }

  if (user) {
    return <Navigate to={routeForRole(user.role)} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
    } catch (requestError) {
      setError('Authentication request failed. Verify credentials and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel/90 p-8 shadow-card backdrop-blur">
        <h1 className="font-display text-3xl text-accent">AEGIS-X</h1>
        <p className="mt-2 text-sm text-muted">Enterprise Security Operations Platform</p>

        <div className="mt-6 flex rounded-lg border border-line bg-panelAlt p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md px-3 py-2 ${mode === 'login' ? 'bg-accent/20 text-white' : 'text-muted'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md px-3 py-2 ${mode === 'register' ? 'bg-accent/20 text-white' : 'text-muted'}`}
          >
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Email</label>
            <input
              className="w-full rounded-md border border-line bg-panelAlt px-3 py-2 text-sm outline-none focus:border-accent"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Username</label>
              <input
                className="w-full rounded-md border border-line bg-panelAlt px-3 py-2 text-sm outline-none focus:border-accent"
                type="text"
                value={username}
                onChange={event => setUsername(event.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-muted">Password</label>
            <input
              className="w-full rounded-md border border-line bg-panelAlt px-3 py-2 text-sm outline-none focus:border-accent"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <ErrorState message={error} />}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-accent px-3 py-2 font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
