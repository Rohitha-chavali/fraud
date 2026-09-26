import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from backend.app.fraud.engine import calculate_fraud_risk

# Fictional Realistic Seed Data
DEMO_CUSTOMERS = [
    {"id": "CUST-4819", "name": "Aarav Sharma", "tier": "Platinum", "baseline": 3500.0, "city": "Mumbai", "device": "iPhone 15 Pro", "deviceId": "DEV-AAPL-9821"},
    {"id": "CUST-2910", "name": "Priya Patel", "tier": "Gold", "baseline": 2200.0, "city": "Bengaluru", "device": "Samsung Galaxy S24", "deviceId": "DEV-SMSG-4120"},
    {"id": "CUST-8102", "name": "Rohan Verma", "tier": "Silver", "baseline": 1800.0, "city": "Delhi", "device": "OnePlus 12", "deviceId": "DEV-OP-7731"},
    {"id": "CUST-5531", "name": "Ananya Iyer", "tier": "Platinum", "baseline": 4800.0, "city": "Hyderabad", "device": "MacBook Pro M3", "deviceId": "DEV-MBP-3319"},
    {"id": "CUST-7214", "name": "Vikram Malhotra", "tier": "Private Client", "baseline": 8500.0, "city": "Mumbai", "device": "iPad Pro M4", "deviceId": "DEV-IPAD-6624"},
    {"id": "CUST-3901", "name": "Sneha Roy", "tier": "Standard", "baseline": 1500.0, "city": "Kolkata", "device": "Pixel 8 Pro", "deviceId": "DEV-GOOG-8812"},
    {"id": "CUST-6420", "name": "Kabir Das", "tier": "Gold", "baseline": 2900.0, "city": "Pune", "device": "iPhone 14", "deviceId": "DEV-AAPL-5510"},
    {"id": "CUST-1198", "name": "Rhea Kapoor", "tier": "Platinum", "baseline": 5200.0, "city": "Chennai", "device": "MacBook Air M2", "deviceId": "DEV-MBA-2281"},
]

MERCHANTS = [
    ("Amazon India", "E-Commerce", "Mumbai"),
    ("Apple Store BKC", "Electronics", "Mumbai"),
    ("Croma Megastore", "Electronics", "Bengaluru"),
    ("Zomato Delivery", "Food & Dining", "Delhi"),
    ("Uber Technologies", "Transport", "Hyderabad"),
    ("Flipkart Internet", "E-Commerce", "Bengaluru"),
    ("Taj Palace Luxury Hotel", "Hospitality", "Delhi"),
    ("Dubai Duty Free Terminal 3", "Duty Free Retail", "Dubai"),
    ("CryptoVault Exchange", "Cryptocurrency", "Singapore"),
    ("Monte Carlo Luxury Gaming", "Casino / Gaming", "London"),
    ("Malabar Gold & Diamonds", "Luxury Jewellery", "Mumbai"),
    ("Shell Highway Fuel Station", "Automotive", "Pune"),
    ("Steam Digital Games", "Digital Goods", "Online"),
    ("Rolex Boutique Mayfair", "Luxury Goods", "London"),
    ("Starbucks Reserve", "Food & Dining", "Mumbai"),
]

