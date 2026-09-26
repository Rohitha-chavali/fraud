import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowRightLeft,
  ScanLine,
  ShieldAlert,
  FolderSearch,
  Network,
  Sparkles,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { setIsLumoraOpen, isLumoraOpen } = useApp();
  const { user, signOut } = useAuth();

  const mainLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
    { to: '/scan', label: 'Scan Transaction', icon: ScanLine },
    { to: '/alerts', label: 'Fraud Alerts', icon: ShieldAlert },
    { to: '/investigations', label: 'Investigations', icon: FolderSearch },
    { to: '/intelligence', label: 'Intelligence', icon: Network },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0a0f1d]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <NavLink to="/dashboard">
          <Logo size="md" />
        </NavLink>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Core Engine
        </div>

        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400/80" />}
            </NavLink>
          );
        })}

        {/* AI Divider */}
        <div className="pt-5 pb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          AI Companion
        </div>

        {/* Lumora AI Link */}
        <button
          onClick={() => setIsLumoraOpen(!isLumoraOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            isLumoraOpen
              ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/40 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-950/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>Lumora AI</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PROMPT
              </span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400/60" />
        </button>

        {/* System Divider */}
        <div className="pt-5 pb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Platform
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            <span>Settings</span>
          </div>
        </NavLink>
      </div>

      {/* Footer Area: User Session + System Status */}
      <div className="p-3 border-t border-slate-800/70 bg-[#080c17]/80 space-y-2">
        {user && (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 truncate font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">AI Engine Online</span>
              <span className="text-[9px] text-slate-400 leading-tight">Latency 14ms · 97.4%</span>
            </div>
          </div>
          <div className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ACTIVE
          </div>
        </div>
      </div>
    </aside>
  );
};
