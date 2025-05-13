"""
Procesador del MCP con Langraph para el microservicio.

Este módulo proporciona una capa de abstracción sobre el grafo MCP de Langraph,
facilitando su uso desde los endpoints de FastAPI y agregando funcionalidades
de trazabilidad y gestión de errores.
"""

import sys
import traceback
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage

# Importar el MCP implementado con Langraph 
# Utilizar el wrapper local de langraph_mcp
from app.langraph.langraph_mcp import (
    build_mcp_graph,
    initialize_context,
    run_graph,
    MCPState
)

from app.core.utils import create_trace_entry, logger, summarize_memory_blocks
from app.core.config import settings

class MCPProcessor:
    """
    Clase para procesar solicitudes utilizando el MCP implementado con Langraph.
    """
    
    def __init__(self, model_name: str = None, debug: bool = False):
        """
        Inicializa el procesador MCP.
        
        Args:
            model_name: Nombre del modelo de lenguaje a utilizar
            debug: Si está en modo debug para registros adicionales
        """
        self.model_name = model_name or settings.LLM_MODEL
        self.debug = debug
        self.trace: List[Dict[str, Any]] = []
        
        # Inicializar el grafo MCP
        logger.info(f"Inicializando grafo MCP con modelo: {self.model_name}")
        self.graph = build_mcp_graph(model_name=self.model_name)
        logger.info("Grafo MCP inicializado correctamente")
    
    def process_request(
        self,
        visit_id: str,
        role: str,
        user_input: str,
        context_override: Optional[Dict[str, Any]] = None,
        previous_messages: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Procesa una solicitud al MCP y devuelve la respuesta generada.
        
        Args:
            visit_id: ID de la visita
            role: Rol del usuario
            user_input: Mensaje del usuario
            context_override: Contexto adicional (opcional)
            previous_messages: Mensajes previos (opcional)
            
        Returns:
            Respuesta del MCP con la salida generada y metadatos
        """
        self.trace = []
        start_time = time.time()
        
        try:
            # Registrar inicio de procesamiento
            self.trace.append(create_trace_entry(
                "request_received",
                {"visit_id": visit_id, "role": role, "input_length": len(user_input)}
            ))
            
            # Inicializar contexto
            logger.debug(f"Inicializando contexto para visita: {visit_id}, rol: {role}")
            context = initialize_context(visit_id=visit_id, user_role=role)
            
            # Aplicar override de contexto si existe
            if context_override:
                logger.debug("Aplicando override de contexto")
                for key, value in context_override.items():
                    if key in context:
                        if isinstance(context[key], dict) and isinstance(value, dict):
                            context[key].update(value)
                        else:
                            context[key] = value
                    else:
                        context[key] = value
            
            # Convertir mensajes previos si existen
            messages = []
            if previous_messages:
                logger.debug(f"Procesando {len(previous_messages)} mensajes previos")
                for msg in previous_messages:
                    if msg.get("role") == "user":
                        messages.append(HumanMessage(content=msg.get("content", "")))
                    elif msg.get("role") == "assistant":
                        messages.append(AIMessage(content=msg.get("content", "")))
            
            # Añadir mensaje actual
            messages.append(HumanMessage(content=user_input))
            
            self.trace.append(create_trace_entry(
                "context_initialized",
                {"context_keys": list(context.keys()), "messages_count": len(messages)}
            ))
            
            # Ejecutar grafo MCP
            logger.debug("Ejecutando grafo MCP")
            result = run_graph(self.graph, context, messages)
            
            # Extraer respuesta y metadatos
            if result.messages and len(result.messages) > len(messages):
                response = result.messages[-1].content
            else:
                response = "No se pudo generar una respuesta."
            
            # Extraer resultados de herramientas utilizadas
            tool_results = [
                {"tool": t.get("tool", "unknown"), "result": t.get("result", "")}
                for t in result.tool_results
            ]
            
            self.trace.append(create_trace_entry(
                "processing_completed",
                {
                    "response_length": len(response),
                    "tools_used": [t["tool"] for t in tool_results],
                    "memory_blocks": len(result.memory_blocks),
                    "filtered_memory": len(result.filtered_memory),
                    "execution_time": time.time() - start_time
                }
            ))
            
            # Construir respuesta
            response_data = {
                "output": response,
                "used_tools": tool_results,
                "trace": self.trace
            }
            
            # Añadir información de debug si está habilitado
            if self.debug:
                response_data["memory_summary"] = summarize_memory_blocks(result.filtered_memory)
                response_data["token_usage"] = {"total": result.token_count}
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error procesando solicitud MCP: {str(e)}")
            error_trace = traceback.format_exc()
            logger.error(error_trace)
            
            self.trace.append(create_trace_entry(
                "error",
                {
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "execution_time": time.time() - start_time
                }
            ))
            
            # Construir respuesta de error
            return {
                "output": "Se produjo un error al procesar la solicitud.",
                "error": {
                    "message": str(e),
                    "type": type(e).__name__,
                    "traceback": error_trace if self.debug else None
                },
                "trace": self.trace
            }

# Instancia global del procesador
mcp_processor = MCPProcessor(
    model_name=settings.LLM_MODEL,
    debug=settings.DEBUG
) 