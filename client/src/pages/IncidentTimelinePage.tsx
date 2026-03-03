import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { platformApi } from '../services/platformApi';

export function IncidentTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const timeline = await platformApi.getIncidentTimeline(id);
        setData(timeline);
      } catch {
        setError('Failed to load incident timeline');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [id]);

  return (
    <Layout title="Incident Timeline">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="rounded-xl border border-line bg-panel p-4 shadow-card">
          <h3 className="font-display text-lg">{data.incident.title}</h3>
          <p className="mt-1 text-sm text-muted">{data.incident.description}</p>

          <div className="mt-4 space-y-3">
            {data.timeline.map((event: any) => (
              <div key={event.id} className="rounded-lg border border-line bg-panelAlt/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{event.event_type}</span>
                  <span className="text-xs text-muted">{new Date(event.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
