"""
Paquete de esquemas para validación de datos.

Este paquete proporciona modelos Pydantic para la validación
de solicitudes y respuestas del microservicio MCP.
"""

from .request import (
    RoleType,
    SenderType,
    MCPRequest,
    ConversationItem,
    FrontendMCPRequest
)

from .response import (
    ToolResult,
    TraceEntry,
    MCPResponse,
    ErrorResponse,
    ContextSummary,
    FrontendMCPResponse
)

__all__ = [
    "RoleType",
    "SenderType",
    "MCPRequest",
    "ConversationItem",
    "FrontendMCPRequest",
    "ToolResult",
    "TraceEntry",
    "MCPResponse",
    "ErrorResponse",
    "ContextSummary",
    "FrontendMCPResponse"
] 