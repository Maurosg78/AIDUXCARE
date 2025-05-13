"""
Utilidades generales para el microservicio MCP.

Este módulo proporciona funciones auxiliares utilizadas a través del servicio.
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configuración de logging
logger = logging.getLogger("mcp_server")

def setup_logging(debug_mode: bool = False) -> None:
    """
    Configura el sistema de logging para el microservicio.
    
    Args:
        debug_mode: Si es True, establece el nivel de logging a DEBUG
    """
    log_level = logging.DEBUG if debug_mode else logging.INFO
    
    # Configurar logger principal
    logger.setLevel(log_level)
    
    # Handler de consola
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    
    # Formato
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    
    # Añadir handler al logger
    logger.addHandler(console_handler)
    
    logger.info(f"Logging configurado en nivel: {log_level}")

def create_trace_entry(action: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Crea una entrada de traza para seguimiento de ejecución.
    
    Args:
        action: Nombre de la acción o evento
        metadata: Datos adicionales para contextualizar la acción
        
    Returns:
        Entrada de traza estructurada
    """
    return {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "metadata": metadata
    }

def create_error_response(message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Crea una respuesta de error estandarizada.
    
    Args:
        message: Mensaje de error principal
        status_code: Código HTTP de estado
        details: Detalles adicionales del error
        
    Returns:
        Respuesta de error estructurada
    """
    return {
        "error": {
            "message": message,
            "status_code": status_code,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
    }

def summarize_memory_blocks(memory_blocks: List[Dict[str, Any]], max_blocks: int = 3) -> str:
    """
    Genera un resumen de los bloques de memoria para facilitar debug.
    
    Args:
        memory_blocks: Lista de bloques de memoria
        max_blocks: Número máximo de bloques a incluir en el resumen
        
    Returns:
        Resumen textual de los bloques de memoria
    """
    if not memory_blocks:
        return "Sin bloques de memoria"
    
    total_blocks = len(memory_blocks)
    summary_blocks = memory_blocks[:max_blocks]
    
    result = f"Total de bloques: {total_blocks}\n"
    
    for i, block in enumerate(summary_blocks, 1):
        result += f"#{i}: {block.get('text', '')[:50]}... " \
                 f"(Prioridad: {block.get('priority', 'desconocida')})\n"
    
    if total_blocks > max_blocks:
        result += f"... y {total_blocks - max_blocks} bloques más"
    
    return result 