def generate_realistic_timeline(score: int, location: str, prev_location: str, is_new_dev: bool, failed_attempts: int) -> List[Dict[str, Any]]:
    events = []
    base_time = datetime.utcnow() - timedelta(minutes=random.randint(15, 60))
    
    events.append({
        "time": (base_time - timedelta(minutes=14)).strftime("%H:%M"),
        "title": "Account Baseline Active",
        "description": f"Verified session heartbeat from established region ({prev_location or location}).",
        "severity": "normal"
    })
    
    if is_new_dev:
        events.append({
            "time": (base_time - timedelta(minutes=7)).strftime("%H:%M"),
            "title": "Unrecognized Device Fingerprint",
            "description": "Hardware telemetry received from novel device identity without prior token pairing.",
            "severity": "warning"
        })

    if failed_attempts > 0:
        events.append({
            "time": (base_time - timedelta(minutes=4)).strftime("%H:%M"),
            "title": f"Authentication Challenge Failure ({failed_attempts}x)",
            "description": f"{failed_attempts} failed passcode/OTP validations recorded in under 90 seconds.",
            "severity": "critical" if failed_attempts >= 2 else "warning"
        })

    events.append({
        "time": (base_time - timedelta(minutes=1)).strftime("%H:%M"),
        "title": "Transaction Authorization Initiated",
        "description": f"Settlement payload submitted from IP geolocated to {location}.",
        "severity": "critical" if score >= 80 else ("warning" if score >= 60 else "normal")
    })

    if score >= 80:
        events.append({
            "time": base_time.strftime("%H:%M"),
            "title": "Automated Security Hold",
            "description": "Deterministic Fraud Engine tripped multiple critical anomaly boundaries; transaction held.",
            "severity": "critical"
        })
    elif score >= 60:
        events.append({
            "time": base_time.strftime("%H:%M"),
            "title": "Step-Up Challenge Dispatched",
            "description": "High-risk variance detected. Cardholder prompted for secondary authentication.",
            "severity": "warning"
        })
    else:
        events.append({
            "time": base_time.strftime("%H:%M"),
            "title": "Transaction Cleared",
            "description": "Risk parameters satisfied standard low-exposure verification criteria.",
            "severity": "normal"
        })

    return events

