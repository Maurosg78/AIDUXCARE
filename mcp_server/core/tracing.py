"""
Módulo de trazabilidad para integración con Langfuse.

Este módulo proporciona funciones para registrar trazas de las interacciones
con el MCP en Langfuse, facilitando la auditoría y análisis de las 
conversaciones clínicas.
"""

import os
import asyncio
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import uuid

from langfuse import Langfuse
from langfuse.decorators import observe

from settings import settings, logger

# Inicializar cliente Langfuse
try:
    langfuse = Langfuse(
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY", ""),
        secret_key=os.getenv("LANGFUSE_SECRET_KEY", ""),
        host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
    )
    langfuse_enabled = True
    logger.info("Langfuse inicializado correctamente")
except Exception as e:
    langfuse_enabled = False
    logger.warning(f"Error al inicializar Langfuse: {str(e)}")

async def log_mcp_trace(
    visit_id: str,
    role: str,
    user_input: str,
    response_data: Dict[str, Any],
    trace_info: Optional[List[Dict[str, Any]]] = None,
    error: Optional[Exception] = None
) -> Optional[str]:
    """
    Registra una traza de interacción con el MCP en Langfuse.
    
    Esta función crea un trace en Langfuse con toda la información relevante
    de la interacción con el MCP, incluyendo entrada, salida, metadatos y
    posibles errores.
    
    Args:
        visit_id: ID de la visita médica
        role: Rol del usuario (health_professional, patient, admin_staff)
        user_input: Mensaje del usuario
        response_data: Datos de respuesta completos
        trace_info: Información adicional de trazabilidad
        error: Excepción en caso de error
        
    Returns:
        ID de la traza creada o None si hay error
    """
    if not langfuse_enabled:
        logger.debug("Langfuse no está habilitado, no se registrará la traza")
        return None
        
    try:
        # Crear ID único para la traza
        trace_id = f"mcp-{uuid.uuid4()}"
        user_id = f"{visit_id}_{role}"
        
        # Extraer respuesta textual
        response_text = response_data.get("response", "")
        
        # Calcular tokens aproximados (4 caracteres ~ 1 token)
        input_tokens = len(user_input) // 4
        output_tokens = len(response_text) // 4
        
        # Información básica de metadatos
        metadata = {
            "visit_id": visit_id,
            "role": role,
            "environment": settings.ENVIRONMENT,
            "api_version": settings.API_VERSION,
            "model": settings.LLM_MODEL,
            "timestamp": datetime.now().isoformat()
        }
        
        # Extraer herramientas utilizadas si existen
        tools_used = []
        if "context_summary" in response_data and "active_tools" in response_data["context_summary"]:
            tools_used = response_data["context_summary"]["active_tools"]
            metadata["tools_used"] = tools_used
            
        # Iniciar trace principal
        trace = langfuse.trace(
            name="mcp_interaction",
            id=trace_id,
            user_id=user_id,
            metadata=metadata,
            tags=["mcp", role, settings.ENVIRONMENT]
        )
        
        # Span principal de la generación
        generation = trace.generation(
            name="mcp_response",
            model=settings.LLM_MODEL,
            input=user_input,
            output=response_text,
            usage={
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens
            },
            metadata={
                "temperature": settings.TEMPERATURE,
                "max_tokens": settings.MAX_TOKENS
            }
        )
        
        # Registrar traza detallada del procesamiento interno
        if trace_info:
            trace_span = trace.span(
                name="mcp_processing",
                input={"trace_entries": trace_info},
                metadata={"trace_count": len(trace_info)}
            )
            
            # Registrar cada paso como un span anidado
            for i, entry in enumerate(trace_info):
                step_name = entry.get("action", f"step_{i}")
                trace_span.span(
                    name=step_name,
                    metadata=entry.get("metadata", {})
                )
            
            trace_span.end()
            
        # Registrar error si existe
        if error:
            error_span = trace.span(
                name="error",
                input={"error_type": type(error).__name__},
                metadata={
                    "error_message": str(error),
                    "timestamp": datetime.now().isoformat()
                },
                level="ERROR"
            )
            error_span.end()
        
        # Cerrar generación y traza principal
        generation.end()
        trace.end()
        
        logger.debug(f"Traza registrada en Langfuse con ID: {trace_id}")
        return trace_id
        
    except Exception as e:
        logger.error(f"Error al registrar traza en Langfuse: {str(e)}")
        return None

async def log_mcp_trace_async(*args, **kwargs) -> None:
    """
    Versión asíncrona no bloqueante de log_mcp_trace.
    
    Esta función envuelve log_mcp_trace en una tarea asíncrona
    para evitar bloquear la respuesta al usuario mientras se
    registra la traza.
    """
    asyncio.create_task(log_mcp_trace(*args, **kwargs))
    
def get_langfuse_status() -> Dict[str, Any]:
    """
    Retorna el estado de la integración con Langfuse.
    
    Returns:
        Dict con información sobre el estado de Langfuse
    """
    return {
        "enabled": langfuse_enabled,
        "host": os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com"),
        "version": "2.0+"
    } 