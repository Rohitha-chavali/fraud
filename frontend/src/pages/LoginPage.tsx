import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

type AuthMode = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export const LoginPage: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Mode state
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Senior Fraud Investigator');
  const [organization, setOrganization] = useState('Fintech Security Operations');

  // Action states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Auto-route if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, from, navigate]);

  /**
   * Validate standard email regex
   */
  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  /**
   * Handle Email + Password Sign In
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  /**
   * Handle User Registration
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full legal or investigator name.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please provide a valid email format (e.g. analyst@institution.com).');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters to meet security standards.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    const res = await signUp({
      email,
      password,
      fullName,
      role,
      organization,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  /**
   * Handle Forgot Password Link Dispatch
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter the email address associated with your account.');
      return;
    }

    setLoading(true);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-900/25 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size="lg" />
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            "Detect fraud before it becomes damage."
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b101f]/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header pill & title */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Restricted Access · Authorized Personnel Only</span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight pt-2">
              {mode === 'SIGN_IN' && 'Sign In to Fraud Shield AI'}
              {mode === 'SIGN_UP' && 'Create Investigator Account'}
              {mode === 'FORGOT_PASSWORD' && 'Recover Account Access'}
            </h2>

            <p className="text-xs text-slate-400">
              {mode === 'SIGN_IN' && 'Enter your institutional email credentials to access the intelligence console.'}
              {mode === 'SIGN_UP' && 'Register your investigator credentials for security telemetry audit trails.'}
              {mode === 'FORGOT_PASSWORD' && 'Enter your account email to receive secure password recovery instructions.'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'SIGN_IN' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@institution.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 text-xs font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_PASSWORD');
                      setError(null);
                      setResetSent(false);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Don't have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_UP');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* CREATE ACCOUNT FORM */}
          {mode === 'SIGN_UP' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohitha Chavali"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1">
                  Institutional Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@institution.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-medium block mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-medium block mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-medium block mb-1">
                    Role / Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Lead Fraud Analyst"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-medium block mb-1">
                    Organization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4 text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. SecOps Unit"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Creating Account & Dispatching Verification...' : 'Create Account'}</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Already have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'FORGOT_PASSWORD' && (
            resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex flex-col items-center text-center space-y-2.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span className="font-bold text-sm text-white">Reset Link Dispatched</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  If an account exists for <span className="text-emerald-300 font-semibold">{email}</span>, a password reset link has been dispatched. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setResetSent(false);
                    setError(null);
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-slate-300 text-xs font-medium block mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-indigo-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@institution.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Dispatching Link...' : 'Send Password Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('SIGN_IN');
                      setError(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )
          )}
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit TLS Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Firebase Identity Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};
