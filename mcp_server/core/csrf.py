"""
Protección CSRF para FastAPI.

Este módulo implementa protección contra ataques CSRF (Cross-Site Request Forgery)
mediante la generación y validación de tokens.
"""

import hmac
import hashlib
import base64
import os
import time
import secrets
from typing import Optional, Dict, Any, List
from fastapi import Request, Response, HTTPException, Depends, Cookie
import logging

# Configuración
CSRF_SECRET = os.environ.get("CSRF_SECRET", secrets.token_hex(32))
CSRF_COOKIE_NAME = "aidux_csrf"
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_TOKEN_EXPIRY = 86400  # 24 horas en segundos

# Logger
logger = logging.getLogger("csrf-protection")

def generate_csrf_token(session_id: str) -> str:
    """
    Genera un token CSRF para una sesión específica.
    
    Args:
        session_id: ID de sesión del usuario
        
    Returns:
        Token CSRF firmado
    """
    timestamp = int(time.time())
    token_data = f"{session_id}:{timestamp}"
    
    # Generar firma HMAC
    signature = hmac.new(
        CSRF_SECRET.encode(),
        token_data.encode(),
        hashlib.sha256
    ).digest()
    
    # Codificar en base64
    signature_b64 = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    token = f"{token_data}:{signature_b64}"
    
    return token

def verify_csrf_token(token: str, session_id: str) -> bool:
    """
    Verifica la validez de un token CSRF.
    
    Args:
        token: Token CSRF a verificar
        session_id: ID de sesión del usuario actual
        
    Returns:
        True si el token es válido, False en caso contrario
    """
    try:
        # Dividir token en partes
        parts = token.split(':')
        if len(parts) != 3:
            return False
        
        token_session_id, timestamp_str, signature = parts
        
        # Verificar que el token corresponde a la sesión actual
        if token_session_id != session_id:
            logger.warning(f"CSRF token para sesión incorrecta: esperado {session_id}, recibido {token_session_id}")
            return False
        
        # Verificar que el token no ha expirado
        try:
            timestamp = int(timestamp_str)
            current_time = int(time.time())
            if current_time - timestamp > CSRF_TOKEN_EXPIRY:
                logger.warning(f"CSRF token expirado: {current_time - timestamp} segundos desde emisión")
                return False
        except ValueError:
            logger.warning("CSRF token con formato inválido: timestamp no es un número")
            return False
        
        # Recalcular firma para verificar
        token_data = f"{token_session_id}:{timestamp_str}"
        expected_signature = hmac.new(
            CSRF_SECRET.encode(),
            token_data.encode(),
            hashlib.sha256
        ).digest()
        expected_signature_b64 = base64.urlsafe_b64encode(expected_signature).decode('utf-8').rstrip('=')
        
        # Comparar firmas
        if signature != expected_signature_b64:
            logger.warning("CSRF token con firma inválida")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Error al verificar token CSRF: {str(e)}")
        return False

def set_csrf_cookie(response: Response, session_id: str) -> None:
    """
    Establece una cookie con el token CSRF.
    
    Args:
        response: Objeto Response de FastAPI
        session_id: ID de sesión del usuario
    """
    token = generate_csrf_token(session_id)
    
    # Establecer cookie segura
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        httponly=True,  # No accesible vía JavaScript
        secure=os.environ.get("ENVIRONMENT", "production") != "development",  # Secure en producción
        samesite="strict",  # Estricto para mayor seguridad
        max_age=CSRF_TOKEN_EXPIRY,
        path="/"
    )

def get_csrf_token(
    request: Request,
    csrf_token: Optional[str] = Cookie(None, alias=CSRF_COOKIE_NAME)
) -> Optional[str]:
    """
    Obtiene el token CSRF de la petición.
    
    Args:
        request: Objeto Request de FastAPI
        csrf_token: Token CSRF de la cookie (inyectado por FastAPI)
        
    Returns:
        Token CSRF o None si no se encuentra
    """
    # Intentar obtener desde header
    header_token = request.headers.get(CSRF_HEADER_NAME)
    if header_token:
        return header_token
    
    # Intentar obtener desde Authorization (para APIs)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("CSRF "):
        return auth_header[5:]  # Remover prefijo "CSRF "
    
    # Devolver token de cookie como último recurso
    return csrf_token

def csrf_protect(request: Request, session_id: Optional[str] = None):
    """
    Middleware para proteger contra ataques CSRF.
    
    Args:
        request: Objeto Request de FastAPI
        session_id: ID de sesión del usuario (opcional)
        
    Raises:
        HTTPException: Si la validación CSRF falla
    """
    # Métodos HTTP que modifican estado requieren protección CSRF
    if request.method.upper() in ["POST", "PUT", "DELETE", "PATCH"]:
        # Obtener token CSRF
        csrf_token = get_csrf_token(request)
        
        # Si no hay token, rechazar
        if not csrf_token:
            logger.warning(f"Intento de {request.method} sin token CSRF: {request.url.path}")
            raise HTTPException(
                status_code=403,
                detail="CSRF token requerido"
            )
        
        # Si no se proporciona session_id, extraer de la Auth
        if not session_id:
            # Intentar extraer de token JWT en cabecera Authorization
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                import jwt
                
                try:
                    token = auth_header[7:]  # Remover prefijo "Bearer "
                    payload = jwt.decode(
                        token, 
                        os.environ.get("JWT_SECRET", "your-default-secret-key-for-development"),
                        algorithms=["HS256"]
                    )
                    # Usar email como identificador de sesión
                    session_id = payload.get("email", "")
                except Exception as e:
                    logger.error(f"Error al decodificar JWT: {str(e)}")
                    session_id = ""
            else:
                session_id = ""  # Fallback
        
        # Verificar token
        if not verify_csrf_token(csrf_token, session_id):
            logger.warning(f"Token CSRF inválido para {request.method} a {request.url.path}")
            raise HTTPException(
                status_code=403,
                detail="Token CSRF inválido o expirado"
            )

# Dependencia para inyectar en rutas que necesitan protección CSRF
async def require_csrf(request: Request):
    """
    Dependencia FastAPI para protección CSRF.
    
    Args:
        request: Objeto Request de FastAPI
        
    Returns:
        None: Si la validación CSRF es exitosa
        
    Raises:
        HTTPException: Si la validación CSRF falla
    """
    # Aplicar protección CSRF
    csrf_protect(request)
    return None

# Endpoints para gestión de tokens CSRF
async def get_csrf_endpoint(request: Request, response: Response):
    """
    Endpoint para obtener un token CSRF.
    
    Args:
        request: Objeto Request de FastAPI
        response: Objeto Response de FastAPI
        
    Returns:
        Dict con el token CSRF
    """
    # Simular sesión basada en IP si no hay sesión real
    session_id = request.client.host if request.client else secrets.token_hex(8)
    
    # Generar token
    token = generate_csrf_token(session_id)
    
    # Establecer cookie
    set_csrf_cookie(response, session_id)
    
    # Devolver token para uso en cabeceras
    return {
        "token": token,
        "expires_in": CSRF_TOKEN_EXPIRY
    } 