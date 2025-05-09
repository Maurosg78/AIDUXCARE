"""
Esquemas para validación de respuestas del API.

Este módulo define los modelos Pydantic para validación de datos
en las respuestas del microservicio MCP.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from .request import ConversationItem, RoleType, SenderType

class ToolResult(BaseModel):
    """Resultado de una herramienta ejecutada por el MCP."""
    
    tool: str = Field(..., description="Nombre de la herramienta ejecutada")
    result: str = Field(..., description="Resultado de la ejecución de la herramienta")

class TraceEntry(BaseModel):
    """Entrada de traza para seguimiento de la ejecución."""
    
    timestamp: str = Field(..., description="Marca de tiempo ISO")
    action: str = Field(..., description="Acción o evento registrado")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos asociados")

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
    """Modelo para respuestas de error."""
    
    error: Dict[str, Any] = Field(
        ...,
        description="Detalles del error ocurrido"
    )
    
    status_code: int = Field(
        ...,
        description="Código de estado HTTP"
    )
    
    message: str = Field(
        ...,
        description="Mensaje de error"
    )

class ContextSummary(BaseModel):
    """
    Resumen del estado contextual del MCP para mostrar en el frontend.
    """
    
    active_tools: List[str] = Field(
        default_factory=list,
        description="Herramientas utilizadas en la respuesta actual"
    )
    
    memory_blocks_count: int = Field(
        0,
        description="Número de bloques de memoria utilizados"
    )
    
    processing_time_ms: float = Field(
        0.0,
        description="Tiempo de procesamiento en milisegundos"
    )
    
    user_role: RoleType = Field(
        ...,
        description="Rol del usuario para el que se generó la respuesta"
    )
    
    error: Optional[bool] = Field(
        None,
        description="Indica si ocurrió un error en el procesamiento"
    )
    
    error_message: Optional[str] = Field(
        None,
        description="Mensaje de error si ocurrió alguno"
    )

class FrontendMCPResponse(BaseModel):
    """
    Modelo para las respuestas al frontend desde el endpoint /mcp/respond.
    Diseñado para ser fácilmente consumido y mostrado en React.
    """
    
    response: str = Field(
        ...,
        description="Texto de respuesta generado por el agente MCP"
    )
    
    conversation_item: ConversationItem = Field(
        ...,
        description="Objeto de conversación listo para añadir al historial en la UI"
    )
    
    context_summary: ContextSummary = Field(
        ...,
        description="Resumen del estado contextual para mostrar en la interfaz"
    )
    
    trace: List[TraceEntry] = Field(
        default_factory=list,
        description="Traza de ejecución para debugging y transparencia"
    ) 