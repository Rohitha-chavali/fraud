export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type DecisionType = 'APPROVE' | 'REVIEW' | 'CHALLENGE' | 'DECLINE';
export type TransactionStatus = 'APPROVED' | 'FLAGGED' | 'BLOCKED' | 'PENDING' | 'RESOLVED';
export type InvestigationStatus = 'New' | 'Investigating' | 'Action Required' | 'Resolved';

export interface RiskSignal {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  severity: RiskLevel;
  description: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  severity: 'normal' | 'warning' | 'critical';
}

export interface CustomerProfile {
  name: string;
  tier: string;
  avgAmount: number;
  totalTxns: number;
  homeLocation: string;
}

export interface Transaction {
  transactionId: string;
  customerId: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  location: string;
  previousLocation?: string;
  deviceId: string;
  deviceType: string;
  timestamp: string;
  previousTransactionTime?: string;
  averageTransactionAmount: number;
  accountAge: number;
  failedAttempts: number;
  international: boolean;
  newDevice: boolean;
  newLocation: boolean;
  txnsToday?: number;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: DecisionType;
  confidence: number;
  riskSignals: RiskSignal[];
  status: TransactionStatus;
  explanation?: string;
  explanationBullets?: string[];
  recommendedAction?: string;
  breakdown?: Record<string, number>;
  isPotentialFalsePositive?: boolean;
  falsePositiveRationale?: string;
  timeline?: TimelineEvent[];
  customerProfile?: CustomerProfile;
  createdAt?: string;
}

export interface FraudAlert {
  alertId: string;
  transactionId: string;
  riskScore: number;
  severity: RiskLevel;
  reason: string;
  signals: string[];
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  amount: number;
  currency: string;
  location: string;
  merchant: string;
  createdAt: string;
}

export interface InvestigationNote {
  id: string;
  author: string;
  note: string;
  timestamp: string;
}

export interface InvestigationCase {
  caseId: string;
  transactionId: string;
  assignedTo: string;
  status: InvestigationStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  riskLevel: RiskLevel;
  merchant: string;
  amount: number;
  currency: string;
  notes: InvestigationNote[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  transactionsAnalyzed: number;
  fraudDetected: number;
  highRisk: number;
  detectionAccuracy: number;
  activeAlerts: number;
  openInvestigations: number;
  demoMode: boolean;
  systemStatus: string;
  lastUpdated: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'customer' | 'device' | 'location' | 'merchant' | 'transaction';
  isSuspicious: boolean;
  riskScore: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  relation: string;
  isSuspicious: boolean;
}

export interface IntelligenceData {
  locations: Array<{
    location: string;
    totalTransactions: number;
    fraudCount: number;
    riskPercentage: number;
    volume: number;
  }>;
  categories: Array<{
    category: string;
    total: number;
    flagged: number;
    flagRate: number;
  }>;
  hourlyTrends: Array<{
    hour: string;
    safe: number;
    suspicious: number;
  }>;
  devices: Array<{
    type: string;
    risk: string;
    share: number;
    incidentRate: number;
  }>;
  trends: Array<{
    day: string;
    normal: number;
    flagged: number;
    blocked: number;
  }>;
  insights: Array<{
    id: string;
    tag: string;
    title: string;
    content: string;
    impact: string;
    recommendation: string;
  }>;
  network: {
    nodes: NetworkNode[];
    links: NetworkLink[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lumora';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  citedSignals?: string[];
  transactionContext?: { transactionId?: string };
}
