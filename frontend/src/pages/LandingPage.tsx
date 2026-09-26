import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Cpu,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const LandingPage: React.FC = () => {
  const [demoState, setDemoState] = useState<'normal' | 'anomaly'>('normal');

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Logo size="md" showTagline={false} />
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>FINTECH RISK ENGINE v2.4</span>
          </div>

          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            <span>Live Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 text-center relative z-10">
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Next-Generation Transaction Intelligence Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans max-w-4xl mx-auto leading-tight sm:leading-none">
          Detect fraud before it becomes <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">damage.</span>
        </h1>

        {/* Supporting text */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Fraud Shield AI combines multi-signal behavioral intelligence, deterministic anomaly detection, and explainable AI to protect payments and empower fraud investigation teams in real time.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <NavLink
            to="/scan"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/40 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Analyze Transaction</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-semibold border border-slate-700/80 transition-all hover:border-slate-600"
          >
            <span>Explore Dashboard</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </NavLink>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-indigo-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                AI Risk Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates amount velocity, travel physics, and hardware telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-purple-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Explainable Decisions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Translates numerical risk scores into human-readable causal evidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Real-Time Stream
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sub-20ms evaluation latency on live clearing networks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Lumora Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Intelligent companion aiding investigators through complex forensic review.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section: See Fraud Shield AI in Action */}
      <section className="max-w-5xl mx-auto px-6 py-12 relative z-10 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Interactive Live Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            See Fraud Shield AI in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Toggle between normal baseline transaction telemetry and a coordinated account takeover attempt.
          </p>

          <div className="inline-flex p-1 mt-6 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setDemoState('normal')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                demoState === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Normal Baseline Transaction
            </button>
            <button
              onClick={() => setDemoState('anomaly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                demoState === 'anomaly'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Anomalous ATO Surge
            </button>
          </div>
        </div>

        {/* Comparison Card */}
        <div className="rounded-2xl bg-[#0d1424] border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Input Telemetry */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Transaction Telemetry Input
              </span>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-white font-bold">
                    {demoState === 'normal' ? 'TXN-10492' : 'TXN-92831'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className={`font-bold ${demoState === 'normal' ? 'text-slate-200' : 'text-rose-400'}`}>
                    {demoState === 'normal' ? '₹2,450' : '₹84,500'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Origin:</span>
                  <span className="text-slate-200">
                    {demoState === 'normal' ? 'Hyderabad (Home baseline)' : 'London (Impossible travel from Mumbai)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hardware Fingerprint:</span>
                  <span className="text-slate-200">
                    {demoState === 'normal' ? 'Known iPhone 15 Pro' : 'New Unrecognized Linux Terminal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Failures:</span>
                  <span className={demoState === 'normal' ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                    {demoState === 'normal' ? '0 attempts' : '3 failed challenges in 90s'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Engine Output */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                Fraud Shield AI Output
              </span>

              <div
                className={`p-5 rounded-xl border transition-all ${
                  demoState === 'normal'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Assessed Risk Score</span>
                    <div className="text-3xl font-extrabold font-mono mt-0.5 text-white">
                      {demoState === 'normal' ? '08 / 100' : '99 / 100'}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                      demoState === 'normal'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    }`}
                  >
                    {demoState === 'normal' ? 'LOW RISK · APPROVE' : 'CRITICAL RISK · BLOCK'}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-3 text-xs space-y-1.5">
                  <span className="font-semibold text-white block">Explainable Rationale:</span>
                  {demoState === 'normal' ? (
                    <p className="text-slate-300">
                      Clean transaction signature conforming cleanly to established behavioral and geographical baselines. Zero friction authorization approved.
                    </p>
                  ) : (
                    <div className="space-y-1 text-slate-300">
                      <p className="text-rose-300 font-medium">
                        • Amount is 24.1× higher than customer's average baseline (₹3,500).
                      </p>
                      <p className="text-rose-300 font-medium">
                        • Impossible travel between Mumbai and London in consecutive timestamps.
                      </p>
                      <p className="text-rose-300 font-medium">
                        • Novel hardware fingerprint coupled with 3 failed challenge attempts.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Action:{' '}
                    <strong className="text-white">
                      {demoState === 'normal' ? 'Instant Settlement Cleared' : 'Automated Hold & Session Revocation'}
                    </strong>
                  </span>
                  <NavLink
                    to="/scan"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Test Scanner</span>
                    <ArrowRight className="w-3 h-3" />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-400">
        <p>FRAUD SHIELD AI · Commercial Fintech Fraud Intelligence Prototype · Demo Environment</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Powered by Deterministic Risk Modeling, Anomaly Detection, and Lumora AI
        </p>
      </footer>
    </div>
  );
};
