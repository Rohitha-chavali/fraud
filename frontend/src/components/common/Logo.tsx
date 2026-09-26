import React from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      <div className="relative flex items-center justify-center">
        {/* Glow behind shield */}
        <div className="absolute inset-0 bg-indigo-500/25 blur-md rounded-full group-hover:bg-indigo-500/40 transition-colors" />
        
        {/* Shield container */}
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/30 text-indigo-400 group-hover:border-indigo-400/60 shadow-lg shadow-indigo-950/50 transition-all">
          <Shield className={`${iconSizes} stroke-[2.2]`} />
          
          {/* Circuit core dot */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-subtle shadow-sm shadow-cyan-400" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-white font-sans ${textSizes}`}>
            FRAUD SHIELD
          </span>
          <span className="text-[11px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 font-medium tracking-tight">
            Detect fraud before it becomes damage.
          </span>
        )}
      </div>
    </div>
  );
};
