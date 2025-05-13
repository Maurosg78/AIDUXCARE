"""
Configuración central del microservicio MCP.

Este módulo proporciona configuraciones basadas en Pydantic para:
- Variables de entorno
- Configuración de CORS
- Ajustes generales de la aplicación
- Configuración de despliegue
"""

import os
import sys
from typing import List, Union, Dict, Any
from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from loguru import logger

class Settings(BaseSettings):
    """Configuración de la aplicación utilizando Pydantic Settings."""
    
    # Metadatos de la aplicación
    APP_NAME: str = Field(default="MCP Server - AiDuxCare", description="Nombre de la aplicación")
    API_VERSION: str = Field(default="v1.29.0", description="Versión del API")
    API_PREFIX: str = Field(default="/api", description="Prefijo para rutas del API")
    
    # Entorno y depuración
    DEBUG: bool = Field(default=False, description="Modo de depuración")
    ENVIRONMENT: str = Field(default="production", description="Entorno de ejecución (production, development, testing)")
    LOG_LEVEL: str = Field(default="INFO", description="Nivel de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)")
    
    # Configuración de servidor
    HOST: str = Field(default="0.0.0.0", description="Host de la aplicación")
    PORT: int = Field(default=8001, description="Puerto de la aplicación")
    
    # Trazabilidad
    ENABLE_TRACE: bool = Field(default=True, description="Habilitar trazabilidad con Langfuse")
    
    # Configuración de CORS
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,https://aiduxcare.vercel.app",
        description="Orígenes permitidos para CORS (separados por comas)"
    )
    
    # Configuración de LLM
    MODEL_PROVIDER: str = Field(default="anthropic", description="Proveedor del modelo LLM (openai, anthropic)")
    DEFAULT_MODEL: str = Field(default="claude-3-sonnet-20240229", description="Modelo LLM a utilizar")
    MAX_TOKENS: int = Field(default=2000, description="Máximo de tokens por respuesta")
    TEMPERATURE: float = Field(default=0.7, description="Temperatura para generación de respuestas")
    
    # Configuración de API Keys
    OPENAI_API_KEY: str = Field(default="", description="API Key de OpenAI")
    ANTHROPIC_API_KEY: str = Field(default="", description="API Key de Anthropic")
    
    # Configuración Langfuse
    LANGFUSE_HOST: str = Field(default="https://cloud.langfuse.com", description="URL de Langfuse")
    LANGFUSE_PUBLIC_KEY: str = Field(default="", description="Clave pública de Langfuse")
    LANGFUSE_SECRET_KEY: str = Field(default="", description="Clave secreta de Langfuse")
    
    # Configuración Supabase
    SUPABASE_URL: str = Field(default="", description="URL de Supabase")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Clave de servicio de Supabase")
    
    # Timeouts y configuraciones de rendimiento
    REQUEST_TIMEOUT: int = Field(default=60, description="Timeout para solicitudes en segundos")
    MAX_CONCURRENT_REQUESTS: int = Field(default=10, description="Máximo de solicitudes concurrentes")
    
    @field_validator("CORS_ORIGINS")
    def parse_cors_origins(cls, v):
        """Parsea CORS_ORIGINS como lista o string."""
        if isinstance(v, str) and "," in v:
            return [origin.strip() for origin in v.split(",")]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

# Constantes de la aplicación
DEFAULT_TIMEOUT = 60  # Timeout para operaciones por defecto (segundos)
DEFAULT_MEMORY_BLOCKS = 5  # Número de bloques de memoria a retener por defecto
MAX_MEMORY_BLOCKS = 20  # Máximo de bloques de memoria permitidos

# Carga las configuraciones desde las variables de entorno
settings = Settings()

# Configura el logger en función de las configuraciones
def setup_logging():
    """Configura el sistema de logging con Loguru."""
    log_level = settings.LOG_LEVEL
    
    # Función para filtrar información sensible en los logs
    def filter_sensitive_data(record):
        """Filtra información sensible de los logs."""
        # Lista de patrones a filtrar (correos, tokens, datos de pacientes)
        sensitive_patterns = [
            (r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', '[EMAIL-REDACTADO]'),
            (r'(eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,})', '[TOKEN-REDACTADO]'),
            (r'(patient_id|visit_id)["\']\s*:\s*["\']([a-zA-Z0-9-]{5,})["\']', r'\1": "[ID-REDACTADO]"'),
            (r'(password|secret|key)["\']\s*:\s*["\']([^"\']{3,})["\']', r'\1": "[SECRETO-REDACTADO]"')
        ]
        
        # Aplicar filtros al mensaje del log
        message = record["message"]
        for pattern, replacement in sensitive_patterns:
            import re
            message = re.sub(pattern, replacement, message)
        
        # Actualizar el mensaje filtrado
        record["message"] = message
        return record
    
    # Configuración para entorno de producción
    config = {
        "handlers": [
            {
                "sink": sys.stdout,
                "format": "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
                "level": log_level,
                "filter": filter_sensitive_data,  # Aplicar filtro de datos sensibles
            }
        ],
    }
    
    # En modo debug, añadir más información pero manteniendo la seguridad
    if settings.DEBUG:
        config["handlers"].append({
            "sink": "logs/mcp_server.log",
            "rotation": "10 MB",
            "format": "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
            "level": "DEBUG",
            "filter": filter_sensitive_data,  # Aplicar filtro también en logs de depuración
        })
    
    # Aplicar configuración
    logger.configure(**config)
    
    return logger 