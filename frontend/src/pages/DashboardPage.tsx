import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRightLeft,
  ScanLine,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  FolderSearch,
} from 'lucide-react';
import { fetchDashboard } from '../services/api';
import { DashboardMetrics, Transaction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const { setActiveTransactionModal, openLumoraWithPrompt } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [riskDist, setRiskDist] = useState<{ low: number; moderate: number; high: number; critical: number }>({
    low: 38,
    moderate: 14,
    high: 11,
    critical: 8,
  });
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setMetrics(data.metrics);
      setRiskDist(data.riskDistribution);
      setThreats(data.liveThreats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Live poll every 20s
    return () => clearInterval(interval);
  }, []);

  const totalDist = riskDist.low + riskDist.moderate + riskDist.high + riskDist.critical || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900/90 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Fraud Intelligence Overview
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            See what is happening across your transaction ecosystem in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <NavLink
            to="/scan"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/40 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan Transaction</span>
          </NavLink>

          <button
            onClick={() => openLumoraWithPrompt('What fraud patterns are currently emerging across the dataset?')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Ask Lumora</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Transactions Analyzed */}
        <div className="p-5 rounded-2xl bg-[#0b101f] border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Transactions Analyzed</span>
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
            {metrics ? metrics.transactionsAnalyzed.toLocaleString() : '24,891'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% vs last 24h</span>
            <span className="text-slate-400 text-[10px] ml-auto">Demo sample</span>
          </div>
        </div>

        {/* Card 2: Fraud Detected */}
        <div className="p-5 rounded-2xl bg-[#0b101f] border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Fraud Detected</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono tracking-tight">
            {metrics ? metrics.fraudDetected.toLocaleString() : '327'}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>3 critical alerts require attention</span>
          </div>
        </div>

        {/* Card 3: High Risk */}
        <div className="p-5 rounded-2xl bg-[#0b101f] border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High-Risk Transactions</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-orange-400 font-mono tracking-tight">
            {metrics ? metrics.highRisk.toLocaleString() : '184'}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <span>Challenged via Step-Up OTP</span>
          </div>
        </div>

        {/* Card 4: Detection Accuracy */}
        <div className="p-5 rounded-2xl bg-[#0b101f] border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Detection Accuracy</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              BENCHMARK
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
            {metrics ? `${metrics.detectionAccuracy}%` : '97.4%'}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
            <span>Model analysis completed in 1.2s</span>
          </div>
        </div>
      </div>

      {/* Risk Overview Distribution Bar */}
      <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Risk Profile Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Proportion of evaluated transactions across safety tiers.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Monitored: {totalDist} txns
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(riskDist.low / totalDist) * 100}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Low Risk: ${riskDist.low}`}
          />
          <div
            style={{ width: `${(riskDist.moderate / totalDist) * 100}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Moderate: ${riskDist.moderate}`}
          />
          <div
            style={{ width: `${(riskDist.high / totalDist) * 100}%` }}
            className="bg-orange-500 transition-all duration-500"
            title={`High: ${riskDist.high}`}
          />
          <div
            style={{ width: `${(riskDist.critical / totalDist) * 100}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Critical: ${riskDist.critical}`}
          />
        </div>

        {/* Segment Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="text-xs">
              <span className="text-slate-400 block">Low Risk</span>
              <strong className="text-white font-mono">
                {riskDist.low} ({Math.round((riskDist.low / totalDist) * 100)}%)
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="text-xs">
              <span className="text-slate-400 block">Moderate</span>
              <strong className="text-white font-mono">
                {riskDist.moderate} ({Math.round((riskDist.moderate / totalDist) * 100)}%)
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <div className="text-xs">
              <span className="text-slate-400 block">High Risk</span>
              <strong className="text-white font-mono">
                {riskDist.high} ({Math.round((riskDist.high / totalDist) * 100)}%)
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="text-xs">
              <span className="text-slate-400 block">Critical</span>
              <strong className="text-rose-400 font-mono">
                {riskDist.critical} ({Math.round((riskDist.critical / totalDist) * 100)}%)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Threat Feed */}
      <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Transaction & Threat Feed
              </h3>
              <p className="text-xs text-slate-400">
                Click any row to open the complete forensic investigation drawer.
              </p>
            </div>
          </div>

          <NavLink
            to="/transactions"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {/* Threat Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d19] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0a0f1d]">
              {threats.map((t) => (
                <tr
                  key={t.transactionId}
                  onClick={() => setActiveTransactionModal(t)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300 group-hover:text-indigo-200">
                    {t.transactionId}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-medium text-white block">{t.customerName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{t.customerId}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    {t.currency === 'INR' ? '₹' : '$'}
                    {Number(t.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{t.location}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="block truncate max-w-[140px] text-white">{t.merchant}</span>
                    <span className="text-[10px] text-slate-400 block">{t.merchantCategory}</span>
                  </td>
                  <td className="py-3 px-4">
                    <RiskBadge level={t.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {t.riskScore}/100
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        t.status === 'FLAGGED'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTransactionModal(t);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-[11px]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
