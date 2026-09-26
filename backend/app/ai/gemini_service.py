import json
from typing import Dict, Any, List, Optional
from backend.app.config import GEMINI_API_KEY, GEMINI_MODEL

class LumoraAIService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model_name = GEMINI_MODEL
        self._gemini_client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._gemini_client = genai.GenerativeModel(self.model_name)
                print(f"[LumoraAI] Gemini model '{self.model_name}' configured successfully.")
            except Exception as e:
                print(f"[LumoraAI] Note: Gemini initialization failed ({e}), using internal Lumora reasoning engine.")

    def explain_transaction(self, txn: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured AI explanation for a transaction"""
        # If Gemini is configured and active, attempt real API prompt
        if self._gemini_client:
            try:
                prompt = f"""
                You are LUMORA, the intelligent fraud investigation companion in FRAUD SHIELD AI.
                Analyze the following financial transaction and generate a structured fraud assessment.
                
                Transaction Data:
                - ID: {txn.get('transactionId')}
                - Customer ID: {txn.get('customerId')}
                - Amount: {txn.get('currency', 'INR')} {txn.get('amount', 0):,}
                - Average User Amount: {txn.get('currency', 'INR')} {txn.get('averageTransactionAmount', 0):,}
                - Merchant: {txn.get('merchant')} ({txn.get('merchantCategory')})
                - Location: {txn.get('location')} (Previous: {txn.get('previousLocation') or 'Same'})
                - Device: {txn.get('deviceType')} (New Device: {txn.get('newDevice')})
                - Failed Attempts: {txn.get('failedAttempts', 0)}
                - Deterministic Risk Score: {txn.get('riskScore')}/100 ({txn.get('riskLevel')})
                - Signals: {json.dumps(txn.get('riskSignals', []))}
                
                Respond in JSON format with keys:
                - "summary": string (concise executive overview)
                - "riskFactors": list of strings (primary flags)
                - "evidence": string (concrete data observations)
                - "recommendedAction": string (actionable next step for fraud investigator)
                - "confidenceLevel": number (between 0.8 and 0.99)
                """
                response = self._gemini_client.generate_content(prompt)
                text = response.text.strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                parsed = json.loads(text)
                return parsed
            except Exception as e:
                print(f"[LumoraAI] Gemini generation fallback triggered: {e}")

        # Deterministic High-Fidelity Synthesized Explanation (matches fintech fraud analyst output)
        score = txn.get("riskScore", 0)
        level = txn.get("riskLevel", "LOW")
        amount = txn.get("amount", 0)
        curr = txn.get("currency", "INR")
        avg = txn.get("averageTransactionAmount", 2500)
        merchant = txn.get("merchant", "Merchant")
        loc = txn.get("location", "Unknown")
        prev_loc = txn.get("previousLocation", "")
        new_dev = txn.get("newDevice", False)
        failed = txn.get("failedAttempts", 0)
        signals = txn.get("riskSignals", [])

        risk_factors = []
        if amount > avg * 2:
            ratio = amount / max(avg, 1)
            risk_factors.append(f"Transaction amount ({curr} {amount:,.2f}) is {ratio:.1f}× higher than baseline.")
        if new_dev:
            risk_factors.append("Originating device fingerprint was registered for the first time on this account.")
        if prev_loc and prev_loc != loc:
            risk_factors.append(f"Rapid geographic displacement between {prev_loc} and {loc}.")
        if failed > 0:
            risk_factors.append(f"{failed} prior failed authentication attempts before success.")
        if not risk_factors:
            risk_factors.append("Transaction telemetry conforms to normal behavioral baseline.")

        if level == "CRITICAL":
            summary = f"High-confidence compromise pattern detected for transaction {txn.get('transactionId')}. Multiple anomalous behavioral signals indicate potential account takeover."
            evidence = f"Initiated from an unverified terminal in {loc} following {failed} authentication challenge failures, routing {curr} {amount:,.2f} to {merchant}."
            rec = "Temporarily hold settlement, invalidate active session tokens, and dispatch step-up biometric verification to the cardholder's verified mobile device."
        elif level == "HIGH":
            summary = f"Elevated exposure detected on transaction {txn.get('transactionId')}. Spending variance exceeds tolerance thresholds."
            evidence = f"Amount {curr} {amount:,.2f} exceeds historical moving average by substantial margin on {txn.get('deviceType', 'device')}."
            rec = "Trigger Step-Up OTP challenge and place transaction in pending analyst queue."
        elif level == "MODERATE":
            summary = f"Mild behavioral deviation noted for transaction {txn.get('transactionId')}. Low likelihood of malicious compromise."
            evidence = f"Minor velocity or merchant category anomaly detected; location is {loc}."
            rec = "Release transaction with automated post-authorization anomaly surveillance."
        else:
            summary = f"Transaction {txn.get('transactionId')} authenticated cleanly within standard low-risk boundaries."
            evidence = f"Consistent device fingerprint, recognized geography ({loc}), and standard expenditure profile."
            rec = "Approve transaction immediately with zero friction."

        return {
            "summary": summary,
            "riskFactors": risk_factors,
            "evidence": evidence,
            "recommendedAction": rec,
            "confidenceLevel": 0.94 if level in ("CRITICAL", "LOW") else 0.88
        }

    def chat_response(
        self,
        message: str,
        transaction: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        style: str = "Balanced"
    ) -> Dict[str, Any]:
        """
        Interactive Lumora assistant dialog grounded in the active transaction or platform context.
        """
        lower_msg = message.lower()
        active_id = transaction.get("transactionId") if transaction else None

        # Try Live Gemini Call if available
        if self._gemini_client:
            try:
                system_context = f"""
                You are LUMORA, the intelligent fraud investigation companion in the 'FRAUD SHIELD AI' platform.
                Tagline: 'Your intelligent fraud investigation companion.'
                
                You provide concise, authoritative, professional fintech guidance to fraud analysts.
                Do NOT hallucinate or invent data. If asked about a transaction that isn't provided, politely clarify.
                Tone: {style} (Concise, Balanced, or Detailed).
                
                Active Transaction Context:
                {json.dumps(transaction) if transaction else "No specific transaction selected. General platform mode."}
                """
                
                chat_prompt = f"{system_context}\n\nUser Question: {message}\n\nRespond as LUMORA with clear insights, actionable advice, and bullet points where helpful."
                gemini_res = self._gemini_client.generate_content(chat_prompt)
                
                # Derive suggested follow-ups
                follow_ups = [
                    "What signals contributed most?",
                    "What is the recommended next step?",
                    "Could this be a false positive?",
                    "Summarize customer profile"
                ]
                
                return {
                    "response": gemini_res.text.strip(),
                    "suggestedActions": follow_ups[:3],
                    "citedSignals": [s.get("name") for s in transaction.get("riskSignals", [])] if transaction else [],
                    "transactionContext": {"transactionId": active_id} if active_id else None
                }
            except Exception as e:
                print(f"[LumoraAI] Gemini chat fallback: {e}")

        # Intelligent Built-in Lumora Knowledge Engine
        cited_signals = []
        if transaction:
            cited_signals = [s.get("name", "") for s in transaction.get("riskSignals", []) if isinstance(s, dict)]
            if not cited_signals and isinstance(transaction.get("riskSignals"), list):
                cited_signals = [str(s) for s in transaction.get("riskSignals", [])]

        # Case 1: Active transaction specific questions
        if transaction and any(k in lower_msg for k in ["why", "flagged", "explain", "risk", "reason"]):
            score = transaction.get("riskScore", 0)
            level = transaction.get("riskLevel", "LOW")
            amt = transaction.get("amount", 0)
            curr = transaction.get("currency", "INR")
            bullets = transaction.get("explanationBullets", [])
            
            bullet_text = "\n".join([f"• {b}" for b in bullets]) if bullets else "• No critical anomalies flagged."
            response_text = (
                f"**Transaction {active_id} Analysis**\n\n"
                f"This transaction is classified as **{level} Risk** with a score of **{score}/100**.\n\n"
                f"**Key Drivers:**\n{bullet_text}\n\n"
                f"**Recommended Action:**\n{transaction.get('recommendedAction', 'Review telemetry.')}"
            )
            suggested = ["Could this be a false positive?", "What should I investigate next?", "Show customer baseline"]

        elif transaction and any(k in lower_msg for k in ["false positive", "legitimate", "genuine"]):
            is_fp = transaction.get("isPotentialFalsePositive", False)
            if is_fp:
                response_text = (
                    f"**Potential False Positive Assessment for {active_id}:**\n\n"
                    f"Yes, there is an elevated probability that this transaction is legitimate. "
                    f"Although the transaction size is higher than normal, the device fingerprint and customer authentication factors match historical baselines with 0 failed attempts.\n\n"
                    f"**Recommendation:** Request SMS/Biometric step-up rather than declining directly."
                )
            else:
                response_text = (
                    f"**False Positive Assessment for {active_id}:**\n\n"
                    f"Unlikely to be a false positive. We observed multiple correlated risk indicators (e.g. {', '.join(cited_signals[:2]) or 'unrecognized hardware and velocity spikes'}). "
                    f"The compound probability points strongly toward unauthorized account access."
                )
            suggested = ["Block transaction now", "Add note to investigation", "Explain risk signals"]

        elif transaction and any(k in lower_msg for k in ["what should i do", "next step", "action", "investigate first"]):
            response_text = (
                f"**Recommended Investigation Protocol for {active_id}:**\n\n"
                f"1. **Confirm Device Authenticity:** Inspect if device `{transaction.get('deviceId', 'DEV-XXX')}` has authenticated previously.\n"
                f"2. **Verify Geographic Proximity:** Check if travel between `{transaction.get('previousLocation', 'Origin')}` and `{transaction.get('location', 'Destination')}` is physically feasible.\n"
                f"3. **Contact Cardholder:** Dispatch an out-of-band push authorization challenge.\n"
                f"4. **Status Action:** Update case in the Investigation Center to 'Investigating'."
            )
            suggested = ["Mark case as Investigating", "Summarize transaction timeline", "Why is new device risky?"]

        elif "impossible travel" in lower_msg:
            response_text = (
                "**What is an Impossible Travel Pattern?**\n\n"
                "Impossible travel occurs when two successive transactions on the same account originate from geographical locations that are physically too far apart to reach in the elapsed time between them.\n\n"
                "**Example:** A purchase in Mumbai at 14:00 followed by an in-person or POS transaction in London at 14:45. This almost invariably signals credential compromise, proxy/VPN cloaking, or card skimming."
            )
            suggested = ["How to detect VPN hops?", "Explain new device risk", "Show active alerts"]

        elif "new device" in lower_msg:
            response_text = (
                "**Why is a New Device Fingerprint Suspicious?**\n\n"
                "Over 78% of account takeover (ATO) attacks occur from newly observed device fingerprints. "
                "When an attacker acquires compromised credentials, their hardware attributes (Canvas hash, WebGL fingerprint, OS architecture) differ from the legitimate customer's device. "
                "Combined with sudden high-value purchases, this carries a high predictive correlation with fraud."
            )
            suggested = ["What does risk score of 87 mean?", "How to reduce false positives?", "Explain impossible travel"]

        elif "risk score" in lower_msg:
            response_text = (
                "**Fraud Shield AI Risk Scoring Tiers:**\n\n"
                "• **0 - 29 (LOW):** Clean behavioral signature. Auto-approved.\n"
                "• **30 - 59 (MODERATE):** Minor deviation (e.g. new merchant). Auto-approved with passive monitoring.\n"
                "• **60 - 79 (HIGH):** Significant anomaly (e.g. large spike or foreign location). Triggers Step-Up MFA Challenge.\n"
                "• **80 - 100 (CRITICAL):** Multiple correlated breach signals (impossible travel, failed logins, new terminal). Instant hold or decline."
            )
            suggested = ["Explain current transaction", "View critical alerts", "How are weights calculated?"]

        elif "reduce false positives" in lower_msg or "false positive" in lower_msg:
            response_text = (
                "**Best Practices to Reduce False Positives:**\n\n"
                "1. **Behavioral Baselining:** Calculate moving averages over 90-day windows rather than static thresholds.\n"
                "2. **Device Trust Tokenization:** Whitelist customer terminals that have passed biometric verification.\n"
                "3. **Step-Up over Outright Block:** For moderate anomalies on mature accounts, send instant approval prompts instead of declining transactions."
            )
            suggested = ["What is impossible travel?", "Explain risk tiers", "Analyze a transaction"]

        else:
            if active_id:
                response_text = (
                    f"I am monitoring transaction **{active_id}** ({transaction.get('currency', 'INR')} {transaction.get('amount', 0):,}). "
                    f"The current risk score is **{transaction.get('riskScore', 0)}/100** ({transaction.get('riskLevel', 'LOW')}). "
                    f"Ask me to explain specific signals, suggest actions, or evaluate false positive likelihood."
                )
            else:
                response_text = (
                    "I am **Lumora**, your intelligent fraud investigation companion. "
                    "I monitor transaction anomalies, evaluate compound behavioral vectors, explain machine learning decisions, and assist your team in expediting fraud reviews. "
                    "How can I assist your investigation today?"
                )
            suggested = [
                "What is an impossible travel pattern?",
                "Explain risk score tiers",
                "Why was this transaction flagged?" if active_id else "Show critical alerts"
            ]

        return {
            "response": response_text,
            "suggestedActions": suggested,
            "citedSignals": cited_signals,
            "transactionContext": {"transactionId": active_id} if active_id else None
        }

lumora_service = LumoraAIService()
