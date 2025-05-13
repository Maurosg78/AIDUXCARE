"""
Router para el endpoint de entradas (/api/mcp/entries).

Este módulo define las rutas relacionadas con la consulta y manejo de 
entradas clínicas almacenadas en el EMR.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from services.supabase_client import SupabaseClientError
from settings import logger

# Crear router
router = APIRouter(
    prefix="/api/mcp/entries",
    tags=["entries"],
)

# Datos mock para pruebas
MOCK_ENTRIES = [
    {
        "id": "entry1",
        "visit_id": "VIS001",
        "field": "anamnesis",
        "content": "Paciente presenta dolor lumbar desde hace 3 días, irradiado a miembro inferior derecho.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:30:00",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry2",
        "visit_id": "VIS001",
        "field": "exploracion",
        "content": "Dolor a la palpación en región lumbar. Lasegue positivo en miembro inferior derecho.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:35:00",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry3",
        "visit_id": "VIS001",
        "field": "diagnostico",
        "content": "Lumbociática derecha.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:40:00",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry4",
        "visit_id": "VIS001",
        "field": "plan",
        "content": "AINE, reposo relativo, reevaluación en 7 días.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:45:00",
        "source": "mcp",
        "validated": True
    }
]

@router.get("")
async def get_emr_entries(
    visit_id: str = Query(..., description="ID de la visita médica"),
    field: Optional[str] = Query(None, description="Campo específico a consultar (ej: anamnesis)"),
    role: Optional[str] = Query(None, description="Rol del creador a filtrar")
) -> Dict[str, Any]:
    """
    Consulta las entradas clínicas almacenadas para una visita.
    
    Este endpoint permite recuperar las entradas clínicas previamente registradas
    para una visita específica, con filtros opcionales por campo y rol del usuario.
    
    Args:
        visit_id: ID de la visita a consultar (obligatorio)
        field: Campo específico a filtrar (opcional)
        role: Rol del usuario a filtrar (opcional)
        
    Returns:
        Lista de entradas clínicas que cumplen con los criterios
    """
    logger.info(f"Consultando entradas EMR para visita: {visit_id}, campo: {field or 'todos'}, rol: {role or 'todos'}")
    
    try:
        # Filtrar datos mock según los parámetros
        filtered_entries = MOCK_ENTRIES.copy()
        
        # Si la visita no es VIS001, devolver error 404
        if visit_id != "VIS001":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": f"La visita {visit_id} no existe",
                    "error_type": "NotFoundError",
                    "timestamp": datetime.now().isoformat()
                }
            )
        
        # Aplicar filtros
        if field:
            filtered_entries = [e for e in filtered_entries if e["field"] == field]
        
        if role:
            filtered_entries = [e for e in filtered_entries if e["role"] == role]
        
        # Construir filtros aplicados para el response
        filters = {
            "visit_id": visit_id
        }
        if field:
            filters["field"] = field
        if role:
            filters["role"] = role
        
        # Preparar respuesta
        response = {
            "visit_id": visit_id,
            "entries": filtered_entries,
            "count": len(filtered_entries),
            "filters": filters,
            "timestamp": datetime.now().isoformat()
        }
        
        # Registrar trazabilidad si está habilitada
        logger.info(f"Devolviendo {len(filtered_entries)} entradas para la visita {visit_id}")
        
        return response
        
    except Exception as e:
        # Manejar excepciones generales
        logger.error(f"Error al consultar entradas EMR: {str(e)}")
        
        # Devolver error genérico
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Error interno del servidor",
                "error_type": "ServerError",
                "detail": str(e),
                "timestamp": datetime.now().isoformat()
            }
        ) 