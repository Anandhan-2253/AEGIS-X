import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routeForRole } from '../utils/roleRoutes';

interface Item {
  label: string;
  path: string;
}

const navByRole: Record<string, Item[]> = {
  ADMIN: [
    { label: 'Admin', path: '/admin' },
    { label: 'SOC', path: '/soc' },
    { label: 'Malware', path: '/malware' },
    { label: 'Pentest', path: '/pentest' },
  ],
  SOC_ANALYST: [
    { label: 'SOC Dashboard', path: '/soc' },
    { label: 'Malware', path: '/malware' },
  ],
  MALWARE_ANALYST: [
    { label: 'Malware', path: '/malware' },
    { label: 'SOC', path: '/soc' },
  ],
  PENTESTER: [
    { label: 'Pentest', path: '/pentest' },
  ],
  VIEWER: [
    { label: 'Viewer', path: '/viewer' },
  ],
};

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = navByRole[user.role] ?? [{ label: 'Dashboard', path: routeForRole(user.role) }];

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-line/70 bg-panel/70 p-6 backdrop-blur">
          <div className="mb-10">
            <h1 className="font-display text-2xl tracking-wide text-accent">AEGIS-X</h1>
            <p className="mt-1 text-xs text-muted">AI-Enhanced Security Operations</p>
          </div>

          <nav className="space-y-2">
            {items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-lg border px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-accent/70 bg-accent/20 text-white'
                      : 'border-transparent text-muted hover:border-line hover:bg-panelAlt/80 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-lg border border-line bg-panelAlt/80 p-3 text-xs">
            <div className="text-muted">Signed in as</div>
            <div className="mt-1 font-semibold text-white">{user.username}</div>
            <div className="text-muted">{user.role}</div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-md border border-danger/60 px-3 py-2 text-danger transition hover:bg-danger/20"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="p-6 lg:p-10">
          <header className="mb-6 border-b border-line pb-4">
            <h2 className="font-display text-3xl text-white">{title}</h2>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
