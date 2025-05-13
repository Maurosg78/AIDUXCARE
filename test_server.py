"""
Servidor de prueba para endpoint MCP.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import json
import uvicorn

app = FastAPI(title="MCP Test Server")

# Tipos
RoleType = Literal["health_professional", "patient", "admin_staff"]
SenderType = Literal["user", "assistant", "system"]

# Modelos
class ConversationItem(BaseModel):
    id: str
    timestamp: Optional[str] = None
    sender_type: SenderType
    sender_name: str
    content: str
    metadata: Dict[str, Any] = {}

class FrontendMCPRequest(BaseModel):
    visit_id: str
    role: RoleType = "health_professional"
    user_input: str
    context_override: Optional[Dict[str, Any]] = None
    previous_messages: Optional[List[ConversationItem]] = None

class ContextSummary(BaseModel):
    active_tools: List[str] = []
    memory_blocks_count: int = 0
    processing_time_ms: float = 0.0
    user_role: RoleType
    error: Optional[bool] = None
    error_message: Optional[str] = None

class TraceEntry(BaseModel):
    timestamp: str
    action: str
    metadata: Dict[str, Any] = {}

class FrontendMCPResponse(BaseModel):
    response: str
    conversation_item: ConversationItem
    context_summary: ContextSummary
    trace: List[TraceEntry] = []

@app.post("/api/mcp/respond", response_model=FrontendMCPResponse)
async def mcp_respond(request: FrontendMCPRequest):
    """Endpoint de prueba para el MCP."""
    
    # Crear respuesta simulada
    response_text = f"Respuesta simulada para la consulta sobre dolor cervical. Rol: {request.role}, Visita: {request.visit_id}"
    
    # Generar ID para mensaje
    message_id = f"msg_{len(request.previous_messages) + 2 if request.previous_messages else 2}"
    timestamp = datetime.now().isoformat()
    
    # Crear trace
    trace_entry = TraceEntry(
        timestamp=timestamp,
        action="processing_completed",
        metadata={"execution_time": 0.5}
    )
    
    # Crear respuesta
    return FrontendMCPResponse(
        response=response_text,
        conversation_item=ConversationItem(
            id=message_id,
            timestamp=timestamp,
            sender_type="assistant",
            sender_name="AiDuxCare MCP Test",
            content=response_text,
            metadata={"tools_used": ["test_tool"], "visit_id": request.visit_id}
        ),
        context_summary=ContextSummary(
            active_tools=["test_tool"],
            memory_blocks_count=1,
            processing_time_ms=500.0,
            user_role=request.role
        ),
        trace=[trace_entry]
    )

@app.get("/health")
async def health_check():
    """Verificar estado del servidor."""
    return {"status": "ok", "version": "test", "service": "MCP Test Server"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080) 