import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  MailCheck,
  RotateCcw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { user, sendVerificationEmail, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If already verified or no user, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.emailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Reload Firebase user state to check if email was verified in another tab/window
   */
  const handleCheckStatus = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const isVerified = await refreshUser();
    setLoading(false);

    if (isVerified) {
      setMessage('Email verified successfully! Opening your dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } else {
      setError('Your email is not verified yet. Please check your inbox (and spam folder) and click the confirmation link.');
    }
  };

  /**
   * Dispatch a new verification email
   */
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError(null);
    setMessage(null);

    const res = await sendVerificationEmail();
    setResendLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setMessage('A fresh verification link has been sent to your email.');
      setResendCooldown(60);
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

        {/* Verification Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b101f]/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <MailCheck className="w-6 h-6 text-indigo-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-semibold">
              <span>Security Check · Email Verification Required</span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight pt-1">
              Verify Your Email Address
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              We've dispatched a secure verification link to:
            </p>
            <p className="text-xs font-mono text-indigo-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 inline-block max-w-full truncate">
              {user?.email || 'your email'}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Please click the link in your email to activate your investigator account before entering the platform.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Checking status with Firebase...' : "I've Verified My Email"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0 || resendLoading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : resendLoading
                  ? 'Dispatching email...'
                  : 'Resend Verification Email'}
              </span>
            </button>
          </div>

          {/* Footer Sign Out */}
          <div className="text-center pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Wrong email or need to switch?</span>
            <button
              onClick={() => signOut()}
              className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit TLS</span>
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
