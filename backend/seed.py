"""
Standalone Seed Script for Fraud Shield AI
Run: python -m backend.seed
"""
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.database.db import db_manager
from backend.app.services.seed_data import get_demo_dataset

def seed():
    print("=========================================")
    print("   FRAUD SHIELD AI - DATASET SEEDER     ")
    print("=========================================")
    print(f"Target Database: {'MongoDB' if db_manager.is_mongo else 'Embedded Local JSON'}")
    
    print("Clearing existing demo records...")
    db_manager.transactions.clear()
    db_manager.alerts.clear()
    db_manager.investigations.clear()

    print("Generating authentic fintech demo dataset...")
    dataset = get_demo_dataset()

    print(f"Inserting {len(dataset['transactions'])} transactions...")
    db_manager.transactions.insert_many(dataset["transactions"])

    print(f"Inserting {len(dataset['alerts'])} fraud alerts...")
    db_manager.alerts.insert_many(dataset["alerts"])

    print(f"Inserting {len(dataset['investigations'])} investigation cases...")
    db_manager.investigations.insert_many(dataset["investigations"])

    print("[SUCCESS] Seed completed successfully!")
    print(f"  - Transactions: {db_manager.transactions.count_documents()}")
    print(f"  - Fraud Alerts: {db_manager.alerts.count_documents()}")
    print(f"  - Investigations: {db_manager.investigations.count_documents()}")

if __name__ == "__main__":
    seed()
