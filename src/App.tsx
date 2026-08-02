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

// Admin Suite Pages
import { AiInsightsPage } from '@/pages/admin/AiInsightsPage';
import { CrisisCenterPage } from '@/pages/admin/CrisisCenterPage';
import { CompetitorsPage } from '@/pages/admin/CompetitorsPage';
import { VoiceOfMarketPage } from '@/pages/admin/VoiceOfMarketPage';
import { IntegrationsPage } from '@/pages/admin/IntegrationsPage';
import { TeamPage } from '@/pages/admin/TeamPage';
import { SocialListeningPage } from '@/pages/admin/SocialListeningPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

                      {/* Equinox Super Admin Suite Routes */}
                      <Route path="/insights" element={<AiInsightsPage />} />
                      <Route path="/crisis" element={<CrisisCenterPage />} />
                      <Route path="/competitors" element={<CompetitorsPage />} />
                      <Route path="/voice-of-market" element={<VoiceOfMarketPage />} />
                      <Route path="/integrations" element={<IntegrationsPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route path="/social" element={<SocialListeningPage />} />

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
