import React, { useEffect, useState } from 'react';
import {
  FolderSearch,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  Send,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { fetchInvestigations, updateInvestigation, fetchTransactionDetail } from '../services/api';
import { InvestigationCase, InvestigationStatus } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';

export const InvestigationsPage: React.FC = () => {
  const { setActiveTransactionModal, openLumoraWithPrompt, addToast } = useApp();

  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [counts, setCounts] = useState({ new: 0, investigating: 0, actionRequired: 0, resolved: 0 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchInvestigations(activeTab);
      setCases(res.cases);
      setCounts(res.counts);
      if (res.cases.length > 0 && !selectedCase) {
        setSelectedCase(res.cases[0]);
      } else if (selectedCase) {
        const found = res.cases.find((c) => c.caseId === selectedCase.caseId);
        if (found) setSelectedCase(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleStatusChange = async (caseId: string, newStatus: InvestigationStatus) => {
    try {
      const updated = await updateInvestigation(caseId, { status: newStatus });
      setSelectedCase(updated);
      addToast(`Status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      addToast('Failed to update case status', 'error');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNote.trim()) return;

    try {
      const updated = await updateInvestigation(selectedCase.caseId, {
        newNote: newNote.trim(),
        noteAuthor: 'Lead Analyst (You)',
      });
      setSelectedCase(updated);
      setNewNote('');
      addToast('Investigation note appended', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to save note', 'error');
    }
  };

  const handleOpenTransaction = async (txnId: string) => {
    try {
      const txn = await fetchTransactionDetail(txnId);
      setActiveTransactionModal(txn);
    } catch (err) {
      addToast(`Could not load transaction ${txnId}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FolderSearch className="w-5 h-5 text-indigo-400" />
              <span>Investigation Center</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              FORENSIC CASE MANAGEMENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conduct multi-factor investigations, document analyst findings, and resolve flagged account incidents.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Cases"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Counters Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600/15 border-indigo-500 text-white'
              : 'bg-[#0b101f] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] block">All Open Cases</span>
          <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">
            {counts.new + counts.investigating + counts.actionRequired + counts.resolved}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('investigating')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'investigating'
              ? 'bg-indigo-600/15 border-indigo-500 text-white'
              : 'bg-[#0b101f] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] block">In Progress</span>
          <span className="text-xl font-extrabold font-mono text-amber-400 mt-0.5 block">
            {counts.investigating}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('action required')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'action required'
              ? 'bg-indigo-600/15 border-indigo-500 text-white'
              : 'bg-[#0b101f] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] block">Action Required</span>
          <span className="text-xl font-extrabold font-mono text-rose-400 mt-0.5 block">
            {counts.actionRequired}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTab === 'resolved'
              ? 'bg-indigo-600/15 border-indigo-500 text-white'
              : 'bg-[#0b101f] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] block">Resolved Cases</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5 block">
            {counts.resolved}
          </span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Case Docket
            </span>
            <span className="text-xs text-slate-400 font-mono">{cases.length} cases</span>
          </div>

          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
            {cases.map((c) => {
              const isSelected = selectedCase?.caseId === c.caseId;
              return (
                <div
                  key={c.caseId}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
                      : 'bg-[#0b101f] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white">{c.caseId}</span>
                    <RiskBadge level={c.riskLevel} score={c.riskScore} size="sm" />
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Txn:</span>
                      <span className="font-mono font-semibold text-indigo-300">{c.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Merchant / Amount:</span>
                      <span className="text-white font-medium">
                        {c.currency === 'INR' ? '₹' : '$'}
                        {Number(c.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned To:</span>
                      <span className="text-slate-300">{c.assignedTo}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : c.status === 'Action Required'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Workspace Panel (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-5">
              {/* Case Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">{selectedCase.caseId}</h3>
                    <RiskBadge level={selectedCase.riskLevel} score={selectedCase.riskScore} size="sm" />
                  </div>
                  <span className="text-xs text-slate-400">
                    Opened on {new Date(selectedCase.createdAt).toLocaleString()} · Assigned to {selectedCase.assignedTo}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      openLumoraWithPrompt(
                        `Summarize investigation case ${selectedCase.caseId} for transaction ${selectedCase.transactionId} and provide action protocol.`
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lumora Case Brief</span>
                  </button>

                  <button
                    onClick={() => handleOpenTransaction(selectedCase.transactionId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <span>View Txn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-medium">Update Investigation Status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['New', 'Investigating', 'Action Required', 'Resolved'] as InvestigationStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedCase.caseId, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedCase.status === st
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Forensic Notes & Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Forensic Notes & Case Log
                </h4>

                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedCase.notes && selectedCase.notes.length > 0 ? (
                    selectedCase.notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-400">{n.author}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{n.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
                      No investigation notes documented yet.
                    </div>
                  )}
                </div>

                {/* Append Note Input */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Document analyst finding, cardholder interview, or action note..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0b101f] border border-slate-800 text-center text-slate-400">
              Select an investigation case from the docket to manage forensic records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
