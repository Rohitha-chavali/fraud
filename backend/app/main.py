from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.config import HOST, PORT, ENVIRONMENT, DEMO_MODE, GEMINI_API_KEY
from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.transactions import router as transactions_router
from backend.app.api.alerts import router as alerts_router
from backend.app.api.investigations import router as investigations_router
from backend.app.api.intelligence import router as intelligence_router
from backend.app.api.lumora import router as lumora_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed on startup if collections are empty
    try:
        if db_manager.transactions.count_documents() == 0:
            print("[Startup] Seeding realistic demo data...")
            data = get_demo_dataset()
            db_manager.transactions.insert_many(data["transactions"])
            db_manager.alerts.insert_many(data["alerts"])
            db_manager.investigations.insert_many(data["investigations"])
            print(f"[Startup] Seeded {len(data['transactions'])} transactions, {len(data['alerts'])} alerts, {len(data['investigations'])} investigations.")
    except Exception as e:
        print(f"[Startup] Seeding check note: {e}")
    yield

app = FastAPI(
    title="Fraud Shield AI API",
    description="Intelligent fintech fraud intelligence platform with explainable AI and Lumora assistant.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(dashboard_router)
app.include_router(transactions_router)
app.include_router(alerts_router)
app.include_router(investigations_router)
app.include_router(intelligence_router)
app.include_router(lumora_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Fraud Shield AI Backend",
        "aiEngine": "Online",
        "geminiConfigured": bool(GEMINI_API_KEY),
        "demoMode": DEMO_MODE,
        "databaseType": "MongoDB" if db_manager.is_mongo else "Embedded Local DB"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=True)
