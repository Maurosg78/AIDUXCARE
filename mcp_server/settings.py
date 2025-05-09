"""
Configuración central del microservicio MCP.

Este módulo proporciona configuraciones basadas en Pydantic para:
- Variables de entorno
- Configuración de CORS
- Ajustes generales de la aplicación
- Configuración de despliegue
"""

import os
from typing import List, Union, Dict, Any
from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from loguru import logger

class Settings(BaseSettings):
    """Configuración de la aplicación utilizando Pydantic Settings."""
    
    # Metadatos de la aplicación
    APP_NAME: str = "MCP Server - AiDuxCare"
    API_VERSION: str = "v1.21.0"
    API_PREFIX: str = "/api"
    
    # Entorno y depuración
    DEBUG: bool = Field(default=False, description="Modo de depuración")
    ENVIRONMENT: str = Field(default="production", description="Entorno de ejecución (production, development, testing)")
    LOG_LEVEL: str = Field(default="INFO", description="Nivel de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)")
    
    # Configuración de servidor
    HOST: str = Field(default="0.0.0.0", description="Host de la aplicación")
    PORT: int = Field(default=8000, description="Puerto de la aplicación")
    
    # Configuración de CORS
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,https://aiduxcare.vercel.app",
        description="Orígenes permitidos para CORS (separados por comas)"
    )
    
    # Configuración de Langraph
    LLM_MODEL: str = Field(default="gpt-3.5-turbo", description="Modelo LLM a utilizar")
    MAX_TOKENS: int = Field(default=2000, description="Máximo de tokens por respuesta")
    TEMPERATURE: float = Field(default=0.7, description="Temperatura para generación de respuestas")
    
    # Configuración de API Keys
    OPENAI_API_KEY: str = Field(default="", description="API Key de OpenAI")
    
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
    
    # Configuración para entorno de producción
    config = {
        "handlers": [
            {
                "sink": os.stdout,
                "format": "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
                "level": log_level,
            }
        ],
    }
    
    # En modo debug, añadir más información
    if settings.DEBUG:
        config["handlers"].append({
            "sink": "logs/mcp_server.log",
            "rotation": "10 MB",
            "format": "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
            "level": "DEBUG",
        })
    
    # Aplicar configuración
    logger.configure(**config)
    
    return logger 