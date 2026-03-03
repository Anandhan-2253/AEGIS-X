import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SOCDashboardPage } from './pages/SOCDashboardPage';
import { MalwarePage } from './pages/MalwarePage';
import { PentestPage } from './pages/PentestPage';
import { AdminPage } from './pages/AdminPage';
import { ViewerPage } from './pages/ViewerPage';
import { IncidentTimelinePage } from './pages/IncidentTimelinePage';
import { routeForRole } from './utils/roleRoutes';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={routeForRole(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/soc"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SOC_ANALYST', 'MALWARE_ANALYST']}>
            <SOCDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/malware"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SOC_ANALYST', 'MALWARE_ANALYST']}>
            <MalwarePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pentest"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PENTESTER']}>
            <PentestPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/viewer"
        element={
          <ProtectedRoute allowedRoles={['VIEWER', 'ADMIN']}>
            <ViewerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/incidents/:id/timeline"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SOC_ANALYST', 'MALWARE_ANALYST', 'VIEWER']}>
            <IncidentTimelinePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
