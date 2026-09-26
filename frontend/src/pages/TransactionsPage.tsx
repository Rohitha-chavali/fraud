import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { fetchTransactions } from '../services/api';
import { Transaction, RiskLevel } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';

export const TransactionsPage: React.FC = () => {
  const { setActiveTransactionModal, openLumoraWithPrompt } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const limit = 20;

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchTransactions({
        riskLevel: riskFilter,
        status: statusFilter,
        search: search.trim() || undefined,
        limit,
        skip: page * limit,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [riskFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              <span>Transactions Directory</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {total} Total Monitored
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and inspect financial transactions evaluated by the fraud detection engine.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b101f] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Txn ID, Customer, Merchant, City..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Risk Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-1 text-[11px] font-medium">Risk:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setRiskFilter(lvl);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                riskFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0b101f] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d19] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0a0f1d]">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.transactionId}
                    onClick={() => setActiveTransactionModal(t)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300 group-hover:text-indigo-200">
                      {t.transactionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">
                        {t.customerProfile?.name || t.customerId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{t.customerId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {t.currency === 'INR' ? '₹' : '$'}
                      {Number(t.amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="block truncate max-w-[130px] font-medium text-white">
                        {t.merchant}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{t.merchantCategory}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{t.location}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="block truncate max-w-[120px]">{t.deviceType}</span>
                      {t.newDevice && (
                        <span className="text-[9px] font-semibold text-rose-400">Novel Device</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={t.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {t.riskScore}/100
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{page * limit + 1}</strong> to{' '}
            <strong className="text-white">{Math.min((page + 1) * limit, total)}</strong> of{' '}
            <strong className="text-white">{total}</strong> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
