import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { platformApi } from '../services/platformApi';
import { Alert, Incident } from '../types';

export function ViewerPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const [incidentRows, alertRows] = await Promise.all([
        platformApi.listIncidents(1, 10),
        platformApi.listAlerts(1, 10),
      ]);
      setIncidents(incidentRows);
      setAlerts(alertRows);
      setLoading(false);
    };

    void run();
  }, []);

  return (
    <Layout title="Read-Only Intelligence View">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-line bg-panel p-4 shadow-card">
            <h3 className="mb-3 font-display text-lg">Incidents</h3>
            <div className="space-y-2">
              {incidents.map(incident => (
                <div key={incident.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                  <div className="font-semibold">{incident.title}</div>
                  <div className="text-xs text-muted">{incident.severity} / {incident.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-panel p-4 shadow-card">
            <h3 className="mb-3 font-display text-lg">Alerts</h3>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-xs text-muted">{alert.severity}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
