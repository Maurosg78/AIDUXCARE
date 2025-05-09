"""
Paquete de servicios del microservicio MCP.

Este paquete proporciona servicios de integración con sistemas externos:
- Supabase para persistencia de datos
- Otros servicios que se puedan agregar en el futuro
"""

from .supabase_client import store_emr_entry, get_supabase_status

__all__ = [
    "store_emr_entry",
    "get_supabase_status"
] 