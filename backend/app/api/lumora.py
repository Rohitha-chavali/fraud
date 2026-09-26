from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from backend.app.models.schemas import LumoraChatRequest, LumoraChatResponse
from backend.app.ai.gemini_service import lumora_service
from backend.app.database.db import db_manager

router = APIRouter(prefix="/api/lumora", tags=["Lumora AI"])

@router.post("/chat", response_model=LumoraChatResponse)
def lumora_chat(req: LumoraChatRequest):
    txn_data = None
    if req.transactionId:
        txn_data = db_manager.transactions.find_one({"transactionId": req.transactionId})
    elif req.context and "transactionId" in req.context:
        txn_data = db_manager.transactions.find_one({"transactionId": req.context["transactionId"]})

    style = "Balanced"
    if req.settings and "style" in req.settings:
        style = req.settings["style"]

    chat_out = lumora_service.chat_response(
        message=req.message,
        transaction=txn_data,
        history=req.conversationHistory,
        style=style
    )

    # Save to conversations log
    db_manager.ai_chats.insert_one({
        "message": req.message,
        "transactionId": req.transactionId,
        "response": chat_out["response"],
        "timestamp": None
    })

    return LumoraChatResponse(
        response=chat_out["response"],
        structuredAnalysis=chat_out.get("structuredAnalysis"),
        suggestedActions=chat_out.get("suggestedActions", []),
        citedSignals=chat_out.get("citedSignals", []),
        transactionContext=chat_out.get("transactionContext")
    )

@router.post("/explain")
def lumora_explain(payload: Dict[str, Any] = Body(...)):
    txn_id = payload.get("transactionId")
    txn_data = None
    if txn_id:
        txn_data = db_manager.transactions.find_one({"transactionId": txn_id})
    if not txn_data:
        txn_data = payload.get("transaction")

    if not txn_data:
        raise HTTPException(status_code=400, detail="Transaction data or transactionId required")

    explanation = lumora_service.explain_transaction(txn_data)
    return explanation
