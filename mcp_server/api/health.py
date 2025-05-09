"""
Router para el endpoint de salud (/api/health).

Este módulo define las rutas relacionadas con la verificación de estado
del servicio y sus dependencias.
"""

from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime

from settings import settings

# Crear router
router = APIRouter(
    prefix="/health",
    tags=["health"],
)

@router.get("")
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
        "model": settings.LLM_MODEL,
        "timestamp": datetime.now().isoformat()
    } 