"""
Implementación del MCP (Model Context Protocol) usando Langraph.

Este módulo implementa el MCP de AiDuxCare utilizando el framework Langraph,
permitiendo una arquitectura de agente basada en grafos de estado con nodos
modulares que gestionan el contexto, memoria y herramientas.
"""

import re
import json
from typing import Dict, List, Any, Optional, Union, TypeVar, Literal, Tuple, Callable, Annotated, cast
from datetime import datetime

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint import MemorySaver
from langgraph.pregel import Pregel

# Tipos para el sistema
Role = Literal["health_professional", "patient", "admin_staff"]
Priority = Literal["high", "medium", "low"]
MCPToolResult = Dict[str, Any]

class MCPState(dict):
    """Estado del grafo MCP."""
    
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
    def user_role(self) -> Role:
        return self.context.get("user_role", "patient")
    
    @property
    def visit_id(self) -> Optional[str]:
        return self.context.get("visit", {}).get("id")
    
    @property
    def tool_results(self) -> List[MCPToolResult]:
        return self.get("tool_results", [])
    
    @property
    def required_tools(self) -> List[str]:
        return self.get("required_tools", [])
    
    @property
    def token_count(self) -> int:
        return self.get("token_count", 0)


# ---- Nodos del grafo ----

def process_user_message(state: MCPState) -> MCPState:
    """
    Procesa el mensaje del usuario y lo añade al contexto.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Estado actualizado con el mensaje procesado
    """
    # Obtener el último mensaje (siempre será un HumanMessage)
    last_message = state.messages[-1] if state.messages else None
    if not isinstance(last_message, HumanMessage):
        return state
    
    message_content = str(last_message.content)
    
    # Determinar la prioridad del mensaje
    priority = determine_message_priority(message_content)
    
    # Crear un nuevo bloque de memoria
    new_block = {
        "id": f"msg_{len(state.memory_blocks) + 1}",
        "actor": "user",
        "text": message_content,
        "priority": priority,
        "timestamp": datetime.now().isoformat()
    }
    
    # Actualizar los bloques de memoria
    updated_blocks = state.memory_blocks + [new_block]
    
    # Actualizar el estado
    new_state = MCPState(state)
    new_state["memory_blocks"] = updated_blocks
    new_state["last_processed_message"] = {
        "content": message_content,
        "priority": priority
    }
    
    # Estimar tokens (simplificado: 4 caracteres = 1 token)
    new_state["token_count"] = state.get("token_count", 0) + (len(message_content) // 4)
    
    return new_state

def filter_memory_blocks(state: MCPState) -> MCPState:
    """
    Filtra los bloques de memoria según rol y prioridad.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Estado actualizado con memoria filtrada
    """
    user_role = state.user_role
    memory_blocks = state.memory_blocks
    max_tokens = 1000  # Límite base
    
    # Configuración por rol
    role_config = {
        "health_professional": {
            "priorities": ["high", "medium", "low"],
            "max_tokens": 2000
        },
        "patient": {
            "priorities": ["high", "medium"],
            "max_tokens": 1000
        },
        "admin_staff": {
            "priorities": ["high", "medium"],
            "max_tokens": 1500
        }
    }
    
    # Obtener configuración para el rol actual
    config = role_config.get(user_role, {"priorities": ["high"], "max_tokens": 1000})
    allowed_priorities = config["priorities"]
    max_tokens = config["max_tokens"]
    
    # Filtrar por prioridad
    filtered_blocks = [
        block for block in memory_blocks
        if block.get("priority") in allowed_priorities
    ]
    
    # Ordenar por prioridad y tiempo
    filtered_blocks.sort(
        key=lambda x: (
            0 if x.get("priority") == "high" else 
            1 if x.get("priority") == "medium" else 2,
            x.get("timestamp", "")
        )
    )
    
    # Limitar por tokens
    result = []
    current_tokens = 0
    
    for block in filtered_blocks:
        # Estimación de tokens (4 caracteres = 1 token)
        block_tokens = len(block.get("text", "")) // 4
        
        if current_tokens + block_tokens <= max_tokens:
            result.append(block)
            current_tokens += block_tokens
        elif block.get("priority") == "high":
            # Siempre incluir alta prioridad
            result.append(block)
            current_tokens += block_tokens
    
    # Actualizar el estado
    new_state = MCPState(state)
    new_state["filtered_memory"] = result
    
    return new_state

def determine_tools_needed(state: MCPState) -> MCPState:
    """
    Determina qué herramientas se necesitan según el contexto y mensajes.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Estado actualizado con herramientas requeridas
    """
    # Configuración de herramientas por rol
    tools_by_role = {
        "health_professional": ["diagnostico", "riesgo_legal", "visitas_anteriores"],
        "patient": ["visitas_anteriores"],
        "admin_staff": ["visitas_anteriores", "riesgo_legal"]
    }
    
    user_role = state.user_role
    available_tools = tools_by_role.get(user_role, [])
    
    # Obtener último mensaje procesado
    last_message = state.get("last_processed_message", {}).get("content", "")
    
    # Lógica simple de detección de herramientas necesarias
    required_tools = []
    
    if "diagnóstico" in last_message.lower() or "síntomas" in last_message.lower():
        if "diagnostico" in available_tools:
            required_tools.append("diagnostico")
    
    if "riesgo" in last_message.lower() or "legal" in last_message.lower():
        if "riesgo_legal" in available_tools:
            required_tools.append("riesgo_legal")
    
    if "visita" in last_message.lower() or "histor" in last_message.lower():
        if "visitas_anteriores" in available_tools:
            required_tools.append("visitas_anteriores")
    
    # Actualizar el estado
    new_state = MCPState(state)
    new_state["required_tools"] = required_tools
    
    return new_state

def decide_next_step(state: MCPState) -> Union[str, Dict[str, Any]]:
    """
    Decide si ejecutar herramientas o generar respuesta final.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Nombre del siguiente nodo a ejecutar o END
    """
    required_tools = state.required_tools
    
    if required_tools:
        return "execute_tools"
    else:
        return "generate_final_response"

def execute_tools(state: MCPState) -> MCPState:
    """
    Ejecuta las herramientas requeridas.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Estado actualizado con resultados de herramientas
    """
    required_tools = state.required_tools
    tool_results = []
    
    # Simulación de ejecución de herramientas
    for tool_name in required_tools:
        if tool_name == "diagnostico":
            result = {
                "tool": "diagnostico",
                "result": "El paciente presenta signos compatibles con cervicalgia mecánica con componente radicular."
            }
        elif tool_name == "riesgo_legal":
            result = {
                "tool": "riesgo_legal",
                "result": "Nivel de riesgo bajo. Se recomienda documentar detalladamente la evolución de los síntomas."
            }
        elif tool_name == "visitas_anteriores":
            result = {
                "tool": "visitas_anteriores",
                "result": "Última visita: 15/02/2025 - Diagnóstico: Lumbalgia mecánica."
            }
        else:
            result = {
                "tool": tool_name,
                "result": "Herramienta no disponible o error en la ejecución."
            }
        
        tool_results.append(result)
    
    # Actualizar el estado
    new_state = MCPState(state)
    new_state["tool_results"] = state.get("tool_results", []) + tool_results
    
    return new_state

def generate_final_response(state: MCPState) -> MCPState:
    """
    Genera la respuesta final del agente.
    
    Args:
        state: Estado actual del grafo
        
    Returns:
        Estado actualizado con la respuesta final
    """
    # Configuración por rol
    response_style = {
        "health_professional": "técnico y detallado",
        "patient": "simple y claro",
        "admin_staff": "administrativo y formal"
    }
    
    user_role = state.user_role
    style = response_style.get(user_role, "neutral")
    
    # Crear contexto para el LLM
    filtered_memory = state.filtered_memory
    tool_results = state.tool_results
    
    memory_text = "\n".join([f"- {block.get('text', '')}" for block in filtered_memory[-5:]])
    tools_text = "\n".join([f"- {result.get('tool', '')}: {result.get('result', '')}" for result in tool_results])
    
    # Construir prompt
    prompt = f"""
    Eres un asistente médico de AiDuxCare para un usuario con rol: {user_role}.
    Tu estilo de comunicación debe ser {style}.
    
    Información relevante del contexto:
    {memory_text}
    
    Resultados de herramientas:
    {tools_text}
    
    Responde de manera útil y concisa.
    """
    
    # Simular respuesta del modelo (en implementación real, usar ChatOpenAI)
    llm = ChatOpenAI(temperature=0.5, model="gpt-3.5-turbo")
    ai_message = llm.invoke([SystemMessage(content=prompt), HumanMessage(content="Responde al usuario")])
    
    # Crear nuevo estado con la respuesta
    new_state = MCPState(state)
    return add_messages(new_state, [AIMessage(content=str(ai_message.content))])

def determine_message_priority(message: str) -> Priority:
    """
    Determina la prioridad de un mensaje basado en su contenido.
    
    Args:
        message: Contenido del mensaje a evaluar
        
    Returns:
        Nivel de prioridad (high, medium, low)
    """
    # Palabras clave de alta prioridad (emergencias, síntomas graves)
    high_priority_keywords = [
        "emergencia", "urgente", "grave", "intenso", "severo",
        "dolor fuerte", "sangrado", "asfixia", "desmayo", "convulsión",
        "accidente", "caída", "alergia", "shock", "pérdida de conocimiento"
    ]
    
    # Palabras clave de prioridad media
    medium_priority_keywords = [
        "dolor", "malestar", "síntoma", "tratamiento", "medicación",
        "diagnóstico", "resultados", "empeorando", "fiebre", "mareo",
        "consulta", "cita", "seguimiento"
    ]
    
    # Convertir a minúsculas para comparación
    message_lower = message.lower()
    
    # Verificar palabras de alta prioridad
    for keyword in high_priority_keywords:
        if keyword in message_lower:
            return "high"
    
    # Verificar palabras de prioridad media
    for keyword in medium_priority_keywords:
        if keyword in message_lower:
            return "medium"
    
    # Consideración de longitud del mensaje como indicador de complejidad
    if len(message) > 200:  # Mensajes largos suelen ser más importantes
        return "medium"
    
    # Por defecto, prioridad baja
    return "low"

# ---- Herramientas del MCP ----

def diagnostico_tool(state: Dict[str, Any]) -> Dict[str, Any]:
    """Herramienta para diagnóstico médico."""
    context = state.get("context", {})
    patient = context.get("patient", {})
    
    return {
        "diagnóstico": "Basado en los síntomas descritos, el paciente presenta signos compatibles con cervicalgia mecánica con componente radicular.",
        "confianza": 0.85,
        "diagnósticos_diferenciales": ["Hernia discal cervical", "Síndrome miofascial", "Radiculopatía"]
    }

def riesgo_legal_tool(state: Dict[str, Any]) -> Dict[str, Any]:
    """Herramienta para evaluar riesgo legal."""
    return {
        "nivel_riesgo": "bajo",
        "recomendación": "Documentar detalladamente la evolución de los síntomas",
        "justificación": "Caso estándar con tratamiento bien documentado y seguimiento adecuado"
    }

def visitas_anteriores_tool(state: Dict[str, Any]) -> Dict[str, Any]:
    """Herramienta para consultar visitas anteriores."""
    context = state.get("context", {})
    patient_id = context.get("patient", {}).get("id")
    
    return {
        "visitas": [
            {
                "fecha": "2025-02-15",
                "motivo": "Dolor lumbar",
                "diagnóstico": "Lumbalgia mecánica",
                "tratamiento": "AINE, reposo relativo, fisioterapia"
            },
            {
                "fecha": "2024-10-03",
                "motivo": "Control anual",
                "diagnóstico": "Paciente sano",
                "tratamiento": "N/A"
            }
        ]
    }

# ---- Construcción del grafo ----

def build_mcp_graph(model_name: str = "gpt-3.5-turbo") -> StateGraph:
    """
    Construye el grafo completo del MCP.
    
    Args:
        model_name: Nombre del modelo a utilizar
        
    Returns:
        Grafo de estado configurado
    """
    # Definir herramientas disponibles
    tools = {
        "diagnostico": diagnostico_tool,
        "riesgo_legal": riesgo_legal_tool,
        "visitas_anteriores": visitas_anteriores_tool
    }
    
    # Crear grafo
    workflow = StateGraph(MCPState)
    
    # Añadir nodos
    workflow.add_node("process_user_message", process_user_message)
    workflow.add_node("filter_memory_blocks", filter_memory_blocks)
    workflow.add_node("determine_tools_needed", determine_tools_needed)
    workflow.add_node("execute_tools", execute_tools)
    workflow.add_node("generate_final_response", generate_final_response)
    
    # Configurar aristas
    workflow.set_entry_point("process_user_message")
    workflow.add_edge("process_user_message", "filter_memory_blocks")
    workflow.add_edge("filter_memory_blocks", "determine_tools_needed")
    workflow.add_edge("determine_tools_needed", decide_next_step)
    workflow.add_edge("execute_tools", "generate_final_response")
    workflow.add_edge("generate_final_response", END)
    
    return workflow

def initialize_context(visit_id: str, user_role: Role = "health_professional") -> Dict[str, Any]:
    """
    Inicializa el contexto del MCP con datos de una visita.
    
    Args:
        visit_id: ID de la visita a cargar
        user_role: Rol del usuario
        
    Returns:
        Contexto inicializado con datos del EMR
    """
    # Simular datos del EMR
    patient_data = {
        "id": "PAC001",
        "name": "Juan Pérez",
        "age": 42,
        "gender": "masculino",
        "background": {
            "allergies": ["Ibuprofeno"],
            "chronic_conditions": ["Hipertensión arterial"]
        }
    }
    
    visit_data = {
        "id": visit_id,
        "date": datetime.now().isoformat(),
        "reason": "Dolor cervical con irradiación a miembro superior derecho",
        "provider": "Dra. Carmen Rodríguez"
    }
    
    # Construir contexto inicial
    context = {
        "patient": patient_data,
        "visit": visit_data,
        "user_role": user_role,
        "system_info": {
            "version": "v1.19.0",
            "module": "MCP-Langraph"
        }
    }
    
    return context

def run_graph(
    graph: StateGraph,
    context: Dict[str, Any],
    messages: List[HumanMessage],
    checkpoint: Optional[MemorySaver] = None
) -> MCPState:
    """
    Ejecuta el grafo MCP con un mensaje de entrada.
    
    Args:
        graph: Grafo MCP configurado
        context: Contexto inicial del MCP
        messages: Lista de mensajes a procesar
        checkpoint: Gestor de checkpoints opcional
        
    Returns:
        Estado final después de la ejecución
    """
    # Preparar estado inicial
    initial_state = MCPState({
        "context": context,
        "messages": messages,
        "memory_blocks": [],
        "filtered_memory": [],
        "tool_results": [],
        "token_count": 0
    })
    
    # Configurar mecanismo de ejecución
    if checkpoint:
        app = graph.compile(checkpointer=checkpoint)
    else:
        app = graph.compile()
    
    # Ejecutar grafo
    final_state = app.invoke(initial_state)
    
    return final_state

# Ejemplo de uso
if __name__ == "__main__":
    # Crear grafo
    mcp_graph = build_mcp_graph(model_name="gpt-3.5-turbo")
    
    # Inicializar contexto con una visita
    context = initialize_context(visit_id="VISITA123", user_role="health_professional")
    
    # Crear mensaje de prueba
    test_message = HumanMessage(content="El paciente refiere dolor cervical que se irradia al brazo derecho desde hace 3 días, sin trauma previo")
    
    # Ejecutar grafo
    result = run_graph(mcp_graph, context, [test_message])
    
    # Mostrar resultado
    print("--- Resultado de ejecución del MCP ---")
    print(f"Mensaje del usuario: {test_message.content}")
    print(f"Respuesta del MCP: {result.messages[-1].content}")
    print(f"Herramientas utilizadas: {[t['tool'] for t in result.tool_results]}")
    print(f"Bloques de memoria filtrados: {len(result.filtered_memory)}") 