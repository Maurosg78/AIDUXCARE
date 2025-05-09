"""
Paquete de esquemas Pydantic para el microservicio MCP.

Este paquete proporciona los modelos de validación para todos los datos
que entran y salen del API.
"""

# Importar todos los modelos de request.py
from .request import (
    FrontendMCPRequest, 
    StoreEMRRequest,
    ConversationItem,
    RoleType,
    SenderType
)

# Importar todos los modelos de response.py
from .response import (
    FrontendMCPResponse,
    ErrorResponse,
    ContextSummary,
    TraceEntry,
    StorageError,
    StoreEMRResponse
)

# Importar todos los modelos de emr_models.py
from .emr_models import (
    EMRFieldEntry,
    EMREntriesResponse
)

# Exportar todos los modelos para uso externo
__all__ = [
    # Modelos de request
    "FrontendMCPRequest",
    "StoreEMRRequest", 
    "ConversationItem",
    "RoleType",
    "SenderType",
    
    # Modelos de response
    "FrontendMCPResponse",
    "ErrorResponse",
    "ContextSummary",
    "TraceEntry",
    "StorageError",
    "StoreEMRResponse",
    
    # Modelos de EMR
    "EMRFieldEntry",
    "EMREntriesResponse"
] 