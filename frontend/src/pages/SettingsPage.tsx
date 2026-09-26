import React from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  Bell,
  Shield,
  Info,
  Check,
  Cpu,
  Database,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, addToast } = useApp();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-indigo-400" />
              <span>Platform Settings</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              CONFIG & PREFERENCES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure Lumora companion depth, risk alerting sensitivities, and system operating parameters.
          </p>
        </div>
      </div>

      {/* AI Preferences Section */}
      <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Lumora AI Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Tailor reasoning verbosity and analytical depth for your investigation style.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Response Style & Verbosity:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Concise',
                label: 'Concise',
                desc: 'Fast bullet points and rapid action protocols. Optimal for rapid triage.',
              },
              {
                id: 'Balanced',
                label: 'Balanced (Recommended)',
                desc: 'Structured risk drivers, causal evidence, and recommended next steps.',
              },
              {
                id: 'Detailed',
                label: 'Detailed',
                desc: 'Comprehensive forensic narratives including hardware fingerprint breakdowns.',
              },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateSettings({ lumoraStyle: st.id as any })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.lumoraStyle === st.id
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{st.label}</span>
                  {settings.lumoraStyle === st.id && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{st.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Bell className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Risk Alerting & Notifications
            </h3>
            <p className="text-xs text-slate-400">
              Configure which transaction threat thresholds trigger immediate push notifications.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                Critical Severity Alerts (Score 80-100)
              </span>
              <span className="text-[11px] text-slate-400">
                Immediately broadcast account takeovers, impossible travel, and credential brute-force attempts.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.criticalAlertsEnabled}
              onChange={(e) => updateSettings({ criticalAlertsEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                High Risk Step-Up Challenges (Score 60-79)
              </span>
              <span className="text-[11px] text-slate-400">
                Flag large spending spikes, unusual merchant categories, and unrecognized device logins.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.highRiskAlertsEnabled}
              onChange={(e) => updateSettings({ highRiskAlertsEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Architecture & Demo Information */}
      <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Info className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              System Architecture & Environment
            </h3>
            <p className="text-xs text-slate-400">
              Runtime information for live demonstration and judging.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Platform</span>
            <span className="font-bold text-white block">FRAUD SHIELD AI</span>
            <span className="text-slate-400 text-[11px]">"Detect fraud before it becomes damage."</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">AI Companion</span>
            <span className="font-bold text-purple-300 block">LUMORA</span>
            <span className="text-slate-400 text-[11px]">"Your intelligent fraud investigation companion."</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Hybrid Fraud Engine</span>
            <span className="font-bold text-white block">Deterministic Rules + Statistical Anomaly + Gemini AI</span>
            <span className="text-emerald-400 text-[11px]">Zero cold-start latency, sub-20ms inference</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Environment Status</span>
            <span className="font-bold text-indigo-300 block">DEMO ENVIRONMENT</span>
            <span className="text-slate-400 text-[11px]">Seeded with 70+ authentic fintech transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
