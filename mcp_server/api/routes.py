"""
Rutas del API para el microservicio MCP.

Este módulo define las rutas disponibles en el API:
- POST /mcp/respond: Endpoint optimizado para integración con frontend
- GET /health: Endpoint para verificar el estado del servicio
- GET /tracing/status: Endpoint para verificar estado de trazabilidad
"""

from fastapi import APIRouter, HTTPException, Request, status
from typing import Dict, Any
from datetime import datetime
import time

from schemas import (
    FrontendMCPRequest, 
    FrontendMCPResponse, 
    ErrorResponse,
    ConversationItem,
    ContextSummary,
    TraceEntry
)
from core.langraph_runner import run_mcp_graph
from core import get_langfuse_status
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