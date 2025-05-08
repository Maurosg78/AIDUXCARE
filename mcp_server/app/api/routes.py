"""
Rutas del API para el microservicio MCP.

Este módulo define las rutas disponibles en el API:
- POST /mcp: Endpoint principal para interactuar con el agente MCP
- POST /mcp/respond: Endpoint optimizado para integración con frontend
- GET /health: Endpoint para verificar el estado del servicio
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from typing import Dict, Any, List, Optional

from app.schemas.request import MCPRequest, MCPResponse, ErrorResponse, ConversationItem, FrontendMCPRequest, FrontendMCPResponse
from app.langraph.processor import mcp_processor
from app.core.utils import logger, create_error_response, create_trace_entry
from app.core.config import settings

# Crear router
router = APIRouter()

@router.post("/mcp", response_model=MCPResponse, responses={500: {"model": ErrorResponse}})
async def process_mcp_request(request: MCPRequest) -> Dict[str, Any]:
    """
    Procesa una solicitud al MCP (Model Context Protocol).
    
    Recibe un mensaje del usuario y devuelve la respuesta generada por el agente.
    
    Args:
        request: Solicitud con todos los datos necesarios
    
    Returns:
        Respuesta generada por el agente MCP
    """
    logger.info(f"Procesando solicitud MCP para visita: {request.visit_id}")
    
    try:
        # Procesar la solicitud con el MCP
        response_data = mcp_processor.process_request(
            visit_id=request.visit_id,
            role=request.role,
            user_input=request.user_input,
            context_override=request.context_override,
            previous_messages=request.previous_messages
        )
        
        # Si hay error en la respuesta, convertirlo en HTTPException
        if "error" in response_data:
            logger.error(f"Error en procesamiento MCP: {response_data['error']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response_data["error"]
            )
        
        return response_data
    
    except Exception as e:
        logger.error(f"Error al procesar solicitud MCP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": str(e)}
        )

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
    
    try:
        # Convertir previous_messages al formato esperado por el procesador
        previous_messages_for_processor = []
        if request.previous_messages:
            for msg in request.previous_messages:
                previous_messages_for_processor.append({
                    "role": "user" if msg.sender_type == "user" else "assistant",
                    "content": msg.content
                })
        
        # Procesar la solicitud con el MCP
        response_data = mcp_processor.process_request(
            visit_id=request.visit_id,
            role=request.role,
            user_input=request.user_input,
            context_override=request.context_override,
            previous_messages=previous_messages_for_processor
        )
        
        # Si hay error en la respuesta, manejarlo
        if "error" in response_data:
            logger.error(f"Error en procesamiento MCP para frontend: {response_data['error']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response_data["error"]
            )
        
        # Extraer herramientas utilizadas
        tools_used = response_data.get("used_tools", [])
        tool_names = [t.get("tool", "unknown") for t in tools_used]
        
        # Generar resumen contextual para frontend
        context_summary = {
            "active_tools": tool_names,
            "memory_blocks_count": len(response_data.get("memory_summary", "").split("\n")) if "memory_summary" in response_data else 0,
            "processing_time_ms": next(
                (trace.get("metadata", {}).get("execution_time", 0) * 1000 
                 for trace in response_data.get("trace", []) 
                 if trace.get("action") == "processing_completed"),
                0
            ),
            "user_role": request.role
        }
        
        # Construir respuesta para el frontend
        frontend_response = {
            "response": response_data.get("output", ""),
            "conversation_item": {
                "id": f"msg_{len(request.previous_messages) + 2 if request.previous_messages else 2}",
                "timestamp": next(
                    (trace.get("timestamp") 
                     for trace in response_data.get("trace", []) 
                     if trace.get("action") == "processing_completed"),
                    None
                ),
                "sender_type": "assistant",
                "sender_name": "AiDuxCare MCP",
                "content": response_data.get("output", ""),
                "metadata": {
                    "tools_used": tool_names,
                    "visit_id": request.visit_id
                }
            },
            "context_summary": context_summary,
            "trace": response_data.get("trace", [])
        }
        
        return frontend_response
        
    except Exception as e:
        logger.error(f"Error al procesar solicitud del frontend: {str(e)}")
        
        # Crear respuesta de error para el frontend
        error_response = {
            "response": f"Lo siento, ocurrió un error: {str(e)}",
            "conversation_item": {
                "id": "error",
                "timestamp": create_trace_entry("error", {"error": str(e)}).get("timestamp"),
                "sender_type": "system",
                "sender_name": "Error",
                "content": f"Lo siento, ocurrió un error: {str(e)}",
                "metadata": {
                    "error": True,
                    "visit_id": request.visit_id
                }
            },
            "context_summary": {
                "error": True,
                "error_message": str(e)
            },
            "trace": [create_trace_entry("error", {"error_message": str(e), "error_type": type(e).__name__})]
        }
        
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
        "model": mcp_processor.model_name
    } 