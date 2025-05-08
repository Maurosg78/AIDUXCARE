"""
Módulo para estructurar el contexto del MCP y manejar la historia de interacciones.

Incluye:
- Clase MCPContext para mantener estado del agente
- Métodos para actualizar y consultar la historia
- Serialización/deserialización del contexto
- Sistema de memoria adaptativa por rol
"""

import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Union, Literal, Callable

# Tipos válidos de roles de usuario
UserRole = Literal["health_professional", "patient", "admin_staff"]

# Tipos válidos de prioridad para bloques de conversación
PriorityLevel = Literal["high", "medium", "low"]

# Tipos válidos de actores en la conversación
ActorType = Literal["patient", "professional", "companion", "system"]


class MCPContext:
    """
    Contexto del MCP (Model Context Protocol) para AiDuxCare.
    
    Mantiene:
    - Información del paciente
    - Historia de interacciones y herramientas usadas
    - Estado de la sesión actual
    - Rol del usuario que interactúa con el MCP
    - Memoria a corto y largo plazo adaptativa según rol
    """
    
    def __init__(
        self,
        paciente_id: str,
        paciente_nombre: str,
        visita_id: str,
        profesional_email: str,
        motivo_consulta: str,
        user_role: UserRole = "health_professional",
        datos_iniciales: Optional[Dict[str, Any]] = None
    ):
        """
        Inicializa un nuevo contexto MCP.
        
        Args:
            paciente_id: ID único del paciente
            paciente_nombre: Nombre del paciente
            visita_id: ID único de la visita actual
            profesional_email: Email del profesional de salud
            motivo_consulta: Motivo principal de la consulta
            user_role: Rol del usuario ("health_professional", "patient", "admin_staff")
            datos_iniciales: Datos adicionales del paciente (opcional)
        """
        self.paciente = {
            "id": paciente_id,
            "nombre": paciente_nombre,
            "datos": datos_iniciales or {}
        }
        
        self.visita = {
            "id": visita_id,
            "profesional_email": profesional_email,
            "motivo_consulta": motivo_consulta,
            "fecha_inicio": datetime.now().isoformat(),
            "estado": "activa"  # activa, completada, cancelada
        }
        
        # Rol del usuario (determina permisos y comportamiento del agente)
        self.user_role: UserRole = user_role
        
        # Historia de mensajes y acciones para trazabilidad
        self.historia: List[Dict[str, Any]] = []
        
        # Métricas para evaluación y auditoria
        self.metricas = {
            "herramientas_usadas": 0,
            "tiempo_inicio": datetime.now().isoformat(),
            "tiempo_actualizacion": datetime.now().isoformat(),
            "tokens_utilizados": 0,
            "tokens_memoria": 0
        }
        
        # Memoria a corto plazo (conversación actual)
        self.short_term_memory: List[Dict[str, Any]] = []
        
        # Memoria a largo plazo (accesible solo para rol clínico)
        self.long_term_memory: List[Dict[str, Any]] = []
        
        # Configuración de memoria según roles
        self.memory_config = {
            "health_professional": {
                "use_long_term_memory": True,
                "max_short_term_blocks": 20,
                "max_long_term_blocks": 100,
                "priority_threshold": "low"  # Incluir todos los niveles de prioridad
            },
            "patient": {
                "use_long_term_memory": False,
                "max_short_term_blocks": 10,
                "max_long_term_blocks": 0,
                "priority_threshold": "medium"  # Solo incluir prioridad alta y media
            },
            "admin_staff": {
                "use_long_term_memory": True,
                "max_short_term_blocks": 15,
                "max_long_term_blocks": 50,
                "priority_threshold": "medium"  # Solo incluir prioridad alta y media
            }
        }
        
        # Añadimos el evento de inicio a la historia
        self.agregar_evento("sistema", "Inicio de sesión MCP", {
            "paciente_id": paciente_id,
            "visita_id": visita_id,
            "motivo_consulta": motivo_consulta,
            "user_role": user_role
        })
    
    def agregar_evento(
        self,
        origen: str,
        tipo: str,
        contenido: Any,
        metadatos: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Añade un nuevo evento a la historia del contexto.
        
        Args:
            origen: Origen del evento (usuario, sistema, herramienta, mcp)
            tipo: Tipo de evento (mensaje, herramienta, acción, etc.)
            contenido: Contenido principal del evento
            metadatos: Información adicional sobre el evento
        """
        evento = {
            "id": len(self.historia) + 1,
            "timestamp": datetime.now().isoformat(),
            "origen": origen,
            "tipo": tipo,
            "contenido": contenido,
            "metadatos": metadatos or {}
        }
        
        # Añadir información del rol a metadatos si no existe
        if "user_role" not in evento["metadatos"]:
            evento["metadatos"]["user_role"] = self.user_role
        
        self.historia.append(evento)
        self.metricas["tiempo_actualizacion"] = evento["timestamp"]
        
        # Actualizar métricas según el tipo de evento
        if tipo == "herramienta":
            self.metricas["herramientas_usadas"] += 1
    
    def agregar_mensaje_usuario(self, mensaje: str) -> None:
        """Añade un mensaje del usuario a la historia."""
        self.agregar_evento("usuario", "mensaje", mensaje)
    
    def agregar_mensaje_sistema(self, mensaje: str) -> None:
        """Añade un mensaje del sistema a la historia."""
        self.agregar_evento("sistema", "mensaje", mensaje)
    
    def agregar_resultado_herramienta(
        self,
        nombre_herramienta: str,
        argumentos: Dict[str, Any],
        resultado: Any
    ) -> None:
        """
        Registra el uso y resultado de una herramienta.
        
        Args:
            nombre_herramienta: Nombre de la herramienta usada
            argumentos: Argumentos pasados a la herramienta
            resultado: Resultado retornado por la herramienta
        """
        self.agregar_evento(
            origen="herramienta",
            tipo="herramienta",
            contenido=resultado,
            metadatos={
                "nombre_herramienta": nombre_herramienta,
                "argumentos": argumentos
            }
        )
    
    def agregar_respuesta_mcp(self, respuesta: str, razonamiento: Optional[str] = None) -> None:
        """
        Añade una respuesta generada por el MCP.
        
        Args:
            respuesta: La respuesta generada
            razonamiento: Explicación del razonamiento (opcional)
        """
        self.agregar_evento(
            origen="mcp",
            tipo="respuesta",
            contenido=respuesta,
            metadatos={"razonamiento": razonamiento} if razonamiento else {}
        )
    
    def agregar_bloque_conversacion(
        self,
        actor: ActorType,
        texto: str,
        prioridad: PriorityLevel = "medium"
    ) -> Dict[str, Any]:
        """
        Añade un bloque de conversación a la memoria.
        
        Args:
            actor: Tipo de actor (paciente, profesional, acompañante, sistema)
            texto: Contenido del bloque de conversación
            prioridad: Nivel de prioridad (alta, media, baja)
            
        Returns:
            Diccionario con el bloque creado
        """
        # Generar bloque de conversación
        bloque = {
            "id": len(self.short_term_memory) + len(self.long_term_memory) + 1,
            "timestamp": datetime.now().isoformat(),
            "actor": actor,
            "priority": prioridad,
            "text": texto,
            "visita_id": self.visita["id"],
            "tokens_estimados": self._estimar_tokens(texto)
        }
        
        # Añadir a memoria a corto plazo
        self.short_term_memory.append(bloque)
        
        # Añadir a memoria a largo plazo si es profesional de salud
        config = self.memory_config[self.user_role]
        if config["use_long_term_memory"] and (
            actor == "professional" or 
            prioridad == "high" or 
            self.user_role == "health_professional"
        ):
            self.long_term_memory.append(bloque)
        
        # Limitar tamaño de las memorias
        self._limitar_memoria()
        
        # Actualizar métricas
        self.metricas["tokens_memoria"] += bloque["tokens_estimados"]
        
        # También registrar en la historia para auditoría
        self.agregar_evento(
            origen="memoria",
            tipo="bloque_conversacion",
            contenido=bloque["text"],
            metadatos={
                "actor": actor,
                "priority": prioridad,
                "id_bloque": bloque["id"]
            }
        )
        
        return bloque
    
    def filter_relevant_blocks(
        self, 
        max_tokens: int = 300
    ) -> List[Dict[str, Any]]:
        """
        Filtra los bloques relevantes según la configuración de rol.
        
        Args:
            max_tokens: Máximo de tokens a incluir
            
        Returns:
            Lista de bloques filtrados
        """
        # Obtener configuración según rol
        config = self.memory_config[self.user_role]
        
        # Mapear prioridad de umbral a valor numérico para comparación
        priority_values = {"high": 3, "medium": 2, "low": 1}
        threshold_value = priority_values[config["priority_threshold"]]
        
        # Filtrar bloques según prioridad
        relevantes = []
        tokens_usados = 0
        
        # Primero incluir bloques de memoria a corto plazo
        for bloque in reversed(self.short_term_memory):  # Priorizar los más recientes
            bloque_priority_value = priority_values[bloque["priority"]]
            
            # Solo incluir si supera el umbral de prioridad
            if bloque_priority_value >= threshold_value:
                # Verificar si añadir este bloque excedería el límite de tokens
                if tokens_usados + bloque["tokens_estimados"] <= max_tokens:
                    relevantes.append(bloque)
                    tokens_usados += bloque["tokens_estimados"]
                else:
                    # Si este bloque es de prioridad alta, intentar incluirlo de todos modos
                    if bloque["priority"] == "high":
                        relevantes.append(bloque)
                        tokens_usados += bloque["tokens_estimados"]
        
        # Luego incluir bloques de memoria a largo plazo si el rol lo permite y quedan tokens
        if config["use_long_term_memory"] and tokens_usados < max_tokens:
            for bloque in reversed(self.long_term_memory):
                # No duplicar bloques que ya están en memoria corta
                if any(b["id"] == bloque["id"] for b in relevantes):
                    continue
                
                bloque_priority_value = priority_values[bloque["priority"]]
                
                # Solo incluir si supera el umbral y es de profesional o es prioridad alta
                if (bloque_priority_value >= threshold_value and 
                    (bloque["actor"] == "professional" or bloque["priority"] == "high")):
                    
                    # Verificar límite de tokens
                    if tokens_usados + bloque["tokens_estimados"] <= max_tokens:
                        relevantes.append(bloque)
                        tokens_usados += bloque["tokens_estimados"]
                    else:
                        # Si es de prioridad alta, incluir aunque exceda el límite
                        if bloque["priority"] == "high":
                            relevantes.append(bloque)
                            tokens_usados += bloque["tokens_estimados"]
        
        # Actualizar métricas
        self.metricas["tokens_utilizados"] += tokens_usados
        
        # Ordenar por timestamp para mantener orden cronológico
        return sorted(relevantes, key=lambda x: x["timestamp"])
    
    def _limitar_memoria(self) -> None:
        """Limita el tamaño de las memorias según la configuración de rol."""
        config = self.memory_config[self.user_role]
        
        # Limitar memoria a corto plazo
        if len(self.short_term_memory) > config["max_short_term_blocks"]:
            # Mantener los más recientes, pero preservar bloques prioritarios
            bloques_alta_prioridad = [b for b in self.short_term_memory if b["priority"] == "high"]
            bloques_normales = [b for b in self.short_term_memory if b["priority"] != "high"]
            
            # Ordenar por timestamp (más recientes primero)
            bloques_normales = sorted(bloques_normales, key=lambda x: x["timestamp"], reverse=True)
            
            # Calcular cuántos bloques normales mantener
            num_bloques_normales = config["max_short_term_blocks"] - len(bloques_alta_prioridad)
            
            if num_bloques_normales > 0:
                self.short_term_memory = bloques_alta_prioridad + bloques_normales[:num_bloques_normales]
            else:
                # Si hay más bloques de alta prioridad que el límite, mantener solo los más recientes
                bloques_alta_prioridad = sorted(bloques_alta_prioridad, 
                                               key=lambda x: x["timestamp"], reverse=True)
                self.short_term_memory = bloques_alta_prioridad[:config["max_short_term_blocks"]]
        
        # Limitar memoria a largo plazo si está habilitada
        if config["use_long_term_memory"] and len(self.long_term_memory) > config["max_long_term_blocks"]:
            # Aplicar la misma lógica que para memoria a corto plazo
            bloques_alta_prioridad = [b for b in self.long_term_memory if b["priority"] == "high"]
            bloques_normales = [b for b in self.long_term_memory if b["priority"] != "high"]
            
            bloques_normales = sorted(bloques_normales, key=lambda x: x["timestamp"], reverse=True)
            
            num_bloques_normales = config["max_long_term_blocks"] - len(bloques_alta_prioridad)
            
            if num_bloques_normales > 0:
                self.long_term_memory = bloques_alta_prioridad + bloques_normales[:num_bloques_normales]
            else:
                bloques_alta_prioridad = sorted(bloques_alta_prioridad, 
                                               key=lambda x: x["timestamp"], reverse=True)
                self.long_term_memory = bloques_alta_prioridad[:config["max_long_term_blocks"]]
    
    def _estimar_tokens(self, texto: str) -> int:
        """
        Estima la cantidad de tokens en un texto.
        Aproximación basada en que 1 token ≈ 4 caracteres en promedio.
        
        Args:
            texto: Texto a analizar
            
        Returns:
            Número estimado de tokens
        """
        return len(texto) // 4 + 1
    
    def obtener_historia_reciente(self, limite: int = 10) -> List[Dict[str, Any]]:
        """Obtiene los eventos más recientes de la historia."""
        return self.historia[-limite:] if limite > 0 else self.historia
    
    def obtener_historia_formateada(self, incluir_metadatos: bool = False) -> str:
        """
        Obtiene la historia formateada como texto para depuración o revisión.
        
        Args:
            incluir_metadatos: Si se incluyen metadatos completos
        
        Returns:
            Historia formateada como texto
        """
        resultado = []
        for evento in self.historia:
            timestamp = datetime.fromisoformat(evento["timestamp"]).strftime("%H:%M:%S")
            origen = evento["origen"].upper()
            tipo = evento["tipo"]
            
            if tipo == "mensaje":
                contenido = str(evento["contenido"])
                resultado.append(f"[{timestamp}] {origen}: {contenido}")
            
            elif tipo == "herramienta":
                nombre = evento["metadatos"].get("nombre_herramienta", "desconocida")
                # Para herramientas, intentamos mostrar el resultado formateado
                if isinstance(evento["contenido"], dict):
                    # Asumimos que el contenido tiene la estructura estándar
                    if "tool" in evento["contenido"]:
                        from mcp.tools import formatear_resultado_herramienta
                        contenido_formateado = formatear_resultado_herramienta(evento["contenido"])
                        resultado.append(f"[{timestamp}] HERRAMIENTA {nombre}:\n{contenido_formateado}")
                    else:
                        contenido_str = json.dumps(evento["contenido"], indent=2, ensure_ascii=False)
                        resultado.append(f"[{timestamp}] HERRAMIENTA {nombre}:\n{contenido_str}")
                else:
                    resultado.append(f"[{timestamp}] HERRAMIENTA {nombre}: {evento['contenido']}")
            
            elif tipo == "respuesta":
                contenido = str(evento["contenido"])
                razonamiento = evento["metadatos"].get("razonamiento", "")
                
                if razonamiento and incluir_metadatos:
                    resultado.append(f"[{timestamp}] MCP (razonamiento): {razonamiento}")
                
                resultado.append(f"[{timestamp}] MCP: {contenido}")
            
            elif tipo == "bloque_conversacion":
                # Formato especial para bloques de conversación
                actor = evento["metadatos"].get("actor", "desconocido").upper()
                prioridad = evento["metadatos"].get("priority", "medium")
                contenido = str(evento["contenido"])
                
                resultado.append(f"[{timestamp}] BLOQUE {actor} ({prioridad}): {contenido}")
            
            else:
                # Para otros tipos de eventos
                if incluir_metadatos:
                    metadatos_str = json.dumps(evento["metadatos"], ensure_ascii=False)
                    resultado.append(f"[{timestamp}] {origen} ({tipo}): {evento['contenido']} - {metadatos_str}")
                else:
                    resultado.append(f"[{timestamp}] {origen} ({tipo}): {evento['contenido']}")
        
        return "\n".join(resultado)
    
    def obtener_memoria_formateada(self) -> str:
        """
        Obtiene la memoria formateada como texto para depuración.
        
        Returns:
            Memoria formateada como texto
        """
        resultado = ["=== MEMORIA CORTO PLAZO ==="]
        
        for bloque in self.short_term_memory:
            timestamp = datetime.fromisoformat(bloque["timestamp"]).strftime("%H:%M:%S")
            resultado.append(f"[{timestamp}] {bloque['actor'].upper()} ({bloque['priority']}): {bloque['text']}")
        
        if self.memory_config[self.user_role]["use_long_term_memory"]:
            resultado.append("\n=== MEMORIA LARGO PLAZO ===")
            
            for bloque in self.long_term_memory:
                timestamp = datetime.fromisoformat(bloque["timestamp"]).strftime("%H:%M:%S")
                resultado.append(f"[{timestamp}] {bloque['actor'].upper()} ({bloque['priority']}): {bloque['text']}")
        
        return "\n".join(resultado)
    
    def exportar_json(self) -> str:
        """Exporta el contexto completo como JSON."""
        return json.dumps({
            "paciente": self.paciente,
            "visita": self.visita,
            "user_role": self.user_role,
            "historia": self.historia,
            "metricas": self.metricas,
            "short_term_memory": self.short_term_memory,
            "long_term_memory": self.long_term_memory
        }, indent=2, ensure_ascii=False)
    
    def finalizar_sesion(self, motivo: str = "completada") -> None:
        """
        Finaliza la sesión actual, actualizando estado y métricas.
        
        Args:
            motivo: Razón de finalización (completada, cancelada, error)
        """
        self.visita["estado"] = motivo
        self.agregar_evento("sistema", "fin_sesion", motivo)
        
        # Calcular duración de la sesión
        inicio = datetime.fromisoformat(self.metricas["tiempo_inicio"])
        fin = datetime.now()
        duracion_segundos = (fin - inicio).total_seconds()
        
        self.metricas["tiempo_fin"] = fin.isoformat()
        self.metricas["duracion_segundos"] = duracion_segundos
    
    @classmethod
    def desde_json(cls, json_str: str) -> 'MCPContext':
        """
        Crea una instancia de MCPContext desde un string JSON.
        
        Args:
            json_str: String JSON con datos del contexto
            
        Returns:
            Nueva instancia de MCPContext
        """
        datos = json.loads(json_str)
        
        # Crear instancia con datos básicos
        contexto = cls(
            paciente_id=datos["paciente"]["id"],
            paciente_nombre=datos["paciente"]["nombre"],
            visita_id=datos["visita"]["id"],
            profesional_email=datos["visita"]["profesional_email"],
            motivo_consulta=datos["visita"]["motivo_consulta"],
            user_role=datos.get("user_role", "health_professional"),
            datos_iniciales=datos["paciente"].get("datos", {})
        )
        
        # Sobrescribir historia importada
        contexto.historia = datos["historia"]
        contexto.metricas = datos["metricas"]
        contexto.visita = datos["visita"]
        
        # Cargar memorias si existen
        if "short_term_memory" in datos:
            contexto.short_term_memory = datos["short_term_memory"]
        
        if "long_term_memory" in datos:
            contexto.long_term_memory = datos["long_term_memory"]
        
        return contexto


# Funciones auxiliares para manejar el contexto

def crear_contexto_desde_peticion(datos_peticion: Dict[str, Any]) -> MCPContext:
    """
    Crea un nuevo contexto MCP a partir de los datos de una petición.
    
    Args:
        datos_peticion: Datos recibidos en la petición de inicio
        
    Returns:
        Nuevo contexto MCP inicializado
    """
    # Extraer campos requeridos
    paciente_id = datos_peticion.get("paciente_id", "")
    paciente_nombre = datos_peticion.get("paciente_nombre", "")
    visita_id = datos_peticion.get("visita_id", "")
    profesional_email = datos_peticion.get("profesional_email", "")
    motivo_consulta = datos_peticion.get("motivo_consulta", "")
    
    # Obtener rol de usuario (por defecto, profesional de salud)
    user_role = datos_peticion.get("user_role", "health_professional")
    
    # Datos adicionales del paciente (opcional)
    datos_paciente = datos_peticion.get("datos_paciente", {})
    
    # Crear y retornar el nuevo contexto
    return MCPContext(
        paciente_id=paciente_id,
        paciente_nombre=paciente_nombre,
        visita_id=visita_id,
        profesional_email=profesional_email,
        motivo_consulta=motivo_consulta,
        user_role=user_role,
        datos_iniciales=datos_paciente
    ) 