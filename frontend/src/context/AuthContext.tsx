import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role?: string;
  organization?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  needsProfileSetup: boolean;
  sendPhoneOtp: (phone: string) => Promise<{ error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string; needsProfile?: boolean }>;
  updateProfile: (profile: { name: string; role?: string; organization?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  const mapSupabaseUser = (sbUser: SupabaseUser | null): AuthUser | null => {
    if (!sbUser) return null;
    const metadata = sbUser.user_metadata || {};
    const name = metadata.full_name || metadata.name || '';
    return {
      id: sbUser.id,
      phone: sbUser.phone || '',
      email: sbUser.email || '',
      name: name,
      role: metadata.role || 'Fraud Investigator',
      organization: metadata.organization || 'SecOps Unit',
      avatarUrl: metadata.avatar_url,
    };
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout: ensure loading state never hangs longer than 2.5s even if network stalls
    const timeoutTimer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 2500);

    // Initial session lookup
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('[Auth] Session check notice:', error.message);
        }
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          setUser(authUser);
          // Check if name / profile details are missing
          const hasName = Boolean(authUser?.name && authUser.name.trim().length > 0);
          setNeedsProfileSetup(!hasName);
        } else {
          setUser(null);
          setNeedsProfileSetup(false);
        }
      })
      .catch((err) => {
        console.warn('[Auth] Session fetch warning:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Listen to real-time auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = mapSupabaseUser(session.user);
        setUser(authUser);
        const hasName = Boolean(authUser?.name && authUser.name.trim().length > 0);
        setNeedsProfileSetup(!hasName);
      } else {
        setUser(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutTimer);
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Step 1: Request OTP code via Supabase Phone Authentication
   */
  const sendPhoneOtp = async (phone: string): Promise<{ error?: string }> => {
    try {
      const cleanPhone = phone.trim();
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
        options: {
          channel: 'sms',
        },
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to dispatch verification code.' };
    }
  };

  /**
   * Step 2: Verify SMS OTP code with Supabase
   */
  const verifyPhoneOtp = async (
    phone: string,
    token: string
  ): Promise<{ error?: string; needsProfile?: boolean }> => {
    try {
      const cleanPhone = phone.trim();
      const cleanToken = token.trim();

      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: cleanToken,
        type: 'sms',
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        const authUser = mapSupabaseUser(data.user);
        setUser(authUser);
        const hasName = Boolean(authUser?.name && authUser.name.trim().length > 0);
        setNeedsProfileSetup(!hasName);
        return { needsProfile: !hasName };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Verification failed. Please check code.' };
    }
  };

  /**
   * Step 3: Profile Setup (Name, Role, Organization) for verified user
   */
  const updateProfile = async (profile: {
    name: string;
    role?: string;
    organization?: string;
  }): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name.trim(),
          role: profile.role?.trim() || 'Fraud Investigator',
          organization: profile.organization?.trim() || 'SecOps Unit',
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        const authUser = mapSupabaseUser(data.user);
        setUser(authUser);
        setNeedsProfileSetup(false);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update profile.' };
    }
  };

  /**
   * Terminate active Supabase session
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Auth] Sign out notice:', err);
    }
    setUser(null);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsProfileSetup,
        sendPhoneOtp,
        verifyPhoneOtp,
        updateProfile,
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
