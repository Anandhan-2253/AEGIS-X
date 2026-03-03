import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

export interface RealtimeAlert {
  alertId: string;
  severity: string;
  title: string;
  createdAt: string;
}

export function useSocketAlerts() {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onAlert = (payload: RealtimeAlert) => {
      setAlerts(prev => [payload, ...prev].slice(0, 50));
    };

    socket.on('alert:new', onAlert);

    return () => {
      socket.off('alert:new', onAlert);
    };
  }, []);

  return alerts;
}
