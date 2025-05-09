"""
Paquete core del microservicio MCP.

Este paquete proporciona la funcionalidad central para:
- Integración con Langraph
- Ejecución del grafo MCP
- Utilidades y herramientas comunes
"""

from .langraph_runner import run_mcp_graph

__all__ = ["run_mcp_graph"] 