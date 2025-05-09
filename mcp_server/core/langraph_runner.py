"""
Implementación del runner para Langraph MCP.

Este módulo proporciona una capa de abstracción sobre el grafo MCP de Langraph,
facilitando su uso desde los endpoints de FastAPI y agregando funcionalidades
de trazabilidad y gestión de errores.
"""

import sys
import os
import time
import traceback
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage

# Agregar la raíz del proyecto al path para importar langraph_mcp
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

try:
    # Intentar importar desde el directorio raíz del proyecto
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..")))
    from langraph_mcp import build_mcp_graph, initialize_context, run_graph, MCPState
except ImportError:
    # Si falla, usar una implementación simulada para desarrollo
    from .mock_langraph import build_mcp_graph, initialize_context, run_graph, MCPState

from schemas import (
    FrontendMCPRequest,
    FrontendMCPResponse,
    ConversationItem,
    ContextSummary,
    TraceEntry
)
from settings import settings, logger

class MCPGraphRunner:
    """
    Clase para ejecutar solicitudes utilizando el MCP implementado con Langraph.
    """
    
    def __init__(self):
        """Inicializa el runner de MCP."""
        self.model_name = settings.LLM_MODEL
        self.debug = settings.DEBUG
        
        # Inicializar el grafo MCP
        logger.info(f"Inicializando grafo MCP con modelo: {self.model_name}")
        try:
            self.graph = build_mcp_graph(model_name=self.model_name)
            logger.info("Grafo MCP inicializado correctamente")
        except Exception as e:
            logger.error(f"Error al inicializar grafo MCP: {str(e)}")
            raise RuntimeError(f"No se pudo inicializar el grafo MCP: {str(e)}")
    
    async def process_request(self, request: FrontendMCPRequest) -> FrontendMCPResponse:
        """
        Procesa una solicitud para el MCP y devuelve la respuesta formateada.
        
        Args:
            request: Solicitud desde el frontend
            
        Returns:
            Respuesta adaptada para el frontend
        """
        start_time = time.time()
        
        # Crear trace para seguimiento
        trace_entries = []
        trace_entries.append(self._create_trace_entry(
            "request_received",
            {
                "visit_id": request.visit_id,
                "role": request.role,
                "input_length": len(request.user_input)
            }
        ))
        
        try:
            # Inicializar contexto
            logger.debug(f"Inicializando contexto para visita: {request.visit_id}, rol: {request.role}")
            context = initialize_context(visit_id=request.visit_id, user_role=request.role)
            
            # Aplicar override de contexto si existe
            if request.context_override:
                logger.debug("Aplicando override de contexto")
                for key, value in request.context_override.items():
                    context[key] = value
            
            # Convertir mensajes previos
            messages = []
            if request.previous_messages:
                logger.debug(f"Procesando {len(request.previous_messages)} mensajes previos")
                for msg in request.previous_messages:
                    if msg.sender_type == "user":
                        messages.append(HumanMessage(content=msg.content))
                    elif msg.sender_type == "assistant":
                        messages.append(AIMessage(content=msg.content))
            
            # Añadir mensaje actual
            messages.append(HumanMessage(content=request.user_input))
            
            trace_entries.append(self._create_trace_entry(
                "context_initialized",
                {
                    "context_keys": list(context.keys()),
                    "messages_count": len(messages)
                }
            ))
            
            # Ejecutar grafo MCP
            logger.debug("Ejecutando grafo MCP")
            result = run_graph(self.graph, context, messages)
            
            # Extraer respuesta 
            if result.messages and len(result.messages) > len(messages):
                response = result.messages[-1].content
            else:
                response = "No se pudo generar una respuesta."
            
            # Extraer herramientas utilizadas
            tool_results = result.tool_results if hasattr(result, "tool_results") else []
            tool_names = [t.get("tool", "unknown") for t in tool_results]
            
            process_time = time.time() - start_time
            memory_blocks_count = len(result.memory_blocks) if hasattr(result, "memory_blocks") else 0
            
            trace_entries.append(self._create_trace_entry(
                "processing_completed",
                {
                    "response_length": len(response),
                    "tools_used": tool_names,
                    "memory_blocks": memory_blocks_count,
                    "execution_time": process_time
                }
            ))
            
            # Construir conversationItem para frontend
            message_id = f"msg_{len(request.previous_messages) + 2 if request.previous_messages else 2}"
            timestamp = datetime.now().isoformat()
            
            conversation_item = ConversationItem(
                id=message_id,
                timestamp=timestamp,
                sender_type="assistant",
                sender_name="AiDuxCare MCP",
                content=response,
                metadata={
                    "tools_used": tool_names,
                    "visit_id": request.visit_id
                }
            )
            
            # Construir context_summary para frontend
            context_summary = ContextSummary(
                active_tools=tool_names,
                memory_blocks_count=memory_blocks_count,
                processing_time_ms=process_time * 1000,  # convertir a ms
                user_role=request.role
            )
            
            # Construir respuesta final
            return FrontendMCPResponse(
                response=response,
                conversation_item=conversation_item,
                context_summary=context_summary,
                trace=trace_entries
            )
            
        except Exception as e:
            logger.error(f"Error procesando solicitud MCP: {str(e)}")
            error_trace = traceback.format_exc()
            logger.error(error_trace)
            
            trace_entries.append(self._create_trace_entry(
                "error",
                {
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "execution_time": time.time() - start_time
                }
            ))
            
            # Construir respuesta de error
            timestamp = datetime.now().isoformat()
            
            return FrontendMCPResponse(
                response=f"Se produjo un error al procesar la solicitud: {str(e)}",
                conversation_item=ConversationItem(
                    id="error",
                    timestamp=timestamp,
                    sender_type="system",
                    sender_name="Error",
                    content=f"Se produjo un error al procesar la solicitud: {str(e)}",
                    metadata={
                        "error": True,
                        "visit_id": request.visit_id
                    }
                ),
                context_summary=ContextSummary(
                    active_tools=[],
                    memory_blocks_count=0,
                    processing_time_ms=(time.time() - start_time) * 1000,
                    user_role=request.role,
                    error=True,
                    error_message=str(e)
                ),
                trace=trace_entries
            )
    
    def _create_trace_entry(self, action: str, metadata: Dict[str, Any]) -> TraceEntry:
        """Crea una entrada de traza con marca de tiempo."""
        return TraceEntry(
            timestamp=datetime.now().isoformat(),
            action=action,
            metadata=metadata
        )

# Instancia global del runner
mcp_runner = MCPGraphRunner()

async def run_mcp_graph(request: FrontendMCPRequest) -> FrontendMCPResponse:
    """
    Función para ejecutar el grafo MCP con una solicitud del frontend.
    
    Esta es la función principal que utiliza el API para procesar
    solicitudes al MCP.
    
    Args:
        request: Solicitud desde el frontend
        
    Returns:
        Respuesta formateada para el frontend
    """
    return await mcp_runner.process_request(request) 