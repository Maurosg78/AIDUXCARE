"""
Servicio para operaciones en el Registro Médico Electrónico (EMR).

Este módulo proporciona funciones para almacenar y recuperar datos clínicos
del EMR utilizando Supabase como almacenamiento.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from .supabase_client import SupabaseClient, SupabaseClientError
from settings import settings

# Configurar logging
logger = logging.getLogger(__name__)

# Configuración de tablas y campos
EMR_TABLE = "emr_entries"

async def store_emr_entry(
    visit_id: str, 
    field: str, 
    role: str, 
    content: str, 
    overwrite: bool = False
) -> Dict[str, Any]:
    """
    Almacena una entrada validada en el EMR.
    
    Args:
        visit_id: ID de la visita a la que pertenece la entrada
        field: Campo clínico (anamnesis, diagnóstico, etc.)
        role: Rol del usuario que crea/valida la entrada
        content: Contenido validado a almacenar
        overwrite: Si debe sobrescribir una entrada existente
    
    Returns:
        Datos de la entrada almacenada
        
    Raises:
        SupabaseClientError: Si hay un error con Supabase
    """
    # Inicializar cliente Supabase
    supabase = SupabaseClient()
    
    # Verificar si ya existe una entrada para este campo
    existing = await supabase.query(
        EMR_TABLE,
        "select", 
        {"columns": "id", "filters": {"visit_id": visit_id, "field": field}}
    )
    
    # Si existe y no se permite sobrescribir, error
    if existing and not overwrite:
        raise SupabaseClientError(f"Ya existe una entrada para el campo '{field}' en la visita {visit_id}")
    
    # Datos para almacenar
    entry_data = {
        "visit_id": visit_id,
        "field": field,
        "content": content,
        "role": role,
        "timestamp": datetime.now().isoformat(),
        "source": "mcp",
        "validated": True
    }
    
    # Si existe, actualizar; si no, crear
    if existing:
        result = await supabase.query(
            EMR_TABLE, 
            "update",
            {"data": entry_data, "filters": {"id": existing[0]["id"]}}
        )
        logger.info(f"Actualizada entrada EMR: {field} para visita {visit_id}")
    else:
        result = await supabase.query(
            EMR_TABLE,
            "insert",
            {"data": entry_data}
        )
        logger.info(f"Creada nueva entrada EMR: {field} para visita {visit_id}")
    
    return result[0] if result else None

async def get_emr_entries_by_visit(
    visit_id: str,
    field: Optional[str] = None,
    role: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Recupera entradas del EMR para una visita específica.
    
    Args:
        visit_id: ID de la visita a consultar
        field: Campo específico a filtrar (opcional)
        role: Rol del usuario a filtrar (opcional)
        
    Returns:
        Lista de entradas que cumplen con los criterios
        
    Raises:
        SupabaseClientError: Si hay un error con Supabase
    """
    # Inicializar cliente Supabase
    supabase = SupabaseClient()
    
    # Construir filtros
    filters = {"visit_id": visit_id}
    if field:
        filters["field"] = field
    if role:
        filters["role"] = role
    
    # Ejecutar consulta
    try:
        results = await supabase.query(
            EMR_TABLE,
            "select",
            {"filters": filters}
        )
        
        logger.info(f"Recuperadas {len(results)} entradas EMR para visita {visit_id}")
        return results
    except SupabaseClientError as e:
        logger.error(f"Error al recuperar entradas EMR: {str(e)}")
        # Si la visita no existe, devolver lista vacía
        if "no existe" in str(e).lower():
            return []
        # Sino, propagar el error
        raise 