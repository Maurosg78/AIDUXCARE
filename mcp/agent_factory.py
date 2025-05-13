"""
Módulo para crear agentes MCP según el rol del usuario.

Este módulo proporciona funciones para inicializar agentes MCP
con configuraciones específicas según el tipo de usuario,
facilitando la personalización del comportamiento por rol.
"""

from typing import Dict, Any, Optional, Callable
from mcp.context import MCPContext
from mcp.agent_mcp import MCPAgent


def create_agent_by_role(
    contexto: MCPContext,
    custom_config: Optional[Dict[str, Any]] = None
) -> MCPAgent:
    """
    Crea un agente MCP adaptado al rol de usuario definido en el contexto.
    
    Args:
        contexto: Contexto MCP con el rol de usuario definido
        custom_config: Configuración personalizada opcional
        
    Returns:
        Instancia de MCPAgent configurada según el rol
    """
    # Validar que el contexto tenga un rol definido
    if not hasattr(contexto, 'user_role'):
        raise ValueError("El contexto debe tener un atributo 'user_role' definido")
    
    # Configuraciones por defecto según el rol
    role_configs = {
        "health_professional": {
            "max_iteraciones": 5,
            "herramientas_permitidas": [
                "sugerir_diagnostico_clinico",
                "evaluar_riesgo_legal",
                "recordar_visitas_anteriores"
            ],
            "mostrar_razonamiento": True,
            "nivel_detalle": "alto"
        },
        "patient": {
            "max_iteraciones": 3,
            "herramientas_permitidas": [
                "recordar_visitas_anteriores"
            ],
            "mostrar_razonamiento": False,
            "nivel_detalle": "bajo"
        },
        "admin_staff": {
            "max_iteraciones": 4,
            "herramientas_permitidas": [
                "recordar_visitas_anteriores",
                "evaluar_riesgo_legal"
            ],
            "mostrar_razonamiento": True,
            "nivel_detalle": "medio"
        }
    }
    
    # Obtener configuración base según el rol
    role = contexto.user_role
    if role not in role_configs:
        raise ValueError(f"Rol de usuario no válido: {role}")
    
    config = role_configs[role]
    
    # Aplicar configuración personalizada si existe
    if custom_config:
        config.update(custom_config)
    
    # Extender el contexto con información de configuración
    contexto.agregar_evento(
        origen="sistema",
        tipo="configuracion",
        contenido=f"Configuración de agente para rol: {role}",
        metadatos={"config": config}
    )
    
    # Crear instancia del agente
    agente = MCPAgent(
        contexto=contexto,
        max_iteraciones=config["max_iteraciones"]
    )
    
    # Almacenar la configuración en el agente para uso durante el procesamiento
    agente.config = config
    
    return agente


def crear_agente_profesional_salud(
    contexto: MCPContext,
    custom_config: Optional[Dict[str, Any]] = None
) -> MCPAgent:
    """
    Crea un agente MCP específico para profesionales de salud.
    
    Args:
        contexto: Contexto MCP
        custom_config: Configuración personalizada opcional
        
    Returns:
        Instancia de MCPAgent para profesionales de salud
    """
    # Establecer el rol en el contexto
    contexto.user_role = "health_professional"
    
    # Opciones específicas para profesionales de salud
    config = {
        "formato_respuesta": "clinico",
        "incluir_referencias": True
    }
    
    if custom_config:
        config.update(custom_config)
    
    return create_agent_by_role(contexto, config)


def crear_agente_paciente(
    contexto: MCPContext,
    custom_config: Optional[Dict[str, Any]] = None
) -> MCPAgent:
    """
    Crea un agente MCP específico para pacientes.
    
    Args:
        contexto: Contexto MCP
        custom_config: Configuración personalizada opcional
        
    Returns:
        Instancia de MCPAgent para pacientes
    """
    # Establecer el rol en el contexto
    contexto.user_role = "patient"
    
    # Opciones específicas para pacientes
    config = {
        "formato_respuesta": "simplificado",
        "lenguaje_tecnico": False,
        "incluir_referencias": False
    }
    
    if custom_config:
        config.update(custom_config)
    
    return create_agent_by_role(contexto, config)


def crear_agente_administrativo(
    contexto: MCPContext,
    custom_config: Optional[Dict[str, Any]] = None
) -> MCPAgent:
    """
    Crea un agente MCP específico para personal administrativo.
    
    Args:
        contexto: Contexto MCP
        custom_config: Configuración personalizada opcional
        
    Returns:
        Instancia de MCPAgent para personal administrativo
    """
    # Establecer el rol en el contexto
    contexto.user_role = "admin_staff"
    
    # Opciones específicas para administrativos
    config = {
        "formato_respuesta": "estructurado",
        "enfoque_gestion": True
    }
    
    if custom_config:
        config.update(custom_config)
    
    return create_agent_by_role(contexto, config) 