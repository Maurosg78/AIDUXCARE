"""
Esquemas para validación de solicitudes y respuestas del API.

Este módulo define los modelos Pydantic para validación de datos
en las solicitudes y respuestas del microservicio MCP.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# Definición de tipos
RoleType = Literal["health_professional", "patient", "admin_staff"]

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