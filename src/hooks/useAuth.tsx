import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dbEngine, type ClientRow } from '@/lib/dbEngine';

interface AuthState {
  session: { user: { id: string; email: string } } | null;
  client: ClientRow | null;
  userRole: 'super_admin' | 'client';
  isMasterAdmin: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchUser: (email: string) => void;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentEmail, setCurrentEmail] = useState<string | null>(() => {
    return localStorage.getItem('equinox_pulse_active_user') || null;
  });

  const [masterAdminEmail, setMasterAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('equinox_master_super_admin') || null;
  });

  const [state, setState] = useState<AuthState>({
    session: null,
    client: null,
    userRole: 'client',
    isMasterAdmin: false,
    loading: false,
  });

  const resolveAuth = (email: string | null) => {
    if (!email) {
      setState({
        session: null,
        client: null,
        userRole: 'client',
        isMasterAdmin: false,
        loading: false,
      });
      return;
    }

    const clients = dbEngine.getClients();
    const foundClient = clients.find((c) => c.email.toLowerCase() === email.toLowerCase()) || clients[0];
    
    if (!foundClient) {
      setState({ session: null, client: null, userRole: 'client', isMasterAdmin: false, loading: false });
      return;
    }

    const isSuper = foundClient.is_super_admin || !!localStorage.getItem('equinox_master_super_admin');
    const role: 'super_admin' | 'client' = isSuper ? 'super_admin' : 'client';

    setState({
      session: {
        user: {
          id: foundClient.auth_user_id,
          email: foundClient.email,
        },
      },
      client: foundClient,
      userRole: role,
      isMasterAdmin: !!localStorage.getItem('equinox_master_super_admin') || foundClient.is_super_admin,
      loading: false,
    });
  };

  useEffect(() => {
    resolveAuth(currentEmail);
    const unsubscribe = dbEngine.subscribe(() => {
      resolveAuth(currentEmail);
    });
    return unsubscribe;
  }, [currentEmail]);

  const signIn = async (email: string, pass: string) => {
    const verifiedClient = dbEngine.verifyClientLogin(email, pass);
    if (!verifiedClient) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }
    localStorage.setItem('equinox_pulse_active_user', verifiedClient.email);
    if (verifiedClient.is_super_admin) {
      localStorage.setItem('equinox_master_super_admin', verifiedClient.email);
      setMasterAdminEmail(verifiedClient.email);
    } else {
      localStorage.removeItem('equinox_master_super_admin');
      setMasterAdminEmail(null);
    }
    setCurrentEmail(verifiedClient.email);
    resolveAuth(verifiedClient.email);
    return { success: true };
  };

  const resetPassword = async (email: string, newPass: string) => {
    const success = dbEngine.resetClientPassword(email, newPass);
    if (!success) {
      return { success: false, error: 'Email account not found. Please contact Super Admin.' };
    }
    return { success: true };
  };

  const switchUser = (email: string) => {
    localStorage.setItem('equinox_pulse_active_user', email);
    setCurrentEmail(email);
    resolveAuth(email);
  };

  const refreshClient = async () => {
    resolveAuth(currentEmail);
  };

  const signOut = async () => {
    localStorage.removeItem('equinox_pulse_active_user');
    localStorage.removeItem('equinox_master_super_admin');
    setCurrentEmail(null);
    setMasterAdminEmail(null);
    setState({ session: null, client: null, userRole: 'client', isMasterAdmin: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, resetPassword, signOut, switchUser, refreshClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
