import React, { useEffect, useState } from 'react';
import {
  Network,
  TrendingUp,
  MapPin,
  Store,
  Clock,
  Smartphone,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { fetchIntelligence } from '../services/api';
import { IntelligenceData } from '../types';
import { NetworkGraph } from '../components/intelligence/NetworkGraph';
import { useApp } from '../context/AppContext';

export const IntelligencePage: React.FC = () => {
  const { openLumoraWithPrompt } = useApp();
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchIntelligence();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <span>Fraud Intelligence & Analytics</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AGGREGATE PATTERN MINING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Macro-level risk telemetry, syndicate network links, temporal anomaly peaks, and AI pattern discoveries.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Intelligence Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Pattern Insights Cards */}
      {data?.insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.insights.map((ins) => (
            <div
              key={ins.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/20 via-[#0c1220] to-[#0b101f] border border-purple-500/30 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {ins.tag}
                  </span>
                  <span className="text-[10px] text-rose-400 font-semibold">{ins.impact}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{ins.title}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ins.content}</p>
              </div>

              <div className="pt-2 border-t border-purple-900/30 text-[11px] text-slate-400">
                <span className="text-purple-300 font-semibold block">AI Recommendation:</span>
                <span className="text-slate-300">{ins.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Fraud Network Graph */}
      {data?.network && (
        <NetworkGraph nodes={data.network.nodes} links={data.network.links} />
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Fraud Trends */}
        <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>7-Day Fraud Volume Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">Normal vs Flagged vs Blocked transactions</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends || []}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="normal" stroke="#6366f1" fillOpacity={1} fill="url(#colorNormal)" name="Normal Volume" />
                <Area type="monotone" dataKey="flagged" stroke="#ef4444" fillOpacity={1} fill="url(#colorFlagged)" name="Flagged / Suspicious" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Peak Fraud Hours */}
        <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Peak Attack Hours (Temporal Density)</span>
              </h3>
              <p className="text-xs text-slate-400">Notice the anomalous spike between 01:00 and 04:00 AM</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="safe" fill="#334155" radius={[4, 4, 0, 0]} name="Normal Activity" />
                <Bar dataKey="suspicious" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Suspicious Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Rows: Locations & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations Table */}
        <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Fraud Concentration by Originating City</span>
          </h3>
          <div className="space-y-3 pt-2">
            {data?.locations.map((loc) => (
              <div key={loc.location} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{loc.location}</span>
                  <span className="text-slate-400 font-mono">
                    {loc.fraudCount} flags ({loc.riskPercentage}% risk rate)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      loc.riskPercentage > 35 ? 'bg-rose-500' : loc.riskPercentage > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(loc.riskPercentage * 2.2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merchant Category Breakdown */}
        <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-400" />
            <span>Risk Exposure by Merchant Category</span>
          </h3>
          <div className="space-y-3 pt-2">
            {data?.categories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{cat.category}</span>
                  <span className="text-slate-400 font-mono">
                    {cat.flagged} flagged ({cat.flagRate}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.flagRate > 40 ? 'bg-rose-500' : cat.flagRate > 20 ? 'bg-orange-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(cat.flagRate * 2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
