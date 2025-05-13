"""
Esquemas para validación de solicitudes y respuestas del API.

Este módulo define los modelos Pydantic para validación de datos
en las solicitudes y respuestas del microservicio MCP.
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

# Modelos adicionales para integración con frontend

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