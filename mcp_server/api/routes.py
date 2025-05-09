"""
Rutas del API para el microservicio MCP.

Este módulo define las rutas disponibles en el API:
- POST /mcp/respond: Endpoint optimizado para integración con frontend
- POST /mcp/store: Endpoint para almacenar entradas validadas en el EMR
- GET /mcp/entries: Endpoint para consultar entradas clínicas almacenadas
- GET /health: Endpoint para verificar el estado del servicio
- GET /tracing/status: Endpoint para verificar estado de trazabilidad
- GET /supabase/status: Endpoint para verificar estado de Supabase
"""

from fastapi import APIRouter, HTTPException, Request, status, Depends, Query
from typing import Dict, Any, Optional, List
from datetime import datetime
import time

from schemas import (
    FrontendMCPRequest, 
    FrontendMCPResponse, 
    ErrorResponse,
    ConversationItem,
    ContextSummary,
    TraceEntry,
    StoreEMRRequest,
    StoreEMRResponse,
    StorageError,
    EMRFieldEntry,
    EMREntriesResponse
)
from core.langraph_runner import run_mcp_graph
from core import get_langfuse_status, log_mcp_trace_async
from services import store_emr_entry, get_supabase_status, get_emr_entries_by_visit
from services.supabase_client import SupabaseClientError
from settings import settings, logger

# Crear router
router = APIRouter()

@router.post("/mcp/respond", response_model=FrontendMCPResponse, responses={500: {"model": ErrorResponse}})
async def frontend_mcp_respond(request: FrontendMCPRequest) -> Dict[str, Any]:
    """
    Endpoint optimizado para integración con el frontend de AiDuxCare.
    
    Procesa solicitudes de la interfaz de usuario y devuelve respuestas en un formato
    adecuado para mostrar directamente en el frontend, incluyendo estado de conversación
    e información contextual para la vista de detalle de visita.
    
    Args:
        request: Solicitud del frontend con información de la visita, rol y mensaje
        
    Returns:
        Respuesta adaptada para mostrar en la interfaz de usuario
    """
    logger.info(f"Procesando solicitud del frontend para visita: {request.visit_id}, rol: {request.role}")
    start_time = time.time()
    
    try:
        # Procesar la solicitud con el MCP
        response_data = await run_mcp_graph(request)
        
        # Calcular tiempo de proceso
        process_time = (time.time() - start_time) * 1000  # ms
        logger.info(f"Solicitud procesada en {process_time:.2f}ms para visita: {request.visit_id}")
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error al procesar solicitud del frontend: {str(e)}")
        process_time = (time.time() - start_time) * 1000  # ms
        
        # Crear trace con información del error
        timestamp = datetime.now().isoformat()
        error_trace = TraceEntry(
            timestamp=timestamp,
            action="error",
            metadata={
                "error_type": type(e).__name__,
                "error_message": str(e),
                "execution_time": process_time / 1000  # segundos
            }
        )
        
        # Crear respuesta de error para el frontend
        error_response = FrontendMCPResponse(
            response=f"Lo siento, ocurrió un error: {str(e)}",
            conversation_item=ConversationItem(
                id="error",
                timestamp=timestamp,
                sender_type="system",
                sender_name="Error",
                content=f"Lo siento, ocurrió un error: {str(e)}",
                metadata={
                    "error": True,
                    "visit_id": request.visit_id
                }
            ),
            context_summary=ContextSummary(
                active_tools=[],
                memory_blocks_count=0,
                processing_time_ms=process_time,
                user_role=request.role,
                error=True,
                error_message=str(e)
            ),
            trace=[error_trace]
        )
        
        return error_response

@router.post("/mcp/store", 
             response_model=StoreEMRResponse, 
             responses={
                400: {"model": StorageError},
                404: {"model": StorageError},
                409: {"model": StorageError},
                500: {"model": StorageError}
             })
