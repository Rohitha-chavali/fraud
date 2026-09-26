import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Phone,
  User,
  Building,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

type AuthStep = 'PHONE' | 'OTP' | 'PROFILE';

export const LoginPage: React.FC = () => {
  const { user, loading: authLoading, needsProfileSetup, sendPhoneOtp, verifyPhoneOtp, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Wizard state
  const [step, setStep] = useState<AuthStep>('PHONE');
  const [phone, setPhone] = useState('+91 ');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Senior Fraud Investigator');
  const [organization, setOrganization] = useState('Fintech Security Operations');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If already logged in with complete profile, go directly to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (needsProfileSetup) {
        setStep('PROFILE');
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, authLoading, needsProfileSetup, from, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * STEP 1: Dispatch OTP via Supabase
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please enter a valid mobile number including country code (e.g. +91 9876543210).');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await sendPhoneOtp(cleanPhone);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep('OTP');
      setResendCooldown(45);
    }
  };

  /**
   * STEP 2: Verify OTP via Supabase
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await verifyPhoneOtp(phone.trim(), cleanOtp);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      if (res.needsProfile) {
        setStep('PROFILE');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  /**
   * STEP 3: Save Name and Profile Details
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Please enter your full legal or investigator name.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await updateProfile({
      name: fullName.trim(),
      role: role.trim(),
      organization: organization.trim(),
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    const res = await sendPhoneOtp(phone.trim());
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setResendCooldown(45);
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

        {/* Auth Wizard Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b101f]/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header pill & title */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Restricted Fintech Access · Phone OTP Protocol</span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight pt-2">
              {step === 'PHONE' && 'Secure Phone Authentication'}
              {step === 'OTP' && 'Verify 6-Digit Code'}
              {step === 'PROFILE' && 'Investigator Profile Setup'}
            </h2>

            <p className="text-xs text-slate-400">
              {step === 'PHONE' && 'Enter your verified phone number to receive an instant authentication passcode.'}
              {step === 'OTP' && `Passcode dispatched to ${phone}. Enter below to complete authorization.`}
              {step === 'PROFILE' && 'Configure your analyst credential identity for audit trail records.'}
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span>{error}</span>
                {error.toLowerCase().includes('provider') && (
                  <p className="text-[11px] text-rose-300/80">
                    Tip: Ensure Phone Auth provider and SMS gateway are enabled in your Supabase Dashboard.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: PHONE NUMBER FORM */}
          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1.5 flex items-center justify-between">
                  <span>Mobile Phone Number</span>
                  <span className="text-[10px] text-slate-400 font-mono">E.164 format</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Include country code (e.g. <span className="text-indigo-300">+91</span> for India, <span className="text-indigo-300">+1</span> for USA).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Dispatching OTP...' : 'Send Security OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION FORM */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 text-xs font-medium">Enter 6-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('PHONE');
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Change Phone
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono text-lg tracking-widest text-center placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying with Supabase...' : 'Verify & Authenticate'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:text-slate-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PROFILE SETUP FORM */}
          {step === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1">
                  Full Legal / Investigator Name <span className="text-rose-400">*</span>
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Fraud Analyst"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium block mb-1">
                  Organization / Financial Institution
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Fintech Fraud Intelligence Unit"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !fullName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Saving Profile...' : 'Complete Setup & Enter Platform'}</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          )}

          {/* Step indicator breadcrumbs */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
            <span
              className={`h-1.5 rounded-full transition-all ${
                step === 'PHONE' ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                step === 'OTP' ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                step === 'PROFILE' ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'
              }`}
            />
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Session</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Supabase Auth Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
