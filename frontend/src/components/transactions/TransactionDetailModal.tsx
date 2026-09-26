import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  User,
  CreditCard,
  MapPin,
  Smartphone,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileText,
  Send,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { useApp } from '../../context/AppContext';
import { createInvestigation } from '../../services/api';

interface ModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<ModalProps> = ({ transaction, onClose }) => {
  const { openLumoraWithPrompt, addToast } = useApp();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; author: string; note: string; time: string }>>([
    {
      id: 'n1',
      author: 'Sentinel Engine',
      note: 'Anomaly threshold breached on amount ratio and device fingerprinting.',
      time: '12m ago',
    },
  ]);
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  if (!transaction) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        author: 'Investigator (You)',
        note: note.trim(),
        time: 'Just now',
      },
    ]);
    setNote('');
    addToast('Investigation note saved', 'success');
  };

  const handleCreateCase = async () => {
    setIsCreatingCase(true);
    try {
      await createInvestigation({
        transactionId: transaction.transactionId,
        assignedTo: 'Lead Fraud Officer',
        initialNote: `Escalated from transaction inspector. Risk score: ${transaction.riskScore}/100.`,
      });
      addToast(`Case created for ${transaction.transactionId}`, 'success');
    } catch (err) {
      addToast('Investigation case already active or failed to initialize', 'info');
    } finally {
      setIsCreatingCase(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b101e] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3 rounded-xl border ${
                transaction.riskLevel === 'CRITICAL'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : transaction.riskLevel === 'HIGH'
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                  : transaction.riskLevel === 'MODERATE'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">
                  {transaction.transactionId}
                </h2>
                <RiskBadge level={transaction.riskLevel} score={transaction.riskScore} size="md" />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Initiated at {new Date(transaction.timestamp).toLocaleString()} · {transaction.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                openLumoraWithPrompt(`Why was ${transaction.transactionId} flagged?`, transaction)
              }
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Lumora</span>
            </button>

            <button
              onClick={handleCreateCase}
              disabled={isCreatingCase}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreatingCase ? 'Creating...' : 'Open Case'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Amount</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {transaction.currency === 'INR' ? '₹' : '$'}
                {transaction.amount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">
                Baseline avg: {transaction.currency === 'INR' ? '₹' : '$'}
                {transaction.averageTransactionAmount.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Merchant & Category</span>
              <span className="text-sm font-semibold text-white truncate block mt-0.5">
                {transaction.merchant}
              </span>
              <span className="text-[10px] text-indigo-400 block">{transaction.merchantCategory}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Device Fingerprint</span>
              <span className="text-xs font-semibold text-white block mt-0.5 truncate">
                {transaction.deviceType}
              </span>
              <span className={`text-[10px] font-semibold ${transaction.newDevice ? 'text-rose-400' : 'text-emerald-400'}`}>
                {transaction.newDevice ? 'New Unrecognized Device' : 'Known Device'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Decision & Confidence</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {transaction.decision}
              </span>
              <span className="text-[10px] text-slate-400">
                AI Confidence: {(transaction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* False Positive Notice if applicable */}
          {transaction.isPotentialFalsePositive && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Potential False Positive Advisory
                </h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  {transaction.falsePositiveRationale ||
                    'Device fingerprint and customer authorization match established baselines. Recommend step-up SMS OTP challenge before outright rejection.'}
                </p>
              </div>
            </div>
          )}

          {/* AI Explanation & Recommended Action */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Lumora Explainable Risk Assessment
              </h3>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {transaction.explanation}
            </p>

            {transaction.explanationBullets && transaction.explanationBullets.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {transaction.explanationBullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            )}

            {transaction.recommendedAction && (
              <div className="mt-3 pt-3 border-t border-purple-900/40 flex items-start gap-2 text-xs">
                <span className="font-bold text-purple-300 shrink-0">Recommended Action:</span>
                <span className="text-slate-200">{transaction.recommendedAction}</span>
              </div>
            )}
          </div>

          {/* Behavioral Signals Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Triggered Risk Signals & Weights
            </h3>
            {transaction.riskSignals && transaction.riskSignals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transaction.riskSignals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{sig.name}</span>
                        <RiskBadge level={sig.severity} size="sm" showDot={false} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {sig.description}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span>Contribution Weight</span>
                        <span>{sig.score} / {sig.maxScore} pts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sig.severity === 'CRITICAL'
                              ? 'bg-rose-500'
                              : sig.severity === 'HIGH'
                              ? 'bg-orange-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min((sig.score / sig.maxScore) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 text-center">
                No adverse risk signals triggered for this transaction.
              </div>
            )}
          </div>

          {/* Behavioral Timeline */}
          {transaction.timeline && transaction.timeline.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Behavioral Timeline</span>
              </h3>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {transaction.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <span
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        event.severity === 'critical'
                          ? 'bg-rose-500 shadow-sm shadow-rose-500'
                          : event.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 font-semibold">
                        {event.time}
                      </span>
                      <span className="text-xs font-bold text-white">{event.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Investigation Notes</span>
            </h3>

            <div className="space-y-2.5 mb-3.5">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-indigo-400">{n.author}:</span>
                    <p className="text-slate-300 mt-0.5">{n.note}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add case observation or investigation note..."
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!note.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
