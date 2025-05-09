"""
Router para el endpoint de entradas (/api/mcp/entries).

Este módulo define las rutas relacionadas con la consulta y manejo de 
entradas clínicas almacenadas en el EMR.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, Optional
from datetime import datetime

from schemas.emr_models import EMRFieldEntry, EMREntriesResponse
from schemas.response import StorageError
from services.emr_service import get_emr_entries_by_visit
from services.supabase_client import SupabaseClientError
from settings import logger

# Crear router
router = APIRouter(
    prefix="/mcp/entries",
    tags=["entries"],
)

@router.get("", 
           response_model=EMREntriesResponse,
           responses={
               404: {"model": StorageError},
               500: {"model": StorageError}
           })
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
        
    Raises:
        HTTPException: Si la visita no existe o hay un error de conexión
    """
    logger.info(f"Consultando entradas EMR para visita: {visit_id}, campo: {field or 'todos'}, rol: {role or 'todos'}")
    start_time = datetime.now()
    
    # Validar que se proporcionó el visit_id
    if not visit_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=StorageError(
                error="El parámetro visit_id es obligatorio",
                error_type="ValidationError",
                timestamp=datetime.now()
            ).model_dump()
        )
    
    try:
        # Consultar las entradas
        entries = await get_emr_entries_by_visit(
            visit_id=visit_id,
            field=field,
            role=role
        )
        
        # Construir filtros aplicados para el response
        filters = {
            "visit_id": visit_id
        }
        if field:
            filters["field"] = field
        if role:
            filters["role"] = role
        
        # Calcular tiempo de proceso
        process_time = (datetime.now() - start_time).total_seconds() * 1000  # ms
        logger.info(f"Consulta procesada en {process_time:.2f}ms, se encontraron {len(entries)} entradas")
        
        # Convertir los timestamps de string a objetos datetime
        parsed_entries = []
        for entry in entries:
            # Asegurar que todos los campos requeridos están presentes
            if not all(k in entry for k in ["field", "content", "role", "timestamp"]):
                logger.warning(f"Entrada con datos incompletos: {entry}")
                continue
                
            # Convertir el timestamp
            if isinstance(entry.get("timestamp"), str):
                try:
                    entry["timestamp"] = datetime.fromisoformat(entry["timestamp"].replace('Z', '+00:00'))
                except ValueError:
                    # Si no se puede convertir, usar la fecha actual
                    entry["timestamp"] = datetime.now()
            
            # Añadir campos por defecto si no existen
            if "source" not in entry:
                entry["source"] = "mcp"
            if "validated" not in entry:
                entry["validated"] = True
            
            # Añadir a la lista de entradas procesadas
            try:
                parsed_entries.append(EMRFieldEntry(**entry))
            except Exception as e:
                logger.warning(f"Error al procesar entrada: {e}")
                continue
        
        # Preparar respuesta
        return EMREntriesResponse(
            visit_id=visit_id,
            entries=parsed_entries,
            count=len(parsed_entries),
            filters=filters,
            timestamp=datetime.now()
        )
        
    except SupabaseClientError as e:
        # Para excepciones específicas de Supabase
        if "no existe" in str(e).lower():
            status_code = status.HTTP_404_NOT_FOUND
            error_type = "NotFoundError"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            error_type = "SupabaseError"
            
        logger.error(f"Error de Supabase al consultar entradas EMR: {str(e)}")
        
        raise HTTPException(
            status_code=status_code,
            detail=StorageError(
                error=str(e),
                error_type=error_type,
                timestamp=datetime.now()
            ).model_dump()
        )
    except Exception as e:
        # Para excepciones generales
        logger.error(f"Error al consultar entradas EMR: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=StorageError(
                error=f"Error interno al procesar la consulta: {str(e)}",
                error_type="ServerError",
                timestamp=datetime.now()
            ).model_dump()
        ) 