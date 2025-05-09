"""
Implementación simulada del MCP para desarrollo y pruebas.

Este módulo proporciona una implementación simulada del MCP para uso
durante desarrollo y pruebas, sin dependencia de Langraph o modelos LLM reales.
"""

import time
import random
from typing import Dict, Any, List, Union, Optional
from datetime import datetime
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage

from settings import logger, settings

class MCPState(dict):
    """Simulación del estado del grafo MCP."""
    
    @property
    def messages(self) -> List[Union[HumanMessage, AIMessage, SystemMessage]]:
        return self.get("messages", [])
    
    @property
    def context(self) -> Dict[str, Any]:
        return self.get("context", {})
    
    @property
    def memory_blocks(self) -> List[Dict[str, Any]]:
        return self.get("memory_blocks", [])
    
    @property
    def filtered_memory(self) -> List[Dict[str, Any]]:
        return self.get("filtered_memory", [])
    
    @property
    def tool_results(self) -> List[Dict[str, Any]]:
        return self.get("tool_results", [])
    
    @property
    def token_count(self) -> int:
        return self.get("token_count", 0)

def build_mcp_graph(model_name: str = "gpt-3.5-turbo") -> Any:
    """
    Crea una simulación del grafo MCP.
    
    Args:
        model_name: Nombre del modelo (solo para registro)
        
    Returns:
        Objeto simulado del grafo
    """
    logger.info(f"Creando grafo MCP simulado con modelo: {model_name}")
    return {"name": "MockMCPGraph", "model": model_name}

def initialize_context(visit_id: str, user_role: str = "health_professional") -> Dict[str, Any]:
    """
    Inicializa un contexto simulado para la ejecución del MCP.
    
    Args:
        visit_id: ID de la visita
        user_role: Rol del usuario
        
    Returns:
        Contexto simulado
    """
    logger.debug(f"Inicializando contexto simulado para visita: {visit_id}, rol: {user_role}")
    
    return {
        "visit": {
            "id": visit_id,
            "created_at": datetime.now().isoformat(),
            "patient_info": {
                "name": "Paciente de prueba",
                "age": 45,
                "gender": "No especificado"
            }
        },
        "user_role": user_role,
        "session_id": f"mock-session-{int(time.time())}",
        "system_info": {
            "version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT,
            "model": settings.LLM_MODEL
        }
    }

def run_graph(graph: Any, context: Dict[str, Any], messages: List[BaseMessage]) -> MCPState:
    """
    Ejecuta una simulación del grafo MCP.
    
    Args:
        graph: Grafo simulado
        context: Contexto de ejecución
        messages: Lista de mensajes
        
    Returns:
        Estado resultante de la ejecución
    """
    logger.debug("Ejecutando grafo MCP simulado")
    
    # Simular tiempo de procesamiento
    time.sleep(0.5)
    
    # Obtener el último mensaje del usuario
    user_input = messages[-1].content if messages else ""
    
    # Determinar respuesta basada en palabras clave
    response = generate_mock_response(user_input, context.get("user_role", "health_professional"))
    
    # Crear mensajes resultantes
    result_messages = list(messages)
    result_messages.append(AIMessage(content=response))
    
    # Simular uso de herramientas
    tool_results = generate_mock_tool_results(user_input)
    
    # Crear bloques de memoria
    memory_blocks = []
    for i, msg in enumerate(messages):
        memory_blocks.append({
            "id": f"memory_{i}",
            "text": str(msg.content),
            "timestamp": datetime.now().isoformat(),
            "priority": random.choice(["high", "medium", "low"])
        })
    
    # Estimar tokens (aproximación simple)
    total_text = user_input + response + sum(tool["result"] for tool in tool_results)
    token_count = len(total_text) // 4  # Aproximadamente 4 caracteres por token
    
    # Construir y retornar estado
    state = MCPState({
        "messages": result_messages,
        "context": context,
        "memory_blocks": memory_blocks,
        "filtered_memory": memory_blocks[:3],  # Simular filtrado
        "tool_results": tool_results,
        "token_count": token_count
    })
    
    return state

def generate_mock_response(user_input: str, role: str) -> str:
    """
    Genera una respuesta simulada basada en el input del usuario.
    
    Args:
        user_input: Mensaje del usuario
        role: Rol del usuario
        
    Returns:
        Respuesta simulada
    """
    lower_input = user_input.lower()
    
    if "dolor" in lower_input:
        return "Basado en los síntomas de dolor que refiere, es importante evaluar si hay compromiso neurológico. Recomiendo realizar una exploración detallada de la sensibilidad y fuerza en el miembro afectado. También sería útil descartar compresión radicular mediante pruebas complementarias."
    elif "fiebre" in lower_input:
        return "La presencia de fiebre junto con los otros síntomas podría indicar un proceso infeccioso. Sugiero solicitar hemograma completo, PCR y valorar la necesidad de hemocultivos según la evolución clínica."
    elif "tratamiento" in lower_input or "medicación" in lower_input:
        return "Para el manejo sintomático recomiendo iniciar con medidas no farmacológicas como reposo relativo y aplicación local de calor/frío según tolerancia. En cuanto a tratamiento farmacológico, podría valorarse iniciar con antiinflamatorios no esteroideos a dosis estándar, monitorizando efectos secundarios y evolución clínica."
    else:
        return "He analizado la información proporcionada sobre el paciente. Recomendaría completar la anamnesis con antecedentes familiares relevantes y valorar la realización de pruebas complementarias específicas según la evolución clínica."

def generate_mock_tool_results(user_input: str) -> List[Dict[str, Any]]:
    """
    Genera resultados de herramientas simulados basados en el input.
    
    Args:
        user_input: Mensaje del usuario
        
    Returns:
        Lista de resultados de herramientas
    """
    results = []
    
    if "dolor" in user_input.lower():
        results.append({
            "tool": "evaluacion_clinica",
            "result": "Posible compresión radicular cervical. Evaluación neurológica recomendada."
        })
    
    if "tratamiento" in user_input.lower() or "medicación" in user_input.lower():
        results.append({
            "tool": "recomendacion_terapeutica",
            "result": "Tratamiento recomendado: AINE + reposo relativo + evaluación por especialista."
        })
    
    # Siempre incluir análisis de contexto
    results.append({
        "tool": "analisis_contexto",
        "result": "Análisis de contexto clínico completado. Patrones identificados en consulta."
    })
    
    return results 