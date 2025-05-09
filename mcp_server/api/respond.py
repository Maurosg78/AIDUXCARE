"""
Router para el endpoint de respuesta (/api/mcp/respond).

Este módulo define las rutas relacionadas con la generación de respuestas
del MCP, que es el punto principal de integración con el frontend.
"""

from fastapi import APIRouter, Body, HTTPException, status
from typing import Dict, Any, List, Optional
from datetime import datetime
import time
import logging

from schemas.request import FrontendMCPRequest
from schemas.response import FrontendMCPResponse, ErrorResponse, ConversationItem, ContextSummary, TraceEntry
from core.langraph_runner import run_mcp_graph
from settings import logger

# Crear router
router = APIRouter(
    prefix="/mcp/respond",
    tags=["respond"],
)

# Logger para el módulo
logger = logging.getLogger("mcp-server")

@router.post("", response_model=FrontendMCPResponse, responses={500: {"model": ErrorResponse}})
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

@router.post("/respond", summary="Generar respuesta del copiloto clínico")
async def generate_response(
    request: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Genera una respuesta del copiloto clínico según la entrada del usuario.
    
    Args:
        request: Datos de la solicitud con entrada del usuario y contexto
    
    Returns:
        Dict con la respuesta generada y metadatos
    """
    try:
        # Validar campos obligatorios
        required_fields = ["visit_id", "role", "user_input"]
        for field in required_fields:
            if field not in request:
                raise HTTPException(
                    status_code=422,
                    detail=f"Campo obligatorio '{field}' no proporcionado"
                )
        
        # Extraer valores
        visit_id = request["visit_id"]
        role = request["role"]
        user_input = request["user_input"]
        
        # Valores opcionales
        field = request.get("field")
        previous_messages = request.get("previous_messages", [])
        context_override = request.get("context_override", {})
        
        # Log de la solicitud
        logger.info(f"Recibida solicitud para visita: {visit_id}, rol: {role}")
        
        # Generar respuesta usando el grafo MCP
        response_data = await run_mcp_graph(
            visit_id=visit_id,
            role=role,
            user_input=user_input,
            field=field,
            previous_messages=previous_messages,
            context_override=context_override
        )
        
        # Devolver respuesta
        return response_data
    
    except HTTPException:
        # Re-lanzar excepciones HTTP ya procesadas
        raise
    
    except Exception as e:
        # Manejar otros errores
        logger.error(f"Error al generar respuesta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la solicitud: {str(e)}"
        ) 