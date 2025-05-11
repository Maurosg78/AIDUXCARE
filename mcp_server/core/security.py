"""
Middleware para añadir cabeceras de seguridad HTTP a FastAPI.

Este módulo implementa un middleware personalizado para añadir
cabeceras de seguridad a todas las respuestas HTTP de FastAPI.
"""

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import os

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware para añadir cabeceras de seguridad HTTP.
    
    Añade encabezados de seguridad como Content-Security-Policy,
    X-Content-Type-Options, X-Frame-Options, etc. a las respuestas.
    """
    
    def __init__(
        self, 
        app: FastAPI, 
        csp_policy: str = None,
        hsts_enabled: bool = True
    ):
        """
        Inicializa el middleware con opciones configurables.
        
        Args:
            app: Aplicación FastAPI
            csp_policy: Política de CSP personalizada (opcional)
            hsts_enabled: Si se debe activar HSTS
        """
        super().__init__(app)
        self.csp_policy = csp_policy or self._get_default_csp()
        self.hsts_enabled = hsts_enabled and os.environ.get("ENVIRONMENT", "production") == "production"
    
    async def dispatch(self, request: Request, call_next):
        """
        Procesa la solicitud y añade encabezados de seguridad a la respuesta.
        
        Args:
            request: Solicitud HTTP
            call_next: Siguiente handler en la cadena
            
        Returns:
            Response con encabezados de seguridad añadidos
        """
        response = await call_next(request)
        
        # Añadir encabezados de seguridad
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = self.csp_policy
        
        # HSTS - solo en producción y solo en HTTPS
        if self.hsts_enabled and request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Buena práctica: Desactivar cache para respuestas de API
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        return response
    
    def _get_default_csp(self) -> str:
        """
        Genera una política CSP predeterminada segura pero funcional.
        
        Returns:
            Política CSP como string
        """
        # Permitir recursos solo del mismo origen por defecto
        csp = [
            "default-src 'self'",
            # Estilos desde origen propio y Google Fonts
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            # Fuentes desde origen propio y Google Fonts
            "font-src 'self' https://fonts.gstatic.com",
            # Imágenes desde origen propio y datos embebidos
            "img-src 'self' data: https:",
            # Scripts solo desde origen propio
            "script-src 'self'",
            # Conexiones solo a origen propio y Langfuse
            "connect-src 'self' https://api.langfuse.com",
            # Objetos embebidos solo desde origen propio
            "object-src 'none'",
            # Evitar mezcla de contenido HTTP/HTTPS
            "upgrade-insecure-requests",
            # Bloquear iframe de sitios externos
            "frame-ancestors 'none'"
        ]
        
        return "; ".join(csp)

def add_security_headers(app: FastAPI) -> None:
    """
    Añade el middleware de seguridad a una aplicación FastAPI.
    
    Args:
        app: Aplicación FastAPI a la que añadir el middleware
    """
    app.add_middleware(SecurityHeadersMiddleware) 