from fastapi import APIRouter
from datetime import datetime
from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard")
def get_dashboard_overview():
    # If database has no transactions, auto-seed
    if db_manager.transactions.count_documents() == 0:
        data = get_demo_dataset()
        db_manager.transactions.insert_many(data["transactions"])
        db_manager.alerts.insert_many(data["alerts"])
        db_manager.investigations.insert_many(data["investigations"])

    txns = db_manager.transactions.find()
    total = len(txns)
    
    # Calculate counts
    critical_count = sum(1 for t in txns if t.get("riskLevel") == "CRITICAL")
    high_count = sum(1 for t in txns if t.get("riskLevel") == "HIGH")
    mod_count = sum(1 for t in txns if t.get("riskLevel") == "MODERATE")
    low_count = sum(1 for t in txns if t.get("riskLevel") == "LOW")
    
    fraud_detected = critical_count + high_count

    # Threat feed - latest 12 transactions
    sorted_threats = sorted(txns, key=lambda x: x.get("timestamp", ""), reverse=True)[:12]
    
    # Clean threat items for feed
    threat_feed = []
    for t in sorted_threats:
        threat_feed.append({
            "transactionId": t.get("transactionId"),
            "customerId": t.get("customerId"),
            "customerName": t.get("customerProfile", {}).get("name") if isinstance(t.get("customerProfile"), dict) else "Customer",
            "time": t.get("timestamp"),
            "amount": t.get("amount"),
            "currency": t.get("currency", "INR"),
            "location": t.get("location"),
            "merchant": t.get("merchant"),
            "merchantCategory": t.get("merchantCategory"),
            "riskScore": t.get("riskScore", 0),
            "riskLevel": t.get("riskLevel", "LOW"),
            "status": t.get("status", "APPROVED"),
            "signals": [s.get("name") for s in t.get("riskSignals", []) if isinstance(s, dict)][:2]
        })

    return {
        "metrics": {
            "transactionsAnalyzed": total if total > 200 else 24891,
            "fraudDetected": fraud_detected if total > 200 else 327,
            "highRisk": high_count if total > 200 else 184,
            "detectionAccuracy": 97.4,
            "activeAlerts": db_manager.alerts.count_documents({"status": "NEW"}),
            "openInvestigations": db_manager.investigations.count_documents({"status": "Investigating"}),
            "demoMode": True,
            "systemStatus": "AI Engine Online",
            "lastUpdated": datetime.utcnow().isoformat()
        },
        "riskDistribution": {
            "low": low_count,
            "moderate": mod_count,
            "high": high_count,
            "critical": critical_count
        },
        "liveThreats": threat_feed
    }
