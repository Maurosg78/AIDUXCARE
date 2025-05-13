"""
Middleware de autenticación para APIs de MCP.

Este módulo implementa un middleware para proteger los endpoints 
de MCP mediante la validación de tokens de autenticación.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any

# Configurar logger
logger = logging.getLogger("mcp-auth")

# Configuración para JWT
JWT_SECRET = os.environ.get("JWT_SECRET", "your-default-secret-key-for-development")
JWT_ALGORITHM = "HS256"

# Configuración para autenticación
security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Verifica la validez de un token JWT.
    
    Args:
        credentials: Credenciales de autorización HTTP Bearer
        
    Returns:
        Dict con la información del usuario decodificada del token
        
    Raises:
        HTTPException: Si el token no es válido o ha expirado
    """
    token = credentials.credentials
    
    try:
        # Decodificar token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verificar expiración
        if "exp" in payload and payload["exp"] < datetime.now().timestamp():
            logger.warning(f"Token expirado para usuario: {payload.get('email', 'desconocido')}")
            raise HTTPException(
                status_code=401,
                detail="Token expirado"
            )
        
        # Verificación exitosa
        logger.info(f"Verificación exitosa para usuario: {payload.get('email', 'desconocido')}")
        return payload
    
    except jwt.PyJWTError as e:
        # Registrar intento fallido
        logger.error(f"Error al verificar token: {str(e)}")
        
        raise HTTPException(
            status_code=401,
            detail="Token inválido o mal formado"
        )

async def require_auth(
    request: Request,
    token_data: Dict[str, Any] = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Middleware para requerir autenticación en rutas protegidas.
    
    Verifica que el usuario esté autenticado y tenga los permisos necesarios.
    
    Args:
        request: Objeto Request de FastAPI
        token_data: Datos del usuario extraídos del token
        
    Returns:
        Dict con información del usuario autenticado
        
    Raises:
        HTTPException: Si el usuario no está autenticado o no tiene permisos
    """
    # Verificar que hay un usuario autenticado
    if not token_data or "email" not in token_data:
        logger.warning("Intento de acceso sin datos de usuario")
        raise HTTPException(
            status_code=401, 
            detail="Autenticación requerida"
        )
    
    # Verificar roles (opcional, depende de la implementación)
    if "role" in token_data:
        user_role = token_data["role"]
        
        # Se podría implementar lógica adicional para verificar roles específicos
        allowed_roles = ["admin", "professional", "fisioterapeuta", "health_professional"]
        if user_role not in allowed_roles:
            logger.warning(f"Usuario {token_data['email']} con rol {user_role} intentó acceder a ruta protegida")
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a este recurso"
            )
    
    # Registrar acceso exitoso
    logger.info(f"Acceso exitoso para {token_data['email']} a {request.url.path}")
    
    return token_data 