async def store_validated_content(request: StoreEMRRequest) -> Dict[str, Any]:
    """
    Almacena contenido validado por un profesional en Supabase.
    
    Este endpoint recibe contenido que ha sido validado manualmente por un
    profesional de la salud y lo almacena de forma permanente en la base de datos,
    vinculándolo a la visita correspondiente.
    
    Args:
        request: Datos del contenido validado a almacenar
        
    Returns:
        Confirmación de almacenamiento con detalles
        
    Raises:
        HTTPException: Si ocurre algún error durante el almacenamiento
    """
    logger.info(f"Almacenando contenido validado para visita: {request.visit_id}, campo: {request.field}")
    start_time = time.time()
    
    try:
        # Intentar almacenar la entrada
        result = await store_emr_entry(
            visit_id=request.visit_id,
            field=request.field,
            role=request.role,
            content=request.content,
            overwrite=request.overwrite
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo almacenar la entrada en Supabase"
            )
        
        # Registrar traza en Langfuse (asíncrono)
        await log_mcp_trace_async(
            visit_id=request.visit_id,
            role=request.role,
            user_input=f"[VALIDACIÓN] Campo {request.field}",
            response_data={
                "field": request.field,
                "content": request.content,
                "validated": True,
                "timestamp": datetime.now().isoformat()
            },
            trace_info=[{
                "action": "content_validation",
                "metadata": {
                    "field": request.field,
                    "role": request.role,
                    "content_length": len(request.content)
                }
            }]
        )
        
        # Calcular tiempo de proceso
        process_time = (time.time() - start_time) * 1000  # ms
        
        # Preparar respuesta exitosa
        return StoreEMRResponse(
            success=True,
            entry_id=result.get("id"),
            field=request.field,
            timestamp=datetime.now(),
            message=f"Contenido validado almacenado correctamente para {request.field}",
            data={
                "visit_id": request.visit_id,
                "processing_time_ms": process_time
            }
        )
        
    except HTTPException:
        # Re-lanzar excepciones HTTP existentes
        raise
    except Exception as e:
        # Determinar el código de error apropiado
        if "no existe" in str(e).lower():
            status_code = status.HTTP_404_NOT_FOUND
            error_type = "NotFoundError"
        elif "ya existe" in str(e).lower() and not request.overwrite:
            status_code = status.HTTP_409_CONFLICT
            error_type = "ConflictError"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            error_type = "StorageError"
        
        # Registrar el error
        logger.error(f"Error al almacenar contenido validado: {str(e)}")
        
        # Lanzar excepción HTTP con detalles estructurados
        raise HTTPException(
            status_code=status_code,
            detail=StorageError(
                error=str(e),
                error_type=error_type,
                timestamp=datetime.now()
            ).model_dump()
        )

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

@router.get("/tracing/status")
async def tracing_status() -> Dict[str, Any]:
    """
    Verifica el estado de la integración con Langfuse.
    
    Returns:
        Estado de la integración de trazabilidad
    """
    langfuse_status = get_langfuse_status()
    
    return {
        "status": "ok" if langfuse_status["enabled"] else "disabled",
        "tracing_provider": "Langfuse",
        "version": langfuse_status["version"],
        "host": langfuse_status["host"],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/supabase/status")
async def supabase_status() -> Dict[str, Any]:
    """
    Verifica el estado de la conexión con Supabase.
    
    Returns:
        Estado de la conexión con Supabase
    """
    status = await get_supabase_status()
    
    return {
        "status": "ok" if status["connected"] else "error",
        "provider": "Supabase",
        "url": status["url"],
        "connected": status["connected"],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/mantra")
async def mantra() -> Dict[str, Any]:
    """
    Retorna el mantra que guía este proyecto
    
    Returns:
        Mantra de AiDuxCare
    """
    
    return {
        "mantra": "Abrazo mi pasado, agradezco mi presente y construyo mi futuro con calma. No corro. No me niego. No me pierdo. Estoy aquí. Y eso es suficiente.",
        "version": settings.API_VERSION,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/entries-test")
async def test_entries() -> Dict[str, Any]:
    """
    Endpoint de prueba para entries.
    """
    return {
        "status": "ok",
        "message": "Endpoint de prueba para entries",
        "timestamp": datetime.now().isoformat()
    } 