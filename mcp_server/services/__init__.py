"""
Paquete de servicios para el microservicio MCP.

Este paquete proporciona los servicios de negocio utilizados por los
endpoints del API, separando la lógica de la presentación.
"""

from .emr_service import (
    store_emr_entry,
    get_emr_entries_by_visit
)

from .supabase_client import (
    get_supabase_status,
    SupabaseClientError,
    store_validation_alerts
)

__all__ = [
    # Servicios EMR
    "store_emr_entry",
    "get_emr_entries_by_visit",
    
    # Servicios Supabase
    "get_supabase_status",
    "SupabaseClientError",
    "store_validation_alerts"
] 