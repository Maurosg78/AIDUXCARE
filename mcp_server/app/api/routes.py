"""
Rutas del API para el microservicio MCP.

Este módulo define las rutas disponibles en el API:
- POST /mcp: Endpoint principal para interactuar con el agente MCP
- GET /health: Endpoint para verificar el estado del servicio
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from typing import Dict, Any

from app.schemas.request import MCPRequest, MCPResponse, ErrorResponse
from app.langraph.processor import mcp_processor
from app.core.utils import logger, create_error_response
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