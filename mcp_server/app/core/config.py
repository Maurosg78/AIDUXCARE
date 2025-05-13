"""
Configuración central del microservicio MCP.

Este módulo proporciona configuraciones para:
- Variables de entorno
- Configuración de CORS
- Ajustes generales de la aplicación
"""

import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Configuración de la aplicación utilizando Pydantic Settings."""
    
    # Metadatos de la aplicación
    APP_NAME: str = "MCP Server - AiDuxCare"
    API_VERSION: str = "v1.20.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configuración de CORS
    CORS_ORIGINS: Union[str, List[str]] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,https://aiduxcare.vercel.app"
    )
    
    # Configuración de Langraph
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "2000"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    
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
    )

# Instancia de configuración global
settings = Settings()

# Constants de la aplicación
DEFAULT_TIMEOUT = 60  # Timeout para operaciones por defecto (segundos) 