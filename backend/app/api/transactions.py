from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
import random
from backend.app.database.db import db_manager
from backend.app.models.schemas import TransactionCreate, Transaction
from backend.app.fraud.engine import calculate_fraud_risk
from backend.app.ai.gemini_service import lumora_service
from backend.app.services.seed_data import generate_realistic_timeline, get_demo_dataset

router = APIRouter(prefix="/api", tags=["Transactions"])

@router.get("/transactions")
def get_transactions(
    riskLevel: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    if db_manager.transactions.count_documents() == 0:
        data = get_demo_dataset()
        db_manager.transactions.insert_many(data["transactions"])
        db_manager.alerts.insert_many(data["alerts"])
        db_manager.investigations.insert_many(data["investigations"])

    txns = db_manager.transactions.find()

    # Filter
    filtered = txns
    if riskLevel and riskLevel.upper() != "ALL":
        filtered = [t for t in filtered if t.get("riskLevel", "").upper() == riskLevel.upper()]

    if status and status.upper() != "ALL":
        filtered = [t for t in filtered if t.get("status", "").upper() == status.upper()]

    if search:
        s = search.lower().strip()
        filtered = [
            t for t in filtered
            if s in t.get("transactionId", "").lower()
            or s in t.get("customerId", "").lower()
            or s in t.get("merchant", "").lower()
            or s in t.get("location", "").lower()
            or s in str(t.get("customerProfile", {}).get("name", "")).lower()
        ]

    # Sort descending by timestamp
    filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    total_count = len(filtered)
    paginated = filtered[skip : skip + limit]

    return {
        "total": total_count,
        "limit": limit,
        "skip": skip,
        "transactions": paginated
    }

@router.get("/transactions/{transaction_id}")
def get_transaction_detail(transaction_id: str):
    txn = db_manager.transactions.find_one({"transactionId": transaction_id})
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    
    # If timeline or explanation is missing, generate
    if not txn.get("timeline"):
        txn["timeline"] = generate_realistic_timeline(
            txn.get("riskScore", 10),
            txn.get("location", "Mumbai"),
            txn.get("previousLocation", ""),
            txn.get("newDevice", False),
            txn.get("failedAttempts", 0)
        )
    return txn

@router.post("/transactions/analyze")
def analyze_transaction(payload: TransactionCreate):
    t_dict = payload.model_dump()
    
    # Fill defaults if missing
    if not t_dict.get("timestamp"):
        t_dict["timestamp"] = datetime.utcnow().isoformat()
    if not t_dict.get("transactionId"):
        t_dict["transactionId"] = f"TXN-{random.randint(10000, 99999)}"

    # 1. Deterministic Engine Evaluation
    assessment = calculate_fraud_risk(t_dict)
    
    # 2. Enrich with structured explanation and AI assistance
    t_dict["riskScore"] = assessment.riskScore
    t_dict["riskLevel"] = assessment.riskLevel
    t_dict["decision"] = assessment.decision
    t_dict["confidence"] = assessment.confidence
    t_dict["riskSignals"] = [s.model_dump() for s in assessment.triggeredSignals]
    t_dict["breakdown"] = assessment.breakdown
    t_dict["isPotentialFalsePositive"] = assessment.isPotentialFalsePositive
    t_dict["falsePositiveRationale"] = assessment.falsePositiveRationale
    t_dict["recommendedAction"] = assessment.recommendedAction
    t_dict["explanation"] = assessment.explanation
    t_dict["explanationBullets"] = assessment.explanationBullets
    t_dict["status"] = "FLAGGED" if assessment.riskLevel in ("CRITICAL", "HIGH") else "APPROVED"

    # Generate timeline
    t_dict["timeline"] = generate_realistic_timeline(
        assessment.riskScore,
        t_dict.get("location", "Unknown"),
        t_dict.get("previousLocation", ""),
        t_dict.get("newDevice", False),
        t_dict.get("failedAttempts", 0)
    )

    t_dict["customerProfile"] = {
        "name": f"User {t_dict.get('customerId')}",
        "tier": "Standard",
        "avgAmount": t_dict.get("averageTransactionAmount", 2500),
        "totalTxns": 42,
        "homeLocation": t_dict.get("previousLocation") or t_dict.get("location")
    }

    # Store transaction
    db_manager.transactions.insert_one(t_dict)

    # 3. Create Alert if High or Critical
    if assessment.riskLevel in ("CRITICAL", "HIGH"):
        alert_id = f"ALT-{random.randint(1000, 9999)}"
        db_manager.alerts.insert_one({
            "alertId": alert_id,
            "transactionId": t_dict["transactionId"],
            "riskScore": assessment.riskScore,
            "severity": assessment.riskLevel,
            "reason": assessment.triggeredSignals[0].name if assessment.triggeredSignals else "High Risk Anomaly",
            "signals": [s.name for s in assessment.triggeredSignals],
            "status": "NEW",
            "amount": t_dict["amount"],
            "currency": t_dict.get("currency", "INR"),
            "location": t_dict.get("location", "Unknown"),
            "merchant": t_dict.get("merchant", "Merchant"),
            "createdAt": t_dict["timestamp"]
        })

    # Return full analyzed transaction with assessment
    return {
        "transaction": t_dict,
        "assessment": assessment.model_dump()
    }
