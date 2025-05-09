"""
Modelos para el MCP (Model Context Protocol).

Este módulo define los modelos de datos utilizados en la comunicación 
con el MCP, incluyendo solicitudes, respuestas y estructuras de mensajes.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ConversationItem(BaseModel):
    """
    Modelo para un elemento de conversación en el historial.
    """
    id: str = Field(..., description="ID único del mensaje")
    timestamp: str = Field(..., description="Timestamp ISO 8601")
    sender_type: str = Field(..., description="Tipo de remitente (user, assistant, system)")
    sender_name: str = Field(..., description="Nombre del remitente")
    content: str = Field(..., description="Contenido del mensaje")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadatos adicionales")

class ContextSummary(BaseModel):
    """
    Modelo para el resumen del contexto de la conversación.
    """
    active_tools: List[str] = Field(default_factory=list, description="Herramientas activas utilizadas")
    memory_blocks_count: int = Field(0, description="Número de bloques de memoria utilizados")
    processing_time_ms: float = Field(..., description="Tiempo de procesamiento en milisegundos")
    user_role: str = Field(..., description="Rol del usuario en la conversación")
    error: bool = Field(False, description="Indicador de error")
    error_message: Optional[str] = Field(None, description="Mensaje de error si ocurrió alguno")

class TraceEntry(BaseModel):
    """
    Modelo para una entrada de traza de ejecución.
    """
    timestamp: str = Field(..., description="Timestamp ISO 8601")
    action: str = Field(..., description="Acción realizada")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos de la acción")

class ErrorResponse(BaseModel):
    """
    Modelo para respuestas de error.
    """
    detail: str = Field(..., description="Mensaje detallado del error")
    error_type: Optional[str] = Field(None, description="Tipo de error")
    timestamp: Optional[str] = Field(None, description="Timestamp del error")

class FrontendMCPRequest(BaseModel):
    """
    Modelo para solicitudes del frontend al MCP.
    """
    visit_id: str = Field(..., description="ID de la visita médica")
    role: str = Field(..., description="Rol del usuario (health_professional, patient, admin_staff)")
    user_input: str = Field(..., description="Entrada del usuario")
    previous_messages: Optional[List[ConversationItem]] = Field(None, description="Mensajes previos")
    context_override: Optional[Dict[str, Any]] = Field(None, description="Anulaciones de contexto")

class FrontendMCPResponse(BaseModel):
    """
    Modelo para respuestas del MCP al frontend.
    """
    response: str = Field(..., description="Respuesta generada por el MCP")
    conversation_item: ConversationItem = Field(..., description="Elemento de conversación para el historial")
    context_summary: ContextSummary = Field(..., description="Resumen del contexto utilizado")
    trace: Optional[List[TraceEntry]] = Field(None, description="Información de traza para depuración") 