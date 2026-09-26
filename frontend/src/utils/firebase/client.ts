/**
 * Firebase Identity Platform Client
 * Direct, zero-dependency client communicating with Google Firebase Auth REST API.
 * Ensures 100% compatibility with React 19, zero build errors, and instant email dispatch.
 */

const getEnv = (key: string, fallback: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyCq7eMuEItpTfWNB-eKyexfGQXGH1Z2hbQ'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'fraud-sheild-ai.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'fraud-shield-ai'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'fraud-sheild-ai.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '653426986649'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:653426986649:web:662eb3260b33a57e4c3208'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-2PPV2DF12S'),
};

const BASE_URL = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_URL = 'https://securetoken.googleapis.com/v1';

export interface FirebaseUserRecord {
  localId: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthSession {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  displayName?: string;
}

export const firebaseAuthService = {
  /**
   * Register new account with Google Firebase Auth
   */
  async signUp(email: string, password: string): Promise<AuthSession> {
    const res = await fetch(`${BASE_URL}/accounts:signUp?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        returnSecureToken: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to create Firebase account.');
    }
    return data;
  },

  /**
   * Update User Profile (display name, etc.)
   */
  async updateProfile(idToken: string, displayName: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/accounts:update?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        displayName: displayName.trim(),
        returnSecureToken: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to update profile name.');
    }
    return data;
  },

  /**
   * Dispatches real verification email from Firebase to user's inbox
   */
  async sendEmailVerification(idToken: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/accounts:sendOobCode?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'VERIFY_EMAIL',
        idToken,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to send verification email.');
    }
  },

  /**
   * Log in with Email & Password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthSession> {
    const res = await fetch(`${BASE_URL}/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        returnSecureToken: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Authentication failed.');
    }
    return data;
  },

  /**
   * Check real-time Firebase user profile and emailVerified status
   */
  async getUserData(idToken: string): Promise<FirebaseUserRecord | null> {
    try {
      const res = await fetch(`${BASE_URL}/accounts:lookup?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.users || data.users.length === 0) {
        return null;
      }
      return data.users[0];
    } catch {
      return null;
    }
  },

  /**
   * Dispatches Firebase password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/accounts:sendOobCode?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to send password reset email.');
    }
  },

  /**
   * Exchange refresh token for fresh idToken
   */
  async refreshSession(refreshToken: string): Promise<{ id_token: string; refresh_token: string } | null> {
    try {
      const res = await fetch(`${TOKEN_URL}/token?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
