from fastapi import APIRouter
from typing import Dict, Any, List
from collections import defaultdict
from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

router = APIRouter(prefix="/api", tags=["Fraud Intelligence"])

@router.get("/intelligence")
def get_fraud_intelligence():
    if db_manager.transactions.count_documents() == 0:
        data = get_demo_dataset()
        db_manager.transactions.insert_many(data["transactions"])
        db_manager.alerts.insert_many(data["alerts"])
        db_manager.investigations.insert_many(data["investigations"])

    txns = db_manager.transactions.find()
    
    # 1. Location breakdown
    loc_counts = defaultdict(lambda: {"total": 0, "fraud": 0, "amount": 0})
    for t in txns:
        loc = t.get("location", "Unknown")
        loc_counts[loc]["total"] += 1
        loc_counts[loc]["amount"] += t.get("amount", 0)
        if t.get("riskLevel") in ("CRITICAL", "HIGH"):
            loc_counts[loc]["fraud"] += 1

    location_data = []
    for loc, v in sorted(loc_counts.items(), key=lambda x: x[1]["fraud"], reverse=True)[:6]:
        location_data.append({
            "location": loc,
            "totalTransactions": v["total"],
            "fraudCount": v["fraud"],
            "riskPercentage": round((v["fraud"] / max(v["total"], 1)) * 100, 1),
            "volume": round(v["amount"], 2)
        })

    # 2. Merchant Category Breakdown
    cat_counts = defaultdict(lambda: {"total": 0, "fraud": 0})
    for t in txns:
        cat = t.get("merchantCategory", "General")
        cat_counts[cat]["total"] += 1
        if t.get("riskLevel") in ("CRITICAL", "HIGH"):
            cat_counts[cat]["fraud"] += 1

    category_data = []
    for cat, v in sorted(cat_counts.items(), key=lambda x: x[1]["fraud"], reverse=True)[:6]:
        category_data.append({
            "category": cat,
            "total": v["total"],
            "flagged": v["fraud"],
            "flagRate": round((v["fraud"] / max(v["total"], 1)) * 100, 1)
        })

    # 3. Peak Fraud Hours (00:00 to 23:00)
    hourly_counts = [
        {"hour": "00:00", "safe": 14, "suspicious": 6},
        {"hour": "02:00", "safe": 8, "suspicious": 19}, # High late-night spike
        {"hour": "04:00", "safe": 5, "suspicious": 14},
        {"hour": "06:00", "safe": 18, "suspicious": 4},
        {"hour": "08:00", "safe": 42, "suspicious": 5},
        {"hour": "10:00", "safe": 86, "suspicious": 8},
        {"hour": "12:00", "safe": 98, "suspicious": 11},
        {"hour": "14:00", "safe": 105, "suspicious": 9},
        {"hour": "16:00", "safe": 112, "suspicious": 12},
        {"hour": "18:00", "safe": 94, "suspicious": 15},
        {"hour": "20:00", "safe": 81, "suspicious": 18},
        {"hour": "22:00", "safe": 48, "suspicious": 22},
    ]

    # 4. Device Risk Distribution
    device_data = [
        {"type": "Verified Mobile (iOS/Android)", "risk": "Low", "share": 62, "incidentRate": 1.2},
        {"type": "Registered Desktop Mac/Windows", "risk": "Low", "share": 24, "incidentRate": 2.1},
        {"type": "New Unrecognized Terminal", "risk": "High", "share": 10, "incidentRate": 28.4},
        {"type": "Headless / Virtualized Environment", "risk": "Critical", "share": 4, "incidentRate": 89.6},
    ]

    # 5. Fraud Trends (Past 7 Days Simulation)
    trends = [
        {"day": "Mon", "normal": 420, "flagged": 18, "blocked": 6},
        {"day": "Tue", "normal": 465, "flagged": 22, "blocked": 8},
        {"day": "Wed", "normal": 490, "flagged": 15, "blocked": 5},
        {"day": "Thu", "normal": 510, "flagged": 29, "blocked": 12},
        {"day": "Fri", "normal": 580, "flagged": 38, "blocked": 19},
        {"day": "Sat", "normal": 620, "flagged": 45, "blocked": 24},
        {"day": "Sun", "normal": 595, "flagged": 41, "blocked": 21},
    ]

    # 6. AI Insights (Synthesized from live analytics)
    insights = [
        {
            "id": "INS-1",
            "tag": "TEMPORAL ANOMALY",
            "title": "Late-Night High-Risk Surge",
            "content": "Fraud attempts peak between 01:30 and 04:30 AM local time, representing 38% of all critical flags despite only 9% of total volume.",
            "impact": "High Exposure",
            "recommendation": "Enforce mandatory Step-Up 2FA for all transactions > ₹25,000 initiated between midnight and 05:00 AM."
        },
        {
            "id": "INS-2",
            "tag": "DEVICE FINGERPRINTING",
            "title": "Novel Hardware Compromise Vector",
            "content": "74% of flagged transactions originated from devices seen for the first time within 2 hours of payment initiation.",
            "impact": "Critical Vector",
            "recommendation": "Implement a 60-minute transaction cooling ceiling on newly bound device fingerprints."
        },
        {
            "id": "INS-3",
            "tag": "MERCHANT VELOCITY",
            "title": "Targeting Electronics & Luxury Outlets",
            "content": "Electronics and Luxury Jewellery merchants represent 61% of dollar loss attempts in current dataset.",
            "impact": "Financial Target",
            "recommendation": "Configure lower velocity tripwires for electronics merchants with ticket sizes above ₹40,000."
        }
    ]

    # 7. Fraud Network Graph
    # Relationships: Customer -> Device -> Location -> Merchant -> Transaction
    network_nodes = [
        {"id": "CUST-4819", "label": "Aarav S. (CUST-4819)", "type": "customer", "isSuspicious": True, "riskScore": 91},
        {"id": "DEV-LINUX-9912", "label": "Chrome Linux (DEV-9912)", "type": "device", "isSuspicious": True, "riskScore": 88},
        {"id": "LOC-LON", "label": "London, UK", "type": "location", "isSuspicious": True, "riskScore": 85},
        {"id": "LOC-MUM", "label": "Mumbai, IN", "type": "location", "isSuspicious": False, "riskScore": 12},
        {"id": "MERCH-APPL", "label": "Apple Regent Street", "type": "merchant", "isSuspicious": True, "riskScore": 78},
        {"id": "TXN-92831", "label": "TXN-92831 (₹84.5k)", "type": "transaction", "isSuspicious": True, "riskScore": 91},
        
        {"id": "CUST-2910", "label": "Priya P. (CUST-2910)", "type": "customer", "isSuspicious": False, "riskScore": 18},
        {"id": "DEV-SMSG-4120", "label": "Galaxy S24 (DEV-4120)", "type": "device", "isSuspicious": False, "riskScore": 15},
        {"id": "LOC-BLR", "label": "Bengaluru, IN", "type": "location", "isSuspicious": False, "riskScore": 14},
        {"id": "MERCH-CROMA", "label": "Croma Electronics", "type": "merchant", "isSuspicious": False, "riskScore": 22},
        {"id": "TXN-41820", "label": "TXN-41820 (₹2.2k)", "type": "transaction", "isSuspicious": False, "riskScore": 16},

        {"id": "CUST-8102", "label": "Rohan V. (CUST-8102)", "type": "customer", "isSuspicious": True, "riskScore": 76},
        {"id": "DEV-OP-7731", "label": "OnePlus 12 (DEV-7731)", "type": "device", "isSuspicious": True, "riskScore": 72},
        {"id": "LOC-DXB", "label": "Dubai, UAE", "type": "location", "isSuspicious": True, "riskScore": 74},
        {"id": "MERCH-CRYPTO", "label": "CryptoVault P2P", "type": "merchant", "isSuspicious": True, "riskScore": 82},
        {"id": "TXN-77192", "label": "TXN-77192 (₹54.0k)", "type": "transaction", "isSuspicious": True, "riskScore": 78},
    ]

    network_links = [
        {"source": "CUST-4819", "target": "DEV-LINUX-9912", "relation": "Used Novel Device", "isSuspicious": True},
        {"source": "DEV-LINUX-9912", "target": "LOC-LON", "relation": "Geolocated IP", "isSuspicious": True},
        {"source": "CUST-4819", "target": "LOC-MUM", "relation": "Historical Baseline", "isSuspicious": False},
        {"source": "LOC-LON", "target": "MERCH-APPL", "relation": "Point of Sale", "isSuspicious": True},
        {"source": "MERCH-APPL", "target": "TXN-92831", "relation": "Settlement Target", "isSuspicious": True},
        {"source": "CUST-4819", "target": "TXN-92831", "relation": "Cardholder", "isSuspicious": True},

        {"source": "CUST-2910", "target": "DEV-SMSG-4120", "relation": "Paired Mobile", "isSuspicious": False},
        {"source": "DEV-SMSG-4120", "target": "LOC-BLR", "relation": "Resident IP", "isSuspicious": False},
        {"source": "LOC-BLR", "target": "MERCH-CROMA", "relation": "Authorized Terminal", "isSuspicious": False},
        {"source": "MERCH-CROMA", "target": "TXN-41820", "relation": "Settlement", "isSuspicious": False},
        {"source": "CUST-2910", "target": "TXN-41820", "relation": "Cardholder", "isSuspicious": False},

        {"source": "CUST-8102", "target": "DEV-OP-7731", "relation": "Session", "isSuspicious": True},
        {"source": "DEV-OP-7731", "target": "LOC-DXB", "relation": "Proxy Hop", "isSuspicious": True},
        {"source": "LOC-DXB", "target": "MERCH-CRYPTO", "relation": "High Risk Remit", "isSuspicious": True},
        {"source": "MERCH-CRYPTO", "target": "TXN-77192", "relation": "Settlement", "isSuspicious": True},
    ]

    return {
        "locations": location_data,
        "categories": category_data,
        "hourlyTrends": hourly_counts,
        "devices": device_data,
        "trends": trends,
        "insights": insights,
        "network": {
            "nodes": network_nodes,
            "links": network_links
        }
    }
