"""
Modelos Pydantic para las solicitudes entrantes al API.

Este módulo define los esquemas para las solicitudes recibidas por el API,
asegurando la validación de datos antes de procesarlos.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Tipos utilizados en múltiples esquemas
RoleType = Literal["health_professional", "patient", "admin_staff"]
SenderType = Literal["user", "assistant", "system"]

class MCPRequest(BaseModel):
    """Modelo para las solicitudes al endpoint MCP."""
    
    visit_id: str = Field(
        ..., 
        description="ID de la visita médica",
        min_length=3,
        examples=["VISITA123"]
    )
    
    role: RoleType = Field(
        "health_professional",
        description="Rol del usuario que interactúa con el agente"
    )
    
    user_input: str = Field(
        ..., 
        description="Mensaje del usuario para el agente MCP",
        min_length=1,
        examples=["El paciente refiere dolor lumbar al levantar peso"]
    )
    
    context_override: Optional[Dict[str, Any]] = Field(
        None,
        description="Contexto adicional para sobreescribir o complementar el contexto base (opcional)"
    )
    
    previous_messages: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Mensajes previos para mantener el contexto de la conversación (opcional)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "visit_id": "VIS001",
                "role": "health_professional",
                "user_input": "El paciente refiere dolor irradiado al brazo derecho",
                "context_override": None,
                "previous_messages": []
            }
        }

class ConversationItem(BaseModel):
    """Representa un mensaje en una conversación."""
    id: str
    timestamp: Optional[str] = None
    sender_type: SenderType
    sender_name: str
    content: str
    metadata: Dict[str, Any] = {}

class FrontendMCPRequest(BaseModel):
    """
    Solicitud desde el frontend para generar una respuesta del MCP.
    
    Este modelo representa la estructura de datos esperada cuando el frontend
    envía un mensaje de usuario para ser procesado por el MCP.
    """
    visit_id: str = Field(..., description="ID de la visita médica")
    role: RoleType = Field("health_professional", description="Rol del usuario")
    user_input: str = Field(..., description="Mensaje del usuario")
    context_override: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional")
    previous_messages: Optional[List[ConversationItem]] = Field(None, description="Mensajes previos")

class StoreEMRRequest(BaseModel):
    """
    Solicitud para almacenar contenido validado en el EMR.
    
    Este modelo representa la estructura de datos esperada cuando se quiere
    almacenar una entrada validada por un profesional en el EMR.
    """
    visit_id: str = Field(..., description="ID de la visita médica")
    field: str = Field(..., description="Campo del EMR (ej: anamnesis, diagnóstico)")
    role: RoleType = Field(..., description="Rol del usuario que valida")
    content: str = Field(..., description="Contenido validado a almacenar")
    overwrite: bool = Field(False, description="Si debe sobrescribir una entrada existente") 