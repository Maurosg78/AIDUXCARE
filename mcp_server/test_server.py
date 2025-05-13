"""
Servidor de prueba para MCP FastAPI v1.20.1

Este servidor simula la funcionalidad del endpoint /api/mcp/respond
para pruebas de integración con el frontend React.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import uvicorn
import json
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp-server")

# Crear aplicación FastAPI
app = FastAPI(
    title="MCP Server - AiDuxCare",
    description="Servidor de prueba para el Modelo de Contexto Predictivo (MCP)",
    version="v1.20.1",
    docs_url="/docs"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://aiduxcare.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    visit_id: str = Field(..., description="ID de la visita médica")
    role: RoleType = Field("health_professional", description="Rol del usuario")
    user_input: str = Field(..., description="Mensaje del usuario")
    context_override: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional")
    previous_messages: Optional[List[ConversationItem]] = Field(None, description="Mensajes previos")

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
    """
    Endpoint optimizado para integración con el frontend de AiDuxCare.
    
    Procesa solicitudes de la interfaz de usuario y devuelve respuestas en un formato
    adecuado para mostrar directamente en el frontend, incluyendo estado de conversación
    e información contextual para la vista de detalle de visita.
    """
    logger.info(f"Recibida solicitud para visita: {request.visit_id}, rol: {request.role}")
    
    # Crear respuesta simulada basada en la entrada del usuario
    if "dolor" in request.user_input.lower():
        response_text = f"Basado en los síntomas de dolor que refiere, es importante evaluar si hay compromiso neurológico. Recomiendo realizar una exploración detallada de la sensibilidad y fuerza en el miembro afectado. También sería útil descartar compresión radicular mediante pruebas complementarias."
    elif "fiebre" in request.user_input.lower():
        response_text = f"La presencia de fiebre junto con los otros síntomas podría indicar un proceso infeccioso. Sugiero solicitar hemograma completo, PCR y valorar la necesidad de hemocultivos según la evolución clínica."
    else:
        response_text = f"He analizado la información proporcionada sobre el paciente. Recomendaría completar la anamnesis con antecedentes familiares relevantes y valorar la realización de pruebas complementarias específicas según la evolución clínica."
    
    # Generar ID para mensaje
    message_id = f"msg_{len(request.previous_messages) + 2 if request.previous_messages else 2}"
    timestamp = datetime.now().isoformat()
    
    # Crear trace con información de procesamiento
    trace_entry = TraceEntry(
        timestamp=timestamp,
        action="processing_completed",
        metadata={
            "execution_time": 0.5,
            "tools_used": ["clinical_evaluation", "treatment_recommendation"],
            "request_info": {
                "visit_id": request.visit_id,
                "role": request.role,
                "input_length": len(request.user_input)
            }
        }
    )
    
    # Crear respuesta para el frontend
    return FrontendMCPResponse(
        response=response_text,
        conversation_item=ConversationItem(
            id=message_id,
            timestamp=timestamp,
            sender_type="assistant",
            sender_name="AiDuxCare MCP",
            content=response_text,
            metadata={
                "tools_used": ["clinical_evaluation", "treatment_recommendation"],
                "visit_id": request.visit_id,
                "confidence": 0.92
            }
        ),
        context_summary=ContextSummary(
            active_tools=["clinical_evaluation", "treatment_recommendation"],
            memory_blocks_count=3,
            processing_time_ms=500.0,
            user_role=request.role
        ),
        trace=[trace_entry]
    )

@app.get("/api/health")
async def health_check():
    """Verificar estado del servidor."""
    return {
        "status": "ok",
        "version": "v1.20.1",
        "service": "MCP Server - AiDuxCare",
        "model": "gpt-3.5-turbo (simulado)"
    }

@app.get("/")
async def root():
    """Ruta raíz que redirige a la documentación."""
    return {
        "message": "Bienvenido al servidor MCP v1.20.1",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 