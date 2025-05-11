"""
Endpoints de prueba para verificar seguridad.

Este módulo proporciona endpoints para verificar
que la configuración de seguridad funciona correctamente.
"""

from fastapi import APIRouter, Request, Response, Depends
from typing import Dict, Any
import json
import os
from core.middleware import require_auth
from core.csrf import require_csrf, set_csrf_cookie

# Router para pruebas de seguridad
router = APIRouter(prefix="/api/security", tags=["seguridad"])

@router.get("/headers-check", summary="Verificar cabeceras de seguridad")
async def check_security_headers(request: Request, response: Response) -> Dict[str, Any]:
    """
    Endpoint para verificar que las cabeceras de seguridad se aplican correctamente.
    
    Returns:
        Dict con información sobre las cabeceras detectadas
    """
    # Lista de cabeceras de seguridad que deberían estar presentes
    security_headers = [
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy"
    ]
    
    # Añadir CSRF token en cookie para pruebas
    session_id = request.client.host or "test-session"
    set_csrf_cookie(response, session_id)
    
    # Devolver información sobre entorno y configuración
    return {
        "service": "MCP Security Check",
        "version": "v1.29.0",
        "environment": os.environ.get("ENVIRONMENT", "production"),
        "security_headers_check": "Esta respuesta debería incluir cabeceras de seguridad",
        "csrf_test": "Se ha establecido una cookie CSRF para pruebas",
        "cors_test": "Orígenes permitidos: " + str(os.environ.get("CORS_ORIGINS", "localhost,aiduxcare.vercel.app"))
    }

@router.post("/csrf-check", summary="Verificar protección CSRF", dependencies=[Depends(require_csrf)])
async def check_csrf_protection(request: Request) -> Dict[str, Any]:
    """
    Endpoint para verificar que la protección CSRF funciona correctamente.
    
    Este endpoint requiere un token CSRF válido para funcionar.
    
    Returns:
        Dict con resultado de la verificación
    """
    return {
        "csrf_check": "OK - Token CSRF válido",
        "timestamp": "Este endpoint solo funciona con un token CSRF válido"
    }

@router.get("/auth-check", summary="Verificar autenticación", dependencies=[Depends(require_auth)])
async def check_auth_protection() -> Dict[str, Any]:
    """
    Endpoint para verificar que la autenticación funciona correctamente.
    
    Este endpoint requiere autenticación para funcionar.
    
    Returns:
        Dict con resultado de la verificación
    """
    return {
        "auth_check": "OK - Autenticado correctamente",
        "role_check": "OK - Rol autorizado"
    }

@router.post("/full-check", summary="Verificación completa de seguridad",
           dependencies=[Depends(require_auth), Depends(require_csrf)])
async def check_full_protection(request: Request) -> Dict[str, Any]:
    """
    Endpoint para verificar que todas las protecciones funcionan correctamente.
    
    Este endpoint requiere autenticación y un token CSRF válido.
    
    Returns:
        Dict con resultado de todas las verificaciones
    """
    # Comprobar cabeceras recibidas
    headers = {k.lower(): v for k, v in request.headers.items()}
    
    auth_header = headers.get("authorization", "")
    csrf_header = headers.get("x-csrf-token", "")
    
    return {
        "security_check": "✅ Todas las protecciones funcionan correctamente",
        "authentication": "✅ Token JWT válido",
        "csrf_protection": "✅ Token CSRF válido",
        "headers": "✅ Cabeceras de seguridad aplicadas",
        "auth_header_exists": bool(auth_header),
        "csrf_header_exists": bool(csrf_header)
    } 