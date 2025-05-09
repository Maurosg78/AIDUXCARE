"""
Módulo para ejecutar el grafo LangGraph del MCP.

Este módulo proporciona la funcionalidad para ejecutar el grafo LangGraph
que implementa el Model Context Protocol (MCP).
"""

import os
import logging
from typing import Dict, Any, List, Optional
import json
import random
from datetime import datetime

# Logger para el módulo
logger = logging.getLogger(__name__)

class MCPGraphRunner:
    """
    Ejecutor del grafo LangGraph para el MCP.
    
    Esta clase implementa el runner del grafo que procesa interacciones
    y genera respuestas para el usuario según el contexto.
    """
    
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        """
        Inicializa el ejecutor del grafo MCP.
        
        Args:
            model_name: Nombre del modelo LLM a utilizar
        """
        self.model_name = model_name
        logger.info(f"Inicializando grafo MCP con modelo: {model_name}")
        
        # En modo simulado, no necesitamos crear el grafo real
        # Solo registramos que se inicializó correctamente
        logger.info("Grafo MCP inicializado correctamente")
    
    async def generate_response(
        self,
        visit_id: str,
        role: str,
        user_input: str,
        field: Optional[str] = None,
        previous_messages: Optional[List[Dict[str, Any]]] = None,
        context_override: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera una respuesta utilizando el grafo MCP.
        
        Args:
            visit_id: ID de la visita
            role: Rol del usuario
            user_input: Entrada del usuario
            field: Campo EMR que se está trabajando (opcional)
            previous_messages: Mensajes previos en la conversación
            context_override: Contexto adicional para la generación
        
        Returns:
            Diccionario con la respuesta y metadatos adicionales
        """
        logger.info(f"Recibida solicitud para visita: {visit_id}, rol: {role}")
        
        # Simular tiempo de procesamiento
        import time
        time.sleep(0.2)  # 200ms de "procesamiento"
        
        # Generar respuesta simulada según el campo
        response = self._generate_simulated_response(user_input, field, role)
        
        # Crear item para la conversación
        conversation_item = {
            "id": f"msg_{random.randint(1000, 9999)}",
            "timestamp": datetime.now().isoformat(),
            "sender_type": "assistant",
            "sender_name": "AiDuxCare",
            "content": response,
            "metadata": {
                "visit_id": visit_id,
                "field": field,
                "model": self.model_name
            }
        }
        
        # Crear resumen de contexto
        context_summary = {
            "user_role": role,
            "active_tools": ["knowledge_base", "medical_guidelines"],
            "processing_time_ms": random.randint(200, 800),
            "memory_blocks_count": random.randint(2, 8),
            "emr_context_used": True
        }
        
        # Crear resultado
        result = {
            "response": response,
            "conversation_item": conversation_item,
            "context_summary": context_summary,
            "trace": [
                {"action": "context_retrieval", "metadata": {"timestamp": datetime.now().isoformat()}},
                {"action": "llm_generation", "metadata": {"model": self.model_name}},
                {"action": "response_formatting", "metadata": {"field": field}}
            ]
        }
        
        return result
    
    def _generate_simulated_response(
        self,
        user_input: str,
        field: Optional[str],
        role: str
    ) -> str:
        """
        Genera una respuesta simulada según el campo y la entrada.
        
        Args:
            user_input: Texto ingresado por el usuario
            field: Campo EMR que se está trabajando
            role: Rol del usuario
        
        Returns:
            Respuesta generada
        """
        # Respuestas específicas según el campo
        if field == "anamnesis":
            return "He revisado la información de anamnesis proporcionada. Algunos aspectos clave que podrías considerar: ¿El paciente tiene antecedentes familiares relevantes? ¿Hay algún tratamiento actual que pueda interferir con la condición?"
        
        elif field == "exploracion":
            return "Basado en los hallazgos de la exploración, te recomendaría evaluar también signos de compromiso neurológico y verificar la simetría en los reflejos osteotendinosos. Considera complementar con una evaluación funcional detallada."
        
        elif field == "diagnostico":
            return "El diagnóstico propuesto es coherente con los síntomas y signos descritos. Como diagnósticos diferenciales, podrías considerar también: estenosis del canal, síndrome facetario, o patología discogénica. ¿Has considerado ordenar pruebas de imagen para confirmar?"
        
        elif field == "plan":
            return "Tu plan de tratamiento aborda los aspectos principales. Podrías considerar añadir: 1) Recomendaciones posturales específicas, 2) Plan de rehabilitación progresiva, 3) Criterios claros para derivación a especialista si no hay mejoría. Recuerda documentar los criterios de reevaluación."
        
        # Respuesta genérica para otros campos o cuando no se especifica
        return "He analizado la información proporcionada. Como copiloto clínico, puedo sugerirte revisar guías clínicas actualizadas para este caso. Considera documentar con más detalle la evolución temporal de los síntomas y los tratamientos previos utilizados."

# Instancia global del runner
mcp_runner = MCPGraphRunner(model_name=os.environ.get("LLM_MODEL", "gpt-3.5-turbo"))

async def run_mcp_graph(
    visit_id: str,
    role: str,
    user_input: str,
    field: Optional[str] = None,
    previous_messages: Optional[List[Dict[str, Any]]] = None,
    context_override: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Función para ejecutar el grafo MCP.
    
    Args:
        visit_id: ID de la visita
        role: Rol del usuario
        user_input: Entrada del usuario
        field: Campo EMR que se está trabajando (opcional)
        previous_messages: Mensajes previos en la conversación
        context_override: Contexto adicional para la generación
    
    Returns:
        Diccionario con la respuesta y metadatos adicionales
    """
    try:
        return await mcp_runner.generate_response(
            visit_id=visit_id,
            role=role,
            user_input=user_input,
            field=field,
            previous_messages=previous_messages,
            context_override=context_override
        )
    except Exception as e:
        logger.error(f"Error al ejecutar el grafo MCP: {str(e)}")
        return {
            "response": "Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
            "conversation_item": {
                "id": f"error_{random.randint(1000, 9999)}",
                "timestamp": datetime.now().isoformat(),
                "sender_type": "assistant",
                "sender_name": "AiDuxCare",
                "content": "Error en el procesamiento."
            },
            "context_summary": {
                "user_role": role,
                "error": str(e)
            },
            "trace": [
                {"action": "error", "metadata": {"error": str(e), "timestamp": datetime.now().isoformat()}}
            ]
        } 