from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class RiskSignal(BaseModel):
    code: str
    name: str
    score: float
    maxScore: float
    severity: str  # LOW, MODERATE, HIGH, CRITICAL
    description: str

class RiskAssessment(BaseModel):
    riskScore: int  # 0 to 100
    riskLevel: str  # LOW, MODERATE, HIGH, CRITICAL
    decision: str   # APPROVE, REVIEW, CHALLENGE, DECLINE
    confidence: float # 0.0 to 1.0
    triggeredSignals: List[RiskSignal]
    explanation: str
    explanationBullets: List[str]
    recommendedAction: str
    breakdown: Dict[str, float]
    isPotentialFalsePositive: bool = False
    falsePositiveRationale: Optional[str] = None

class TransactionBase(BaseModel):
    transactionId: str
    customerId: str
    amount: float
    currency: str = "INR"
    merchant: str
    merchantCategory: str
    location: str
    previousLocation: Optional[str] = None
    deviceId: str
    deviceType: str
    timestamp: Optional[str] = None
    previousTransactionTime: Optional[str] = None
    averageTransactionAmount: float = 2500.0
    accountAge: int = 180  # in days
    failedAttempts: int = 0
    international: bool = False
    newDevice: bool = False
    newLocation: bool = False

class TransactionCreate(TransactionBase):
    pass

class TimelineEvent(BaseModel):
    time: str
    title: str
    description: str
    severity: str = "normal"  # normal, warning, critical

class Transaction(TransactionBase):
    riskScore: int
    riskLevel: str
    riskSignals: List[RiskSignal] = []
    status: str = "PENDING"  # PENDING, APPROVED, FLAGGED, BLOCKED, RESOLVED
    decision: str = "APPROVE"
    confidence: float = 0.95
    explanation: Optional[str] = None
    explanationBullets: List[str] = []
    recommendedAction: Optional[str] = None
    breakdown: Dict[str, float] = {}
    isPotentialFalsePositive: bool = False
    timeline: List[TimelineEvent] = []
    customerProfile: Optional[Dict[str, Any]] = None
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class FraudAlert(BaseModel):
    alertId: str
    transactionId: str
    riskScore: int
    severity: str  # MODERATE, HIGH, CRITICAL
    reason: str
    signals: List[str] = []
    status: str = "NEW"  # NEW, INVESTIGATING, RESOLVED, DISMISSED
    amount: float
    currency: str = "INR"
    location: str
    merchant: str
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class InvestigationNote(BaseModel):
    id: str
    author: str
    note: str
    timestamp: str

class Investigation(BaseModel):
    caseId: str
    transactionId: str
    assignedTo: str = "Senior Analyst"
    status: str = "New"  # New, Investigating, Action Required, Resolved
    priority: str = "High" # Low, Medium, High, Critical
    riskScore: int
    riskLevel: str
    merchant: str
    amount: float
    currency: str = "INR"
    notes: List[InvestigationNote] = []
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class LumoraChatRequest(BaseModel):
    message: str
    transactionId: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    conversationHistory: Optional[List[Dict[str, str]]] = []
    settings: Optional[Dict[str, Any]] = None

class LumoraChatResponse(BaseModel):
    response: str
    structuredAnalysis: Optional[Dict[str, Any]] = None
    suggestedActions: List[str] = []
    citedSignals: List[str] = []
    transactionContext: Optional[Dict[str, Any]] = None

class DashboardMetrics(BaseModel):
    transactionsAnalyzed: int
    fraudDetected: int
    highRisk: int
    detectionAccuracy: float
    demoMode: bool = True
    lastUpdated: str
    riskDistribution: Dict[str, int]
    liveThreats: List[Dict[str, Any]]
