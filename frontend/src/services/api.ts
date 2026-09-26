import {
  DashboardMetrics,
  Transaction,
  FraudAlert,
  InvestigationCase,
  IntelligenceData,
  RiskLevel
} from '../types';

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchDashboard(): Promise<{
  metrics: DashboardMetrics;
  riskDistribution: { low: number; moderate: number; high: number; critical: number };
  liveThreats: any[];
}> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchTransactions(params?: {
  riskLevel?: string;
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<{ total: number; transactions: Transaction[] }> {
  const url = new URL(`${API_BASE}/transactions`, window.location.origin);
  if (params?.riskLevel) url.searchParams.set('riskLevel', params.riskLevel);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.search) url.searchParams.set('search', params.search);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.skip) url.searchParams.set('skip', String(params.skip));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionDetail(transactionId: string): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${transactionId}`);
  if (!res.ok) throw new Error(`Transaction ${transactionId} not found`);
  return res.json();
}

export async function analyzeTransaction(payload: Partial<Transaction>): Promise<{
  transaction: Transaction;
  assessment: any;
}> {
  const res = await fetch(`${API_BASE}/transactions/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Risk analysis failed');
  }
  return res.json();
}

export async function fetchAlerts(severity?: string, status?: string): Promise<{ alerts: FraudAlert[]; total: number }> {
  const url = new URL(`${API_BASE}/alerts`, window.location.origin);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (status && status !== 'ALL') url.searchParams.set('status', status);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch fraud alerts');
  return res.json();
}

export async function updateAlertStatus(alertId: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update alert');
  return res.json();
}

export async function fetchInvestigations(status?: string): Promise<{
  cases: InvestigationCase[];
  counts: { new: number; investigating: number; actionRequired: number; resolved: number };
  total: number;
}> {
  const url = new URL(`${API_BASE}/investigations`, window.location.origin);
  if (status && status.toLowerCase() !== 'all') url.searchParams.set('status', status);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch investigations');
  return res.json();
}

export async function createInvestigation(payload: {
  transactionId: string;
  assignedTo?: string;
  initialNote?: string;
  priority?: string;
}): Promise<InvestigationCase> {
  const res = await fetch(`${API_BASE}/investigations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create investigation case');
  return res.json();
}

export async function updateInvestigation(caseId: string, payload: {
  status?: string;
  assignedTo?: string;
  newNote?: string;
  noteAuthor?: string;
  priority?: string;
}): Promise<InvestigationCase> {
  const res = await fetch(`${API_BASE}/investigations/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update case');
  return res.json();
}

export async function fetchIntelligence(): Promise<IntelligenceData> {
  const res = await fetch(`${API_BASE}/intelligence`);
  if (!res.ok) throw new Error('Failed to fetch intelligence analytics');
  return res.json();
}

export async function sendLumoraChat(params: {
  message: string;
  transactionId?: string;
  history?: Array<{ role: string; content: string }>;
  settings?: { style: string };
}): Promise<{
  response: string;
  suggestedActions: string[];
  citedSignals: string[];
  transactionContext?: { transactionId?: string };
}> {
  const res = await fetch(`${API_BASE}/lumora/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message,
      transactionId: params.transactionId,
      conversationHistory: params.history,
      settings: params.settings,
    }),
  });
  if (!res.ok) throw new Error('Lumora assistant temporarily unavailable');
  return res.json();
}
