"""
Wrapper para langraph_mcp.py original.

Este módulo simplemente reexporta las funciones y clases necesarias
del módulo langraph_mcp.py ubicado en la raíz del proyecto.
"""

import sys
import os

# Añadir la raíz del proyecto al path para importar langraph_mcp
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from langraph_mcp import (
    build_mcp_graph,
    initialize_context,
    run_graph,
    MCPState
)

# Reexportar para que estén disponibles desde este módulo
__all__ = ['build_mcp_graph', 'initialize_context', 'run_graph', 'MCPState'] 