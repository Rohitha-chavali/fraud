from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any, List
from datetime import datetime
import random
from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

router = APIRouter(prefix="/api", tags=["Investigations"])

@router.get("/investigations")
def get_investigations(status: Optional[str] = None):
    if db_manager.investigations.count_documents() == 0:
        data = get_demo_dataset()
        db_manager.transactions.insert_many(data["transactions"])
        db_manager.alerts.insert_many(data["alerts"])
        db_manager.investigations.insert_many(data["investigations"])

    cases = db_manager.investigations.find()
    
    if status and status.lower() != "all":
        cases = [c for c in cases if c.get("status", "").lower() == status.lower()]

    cases.sort(key=lambda x: x.get("updatedAt", ""), reverse=True)

    # Status counts
    all_cases = db_manager.investigations.find()
    counts = {
        "new": sum(1 for c in all_cases if c.get("status") == "New"),
        "investigating": sum(1 for c in all_cases if c.get("status") == "Investigating"),
        "actionRequired": sum(1 for c in all_cases if c.get("status") == "Action Required"),
        "resolved": sum(1 for c in all_cases if c.get("status") == "Resolved"),
    }

    return {"cases": cases, "counts": counts, "total": len(cases)}

@router.post("/investigations")
def create_investigation(payload: Dict[str, Any] = Body(...)):
    txn_id = payload.get("transactionId")
    if not txn_id:
        raise HTTPException(status_code=400, detail="transactionId is required")

    txn = db_manager.transactions.find_one({"transactionId": txn_id})
    case_id = f"CASE-{random.randint(1000, 9999)}"
    
    case = {
        "caseId": case_id,
        "transactionId": txn_id,
        "assignedTo": payload.get("assignedTo", "Senior Fraud Analyst"),
        "status": payload.get("status", "New"),
        "priority": payload.get("priority", "High" if (txn and txn.get("riskScore", 0) > 60) else "Medium"),
        "riskScore": txn.get("riskScore", 75) if txn else 75,
        "riskLevel": txn.get("riskLevel", "HIGH") if txn else "HIGH",
        "merchant": txn.get("merchant", "Merchant") if txn else "Unknown",
        "amount": txn.get("amount", 0) if txn else 0,
        "currency": txn.get("currency", "INR") if txn else "INR",
        "notes": [
            {
                "id": "NOTE-1",
                "author": "Fraud Shield AI Sentinel",
                "note": payload.get("initialNote", f"Investigation opened for suspicious transaction {txn_id}."),
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
            }
        ],
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }

    db_manager.investigations.insert_one(case)
    return case

@router.patch("/investigations/{case_id}")
def update_investigation(case_id: str, payload: Dict[str, Any] = Body(...)):
    existing = db_manager.investigations.find_one({"caseId": case_id})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    notes = existing.get("notes", [])
    if "newNote" in payload and payload["newNote"]:
        note_text = payload["newNote"].strip()
        notes.append({
            "id": f"NOTE-{len(notes) + 1}",
            "author": payload.get("noteAuthor", "Lead Investigator"),
            "note": note_text,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        })

    update_fields = {
        "updatedAt": datetime.utcnow().isoformat(),
        "notes": notes
    }
    if "status" in payload:
        update_fields["status"] = payload["status"]
    if "assignedTo" in payload:
        update_fields["assignedTo"] = payload["assignedTo"]
    if "priority" in payload:
        update_fields["priority"] = payload["priority"]

    db_manager.investigations.update_one({"caseId": case_id}, update_fields)
    updated_case = db_manager.investigations.find_one({"caseId": case_id})
    return updated_case
