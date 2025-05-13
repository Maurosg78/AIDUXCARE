"""
Configuración centralizada para el microservicio MCP.

Este módulo proporciona acceso unificado a la configuración del sistema,
permitiendo una gestión coherente de parámetros en todos los componentes.
"""

import os
import logging
from typing import Dict, Any
from functools import lru_cache

from settings import Settings, settings

# Configurar logger
logger = logging.getLogger(__name__)

@lru_cache()
def get_settings() -> Settings:
    """
    Obtener la configuración global del sistema.
    
    Esta función está cacheada para evitar cargar múltiples veces
    la configuración dentro de la misma ejecución.
    
    Returns:
        Objeto Settings con la configuración global
    """
    return settings

def get_service_info() -> Dict[str, Any]:
    """
    Obtener información básica sobre el servicio.
    
    Returns:
        Diccionario con información del servicio
    """
    config = get_settings()
    
    return {
        "name": config.APP_NAME,
        "version": config.API_VERSION,
        "environment": config.ENVIRONMENT,
        "debug": config.DEBUG,
        "llm_model": config.LLM_MODEL
    }

def is_production() -> bool:
    """
    Verificar si el sistema está en entorno de producción.
    
    Returns:
        True si es entorno de producción, False en caso contrario
    """
    return get_settings().ENVIRONMENT.lower() == "production"

def is_development() -> bool:
    """
    Verificar si el sistema está en entorno de desarrollo.
    
    Returns:
        True si es entorno de desarrollo, False en caso contrario
    """
    return get_settings().ENVIRONMENT.lower() == "development"

def is_testing() -> bool:
    """
    Verificar si el sistema está en entorno de pruebas.
    
    Returns:
        True si es entorno de pruebas, False en caso contrario
    """
    return get_settings().ENVIRONMENT.lower() == "testing"

def is_mock_data_enabled() -> bool:
    """
    Verificar si se deben usar datos simulados.
    
    Returns:
        True si se deben usar datos simulados, False en caso contrario
    """
    return os.environ.get("MOCK_EMR_DATA", "").lower() in ("true", "1", "yes") 