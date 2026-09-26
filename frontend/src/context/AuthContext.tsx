import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl?: string;
}

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  organization?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ error?: string; confirmationSent?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const DEFAULT_USER: AuthUser = {
  id: 'analyst-primary',
  email: 'lead.analyst@fraudshield.ai',
  name: 'Lead Fraud Investigator',
  role: 'Senior Fintech Risk Specialist',
  organization: 'SecOps Threat Intelligence',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_USER);
  const [loading] = useState(false);

  const signIn = async (_email: string, _pass: string): Promise<{ error?: string }> => {
    setUser(DEFAULT_USER);
    return {};
  };

  const signUp = async (params: SignUpParams): Promise<{ error?: string; confirmationSent?: boolean }> => {
    setUser({
      id: 'analyst-' + Date.now(),
      email: params.email,
      name: params.fullName || 'Lead Fraud Investigator',
      role: params.role || 'Senior Fraud Analyst',
      organization: params.organization || 'Fintech SecOps Unit',
    });
    return { confirmationSent: false };
  };

  const resetPassword = async (_email: string): Promise<{ error?: string }> => {
    return {};
  };

  const updatePassword = async (_newPassword: string): Promise<{ error?: string }> => {
    return {};
  };

  const signOut = async () => {
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
