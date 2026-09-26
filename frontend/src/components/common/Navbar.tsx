import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  ScanLine,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  const { setIsLumoraOpen, isLumoraOpen, inspectedTxnId } = useApp();
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 px-8 border-b border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
      {/* Title / Context */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title || 'Fraud Intelligence Overview'}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>

        {/* Demo Mode Badge as requested in prompt section 37 */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>DEMO ENVIRONMENT</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-3">
        {/* Quick Scan CTA */}
        <NavLink
          to="/scan"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all hover:border-slate-600 shadow-sm"
        >
          <ScanLine className="w-3.5 h-3.5 text-indigo-400" />
          <span>Analyze Txn</span>
        </NavLink>

        {/* Alerts shortcut */}
        <NavLink
          to="/alerts"
          className="relative p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          title="View Fraud Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
            3
          </span>
        </NavLink>

        {/* Lumora AI trigger button */}
        <button
          onClick={() => setIsLumoraOpen(!isLumoraOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isLumoraOpen
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
              : 'bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-800 text-purple-200 border border-purple-500/30 hover:border-purple-400/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse-subtle" />
          <span>Lumora</span>
          {inspectedTxnId && (
            <span className="text-[10px] font-mono bg-purple-950/60 px-1 rounded text-purple-300 border border-purple-500/20">
              {inspectedTxnId}
            </span>
          )}
        </button>

        {/* User profile & Sign Out */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 max-w-[120px] truncate" title={user.email}>
              <div className="w-6 h-6 rounded-full bg-indigo-600/40 border border-indigo-500/50 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="truncate hidden lg:inline">{user.name || user.email.split('@')[0]}</span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
