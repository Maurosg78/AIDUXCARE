"""
Rutas de API para el microservicio MCP.

Este módulo define las rutas principales del microservicio, incluyendo:
- GET /mcp/entries: Endpoint para consultar entradas clínicas almacenadas
- GET /health: Endpoint para verificar el estado del servicio
"""

import sys
import os
from fastapi import APIRouter, HTTPException, Request, status, Query
from typing import Dict, Any, Optional, List
from datetime import datetime
import time

# Asegurarse de que el directorio raíz está en el path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

# Importar componentes
from schemas.emr_models import EMRFieldEntry, EMREntriesResponse, StorageError
from services.supabase_client import get_emr_entries_by_visit, SupabaseClientError
from settings import settings, logger

# Crear router
router = APIRouter()

@router.get("/mcp/entries", 
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
    start_time = time.time()
    
    # Validar que se proporcionó el visit_id
    if not visit_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=StorageError(
                error="El parámetro visit_id es obligatorio",
                error_type="ValidationError",
                timestamp=datetime.now()
            ).dict()
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
        process_time = (time.time() - start_time) * 1000  # ms
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
            ).dict()
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
            ).dict()
        )

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Verifica el estado del servicio MCP.
    
    Returns:
        Estado del servicio y versión
    """
    return {
        "status": "ok",
        "version": settings.API_VERSION,
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "model": settings.LLM_MODEL
    } 