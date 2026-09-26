import json
import os
import threading
from typing import Dict, Any, List, Optional
from pathlib import Path
from backend.app.config import MONGODB_URI, MONGODB_DB

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

class LocalCollection:
    """Thread-safe file-backed collection fallback matching PyMongo-like interface"""
    def __init__(self, filename: str):
        self.file_path = DATA_DIR / f"{filename}.json"
        self.lock = threading.Lock()
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        with self.lock:
            if self.file_path.exists():
                try:
                    with open(self.file_path, "r", encoding="utf-8") as f:
                        self._data = json.load(f)
                except Exception:
                    self._data = []
            else:
                self._data = []
                self._save()

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            print(f"[LocalCollection] Error saving {self.file_path.name}: {e}")

    def find(self, query: Optional[Dict[str, Any]] = None, sort_field: Optional[str] = None, ascending: bool = False, limit: Optional[int] = None, skip: int = 0) -> List[Dict[str, Any]]:
        with self.lock:
            results = list(self._data)
            if query:
                def match(item):
                    for k, v in query.items():
                        if k not in item or item[k] != v:
                            return False
                    return True
                results = [r for r in results if match(r)]

            if sort_field:
                results.sort(key=lambda x: x.get(sort_field, 0), reverse=not ascending)

            if skip:
                results = results[skip:]
            if limit is not None:
                results = results[:limit]
            return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.lock:
            for item in self._data:
                matched = True
                for k, v in query.items():
                    if item.get(k) != v:
                        matched = False
                        break
                if matched:
                    return dict(item)
            return None

    def insert_one(self, doc: Dict[str, Any]):
        with self.lock:
            # avoid duplicates on unique keys like transactionId or caseId or alertId
            pk_keys = ["transactionId", "caseId", "alertId", "id"]
            for pk in pk_keys:
                if pk in doc:
                    self._data = [d for d in self._data if d.get(pk) != doc[pk]]
                    break
            self._data.insert(0, doc)
            self._save()
        return doc

    def insert_many(self, docs: List[Dict[str, Any]]):
        with self.lock:
            for doc in docs:
                pk_keys = ["transactionId", "caseId", "alertId", "id"]
                for pk in pk_keys:
                    if pk in doc:
                        self._data = [d for d in self._data if d.get(pk) != doc[pk]]
                        break
                self._data.append(doc)
            self._save()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        with self.lock:
            for item in self._data:
                matched = True
                for k, v in query.items():
                    if item.get(k) != v:
                        matched = False
                        break
                if matched:
                    set_values = update.get("$set", update)
                    item.update(set_values)
                    self._save()
                    return True
            return False

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

    def clear(self):
        with self.lock:
            self._data = []
            self._save()


class DatabaseManager:
    def __init__(self):
        self.is_mongo = False
        self.mongo_client = None
        self.mongo_db = None
        
        # Local collections
        self.local_transactions = LocalCollection("transactions")
        self.local_alerts = LocalCollection("fraud_alerts")
        self.local_investigations = LocalCollection("investigations")
        self.local_ai_chats = LocalCollection("ai_conversations")
        self.local_metrics = LocalCollection("system_metrics")

        self._try_init_mongo()

    def _try_init_mongo(self):
        try:
            import pymongo
            client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
            # Trigger a ping to verify connection
            client.admin.command('ping')
            self.mongo_client = client
            self.mongo_db = client[MONGODB_DB]
            self.is_mongo = True
            print(f"[DatabaseManager] Successfully connected to MongoDB at {MONGODB_URI}")
        except Exception as e:
            self.is_mongo = False
            print(f"[DatabaseManager] MongoDB not reachable ({e}). Using embedded local database engine.")

    @property
    def transactions(self):
        if self.is_mongo and self.mongo_db is not None:
            return self.mongo_db["transactions"]
        return self.local_transactions

    @property
    def alerts(self):
        if self.is_mongo and self.mongo_db is not None:
            return self.mongo_db["fraud_alerts"]
        return self.local_alerts

    @property
    def investigations(self):
        if self.is_mongo and self.mongo_db is not None:
            return self.mongo_db["investigations"]
        return self.local_investigations

    @property
    def ai_chats(self):
        if self.is_mongo and self.mongo_db is not None:
            return self.mongo_db["ai_conversations"]
        return self.local_ai_chats

    @property
    def metrics(self):
        if self.is_mongo and self.mongo_db is not None:
            return self.mongo_db["system_metrics"]
        return self.local_metrics

db_manager = DatabaseManager()
