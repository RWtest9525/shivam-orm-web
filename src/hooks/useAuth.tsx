import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { dbEngine, type ClientRow } from '@/lib/dbEngine';

interface AuthState {
  session: { user: { id: string; email: string } } | null;
  client: ClientRow | null;
  userRole: 'super_admin' | 'client' | 'worker';
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  switchUser: (email: string) => void;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentEmail, setCurrentEmail] = useState<string>(() => {
    return localStorage.getItem('shivam_orm_active_user') || 'client@dreamapps.com';
  });

  const [state, setState] = useState<AuthState>({
    session: null,
    client: null,
    userRole: 'client',
    loading: true,
  });

  const resolveAuth = (email: string) => {
    const clients = dbEngine.getClients();
    const foundClient = clients.find((c) => c.email.toLowerCase() === email.toLowerCase()) || clients[1] || clients[0];
    
    let role: 'super_admin' | 'client' | 'worker' = 'client';
    if (foundClient.is_super_admin) {
      role = 'super_admin';
    } else if (email.includes('mod') || email.includes('worker') || email.includes('support')) {
      role = 'worker';
    }

    setState({
      session: {
        user: {
          id: foundClient.auth_user_id,
          email: foundClient.email,
        },
      },
      client: foundClient,
      userRole: role,
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

  const switchUser = (email: string) => {
    localStorage.setItem('shivam_orm_active_user', email);
    setCurrentEmail(email);
    resolveAuth(email);
  };

  const refreshClient = async () => {
    resolveAuth(currentEmail);
  };

  const signOut = async () => {
    localStorage.removeItem('shivam_orm_active_user');
    setState({ session: null, client: null, userRole: 'client', loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, switchUser, refreshClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
