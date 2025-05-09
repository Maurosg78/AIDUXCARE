"""
Modelos Pydantic para las respuestas del API.

Este módulo define los esquemas para las respuestas enviadas por el API,
garantizando un formato consistente.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from .request import ConversationItem, RoleType, SenderType

class ToolResult(BaseModel):
    """Resultado de una herramienta ejecutada por el MCP."""
    
    tool: str = Field(..., description="Nombre de la herramienta ejecutada")
    result: str = Field(..., description="Resultado de la ejecución de la herramienta")

class TraceEntry(BaseModel):
    """
    Entrada de trazabilidad para debugging y monitoreo.
    
    Registra acciones, decisiones y eventos internos durante el procesamiento
    de una solicitud por el MCP.
    """
    timestamp: str
    action: str
    metadata: Dict[str, Any] = {}

class MCPResponse(BaseModel):
    """Modelo para las respuestas del endpoint MCP."""
    
    output: str = Field(..., description="Texto de respuesta generado por el agente MCP")
    
    used_tools: List[ToolResult] = Field(
        default_factory=list,
        description="Listado de herramientas utilizadas y sus resultados"
    )
    
    trace: List[TraceEntry] = Field(
        default_factory=list,
        description="Traza de ejecución para debugging"
    )
    
    memory_summary: Optional[str] = Field(
        None,
        description="Resumen de los bloques de memoria procesados (solo en modo debug)"
    )
    
    token_usage: Optional[Dict[str, int]] = Field(
        None,
        description="Uso de tokens en la generación de la respuesta"
    )

class ErrorResponse(BaseModel):
    """
    Modelo estándar para respuestas de error.
    
    Proporciona un formato consistente para todos los errores devueltos
    por el API.
    """
    error: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "message": "Error interno del servidor",
                    "status_code": 500,
                    "details": {"error": "Descripción detallada del error"}
                },
                "timestamp": "2023-09-01T12:00:00"
            }
        }

class ContextSummary(BaseModel):
    """
    Resumen del contexto para el frontend.
    
    Proporciona información sobre el estado actual del agente MCP,
    incluyendo herramientas activas y otra información contextual.
    """
    active_tools: List[str] = []
    memory_blocks_count: int = 0
    processing_time_ms: float = 0.0
    user_role: RoleType
    error: Optional[bool] = None
    error_message: Optional[str] = None

class FrontendMCPResponse(BaseModel):
    """
    Respuesta del MCP optimizada para el frontend.
    
    Incluye tanto la respuesta textual como metadatos adicionales para
    mostrar en la interfaz y facilitar el debugging.
    """
    response: str
    conversation_item: ConversationItem
    context_summary: ContextSummary
    trace: List[TraceEntry] = []

class StorageError(BaseModel):
    """
    Error específico para operaciones de almacenamiento.
    
    Utilizado en endpoints relacionados con EMR y persistencia de datos.
    """
    error: str
    error_type: str
    timestamp: datetime = Field(default_factory=datetime.now)

class StoreEMRResponse(BaseModel):
    """
    Respuesta para operaciones de almacenamiento en EMR.
    
    Confirma el almacenamiento exitoso de una entrada clínica.
    """
    success: bool
    entry_id: Optional[str] = None
    field: str
    timestamp: datetime
    message: str
    data: Dict[str, Any] = {} 