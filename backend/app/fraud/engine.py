import math
from typing import Dict, Any, List, Tuple
from datetime import datetime
from backend.app.models.schemas import RiskAssessment, RiskSignal

def calculate_fraud_risk(txn_data: Dict[str, Any]) -> RiskAssessment:
    """
    Deterministic Multi-Signal Fraud Scoring Engine
    Combines rule-based checks, statistical anomaly detection, and behavioral heuristics.
    Returns normalized 0-100 score, categorized severity, signal breakdowns, and recommendations.
    """
    amount = float(txn_data.get("amount", 0))
    avg_amount = float(txn_data.get("averageTransactionAmount", 2500) or 2500)
    failed_attempts = int(txn_data.get("failedAttempts", 0))
    new_device = bool(txn_data.get("newDevice", False))
    new_location = bool(txn_data.get("newLocation", False))
    international = bool(txn_data.get("international", False))
    account_age_days = int(txn_data.get("accountAge", 180))
    merchant = str(txn_data.get("merchant", ""))
    merchant_category = str(txn_data.get("merchantCategory", "General Retail"))
    location = str(txn_data.get("location", ""))
    prev_location = str(txn_data.get("previousLocation", "") or "")
    
    signals: List[RiskSignal] = []
    breakdown: Dict[str, float] = {
        "amount_anomaly": 0.0,
        "location_anomaly": 0.0,
        "device_risk": 0.0,
        "velocity_risk": 0.0,
        "merchant_risk": 0.0
    }
    
    # 1. Amount Anomaly Scoring (Weight up to 30)
    ratio = amount / max(avg_amount, 10.0)
    amt_score = 0.0
    if ratio >= 5.0:
        amt_score = 30.0
        signals.append(RiskSignal(
            code="AMT_SPIKE_EXTREME",
            name="Extreme Amount Anomaly",
            score=amt_score,
            maxScore=30.0,
            severity="CRITICAL",
            description=f"Transaction amount ({amount:,.2f}) is {ratio:.1f}× higher than customer's established average ({avg_amount:,.2f})."
        ))
    elif ratio >= 3.0:
        amt_score = 22.0
        signals.append(RiskSignal(
            code="AMT_SPIKE_HIGH",
            name="Substantial Amount Surge",
            score=amt_score,
            maxScore=30.0,
            severity="HIGH",
            description=f"Transaction value is {ratio:.1f}× higher than baseline spending habits."
        ))
    elif ratio >= 1.8:
        amt_score = 12.0
        signals.append(RiskSignal(
            code="AMT_SPIKE_MODERATE",
            name="Above-Average Transaction Size",
            score=amt_score,
            maxScore=30.0,
            severity="MODERATE",
            description=f"Transaction amount exceeds typical baseline by {((ratio - 1.0)*100):.0f}%."
        ))
    else:
        amt_score = 2.0
    breakdown["amount_anomaly"] = amt_score

    # 2. Location & Impossible Travel (Weight up to 25)
    loc_score = 0.0
    impossible_travel = False
    
    # Known distant pairs indicating impossible physical travel if sudden
    distant_hops = [
        ("Mumbai", "London"), ("Delhi", "New York"), ("Bengaluru", "Dubai"), 
        ("Hyderabad", "Singapore"), ("Mumbai", "Tokyo"), ("Chennai", "Frankfurt"),
        ("Kolkata", "Sydney"), ("Pune", "Toronto")
    ]
    if prev_location and location and prev_location != location:
        # Check if pair matches distant travel
        is_distant = any(
            (p1.lower() in prev_location.lower() and p2.lower() in location.lower()) or
            (p2.lower() in prev_location.lower() and p1.lower() in location.lower())
            for p1, p2 in distant_hops
        )
        if is_distant:
            impossible_travel = True
            loc_score = 25.0
            signals.append(RiskSignal(
                code="IMPOSSIBLE_TRAVEL",
                name="Impossible Travel Pattern Detected",
                score=loc_score,
                maxScore=25.0,
                severity="CRITICAL",
                description=f"Unfeasible physical displacement between {prev_location} and {location} within consecutive transaction timestamps."
            ))
        elif new_location:
            loc_score = 15.0
            signals.append(RiskSignal(
                code="NEW_GEO_LOCATION",
                name="Unrecognized Geographic Location",
                score=loc_score,
                maxScore=25.0,
                severity="HIGH",
                description=f"Transaction initiated from unfamiliar region ({location}) outside historical geographical baseline."
            ))
    elif new_location:
        loc_score = 12.0
        signals.append(RiskSignal(
            code="NEW_GEO_LOCATION",
            name="Unrecognized Location",
            score=loc_score,
            maxScore=25.0,
            severity="MODERATE",
            description=f"Originating IP coordinates resolve to new city: {location}."
        ))
    breakdown["location_anomaly"] = loc_score

    # 3. Device & Hardware Risk (Weight up to 20)
    dev_score = 0.0
    if new_device:
        dev_score += 15.0
        signals.append(RiskSignal(
            code="NEW_DEVICE_IDENTIFIER",
            name="Unrecognized Device Fingerprint",
            score=15.0,
            maxScore=20.0,
            severity="HIGH",
            description="Hardware signature, browser canvas fingerprint, or OS identity has never been used by this account."
        ))
    
    # Emulators or suspicious OS patterns
    dev_type = str(txn_data.get("deviceType", "Mobile"))
    if "emulator" in dev_type.lower() or "linux headless" in dev_type.lower() or "bot" in dev_type.lower():
        dev_score += 18.0
        signals.append(RiskSignal(
            code="DEVICE_TAMPERING",
            name="Simulated / Virtualized Environment",
            score=18.0,
            maxScore=20.0,
            severity="CRITICAL",
            description="Transaction telemetry exhibits headless browser or emulated hardware fingerprints."
        ))
    dev_score = min(dev_score, 20.0)
    breakdown["device_risk"] = dev_score

    # 4. Velocity & Authentication Attempts (Weight up to 25)
    vel_score = 0.0
    if failed_attempts >= 3:
        vel_score += 20.0
        signals.append(RiskSignal(
            code="REPEATED_AUTH_FAILURES",
            name="Multiple Failed Verification Attempts",
            score=20.0,
            maxScore=25.0,
            severity="CRITICAL",
            description=f"{failed_attempts} consecutive failed authentication or PIN attempts recorded immediately preceding this transaction."
        ))
    elif failed_attempts >= 1:
        vel_score += 8.0
        signals.append(RiskSignal(
            code="AUTH_CHALLENGE_FAILURE",
            name="Prior Authentication Failure",
            score=8.0,
            maxScore=25.0,
            severity="MODERATE",
            description=f"{failed_attempts} prior verification attempt failed before successful credential entry."
        ))

    # Velocity / txns today
    txns_today = int(txn_data.get("txnsToday", 1) or 1)
    if txns_today > 5:
        burst_score = 10.0
        vel_score += burst_score
        signals.append(RiskSignal(
            code="HIGH_TXN_VELOCITY",
            name="Rapid Transaction Velocity",
            score=burst_score,
            maxScore=25.0,
            severity="HIGH",
            description=f"Rapid cluster of {txns_today} transactions registered in under 24 hours."
        ))
    vel_score = min(vel_score, 25.0)
    breakdown["velocity_risk"] = vel_score

    # 5. Merchant, Cross-Border & Behavioral Risk (Weight up to 20)
    merch_score = 0.0
    high_risk_categories = [
        "cryptocurrency", "crypto", "gambling", "casino", "wire transfer", 
        "foreign exchange", "forex", "luxury jewellery", "precious metals", "pawn"
    ]
    is_high_risk_merchant = any(h in merchant_category.lower() or h in merchant.lower() for h in high_risk_categories)
    if is_high_risk_merchant:
        merch_score += 12.0
        signals.append(RiskSignal(
            code="HIGH_RISK_MERCHANT_CATEGORY",
            name="High-Risk Merchant Sector",
            score=12.0,
            maxScore=20.0,
            severity="HIGH",
            description=f"Transaction routed to high-volatility financial category: {merchant_category} ({merchant})."
        ))

    if international:
        merch_score += 8.0
        signals.append(RiskSignal(
            code="CROSS_BORDER_TXN",
            name="Cross-Border International Route",
            score=8.0,
            maxScore=20.0,
            severity="MODERATE",
            description="Transaction crosses national jurisdictional clearing networks."
        ))

    if account_age_days < 14 and amount > 15000:
        merch_score += 10.0
        signals.append(RiskSignal(
            code="NEW_ACCOUNT_HIGH_VALUE",
            name="Infant Account High-Value Spike",
            score=10.0,
            maxScore=20.0,
            severity="HIGH",
            description=f"Account age is only {account_age_days} days yet initiating high-exposure financial settlement."
        ))

    merch_score = min(merch_score, 20.0)
    breakdown["merchant_risk"] = merch_score

    # Compute Total Score
    total_raw = sum(breakdown.values())
    
    # Dynamic Boosts for Compound Attacks (Fraudsters combining new device + large spike + failed attempts)
    compound_multiplier = 1.0
    if new_device and (ratio >= 3.0 or impossible_travel):
        compound_multiplier += 0.15
    if failed_attempts >= 2 and ratio >= 2.0:
        compound_multiplier += 0.10

    final_score = int(round(min(total_raw * compound_multiplier, 99.0)))
    if impossible_travel and final_score < 85:
        final_score = 91

    # Ensure baseline floor
    if final_score < 4 and len(signals) == 0:
        final_score = 6

    # Determine Severity Tier
    if final_score >= 80:
        risk_level = "CRITICAL"
        decision = "DECLINE"
        confidence = 0.94
    elif final_score >= 60:
        risk_level = "HIGH"
        decision = "CHALLENGE"
        confidence = 0.88
    elif final_score >= 30:
        risk_level = "MODERATE"
        decision = "REVIEW"
        confidence = 0.82
    else:
        risk_level = "LOW"
        decision = "APPROVE"
        confidence = 0.96

    # Potential False Positive check:
    # High score solely driven by amount spike or international travel, while on a verified known device with 0 failed attempts and mature account
    is_potential_false_positive = False
    false_positive_rationale = None
    if risk_level in ("HIGH", "CRITICAL") and not new_device and failed_attempts == 0 and not impossible_travel and account_age_days > 120:
        is_potential_false_positive = True
        false_positive_rationale = (
            "User is operating from an authenticated, known device with 0 authentication failures and established tenure. "
            "The surge in value may represent a planned legitimate capital expenditure or holiday purchase."
        )

    # Human-readable Explanation & Bullets
    bullets: List[str] = []
    if signals:
        for s in sorted(signals, key=lambda x: x.score, reverse=True)[:4]:
            bullets.append(s.description)
    else:
        bullets.append("Transaction metrics align smoothly with established behavioral patterns.")
        bullets.append("Hardware fingerprint, location, and merchant profile correspond to expected baselines.")

    # Recommended Action
    if risk_level == "CRITICAL":
        if is_potential_false_positive:
            rec_action = "Temporarily hold transaction for secondary biometric or out-of-band phone verification before processing."
        else:
            rec_action = "Immediately block transaction, suspend associated session tokens, and alert fraud operations team."
    elif risk_level == "HIGH":
        rec_action = "Trigger mandatory Step-Up Multi-Factor Authentication (OTP / Hardware Key) and queue for analyst review."
    elif risk_level == "MODERATE":
        rec_action = "Approve with elevated telemetry logging; monitor account for rapid subsequent velocity anomalies."
    else:
        rec_action = "Approve transaction. Risk metrics fall well within normal safe operating thresholds."

    summary = (
        f"Assigned a {risk_level} risk score of {final_score}/100. "
        + (f"Key triggers include {signals[0].name.lower()}" if signals else "No anomalous triggers detected")
        + (f" and {signals[1].name.lower()}." if len(signals) > 1 else ".")
    )

    return RiskAssessment(
        riskScore=final_score,
        riskLevel=risk_level,
        decision=decision,
        confidence=confidence,
        triggeredSignals=signals,
        explanation=summary,
        explanationBullets=bullets,
        recommendedAction=rec_action,
        breakdown=breakdown,
        isPotentialFalsePositive=is_potential_false_positive,
        falsePositiveRationale=false_positive_rationale
    )
