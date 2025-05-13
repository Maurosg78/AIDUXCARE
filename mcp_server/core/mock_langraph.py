"""
Implementación mock de LangGraph para desarrollo y pruebas.

Este módulo proporciona versiones simuladas de las funciones y clases
de LangGraph, permitiendo ejecutar pruebas sin dependencias externas.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from dataclasses import dataclass

from settings import logger, settings

@dataclass
class MCPState:
    """Clase simulada para el estado del MCP."""
    messages: List[Any] = None
    memory_blocks: List[Dict[str, Any]] = None
    tool_results: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        self.messages = self.messages or []
        self.memory_blocks = self.memory_blocks or []
        self.tool_results = self.tool_results or []

class MockGraph:
    """Clase simulada para el grafo LangGraph."""
    
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        self.model_name = model_name
        logger.info(f"Mock LangGraph inicializado con modelo: {model_name}")
    
    async def ainvoke(self, context: Dict[str, Any], messages: List[Any]) -> MCPState:
        """Simula la invocación asíncrona del grafo."""
        logger.info("Llamada simulada a LangGraph.ainvoke")
        return await self._process(context, messages)
        
    async def _process(self, context: Dict[str, Any], messages: List[Any]) -> MCPState:
        """Procesa internamente la solicitud y genera una respuesta simulada."""
        # Simular una respuesta básica
        visit_id = context.get("visit_id", "unknown")
        role = context.get("user_role", "unknown")
        
        # Obtener el último mensaje
        user_message = messages[-1].content if messages else "Sin entrada de usuario"
        
        # Generar respuesta simulada
        ai_message = {
            "content": f"[RESPUESTA SIMULADA] Como copiloto clínico, basado en el contexto de la visita {visit_id}, puedo ayudar con tu consulta. La información que proporcionas es relevante para el diagnóstico.",
            "role": "assistant"
        }
        
        # Agregar mensaje del usuario y respuesta simulada
        all_messages = list(messages)  # Copiar mensajes existentes
        all_messages.append(ai_message)  # Agregar respuesta
        
        # Simular herramientas utilizadas
        tools = ["ContextRetriever", "MedicalKnowledgeBase"]
        
        # Crear estado resultante
        return MCPState(
            messages=all_messages,
            memory_blocks=[
                {"id": str(uuid.uuid4()), "content": "Bloque de memoria simulado"}
            ],
            tool_results=[
                {"tool": tool, "result": f"Resultado simulado de {tool}"} 
                for tool in tools
            ]
        )

def build_mcp_graph(model_name: str = "gpt-3.5-turbo") -> MockGraph:
    """
    Crea una instancia simulada del grafo MCP.
    
    Args:
        model_name: Nombre del modelo a utilizar
        
    Returns:
        Instancia de MockGraph
    """
    return MockGraph(model_name=model_name)

def initialize_context(visit_id: str, user_role: str) -> Dict[str, Any]:
    """
    Inicializa el contexto para el MCP.
    
    Args:
        visit_id: ID de la visita
        user_role: Rol del usuario
        
    Returns:
        Contexto inicializado
    """
    return {
        "visit_id": visit_id,
        "user_role": user_role,
        "timestamp": datetime.now().isoformat(),
        "system_info": {
            "version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT
        }
    }

async def run_graph(graph: MockGraph, context: Dict[str, Any], messages: List[Any]) -> MCPState:
    """
    Ejecuta el grafo MCP con los mensajes y contexto dados.
    
    Args:
        graph: Instancia del grafo
        context: Contexto de la ejecución
        messages: Lista de mensajes
        
    Returns:
        Estado resultante
    """
    logger.info(f"Ejecutando mock de LangGraph para visita: {context.get('visit_id')}")
    return await graph.ainvoke(context, messages) 