import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapSupabaseUser = (sbUser: SupabaseUser | null): AuthUser | null => {
    if (!sbUser) return null;
    const metadata = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const name = metadata.full_name || metadata.name || email.split('@')[0] || 'Analyst';
    return {
      id: sbUser.id,
      email: email,
      name: name,
      role: metadata.role || 'Fraud Investigator',
      organization: metadata.organization || 'Fintech SecOps Unit',
      avatarUrl: metadata.avatar_url,
    };
  };

  useEffect(() => {
    let mounted = true;

    // Failsafe watchdog timer: ensure loading state never stalls longer than 2s
    const watchdog = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 2000);

    // Initial Supabase Session Hydration
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('[Auth] Session retrieval notice:', error.message);
        }
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.warn('[Auth] Session check exception:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Real-time Supabase Auth Event Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(watchdog);
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Supabase Email + Password Login
   */
  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        setUser(mapSupabaseUser(data.user));
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Authentication failed. Please verify credentials.' };
    }
  };

  /**
   * Supabase Account Registration with Profile Metadata
   */
  const signUp = async (params: SignUpParams): Promise<{ error?: string; confirmationSent?: boolean }> => {
    try {
      const cleanEmail = params.email.trim();
      const cleanName = params.fullName.trim();
      const role = params.role?.trim() || 'Fraud Investigator';
      const org = params.organization?.trim() || 'Fintech SecOps Unit';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            full_name: cleanName,
            role: role,
            organization: org,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If Supabase has "Confirm email" toggled on, session is null until confirmed via email link
      const confirmationSent = !data?.session;

      if (data?.user && data.session) {
        setUser(mapSupabaseUser(data.user));
      }

      return { confirmationSent };
    } catch (err: any) {
      return { error: err.message || 'Registration failed. Please check inputs.' };
    }
  };

  /**
   * Supabase Password Reset Request
   */
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const cleanEmail = email.trim();
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to dispatch password recovery link.' };
    }
  };

  /**
   * Update Password (used on /reset-password page after clicking email link)
   */
  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update password.' };
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] Sign out notice:', err);
    }
    setUser(null);
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