def get_demo_dataset() -> Dict[str, Any]:
    """Generates ~75 structured transactions with alerts and investigations"""
    transactions = []
    alerts = []
    investigations = []

    # 1. Preset signature critical transaction (featured in demo instructions)
    tx_feature = {
        "transactionId": "TXN-92831",
        "customerId": "CUST-4819",
        "amount": 84500.0,
        "currency": "INR",
        "merchant": "Apple Store Regent Street",
        "merchantCategory": "Electronics",
        "location": "London",
        "previousLocation": "Mumbai",
        "deviceId": "DEV-LINUX-9912",
        "deviceType": "Chrome on Linux (Unregistered)",
        "timestamp": (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
        "previousTransactionTime": (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
        "averageTransactionAmount": 3500.0,
        "accountAge": 240,
        "failedAttempts": 3,
        "international": True,
        "newDevice": True,
        "newLocation": True,
        "txnsToday": 7
    }
    assessment = calculate_fraud_risk(tx_feature)
    tx_feature["riskScore"] = assessment.riskScore
    tx_feature["riskLevel"] = assessment.riskLevel
    tx_feature["decision"] = assessment.decision
    tx_feature["confidence"] = assessment.confidence
    tx_feature["riskSignals"] = [s.model_dump() for s in assessment.triggeredSignals]
    tx_feature["explanation"] = assessment.explanation
    tx_feature["explanationBullets"] = assessment.explanationBullets
    tx_feature["recommendedAction"] = assessment.recommendedAction
    tx_feature["breakdown"] = assessment.breakdown
    tx_feature["isPotentialFalsePositive"] = assessment.isPotentialFalsePositive
    tx_feature["status"] = "FLAGGED"
    tx_feature["timeline"] = generate_realistic_timeline(
        assessment.riskScore, tx_feature["location"], tx_feature["previousLocation"], True, 3
    )
    tx_feature["customerProfile"] = {
        "name": "Aarav Sharma",
        "tier": "Platinum",
        "avgAmount": 3500.0,
        "totalTxns": 348,
        "homeLocation": "Mumbai"
    }
    transactions.append(tx_feature)

    # Corresponding Alert for TXN-92831
    alerts.append({
        "alertId": "ALT-9012",
        "transactionId": "TXN-92831",
        "riskScore": assessment.riskScore,
        "severity": "CRITICAL",
        "reason": "Impossible travel (Mumbai → London) & 3 failed credentials with 24× amount surge",
        "signals": [s.name for s in assessment.triggeredSignals],
        "status": "NEW",
        "amount": tx_feature["amount"],
        "currency": "INR",
        "location": tx_feature["location"],
        "merchant": tx_feature["merchant"],
        "createdAt": tx_feature["timestamp"]
    })

    # Corresponding Investigation for TXN-92831
    investigations.append({
        "caseId": "CASE-4401",
        "transactionId": "TXN-92831",
        "assignedTo": "Senior Fraud Specialist",
        "status": "Investigating",
        "priority": "Critical",
        "riskScore": assessment.riskScore,
        "riskLevel": assessment.riskLevel,
        "merchant": tx_feature["merchant"],
        "amount": tx_feature["amount"],
        "currency": "INR",
        "notes": [
            {
                "id": "NOTE-1",
                "author": "Lumora AI Sentinel",
                "note": "Flagged impossible geographic velocity (Mumbai to London in 33 mins). Initiated security challenge.",
                "timestamp": (datetime.utcnow() - timedelta(minutes=11)).strftime("%Y-%m-%d %H:%M")
            },
            {
                "id": "NOTE-2",
                "author": "Analyst Rajiv S.",
                "note": "Attempted cardholder phone verification. Mobile endpoint unreachable. Holding settlement.",
                "timestamp": (datetime.utcnow() - timedelta(minutes=6)).strftime("%Y-%m-%d %H:%M")
            }
        ],
        "createdAt": (datetime.utcnow() - timedelta(minutes=12)).isoformat(),
        "updatedAt": (datetime.utcnow() - timedelta(minutes=5)).isoformat()
    })

    # Generate 70 more realistic transactions
    now = datetime.utcnow()
    for i in range(1, 71):
        txn_id = f"TXN-{random.randint(10000, 99999)}"
        cust = random.choice(DEMO_CUSTOMERS)
        merch, category, merch_city = random.choice(MERCHANTS)
        
        # Decide scenario
        scenario_dice = random.random()
        
        if scenario_dice < 0.15:
            # Critical Scenario
            is_new_dev = True
            is_new_loc = True
            failed = random.randint(2, 4)
            is_intl = True
            mult = random.uniform(5.0, 18.0)
            amount = round(cust["baseline"] * mult, 2)
            loc = random.choice(["London", "New York", "Singapore", "Dubai"])
            prev_loc = cust["city"]
            status = "FLAGGED"
        elif scenario_dice < 0.35:
            # High Risk Scenario
            is_new_dev = random.choice([True, False])
            is_new_loc = True
            failed = random.choice([1, 2])
            is_intl = random.choice([True, False])
            mult = random.uniform(2.5, 4.5)
            amount = round(cust["baseline"] * mult, 2)
            loc = random.choice(["Dubai", "Singapore", "Bangkok", "Pune", "Kolkata"])
            prev_loc = cust["city"]
            status = "FLAGGED"
        elif scenario_dice < 0.55:
            # Moderate Risk Scenario
            is_new_dev = False
            is_new_loc = False
            failed = random.choice([0, 1])
            is_intl = False
            mult = random.uniform(1.6, 2.4)
            amount = round(cust["baseline"] * mult, 2)
            loc = cust["city"]
            prev_loc = cust["city"]
            status = "APPROVED"
        else:
            # Low Risk Safe Scenario
            is_new_dev = False
            is_new_loc = False
            failed = 0
            is_intl = False
            mult = random.uniform(0.3, 1.2)
            amount = round(cust["baseline"] * mult, 2)
            loc = cust["city"]
            prev_loc = cust["city"]
            status = "APPROVED"

        time_delta_mins = i * random.randint(5, 25)
        txn_time = (now - timedelta(minutes=time_delta_mins)).isoformat()
        
        t_data = {
            "transactionId": txn_id,
            "customerId": cust["id"],
            "amount": amount,
            "currency": "INR",
            "merchant": merch,
            "merchantCategory": category,
            "location": loc,
            "previousLocation": prev_loc,
            "deviceId": f"DEV-NEW-{random.randint(100,999)}" if is_new_dev else cust["deviceId"],
            "deviceType": "Unknown Terminal" if is_new_dev else cust["device"],
            "timestamp": txn_time,
            "previousTransactionTime": (now - timedelta(minutes=time_delta_mins + 40)).isoformat(),
            "averageTransactionAmount": cust["baseline"],
            "accountAge": random.randint(30, 400),
            "failedAttempts": failed,
            "international": is_intl,
            "newDevice": is_new_dev,
            "newLocation": is_new_loc,
            "txnsToday": random.randint(1, 6)
        }

        eval_res = calculate_fraud_risk(t_data)
        t_data["riskScore"] = eval_res.riskScore
        t_data["riskLevel"] = eval_res.riskLevel
        t_data["decision"] = eval_res.decision
        t_data["confidence"] = eval_res.confidence
        t_data["riskSignals"] = [s.model_dump() for s in eval_res.triggeredSignals]
        t_data["explanation"] = eval_res.explanation
        t_data["explanationBullets"] = eval_res.explanationBullets
        t_data["recommendedAction"] = eval_res.recommendedAction
        t_data["breakdown"] = eval_res.breakdown
        t_data["isPotentialFalsePositive"] = eval_res.isPotentialFalsePositive
        t_data["status"] = "FLAGGED" if eval_res.riskLevel in ("CRITICAL", "HIGH") else "APPROVED"
        t_data["timeline"] = generate_realistic_timeline(
            eval_res.riskScore, loc, prev_loc, is_new_dev, failed
        )
        t_data["customerProfile"] = {
            "name": cust["name"],
            "tier": cust["tier"],
            "avgAmount": cust["baseline"],
            "totalTxns": random.randint(120, 500),
            "homeLocation": cust["city"]
        }
        transactions.append(t_data)

        # Alerts for Critical and High
        if eval_res.riskLevel in ("CRITICAL", "HIGH") and len(alerts) < 18:
            alerts.append({
                "alertId": f"ALT-{random.randint(1000, 9999)}",
                "transactionId": txn_id,
                "riskScore": eval_res.riskScore,
                "severity": eval_res.riskLevel,
                "reason": eval_res.triggeredSignals[0].name if eval_res.triggeredSignals else "Anomalous Spending Pattern",
                "signals": [s.name for s in eval_res.triggeredSignals],
                "status": random.choice(["NEW", "NEW", "INVESTIGATING", "RESOLVED"]),
                "amount": amount,
                "currency": "INR",
                "location": loc,
                "merchant": merch,
                "createdAt": txn_time
            })

        # Seed realistic investigations
        if eval_res.riskLevel == "CRITICAL" and len(investigations) < 8:
            investigations.append({
                "caseId": f"CASE-{random.randint(1000, 9999)}",
                "transactionId": txn_id,
                "assignedTo": random.choice(["Senior Analyst", "Lead Fraud Officer", "SecOps Team", "Investigator Priya"]),
                "status": random.choice(["New", "Investigating", "Action Required", "Resolved"]),
                "priority": "Critical" if eval_res.riskScore > 85 else "High",
                "riskScore": eval_res.riskScore,
                "riskLevel": eval_res.riskLevel,
                "merchant": merch,
                "amount": amount,
                "currency": "INR",
                "notes": [
                    {
                        "id": f"NOTE-{random.randint(10, 99)}",
                        "author": "Lumora AI Sentinel",
                        "note": f"Automated anomaly dispatch for {cust['name']} ({txn_id}). Score: {eval_res.riskScore}.",
                        "timestamp": (now - timedelta(minutes=time_delta_mins - 2)).strftime("%Y-%m-%d %H:%M")
                    }
                ],
                "createdAt": txn_time,
                "updatedAt": (now - timedelta(minutes=max(1, time_delta_mins - 10))).isoformat()
            })

    return {
        "transactions": transactions,
        "alerts": alerts,
        "investigations": investigations
    }
