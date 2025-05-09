"""
Paquete para endpoints API del MCP.

Este paquete contiene todos los routers y endpoints
del microservicio MCP.
"""

from fastapi import APIRouter

from .entries import router as entries_router
from .respond import router as respond_router
from .health import router as health_router

# Crear router principal que agrupa todos los routers
router = APIRouter()

# Incluir sub-routers
router.include_router(entries_router)
router.include_router(respond_router)
router.include_router(health_router)

# Registrar los routers disponibles
__all__ = ["router"] 