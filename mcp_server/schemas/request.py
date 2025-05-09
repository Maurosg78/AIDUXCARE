"""
Esquemas para validación de solicitudes del API.

Este módulo define los modelos Pydantic para validación de datos
en las solicitudes del microservicio MCP.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Definición de tipos
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
    """
    Representa un mensaje en una conversación para el frontend.
    Diseñado para ser mostrado directamente en la interfaz de usuario.
    """
    
    id: str = Field(..., description="Identificador único del mensaje")
    
    timestamp: Optional[str] = Field(
        None, 
        description="Marca de tiempo ISO cuando se generó el mensaje"
    )
    
    sender_type: SenderType = Field(
        ...,
        description="Tipo de remitente: usuario, asistente o sistema"
    )
    
    sender_name: str = Field(
        ...,
        description="Nombre del remitente para mostrar en la interfaz"
    )
    
    content: str = Field(
        ...,
        description="Contenido del mensaje"
    )
    
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadatos adicionales como herramientas usadas, etc."
    )

class FrontendMCPRequest(BaseModel):
    """
    Modelo para las solicitudes desde el frontend al endpoint /mcp/respond.
    Optimizado para ser enviado desde React.
    """
    
    visit_id: str = Field(
        ..., 
        description="ID de la visita médica",
        min_length=3,
        examples=["VIS123"]
    )
    
    role: RoleType = Field(
        "health_professional",
        description="Rol del usuario que interactúa con el agente"
    )
    
    user_input: str = Field(
        ..., 
        description="Mensaje del usuario para el agente MCP",
        min_length=1,
        examples=["El paciente refiere dolor irradiado hacia el brazo derecho"]
    )
    
    context_override: Optional[Dict[str, Any]] = Field(
        None,
        description="Contexto adicional para sobreescribir o complementar el contexto base (opcional)"
    )
    
    previous_messages: Optional[List[ConversationItem]] = Field(
        None,
        description="Histórico de conversación para mantener el contexto"
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