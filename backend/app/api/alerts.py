from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

router = APIRouter(prefix="/api", tags=["Fraud Alerts"])

@router.get("/alerts")
def get_alerts(severity: Optional[str] = None, status: Optional[str] = None):
    if db_manager.alerts.count_documents() == 0:
        data = get_demo_dataset()
        db_manager.transactions.insert_many(data["transactions"])
        db_manager.alerts.insert_many(data["alerts"])
        db_manager.investigations.insert_many(data["investigations"])

    alerts = db_manager.alerts.find()
    
    if severity and severity.upper() != "ALL":
        alerts = [a for a in alerts if a.get("severity", "").upper() == severity.upper()]

    if status and status.upper() != "ALL":
        alerts = [a for a in alerts if a.get("status", "").upper() == status.upper()]

    alerts.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return {"alerts": alerts, "total": len(alerts)}

@router.patch("/alerts/{alert_id}")
def update_alert(alert_id: str, payload: Dict[str, Any] = Body(...)):
    existing = db_manager.alerts.find_one({"alertId": alert_id})
    if not existing:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    updated = db_manager.alerts.update_one({"alertId": alert_id}, payload)
    return {"success": True, "alertId": alert_id, "updated": payload}
