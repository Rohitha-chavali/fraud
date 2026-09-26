# FRAUD SHIELD AI

> **"Detect fraud before it becomes damage."**
> 
> *AI Assistant: LUMORA — "Your intelligent fraud investigation companion."*

---

## 🛡️ Project Overview

**Fraud Shield AI** is a commercial-grade, full-stack fintech fraud detection and investigation platform designed for banking analysts, fraud investigators, and fintech risk teams.

Built with a **hybrid architecture**, Fraud Shield AI combines a deterministic multi-signal fraud scoring engine, statistical anomaly detection, explainable AI decisions, and an interactive intelligent companion named **LUMORA** grounded directly in transaction telemetry.

---

## 🏛️ Architecture & Tech Stack

```
                          ┌─────────────────────────────────────┐
                          │         React 18 + Vite             │
                          │   Tailwind CSS + Framer Motion      │
                          │     Recharts + Lucide Icons         │
                          └──────────────────┬──────────────────┘
                                             │ HTTP REST / Proxy
                                             ▼
                          ┌─────────────────────────────────────┐
                          │           FastAPI Backend           │
                          │    Pydantic v2 + Async Lifespan     │
                          └──────┬────────────────────────┬─────┘
                                 │                        │
                    ┌────────────▼────────────┐ ┌─────────▼─────────┐
                    │ Multi-Signal Fraud      │ │   Lumora AI Layer │
                    │ Scoring Engine          │ │  Gemini 1.5 Flash │
                    │ (0-100 Weighted Vector) │ │  + Knowledge Base │
                    └────────────┬────────────┘ └─────────┬─────────┘
                                 │                        │
                                 └───────────┬────────────┘
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │          Hybrid Data Store          │
                          │  MongoDB Driver (PyMongo)           │
                          │  + High-Performance Embedded JSON   │
                          └─────────────────────────────────────┘
```

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend:** Python, FastAPI, Uvicorn, Pydantic v2
- **Database:** MongoDB with automated local embedded JSON fallback (zero configuration required)
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) + Native Lumora Domain Knowledge Engine

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+
- (Optional) MongoDB local or MongoDB Atlas connection string
- (Optional) Google Gemini API key

### 1. Backend Setup & Startup

```bash
# Navigate to project root
cd "fraud_sheild_ai"

# Activate the existing virtual environment (or create with: python -m venv backend/venv)
# On Windows:
backend\venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# (Optional) Seed the demo dataset (70+ transactions, 15+ alerts, 8 investigations)
python -m backend.seed

# Start the FastAPI server on port 8000
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at:
- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 2. Frontend Setup & Startup

```bash
# In a new terminal, navigate to frontend directory:
cd "fraud_sheild_ai/frontend"

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The frontend will be live at:
- Web App: `http://localhost:5173`

---

## ⚙️ Environment Variables

A `.env.example` file is provided in `backend/.env.example`:

```ini
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DEMO_MODE=True

# Database Configuration
# If MongoDB is unavailable, the backend automatically switches to its embedded local JSON store
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=fraud_shield_ai

# Google Gemini AI Configuration
# When set, Lumora leverages live Gemini 1.5 Flash models for unstructured explanations
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

---

## 🧠 Fraud Engine & Explainable Scoring

The backend uses a multi-factor deterministic scoring engine that calculates a score between **0 and 100**:

$$\text{Risk Score} = \sum (\text{Amount Anomaly} + \text{Location & Travel} + \text{Device Risk} + \text{Velocity} + \text{Merchant Risk}) \times \text{Compound Multiplier}$$

- **0 - 29 (LOW):** Authorized instantly. Clean behavioral telemetry.
- **30 - 59 (MODERATE):** Manual review flag. Minor geographic or category variance.
- **60 - 79 (HIGH):** Step-Up MFA Challenge. Significant spending or device shift.
- **80 - 100 (CRITICAL):** Immediate Hold / Decline. Impossible travel, brute-force attempts, or account takeover signatures.

### False Positive Awareness
Transactions on trusted devices with mature tenure and 0 authentication failures are tagged with an **Advisory Warning** recommending out-of-band push confirmation rather than immediate decline.

---

## 🎤 5-Minute Hackathon Demo Script

1. **Landing Page (`/`):**
   - Present the vision: *"Detect fraud before it becomes damage."*
   - Toggle the **"See Fraud Shield AI in Action"** comparison widget: show normal baseline vs anomalous London ATO surge.
2. **Dashboard (`/dashboard`):**
   - Review live KPI cards (24,891 analyzed, 327 detected, 97.4% accuracy).
   - Point out the Real-time Threat Feed with live pulsing indicators.
3. **Deep Investigation (`TXN-92831`):**
   - Click `TXN-92831` (Aarav Sharma) in the feed to open the forensic inspection drawer.
   - Point out the **99/100 Critical Risk** score, the 24.1× amount spike, impossible travel (Mumbai to London), and 3 failed credentials.
4. **Lumora AI Companion:**
   - Click **"Ask Lumora"** or open the floating glowing orb at the bottom right.
   - Click: *"Why was TXN-92831 flagged?"*
   - Demonstrate grounded causal reasoning and specific action recommendations.
5. **Real-time Transaction Scanner (`/scan`):**
   - Click the preset scenario **"🚨 Critical ATO Attack"**.
   - Click **"Analyze Risk Telemetry"** and observe the multi-stage progress pipeline.
   - Review the visual Risk Breakdown bars and explainable rationale.
6. **Intelligence & Network Graph (`/intelligence`):**
   - Explore the **Fraud Network Topology** showing correlated accounts, devices, proxies, and merchants.
   - Highlight the **Late-Night Attack Peak** (01:30–04:30 AM).
7. **Investigation Center (`/investigations`):**
   - Open case `CASE-4401`, update status to *Investigating*, and document an analyst finding.

---

## 🔒 Security & Privacy
- Zero client-side API key exposure.
- Authentication tokens and credentials stored via backend environment variables.
- Demo dataset uses fictional mock customer profiles with no real PII.
