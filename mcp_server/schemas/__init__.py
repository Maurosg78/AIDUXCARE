"""
Esquemas del microservicio MCP.

Este paquete define los modelos de datos utilizados para:
- Validación de peticiones y respuestas
- Estructuras de datos internas
- Comunicación con el frontend
"""

# Modelos base
from .base_models import (
    ErrorResponse,
    ConversationItem,
    ContextSummary,
    TraceEntry
)

# Modelos MCP
from .mcp_models import (
    FrontendMCPRequest,
    FrontendMCPResponse
)

# Modelos EMR
from .emr_models import (
    StoreEMRRequest,
    StoreEMRResponse,
    StorageError,
    EMRFieldEntry,
    EMREntriesResponse
)

__all__ = [
    "ErrorResponse",
    "ConversationItem",
    "ContextSummary",
    "TraceEntry",
    "FrontendMCPRequest",
    "FrontendMCPResponse",
    "StoreEMRRequest",
    "StoreEMRResponse",
    "StorageError",
    "EMRFieldEntry",
    "EMREntriesResponse"
] 