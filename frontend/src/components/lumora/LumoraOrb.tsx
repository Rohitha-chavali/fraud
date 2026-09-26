import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LumoraOrb: React.FC = () => {
  const { isLumoraOpen, setIsLumoraOpen, inspectedTxnId } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsLumoraOpen(!isLumoraOpen)}
        className="relative group p-3.5 rounded-full bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-500 text-white shadow-xl shadow-purple-950/60 hover:shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-purple-400/40"
        title="Open Lumora AI Assistant"
      >
        {/* Pulsing glow halo */}
        <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-md group-hover:bg-purple-500/50 animate-pulse transition-all" />

        {/* Orbiting particles simulation */}
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-100 group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Active context notification badge */}
          {inspectedTxnId && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-sm" />
          )}
        </div>
      </button>
    </div>
  );
};
