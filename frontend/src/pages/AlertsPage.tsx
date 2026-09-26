import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Bell,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { fetchAlerts, updateAlertStatus, fetchTransactionDetail } from '../services/api';
import { FraudAlert } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';

export const AlertsPage: React.FC = () => {
  const { setActiveTransactionModal, openLumoraWithPrompt, addToast } = useApp();

  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'RESOLVED'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const isResolved = filter === 'RESOLVED';
      const severity = isResolved ? undefined : filter;
      const status = isResolved ? 'RESOLVED' : undefined;

      const res = await fetchAlerts(severity, status);
      setAlerts(res.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleInvestigate = async (alert: FraudAlert) => {
    try {
      const txn = await fetchTransactionDetail(alert.transactionId);
      setActiveTransactionModal(txn);
    } catch (err) {
      addToast(`Could not load transaction ${alert.transactionId}`, 'error');
    }
  };

  const handleResolveAlert = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateAlertStatus(alertId, 'RESOLVED');
      addToast(`Alert ${alertId} marked as Resolved`, 'success');
      loadData();
    } catch (err) {
      addToast('Failed to update alert', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Fraud Alerts</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              TRIPWIRE SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly triggers requiring compliance, risk officer, or analyst review.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Alerts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0b101f] border border-slate-800 w-fit">
        {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Loading fraud alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0b101f] border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">All Caught Up</h4>
          <p className="text-xs text-slate-400">
            No active fraud alerts under the {filter} severity queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alt) => (
            <div
              key={alt.alertId}
              className={`p-5 rounded-2xl bg-[#0b101f] border transition-all duration-200 flex flex-col justify-between hover:border-slate-700 shadow-xl ${
                alt.severity === 'CRITICAL'
                  ? 'border-rose-900/40 hover:border-rose-600/60'
                  : alt.severity === 'HIGH'
                  ? 'border-orange-900/40 hover:border-orange-600/60'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Top Pill Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <RiskBadge level={alt.severity} score={alt.riskScore} size="sm" />
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Reason Title */}
                <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                  {alt.reason}
                </h3>

                {/* Amount & Txn ID */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Transaction:</span>
                    <span className="font-mono font-bold text-indigo-300">{alt.transactionId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-mono font-bold text-white">
                      {alt.currency === 'INR' ? '₹' : '$'}
                      {Number(alt.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-200">{alt.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Merchant:</span>
                    <span className="text-slate-200 truncate max-w-[130px]">{alt.merchant}</span>
                  </div>
                </div>

                {/* Signal Badges */}
                {alt.signals && alt.signals.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {alt.signals.slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {s}
                      </span>
                    ))}
                    {alt.signals.length > 2 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{alt.signals.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    alt.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {alt.status}
                </span>

                <div className="flex items-center gap-2">
                  {alt.status !== 'RESOLVED' && (
                    <button
                      onClick={(e) => handleResolveAlert(alt.alertId, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      title="Mark as resolved"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => handleInvestigate(alt)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-colors flex items-center gap-1"
                  >
                    <span>Investigate</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
