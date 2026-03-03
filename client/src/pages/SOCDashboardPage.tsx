import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertFeed } from '../components/AlertFeed';
import { ErrorState } from '../components/ErrorState';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { platformApi } from '../services/platformApi';
import { Alert, Incident } from '../types';

export function SOCDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [message, setMessage] = useState('Suspicious PowerShell execution from workstation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [incidentRows, alertRows] = await Promise.all([
        platformApi.listIncidents(1, 10),
        platformApi.listAlerts(1, 10),
      ]);
      setIncidents(incidentRows);
      setAlerts(alertRows);
    } catch {
      setError('Failed to load SOC data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const ingestSampleLog = async (event: FormEvent) => {
    event.preventDefault();
    setIngesting(true);

    try {
      await platformApi.ingestLog({
        source: 'endpoint-edr',
        logType: 'process_creation',
        severity: 'MEDIUM',
        message,
        rawData: {
          host: 'srv-finance-1',
          process: 'powershell.exe',
          commandLine: message,
        },
      });
      await loadData();
      setMessage('');
    } catch {
      setError('Log ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <Layout title="SOC Operations Dashboard">
      {loading ? (
        <LoadingSpinner label="Loading incidents and alerts..." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            {error && <ErrorState message={error} />}

            <form onSubmit={ingestSampleLog} className="rounded-xl border border-line bg-panel p-4 shadow-card">
              <h3 className="mb-2 font-display text-lg">Log Ingestion</h3>
              <p className="mb-3 text-sm text-muted">Submit structured events to trigger alert scoring and incident workflows.</p>
              <textarea
                value={message}
                onChange={event => setMessage(event.target.value)}
                className="h-24 w-full rounded-md border border-line bg-panelAlt p-3 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={ingesting}
                className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-900"
              >
                {ingesting ? 'Ingesting...' : 'Ingest Log'}
              </button>
            </form>

            <div className="rounded-xl border border-line bg-panel p-4 shadow-card">
              <h3 className="mb-3 font-display text-lg">Incidents</h3>
              <div className="space-y-2">
                {incidents.map(incident => (
                  <div key={incident.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                    <div className="flex items-center justify-between">
                      <strong>{incident.title}</strong>
                      <span className="text-xs text-muted">{incident.severity} / {incident.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{incident.description.slice(0, 160)}</p>
                    <Link className="mt-2 inline-block text-xs text-accent" to={`/incidents/${incident.id}/timeline`}>
                      View Timeline
                    </Link>
                  </div>
                ))}
                {incidents.length === 0 && <p className="text-sm text-muted">No incidents available.</p>}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-panel p-4 shadow-card">
              <h3 className="mb-3 font-display text-lg">Recent Alerts</h3>
              <ul className="space-y-2">
                {alerts.map(alert => (
                  <li key={alert.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{alert.title}</span>
                      <span className="text-xs text-muted">{alert.severity}</span>
                    </div>
                    <p className="text-sm text-muted">{alert.rule_triggered}</p>
                  </li>
                ))}
                {alerts.length === 0 && <li className="text-sm text-muted">No alerts available.</li>}
              </ul>
            </div>
          </section>

          <AlertFeed />
        </div>
      )}
    </Layout>
  );
}
