import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService, FirebaseUserRecord } from '../utils/firebase/client';

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: string;
  organization: string;
  emailVerified: boolean;
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
  signIn: (email: string, pass: string) => Promise<{ error?: string; unverified?: boolean }>;
  signUp: (params: SignUpParams) => Promise<{ error?: string; verificationSent?: boolean }>;
  sendVerificationEmail: () => Promise<{ error?: string }>;
  refreshUser: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = 'fraudshield_fb_id_token';
const REFRESH_KEY = 'fraudshield_fb_refresh_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (record: FirebaseUserRecord): AuthUser => {
    let profileMeta: { role?: string; organization?: string } = {};
    try {
      const raw = localStorage.getItem(`fraudshield_profile_${record.localId}`);
      if (raw) profileMeta = JSON.parse(raw);
    } catch {
      // ignore
    }

    return {
      uid: record.localId,
      email: record.email,
      name: record.displayName || record.email.split('@')[0] || 'Investigator',
      role: profileMeta.role || 'Senior Fraud Investigator',
      organization: profileMeta.organization || 'Fintech SecOps Unit',
      emailVerified: Boolean(record.emailVerified),
      avatarUrl: record.photoUrl,
    };
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_KEY);

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        let userData = await firebaseAuthService.getUserData(token);

        // If token expired, try refreshing
        if (!userData && refreshToken) {
          const fresh = await firebaseAuthService.refreshSession(refreshToken);
          if (fresh?.id_token) {
            localStorage.setItem(TOKEN_KEY, fresh.id_token);
            if (fresh.refresh_token) {
              localStorage.setItem(REFRESH_KEY, fresh.refresh_token);
            }
            userData = await firebaseAuthService.getUserData(fresh.id_token);
          }
        }

        if (mounted && userData) {
          setUser(formatUser(userData));
        } else if (mounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Log in with Email & Password directly
   */
  const signIn = async (email: string, pass: string): Promise<{ error?: string; unverified?: boolean }> => {
    try {
      const session = await firebaseAuthService.signInWithPassword(email, pass);
      localStorage.setItem(TOKEN_KEY, session.idToken);
      localStorage.setItem(REFRESH_KEY, session.refreshToken);

      // Set user session directly into dashboard
      const userData = await firebaseAuthService.getUserData(session.idToken);
      if (userData) {
        setUser(formatUser(userData));
      }
      return {};
    } catch (err: any) {
      let msg = 'Authentication failed. Please verify credentials.';
      const raw = err.message || '';
      if (
        raw.includes('INVALID_LOGIN_CREDENTIALS') ||
        raw.includes('INVALID_PASSWORD') ||
        raw.includes('EMAIL_NOT_FOUND')
      ) {
        msg = 'Invalid email address or password.';
      } else if (raw.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        msg = 'Access temporarily restricted due to repeated attempts. Please try again shortly or reset password.';
      } else if (raw.includes('INVALID_EMAIL')) {
        msg = 'Please enter a valid email address.';
      }
      return { error: msg };
    }
  };

  /**
   * Register new account and log in directly
   */
  const signUp = async (params: SignUpParams): Promise<{ error?: string; verificationSent?: boolean }> => {
    try {
      const session = await firebaseAuthService.signUp(params.email, params.password);
      localStorage.setItem(TOKEN_KEY, session.idToken);
      localStorage.setItem(REFRESH_KEY, session.refreshToken);

      // Save user-specific profile metadata associated with Firebase UID
      localStorage.setItem(
        `fraudshield_profile_${session.localId}`,
        JSON.stringify({
          role: params.role?.trim() || 'Senior Fraud Investigator',
          organization: params.organization?.trim() || 'Fintech SecOps Unit',
        })
      );

      // Update Display Name in Firebase
      if (params.fullName.trim()) {
        try {
          await firebaseAuthService.updateProfile(session.idToken, params.fullName);
        } catch {
          // ignore
        }
      }

      // Fetch fresh user profile and log in directly
      const userData = await firebaseAuthService.getUserData(session.idToken);
      if (userData) {
        setUser(formatUser(userData));
      }

      return {};
    } catch (err: any) {
      let msg = 'Registration failed.';
      const raw = err.message || '';
      if (raw.includes('EMAIL_EXISTS')) {
        msg = 'An account with this email address is already registered.';
      } else if (raw.includes('WEAK_PASSWORD')) {
        msg = 'Password should be at least 6 characters.';
      } else if (raw.includes('INVALID_EMAIL')) {
        msg = 'Please provide a valid email format.';
      }
      return { error: msg };
    }
  };

  /**
   * Dispatch verification email to current session
   */
  const sendVerificationEmail = async (): Promise<{ error?: string }> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { error: 'No active session found.' };

    try {
      await firebaseAuthService.sendEmailVerification(token);
      return {};
    } catch (err: any) {
      const raw = err.message || '';
      if (raw.includes('TOO_MANY_ATTEMPTS')) {
        return { error: 'Requests throttled. Please wait 60 seconds before requesting another email.' };
      }
      return { error: err.message || 'Failed to dispatch verification email.' };
    }
  };

  /**
   * Reload Firebase user to check if email was verified in inbox
   */
  const refreshUser = async (): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const userData = await firebaseAuthService.getUserData(token);
      if (userData) {
        setUser(formatUser(userData));
        return Boolean(userData.emailVerified);
      }
    } catch {
      // ignore
    }
    return false;
  };

  /**
   * Dispatch Password Reset Email
   */
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      await firebaseAuthService.sendPasswordResetEmail(email);
      return {};
    } catch {
      // Keep message secure without revealing account presence
      return {};
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        sendVerificationEmail,
        refreshUser,
        resetPassword,
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
