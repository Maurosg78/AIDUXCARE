"""
Paquete core para componentes centrales del MCP.

Este paquete contiene los componentes centrales del MCP:
- Validadores de registros clínicos
- Ejecutores de grafos LangGraph
- Integración con Langfuse
"""

from .langfuse_tracing import create_trace
from .langraph_runner import run_mcp_graph
from .validators import validate_emr_record

__all__ = [
    "create_trace",
    "run_mcp_graph",
    "validate_emr_record"
] 