import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { ClientDashboard } from '@/pages/ClientDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ClientsPage } from '@/pages/ClientsPage';
import { PlatformPage } from '@/pages/PlatformPage';
import { PlayStoreLivePage } from '@/pages/PlayStoreLivePage';
import { SocialInboxPage } from '@/pages/SocialInboxPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LiveFetcherPage } from '@/pages/LiveFetcherPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function RoleBasedDashboard() {
  const { userRole } = useAuth();
  if (userRole === 'super_admin') {
    return <AdminDashboard />;
  }
  return <ClientDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<RoleBasedDashboard />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/live-fetcher" element={<LiveFetcherPage />} />
                      <Route path="/playstore-live" element={<PlayStoreLivePage />} />
                      <Route path="/social-inbox" element={<SocialInboxPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/platform/:platformId" element={<PlatformPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/app" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
