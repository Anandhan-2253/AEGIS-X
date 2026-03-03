import { useSocketAlerts } from '../hooks/useSocketAlerts';

export function AlertFeed() {
  const alerts = useSocketAlerts();

  return (
    <section className="rounded-xl border border-line bg-panel p-4 shadow-card">
      <h3 className="mb-3 font-display text-lg">Real-Time Alert Feed</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted">No live alerts yet.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.slice(0, 10).map(alert => (
            <li key={alert.alertId} className="rounded-md border border-line bg-panelAlt/70 p-3">
              <div className="flex items-center justify-between">
                <strong className="text-sm">{alert.title}</strong>
                <span className="text-xs text-muted">{alert.severity}</span>
              </div>
              <div className="mt-1 text-xs text-muted">{new Date(alert.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
