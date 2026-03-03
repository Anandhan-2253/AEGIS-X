import { useEffect, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { platformApi } from '../services/platformApi';
import { AuditLog, AuthUser, UserRole } from '../types';

export function AdminPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [userRows, auditRows] = await Promise.all([
        platformApi.listUsers(1, 20),
        platformApi.listAuditLogs(1, 20),
      ]);
      setUsers(userRows);
      setAuditLogs(auditRows);
    } catch {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRoleChange = async (userId: string, role: UserRole) => {
    try {
      await platformApi.updateUserRole(userId, role);
      await load();
    } catch {
      setError('Role update failed');
    }
  };

  return (
    <Layout title="Administration and Audit">
      {loading ? (
        <LoadingSpinner label="Loading admin workspace..." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-line bg-panel p-4 shadow-card">
            <h3 className="mb-3 font-display text-lg">User Management</h3>
            {error && <ErrorState message={error} />}
            <div className="space-y-2">
              {users.map(row => (
                <div key={row.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{row.username}</div>
                      <div className="text-xs text-muted">{row.email}</div>
                    </div>
                    <select
                      value={row.role}
                      onChange={event => onRoleChange(row.id, event.target.value as UserRole)}
                      className="rounded-md border border-line bg-panel px-2 py-1 text-xs"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SOC_ANALYST">SOC_ANALYST</option>
                      <option value="MALWARE_ANALYST">MALWARE_ANALYST</option>
                      <option value="PENTESTER">PENTESTER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-panel p-4 shadow-card">
            <h3 className="mb-3 font-display text-lg">Audit Logs</h3>
            <div className="space-y-2">
              {auditLogs.map(log => (
                <article key={log.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{log.action}</span>
                    <span className="text-xs text-muted">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted">{log.resource_type}</div>
                </article>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-muted">No audit events found.</p>}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
