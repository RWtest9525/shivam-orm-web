import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoginPage } from '@/pages/LoginPage';
import { AppLayout } from '@/components/AppLayout';
import { ClientDashboard } from '@/pages/ClientDashboard';
import { PlatformPage } from '@/pages/PlatformPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { PlayStoreLivePage } from '@/pages/PlayStoreLivePage';
import { SocialInboxPage } from '@/pages/SocialInboxPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoutes() {
  const { session, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        {userRole === 'super_admin' ? (
          <>
            <Route path="/app" element={<AdminDashboard />} />
            <Route path="/app/clients" element={<AdminDashboard />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/app/platform/:platformId" element={<PlatformPage />} />
          </>
        ) : (
          <>
            <Route path="/app" element={<ClientDashboard />} />
            <Route path="/app/playstore-live" element={<PlayStoreLivePage />} />
            <Route path="/app/social-inbox" element={<SocialInboxPage />} />
            <Route path="/app/platform/:platformId" element={<PlatformPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
