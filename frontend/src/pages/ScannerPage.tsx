import React, { useState } from 'react';
import {
  ScanLine,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FolderPlus,
  Play,
  Info,
} from 'lucide-react';
import { analyzeTransaction, createInvestigation } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';

export const ScannerPage: React.FC = () => {
  const { openLumoraWithPrompt, addToast, setActiveTransactionModal } = useApp();

  const [formData, setFormData] = useState({
    transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    amount: 84500,
    currency: 'INR',
    merchant: 'Apple Store Regent Street',
    merchantCategory: 'Electronics',
    customerId: 'CUST-4819',
    accountAge: 240,
    averageTransactionAmount: 3500,
    txnsToday: 6,
    location: 'London',
    previousLocation: 'Mumbai',
    deviceId: 'DEV-LINUX-9912',
    deviceType: 'Chrome on Linux (Unregistered)',
    failedAttempts: 3,
    newDevice: true,
    newLocation: true,
    international: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<any | null>(null);

  const loadingSteps = [
    'Analyzing transaction telemetry...',
    'Checking behavioral signals & velocity...',
    'Comparing transaction patterns to baseline...',
    'Generating explainable risk assessment...',
  ];

  const presets = [
    {
      title: '🚨 Critical ATO Attack',
      desc: 'London vs Mumbai, ₹84.5k (24× spike), 3 failed attempts, novel Linux terminal',
      data: {
        transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: 84500,
        currency: 'INR',
        merchant: 'Apple Store Regent Street',
        merchantCategory: 'Electronics',
        customerId: 'CUST-4819',
        accountAge: 240,
        averageTransactionAmount: 3500,
        txnsToday: 7,
        location: 'London',
        previousLocation: 'Mumbai',
        deviceId: 'DEV-LINUX-9912',
        deviceType: 'Chrome on Linux (Headless)',
        failedAttempts: 3,
        newDevice: true,
        newLocation: true,
        international: true,
      },
    },
    {
      title: '✅ Normal Everyday Grocery',
      desc: '₹1,850, known device, verified location, 0 failed attempts',
      data: {
        transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: 1850,
        currency: 'INR',
        merchant: 'Nature Basket Supermarket',
        merchantCategory: 'Groceries',
        customerId: 'CUST-2910',
        accountAge: 320,
        averageTransactionAmount: 2200,
        txnsToday: 2,
        location: 'Bengaluru',
        previousLocation: 'Bengaluru',
        deviceId: 'DEV-SMSG-4120',
        deviceType: 'Samsung Galaxy S24',
        failedAttempts: 0,
        newDevice: false,
        newLocation: false,
        international: false,
      },
    },
    {
      title: '⚠️ High Risk Luxury Spike',
      desc: '₹58,000 to Crypto Exchange from new location with 1 failed auth',
      data: {
        transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: 58000,
        currency: 'INR',
        merchant: 'CryptoVault Remit',
        merchantCategory: 'Cryptocurrency',
        customerId: 'CUST-8102',
        accountAge: 65,
        averageTransactionAmount: 2800,
        txnsToday: 4,
        location: 'Dubai',
        previousLocation: 'Delhi',
        deviceId: 'DEV-OP-7731',
        deviceType: 'OnePlus 12',
        failedAttempts: 1,
        newDevice: false,
        newLocation: true,
        international: true,
      },
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setFormData(p.data);
    setResult(null);
    addToast(`Loaded demo scenario: ${p.title}`, 'info');
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);

    // Multi-step animated progress simulation
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    try {
      const res = await analyzeTransaction(formData);
      setResult(res);
      addToast(`Assessment complete: ${res.transaction.riskLevel} (${res.transaction.riskScore}/100)`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!result) return;
    try {
      await createInvestigation({
        transactionId: result.transaction.transactionId,
        assignedTo: 'Lead Fraud Officer',
        initialNote: `Case created from scanner analysis. Risk: ${result.transaction.riskScore}/100.`,
      });
      addToast(`Investigation case opened for ${result.transaction.transactionId}`, 'success');
    } catch (err) {
      addToast('Case already exists or failed to open', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-indigo-400" />
              <span>Analyze a Transaction</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              REAL-TIME RISK ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate or evaluate transactions against the hybrid rule and anomaly detection pipeline.
          </p>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/70 transition-all hover:border-slate-500"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl space-y-6">
            {/* Section 1: Transaction Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">1</span>
                <span>Transaction Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono font-semibold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-medium block mb-1">Merchant Name</label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Merchant Category</label>
                  <input
                    type="text"
                    value={formData.merchantCategory}
                    onChange={(e) => setFormData({ ...formData, merchantCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Customer Context */}
            <div className="border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">2</span>
                <span>Customer Context</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Customer ID</label>
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Account Age (Days)</label>
                  <input
                    type="number"
                    value={formData.accountAge}
                    onChange={(e) => setFormData({ ...formData, accountAge: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Baseline Avg (₹)</label>
                  <input
                    type="number"
                    value={formData.averageTransactionAmount}
                    onChange={(e) => setFormData({ ...formData, averageTransactionAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Txns Today</label>
                  <input
                    type="number"
                    value={formData.txnsToday}
                    onChange={(e) => setFormData({ ...formData, txnsToday: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Device & Location */}
            <div className="border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">3</span>
                <span>Device & Location</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Originating Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Previous Location</label>
                  <input
                    type="text"
                    value={formData.previousLocation}
                    onChange={(e) => setFormData({ ...formData, previousLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Device ID / Fingerprint</label>
                  <input
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Device Type</label>
                  <input
                    type="text"
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Behavioral Signals */}
            <div className="border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">4</span>
                <span>Behavioral & Security Signals</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Failed Auth Attempts</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.failedAttempts}
                    onChange={(e) => setFormData({ ...formData, failedAttempts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="newDevice"
                    checked={formData.newDevice}
                    onChange={(e) => setFormData({ ...formData, newDevice: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="newDevice" className="text-slate-300 font-medium cursor-pointer">
                    New Device
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="newLocation"
                    checked={formData.newLocation}
                    onChange={(e) => setFormData({ ...formData, newLocation: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="newLocation" className="text-slate-300 font-medium cursor-pointer">
                    New Location
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="intlTxn"
                    checked={formData.international}
                    onChange={(e) => setFormData({ ...formData, international: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="intlTxn" className="text-slate-300 font-medium cursor-pointer">
                    International
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-900/40 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingSteps[loadingStep]}</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-4 h-4" />
                    <span>Analyze Risk Telemetry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {loading && (
            <div className="p-8 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Processing Hybrid Risk Model
                </h4>
                <p className="text-xs text-purple-300 mt-1 font-mono">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="p-8 rounded-2xl bg-[#0b101f]/70 border border-slate-800/80 shadow-xl flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
              <div className="p-3 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800">
                <ScanLine className="w-8 h-8 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Scanner Standby</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Enter transaction metrics or pick a preset scenario on the left, then click <strong>Analyze Risk Telemetry</strong>.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="p-6 rounded-2xl bg-[#0b101f] border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              {/* Score Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    Risk Assessment Score
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
                    {result.assessment.riskScore} <span className="text-base text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <RiskBadge level={result.assessment.riskLevel} size="lg" />
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">
                    Decision: <strong className="text-white">{result.assessment.decision}</strong>
                  </span>
                </div>
              </div>

              {/* Potential False Positive Warning if applicable */}
              {result.assessment.isPotentialFalsePositive && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300">False Positive Advisory</strong>
                    <p className="mt-0.5 text-amber-200/90 leading-tight">
                      {result.assessment.falsePositiveRationale}
                    </p>
                  </div>
                </div>
              )}

              {/* Visual Risk Breakdown Bars */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Risk Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(result.assessment.breakdown || {}).map(([key, val]: [string, any]) => {
                    const labelMap: Record<string, string> = {
                      amount_anomaly: 'Amount Anomaly',
                      location_anomaly: 'Location & Travel Risk',
                      device_risk: 'Device Fingerprint Risk',
                      velocity_risk: 'Velocity & Attempts',
                      merchant_risk: 'Merchant Category Risk',
                    };
                    const maxVals: Record<string, number> = {
                      amount_anomaly: 30,
                      location_anomaly: 25,
                      device_risk: 20,
                      velocity_risk: 25,
                      merchant_risk: 20,
                    };
                    const max = maxVals[key] || 30;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300">{labelMap[key] || key}</span>
                          <span className="font-mono text-slate-400">{val} / {max} pts</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-rose-500"
                            style={{ width: `${Math.min((val / max) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explainable AI Rationale */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-purple-300 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why was this flagged?</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {result.assessment.explanation}
                </p>
                {result.assessment.explanationBullets && (
                  <div className="space-y-1 pt-1">
                    {result.assessment.explanationBullets.map((b: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  Recommended Action
                </span>
                <p className="text-white font-medium mt-1">
                  {result.assessment.recommendedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    openLumoraWithPrompt(
                      `Why was ${result.transaction.transactionId} evaluated at ${result.assessment.riskScore}/100 risk?`,
                      result.transaction
                    )
                  }
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Lumora</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateCase}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-900/30"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Open Case</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
