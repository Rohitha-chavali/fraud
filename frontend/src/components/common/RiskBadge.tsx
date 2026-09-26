import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showDot = true,
}) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const config = {
    LOW: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'LOW',
    },
    MODERATE: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'MODERATE',
    },
    HIGH: {
      bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      dot: 'bg-orange-400',
      label: 'HIGH',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-sm shadow-rose-900/20',
      dot: 'bg-rose-400 animate-pulse',
      label: 'CRITICAL',
    },
  }[normLevel] || {
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    dot: 'bg-slate-400',
    label: normLevel,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-70 font-mono text-[10px] ml-0.5">({score})</span>
      )}
    </span>
  );
};
