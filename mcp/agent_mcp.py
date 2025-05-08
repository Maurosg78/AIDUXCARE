"""
Agente MCP principal para AiDuxCare.

Este módulo implementa el agente MCP (Model Context Protocol) que:
1. Mantiene un contexto con memoria de la sesión
2. Ejecuta herramientas clínicas según necesidad
3. Genera respuestas contextualizadas
4. Registra todas las acciones para trazabilidad
5. Utiliza memoria adaptativa por rol para optimizar tokens

La arquitectura está diseñada para facilitar la migración a Langraph en el futuro.
"""

import os
import sys
import json
import time
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Callable, Union, Set

# Importar herramientas y contexto
from mcp.tools import (
    sugerir_diagnostico_clinico,
    evaluar_riesgo_legal,
    recordar_visitas_anteriores,
    formatear_resultado_herramienta
)
from mcp.context import MCPContext, crear_contexto_desde_peticion, ActorType, PriorityLevel


# Constantes para el agente MCP
SYSTEM_PROMPT = """
Eres un copiloto clínico que asiste a profesionales de la salud.
Tu misión es proporcionar respuestas precisas, basadas en evidencia y éticamente responsables.
Debes mantener la confidencialidad del paciente y cumplir las normativas clínicas.
Cuando necesites información adicional, puedes usar herramientas específicas.
"""

# Catálogo de herramientas disponibles para el agente
HERRAMIENTAS_DISPONIBLES = {
    "sugerir_diagnostico_clinico": {
        "funcion": sugerir_diagnostico_clinico,
        "descripcion": "Sugiere posibles diagnósticos basados en síntomas y antecedentes",
        "parametros": ["motivo_consulta", "sintomas", "antecedentes"]
    },
    "evaluar_riesgo_legal": {
        "funcion": evaluar_riesgo_legal,
        "descripcion": "Evalúa riesgos legales del tratamiento propuesto",
        "parametros": ["diagnostico", "tratamiento_propuesto", "consentimiento_informado", "condiciones_especiales"]
    },
    "recordar_visitas_anteriores": {
        "funcion": recordar_visitas_anteriores,
        "descripcion": "Recupera información de visitas anteriores del paciente",
        "parametros": ["paciente_id", "limite"]
    }
}


class MCPAgent:
    """
    Agente MCP para asistencia clínica en AiDuxCare.
    
    Maneja:
    - Contexto y estado de la sesión
    - Ejecución de herramientas
    - Generación de respuestas
    - Trazabilidad de acciones
    - Memoria adaptativa por rol
    """
    
    def __init__(
        self,
        contexto: MCPContext,
        max_iteraciones: int = 5,
        simulacion_llm: Optional[Callable] = None,
        config: Optional[Dict[str, Any]] = None
    ):
        """
        Inicializa un nuevo agente MCP.
        
        Args:
            contexto: Contexto MCP activo
            max_iteraciones: Número máximo de iteraciones de razonamiento
            simulacion_llm: Función opcional para simular respuestas LLM
            config: Configuración adicional según rol de usuario
        """
        self.contexto = contexto
        self.max_iteraciones = max_iteraciones
        self.simulacion_llm = simulacion_llm or self._simulador_llm_por_defecto
        
        # Configuración por defecto
        self.config = {
            "herramientas_permitidas": list(HERRAMIENTAS_DISPONIBLES.keys()),
            "mostrar_razonamiento": True,
            "nivel_detalle": "alto",
            "formato_respuesta": "clinico",
            "max_tokens_memoria": 300  # Límite por defecto de tokens para memoria en prompts
        }
        
        # Actualizar con configuración personalizada
        if config:
            self.config.update(config)
            
        # Registrar iniciación del agente con la configuración
        if hasattr(contexto, 'user_role'):
            self.contexto.agregar_evento(
                origen="sistema", 
                tipo="inicializacion", 
                contenido=f"Agente MCP inicializado para rol: {contexto.user_role}",
                metadatos={"config": self.config}
            )
    
    def procesar_mensaje(self, mensaje: str) -> str:
        """
        Procesa un mensaje de entrada y genera una respuesta.
        
        Args:
            mensaje: Mensaje de texto del usuario
            
        Returns:
            Respuesta generada por el agente
        """
        # Registrar mensaje entrante en el contexto
        self.contexto.agregar_mensaje_usuario(mensaje)
        
        # Detectar actor por defecto según rol de usuario
        actor: ActorType = "professional"
        if self.contexto.user_role == "patient":
            actor = "patient"
        
        # Procesar el mensaje como bloque de conversación
        # Se asume prioridad media por defecto, se analizará en el razonamiento
        self.contexto.agregar_bloque_conversacion(
            actor=actor,
            texto=mensaje,
            prioridad=self._determinar_prioridad_mensaje(mensaje)
        )
        
        # Ejecutar ciclo de razonamiento
        return self._ejecutar_ciclo_razonamiento(mensaje)
    
    def _ejecutar_ciclo_razonamiento(self, mensaje_entrada: str) -> str:
        """
        Ejecuta el ciclo principal de razonamiento del agente.
        
        Args:
            mensaje_entrada: Mensaje inicial para procesar
            
        Returns:
            Respuesta final generada
        """
        iteraciones = 0
        
        # Extraer información relevante del contexto para el razonamiento
        paciente_id = self.contexto.paciente["id"]
        paciente_nombre = self.contexto.paciente["nombre"]
        motivo_consulta = self.contexto.visita["motivo_consulta"]
        
        # Si el mensaje de entrada menciona herramientas específicas, analizarlo
        herramientas_mencionadas = self._extraer_herramientas_de_mensaje(mensaje_entrada)
        
        # Iniciar cadena de razonamiento
        razonamiento = [
            f"Mensaje recibido sobre paciente {paciente_nombre} (ID: {paciente_id}).",
            f"Motivo de consulta: {motivo_consulta}",
            "Analizando mensaje para determinar respuesta adecuada y herramientas necesarias..."
        ]
        
        # Obtener bloques de memoria relevantes según rol
        bloques_memoria = self.contexto.filter_relevant_blocks(
            max_tokens=self.config.get("max_tokens_memoria", 300)
        )
        
        if bloques_memoria:
            # Añadir información de bloques de memoria al razonamiento
            razonamiento.append(f"Utilizando {len(bloques_memoria)} bloques de memoria relevantes:")
            for idx, bloque in enumerate(bloques_memoria[-3:]):  # Mostrar solo últimos 3 para no saturar logs
                razonamiento.append(f"  - {bloque['actor'].upper()} ({bloque['priority']}): {bloque['text'][:50]}...")
            
            if len(bloques_memoria) > 3:
                razonamiento.append(f"  - Y {len(bloques_memoria) - 3} bloques más...")
        else:
            razonamiento.append("No hay bloques de memoria relevantes para este contexto.")
        
        # Preparamos respuesta final
        respuesta_final = ""
        
        # Ejecutar iteraciones de razonamiento
        while iteraciones < self.max_iteraciones:
            iteraciones += 1
            
            # Determinar qué herramientas usar según el contexto y mensaje
            herramientas_a_usar = self._seleccionar_herramientas(
                mensaje_entrada, herramientas_mencionadas, iteraciones
            )
            
            # Si no hay más herramientas a usar, generar respuesta final
            if not herramientas_a_usar:
                razonamiento.append("No se requieren más herramientas. Generando respuesta final.")
                respuesta_final = self._generar_respuesta_final(razonamiento, bloques_memoria)
                break
            
            # Ejecutar cada herramienta seleccionada
            for nombre_herramienta, args in herramientas_a_usar:
                razonamiento.append(f"Ejecutando herramienta: {nombre_herramienta} con argumentos: {args}")
                
                # Ejecutar y registrar resultado
                resultado = self._ejecutar_herramienta(nombre_herramienta, args)
                
                # Actualizar razonamiento con resultado
                resultado_formateado = formatear_resultado_herramienta(resultado)
                razonamiento.append(f"Resultado:\n{resultado_formateado}")
                
                # Añadir resultado a la memoria con prioridad alta si contiene info relevante
                if resultado and "contenido" in resultado and resultado.get("status") == "success":
                    contenido_resultado = resultado.get("contenido", "")
                    if isinstance(contenido_resultado, str) and len(contenido_resultado) > 20:
                        self.contexto.agregar_bloque_conversacion(
                            actor="system",
                            texto=f"Resultado de {nombre_herramienta}: {contenido_resultado[:200]}...",
                            prioridad="high"
                        )
            
            # Simular análisis del LLM sobre los resultados obtenidos
            siguiente_paso = self._decidir_siguiente_paso(razonamiento, iteraciones, bloques_memoria)
            razonamiento.append(f"Análisis: {siguiente_paso}")
            
            # Si se indica generar respuesta final, terminar ciclo
            if "RESPUESTA_FINAL" in siguiente_paso:
                respuesta_final = self._generar_respuesta_final(razonamiento, bloques_memoria)
                break
        
        # Si se llegó al límite de iteraciones sin respuesta, generar una de emergencia
        if not respuesta_final:
            razonamiento.append("Se alcanzó el límite de iteraciones sin respuesta definitiva.")
            respuesta_final = self._generar_respuesta_final(razonamiento, bloques_memoria, emergencia=True)
        
        # Registrar respuesta en el contexto
        razonamiento_str = "\n".join(razonamiento)
        self.contexto.agregar_respuesta_mcp(respuesta_final, razonamiento_str)
        
        # Registrar la respuesta como un bloque de memoria de alta prioridad
        self.contexto.agregar_bloque_conversacion(
            actor="professional",
            texto=respuesta_final,
            prioridad="high"
        )
        
        return respuesta_final
    
    def _extraer_herramientas_de_mensaje(self, mensaje: str) -> List[str]:
        """
        Extrae menciones a herramientas específicas del mensaje.
        
        Args:
            mensaje: Mensaje de entrada
            
        Returns:
            Lista de nombres de herramientas mencionadas
        """
        # Buscar menciones a herramientas conocidas
        herramientas_mencionadas = []
        mensaje_lower = mensaje.lower()
        
        palabras_clave = {
            "sugerir_diagnostico_clinico": ["diagnóstico", "diagnostico", "diagnósticos", "diagnosticar"],
            "evaluar_riesgo_legal": ["riesgo", "legal", "consentimiento", "normativa"],
            "recordar_visitas_anteriores": ["visita", "anterior", "historial", "previas"]
        }
        
        for herramienta, keywords in palabras_clave.items():
            if any(kw in mensaje_lower for kw in keywords):
                herramientas_mencionadas.append(herramienta)
        
        return herramientas_mencionadas
    
    def _seleccionar_herramientas(
        self, 
        mensaje: str, 
        herramientas_mencionadas: List[str],
        iteracion: int
    ) -> List[Tuple[str, Dict[str, Any]]]:
        """
        Determina qué herramientas ejecutar según el contexto y mensaje.
        
        Args:
            mensaje: Mensaje del usuario
            herramientas_mencionadas: Herramientas explícitamente mencionadas
            iteracion: Número de iteración actual
            
        Returns:
            Lista de tuplas con (nombre_herramienta, argumentos)
        """
        herramientas_a_usar = []
        mensaje_lower = mensaje.lower()
        
        # Datos del contexto que pueden ser útiles para las herramientas
        paciente_id = self.contexto.paciente["id"]
        
        # Obtener herramientas permitidas según la configuración
        herramientas_permitidas = set(self.config.get("herramientas_permitidas", []))
        
        # Lógica de selección según el rol de usuario
        user_role = self.contexto.user_role if hasattr(self.contexto, 'user_role') else "health_professional"
        
        # Log para depuración
        self.contexto.agregar_evento(
            "sistema",
            "seleccion_herramientas",
            f"Seleccionando herramientas para rol: {user_role}",
            {"iteracion": iteracion, "herramientas_permitidas": list(herramientas_permitidas)}
        )
        
        # Filtrar herramientas según permisos del rol
        herramientas_mencionadas_filtradas = [h for h in herramientas_mencionadas if h in herramientas_permitidas]
        
        # Lógica de selección según el contenido del mensaje y la iteración
        if iteracion == 1:
            # En la primera iteración, priorizamos recordar visitas si no es la primera
            if ("recordar_visitas_anteriores" in herramientas_mencionadas_filtradas or "historial" in mensaje_lower) and "recordar_visitas_anteriores" in herramientas_permitidas:
                herramientas_a_usar.append((
                    "recordar_visitas_anteriores",
                    {"paciente_id": paciente_id, "limite": 3}
                ))
        
        # Si se menciona dolor o síntomas, sugerir diagnóstico (solo para profesionales)
        if (iteracion <= 2 and
            ("sugerir_diagnostico_clinico" in herramientas_mencionadas_filtradas or 
             any(kw in mensaje_lower for kw in ["dolor", "molestia", "síntoma", "sintoma"])) and
            "sugerir_diagnostico_clinico" in herramientas_permitidas):
            
            # Extraer síntomas del mensaje (simplificado)
            sintomas = self._extraer_sintomas_de_mensaje(mensaje)
            
            herramientas_a_usar.append((
                "sugerir_diagnostico_clinico",
                {
                    "motivo_consulta": self.contexto.visita["motivo_consulta"],
                    "sintomas": sintomas,
                    "antecedentes": []
                }
            ))
        
        # Si se menciona tratamiento, evaluar riesgo legal (solo para profesionales y admin)
        if (iteracion >= 2 and
            ("evaluar_riesgo_legal" in herramientas_mencionadas_filtradas or
             any(kw in mensaje_lower for kw in ["tratamiento", "terapia", "manipulación", "manipulacion"])) and
            "evaluar_riesgo_legal" in herramientas_permitidas):
            
            # Extraer un posible tratamiento del mensaje (simplificado)
            tratamiento = self._extraer_tratamiento_de_mensaje(mensaje)
            
            herramientas_a_usar.append((
                "evaluar_riesgo_legal",
                {
                    "diagnostico": self._obtener_ultimo_diagnostico() or "No especificado",
                    "tratamiento_propuesto": tratamiento,
                    "consentimiento_informado": "consentimiento" in mensaje_lower,
                    "condiciones_especiales": []
                }
            ))
        
        return herramientas_a_usar
    
    def _ejecutar_herramienta(
        self, 
        nombre_herramienta: str, 
        argumentos: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Ejecuta una herramienta con los argumentos proporcionados.
        
        Args:
            nombre_herramienta: Nombre de la herramienta a ejecutar
            argumentos: Argumentos para la herramienta
            
        Returns:
            Resultado de la herramienta
        """
        # Verificar que la herramienta existe
        if nombre_herramienta not in HERRAMIENTAS_DISPONIBLES:
            resultado = {
                "error": f"Herramienta '{nombre_herramienta}' no encontrada",
                "timestamp": datetime.now().isoformat(),
                "tool": "error"
            }
        else:
            try:
                # Obtener función de la herramienta
                funcion = HERRAMIENTAS_DISPONIBLES[nombre_herramienta]["funcion"]
                
                # Ejecutar función con argumentos
                resultado = funcion(**argumentos)
                
            except Exception as e:
                # Capturar errores de ejecución
                resultado = {
                    "error": f"Error ejecutando {nombre_herramienta}: {str(e)}",
                    "timestamp": datetime.now().isoformat(),
                    "tool": nombre_herramienta,
                    "inputs": argumentos
                }
        
        # Registrar uso de herramienta en el contexto
        self.contexto.agregar_resultado_herramienta(
            nombre_herramienta=nombre_herramienta,
            argumentos=argumentos,
            resultado=resultado
        )
        
        return resultado
    
    def _decidir_siguiente_paso(self, razonamiento: List[str], iteracion: int, bloques_memoria: List[Dict[str, Any]]) -> str:
        """
        Determina el siguiente paso en el razonamiento.
        
        Args:
            razonamiento: Lista de pasos de razonamiento hasta ahora
            iteracion: Número de iteración actual
            bloques_memoria: Lista de bloques de memoria relevantes
            
        Returns:
            Decisión sobre el siguiente paso
        """
        # En un sistema real, esto sería una llamada a un LLM
        # Para la versión simulada, usamos lógica programática
        
        # Obtener el rol de usuario y herramientas permitidas
        user_role = self.contexto.user_role if hasattr(self.contexto, 'user_role') else "health_professional"
        herramientas_permitidas = set(self.config.get("herramientas_permitidas", []))
        
        # Si es la última iteración posible, forzar respuesta final
        if iteracion >= self.max_iteraciones - 1:
            return "RESPUESTA_FINAL: Hemos recopilado suficiente información para responder."
        
        # Comprobar si se han usado herramientas principales
        herramientas_usadas = set()
        for paso in razonamiento:
            if paso.startswith("Ejecutando herramienta:"):
                nombre = paso.split("Ejecutando herramienta:")[1].split("con argumentos")[0].strip()
                herramientas_usadas.add(nombre)
        
        # Lógica adaptada según el rol
        if user_role == "patient":
            # Pacientes solo necesitan información básica de visitas anteriores
            if "recordar_visitas_anteriores" in herramientas_usadas:
                return "RESPUESTA_FINAL: Se ha obtenido el historial de visitas anteriores para el paciente."
            elif "recordar_visitas_anteriores" in herramientas_permitidas:
                return "El paciente necesita conocer su historial de visitas."
        
        elif user_role == "admin_staff":
            # Administrativos necesitan visitas y posibles consideraciones legales
            if "recordar_visitas_anteriores" in herramientas_usadas and "evaluar_riesgo_legal" in herramientas_usadas:
                return "RESPUESTA_FINAL: Se ha obtenido información administrativa completa para la gestión del caso."
            elif "recordar_visitas_anteriores" not in herramientas_usadas and "recordar_visitas_anteriores" in herramientas_permitidas:
                return "Es necesario verificar el historial de visitas del paciente para la gestión administrativa."
            elif "evaluar_riesgo_legal" not in herramientas_usadas and "evaluar_riesgo_legal" in herramientas_permitidas:
                return "Debemos evaluar posibles consideraciones legales para el registro administrativo."
        
        else:  # health_professional
            # Profesionales necesitan diagnóstico y evaluación de riesgos
            # Si ya se han usado ambas herramientas principales, generar respuesta
            if ("sugerir_diagnostico_clinico" in herramientas_usadas and 
                "evaluar_riesgo_legal" in herramientas_usadas):
                return "RESPUESTA_FINAL: Se han obtenido diagnósticos y evaluación de riesgos. Podemos formular una respuesta completa."
            
            # Si solo se ha usado una herramienta principal, sugerir la otra
            if ("sugerir_diagnostico_clinico" in herramientas_usadas and 
                "evaluar_riesgo_legal" not in herramientas_usadas and 
                "evaluar_riesgo_legal" in herramientas_permitidas):
                return "Tenemos diagnósticos potenciales, pero debemos evaluar riesgos legales del posible tratamiento."
            
            if ("sugerir_diagnostico_clinico" not in herramientas_usadas and 
                "evaluar_riesgo_legal" in herramientas_usadas and 
                "sugerir_diagnostico_clinico" in herramientas_permitidas):
                return "Hemos evaluado riesgos legales, pero necesitamos confirmar diagnósticos posibles."
            
            # Si no se ha usado ninguna herramienta principal, priorizar diagnóstico
            if not herramientas_usadas:
                if "sugerir_diagnostico_clinico" in herramientas_permitidas:
                    return "No se ha utilizado ninguna herramienta. Debemos primero obtener diagnósticos posibles."
                elif "recordar_visitas_anteriores" in herramientas_permitidas:
                    return "Es importante revisar el historial del paciente antes de continuar."
        
        # Por defecto, seguir con la iteración
        return f"Continuando análisis en iteración {iteracion+1} para rol {user_role}"
    
    def _generar_respuesta_final(
        self, 
        razonamiento: List[str], 
        bloques_memoria: List[Dict[str, Any]],
        emergencia: bool = False
    ) -> str:
        """
        Genera la respuesta final basada en el razonamiento.
        
        Args:
            razonamiento: Lista de pasos de razonamiento
            bloques_memoria: Lista de bloques de memoria relevantes
            emergencia: Si es una respuesta de emergencia por límite de iteraciones
            
        Returns:
            Respuesta generada
        """
        # En un sistema real, esto sería otra llamada al LLM
        # Para la simulación, construimos una respuesta basada en los resultados
        
        # Extraer información relevante del razonamiento
        diagnosticos = []
        riesgos_legales = []
        visitas_previas = []
        
        for paso in razonamiento:
            if "SUGERENCIA DIAGNÓSTICA" in paso:
                diagnosticos.append(paso)
            if "EVALUACIÓN DE RIESGO LEGAL" in paso:
                riesgos_legales.append(paso)
            if "VISITAS ANTERIORES" in paso:
                visitas_previas.append(paso)
        
        # Obtener el rol de usuario y la configuración
        user_role = self.contexto.user_role if hasattr(self.contexto, 'user_role') else "health_professional"
        nivel_detalle = self.config.get("nivel_detalle", "alto")
        formato_respuesta = self.config.get("formato_respuesta", "clinico")
        
        # Construir respuesta según la información disponible
        paciente_nombre = self.contexto.paciente["nombre"]
        
        partes_respuesta = []
        
        # Introducción adaptada según rol
        if user_role == "patient":
            intro = f"Hola {paciente_nombre}, respecto a tu consulta:"
        elif user_role == "admin_staff":
            intro = f"Información sobre el paciente {paciente_nombre} para gestión administrativa:"
        else:  # health_professional
            intro = f"Respecto a la consulta del paciente {paciente_nombre}:"
        
        partes_respuesta.append(intro)
        
        # Resumen de visitas anteriores si existen (disponible para todos los roles)
        if visitas_previas:
            if user_role == "patient":
                partes_respuesta.append("Basado en tus visitas anteriores:")
            else:
                partes_respuesta.append("Basado en su historial de visitas:")
                
            for v in visitas_previas:
                # Extraer solo las partes relevantes del texto
                lineas = v.split("\n")
                for i, linea in enumerate(lineas):
                    if i > 0 and i < 4:  # Omitir cabecera y tomar solo las primeras visitas
                        partes_respuesta.append(f"- {linea.strip()}")
        
        # Diagnósticos si existen (adaptados según rol)
        if diagnosticos and (user_role != "admin_staff" or nivel_detalle == "alto"):
            for d in diagnosticos:
                # Extraer la información principal
                lineas = d.split("\n")
                principal = None
                secundarios = None
                
                for linea in lineas:
                    if "Principal:" in linea:
                        principal = linea.split("Principal:")[1].strip()
                    if "Secundarios:" in linea:
                        secundarios = linea.split("Secundarios:")[1].strip()
                
                if principal:
                    if user_role == "patient":
                        partes_respuesta.append(f"El profesional de salud considera que podrías presentar {principal}.")
                    elif user_role == "admin_staff":
                        partes_respuesta.append(f"Diagnóstico registrado: {principal}")
                    else:  # health_professional
                        partes_respuesta.append(f"El diagnóstico principal sugerido es {principal}.")
                
                if secundarios and secundarios != "" and user_role != "patient":
                    if user_role == "admin_staff":
                        partes_respuesta.append(f"Diagnósticos alternativos: {secundarios}")
                    else:  # health_professional
                        partes_respuesta.append(f"También se deben considerar: {secundarios}.")
        
        # Recomendaciones de riesgo legal si existen (solo para profesionales y admin)
        if riesgos_legales and user_role != "patient":
            for r in riesgos_legales:
                nivel = "BAJO"
                if "NIVEL ALTO" in r:
                    nivel = "ALTO"
                    if user_role == "admin_staff":
                        partes_respuesta.append("⚠️ ALERTA: Aspectos legales importantes a considerar:")
                    else:
                        partes_respuesta.append("⚠️ Es importante considerar los siguientes aspectos de riesgo legal:")
                elif "NIVEL MEDIO" in r:
                    nivel = "MEDIO"
                    partes_respuesta.append("Se deben tener en cuenta los siguientes aspectos legales:")
                else:
                    if user_role == "admin_staff":
                        partes_respuesta.append("Consideraciones administrativas:")
                    else:
                        partes_respuesta.append("Desde el punto de vista legal, se recomienda:")
                
                # Extraer recomendaciones
                if "Recomendaciones:" in r:
                    recomendaciones = r.split("Recomendaciones:")[1].split("\n")
                    for recomendacion in recomendaciones:
                        if recomendacion.strip() and recomendacion.strip().startswith("-"):
                            partes_respuesta.append(f"{recomendacion.strip()}")
        
        # Si no hay suficiente información, dar respuesta genérica adaptada al rol
        if len(partes_respuesta) <= 1 or emergencia:
            partes_respuesta = [intro]
            
            if user_role == "patient":
                partes_respuesta.append("Con la información disponible, recomendaría:")
                partes_respuesta.append("- Seguir las indicaciones de tu profesional de salud")
                partes_respuesta.append("- Mantener un registro de tus síntomas")
                partes_respuesta.append("- Consultar nuevamente si los síntomas persisten o empeoran")
            elif user_role == "admin_staff":
                partes_respuesta.append("Para la correcta gestión administrativa del caso, se sugiere:")
                partes_respuesta.append("- Verificar la información completa del paciente")
                partes_respuesta.append("- Programar seguimiento según protocolo")
                partes_respuesta.append("- Actualizar registros con la información más reciente")
            else:  # health_professional
                partes_respuesta.append("Basado en la información proporcionada, recomiendo:")
                partes_respuesta.append("- Realizar una evaluación clínica completa")
                partes_respuesta.append("- Documentar exhaustivamente los hallazgos")
                partes_respuesta.append("- Considerar las guías clínicas actualizadas para este caso")
                partes_respuesta.append("\nPara un diagnóstico preciso, necesitaría más detalles sobre los síntomas específicos del paciente.")
        
        # Finalización adaptada al rol
        if user_role == "patient":
            partes_respuesta.append("\nRecuerda que esta información no reemplaza la consulta con tu profesional de salud.")
        elif user_role == "admin_staff":
            partes_respuesta.append("\nLa información proporcionada está sujeta a actualización en futuras visitas.")
        else:  # health_professional
            partes_respuesta.append("\nEstoy disponible para asistir con cualquier otra consulta relacionada con este caso.")
        
        return "\n".join(partes_respuesta)
    
    def _extraer_sintomas_de_mensaje(self, mensaje: str) -> List[str]:
        """
        Extrae posibles síntomas de un mensaje (versión simplificada).
        
        Args:
            mensaje: Mensaje a analizar
            
        Returns:
            Lista de síntomas extraídos
        """
        # En un sistema real, esto usaría NLP
        # En esta simulación, buscamos palabras clave
        
        sintomas_comunes = [
            "dolor", "inflamación", "inflamacion", "rigidez", "debilidad",
            "entumecimiento", "limitación", "limitacion", "dificultad",
            "mareo", "cervical", "lumbar", "rodilla", "hombro", "cadera"
        ]
        
        mensaje_lower = mensaje.lower()
        sintomas_encontrados = []
        
        for sintoma in sintomas_comunes:
            if sintoma in mensaje_lower:
                # Encontrar contexto alrededor del síntoma
                indice = mensaje_lower.find(sintoma)
                inicio = max(0, indice - 20)
                fin = min(len(mensaje_lower), indice + len(sintoma) + 20)
                contexto = mensaje_lower[inicio:fin]
                
                # Limpiar y añadir
                contexto = contexto.replace(".", "").replace(",", "").strip()
                if "no " + sintoma not in contexto and "sin " + sintoma not in contexto:
                    sintomas_encontrados.append(contexto)
        
        # Si no se encontró ninguno, añadir el motivo de consulta como síntoma genérico
        if not sintomas_encontrados:
            sintomas_encontrados.append(self.contexto.visita["motivo_consulta"])
        
        return sintomas_encontrados
    
    def _extraer_tratamiento_de_mensaje(self, mensaje: str) -> str:
        """
        Extrae posible tratamiento mencionado en un mensaje (versión simplificada).
        
        Args:
            mensaje: Mensaje a analizar
            
        Returns:
            Tratamiento extraído o texto genérico
        """
        # Palabras clave de tratamientos comunes en fisioterapia
        tratamientos_comunes = [
            "manipulación", "manipulacion", "movilización", "movilizacion",
            "ejercicios", "electroterapia", "ultrasonido", "masaje",
            "calor", "frío", "frio", "tracción", "traccion", "acupuntura",
            "láser", "laser", "tens", "vendaje", "kinesiotape", "estiramiento"
        ]
        
        mensaje_lower = mensaje.lower()
        
        for tratamiento in tratamientos_comunes:
            if tratamiento in mensaje_lower:
                # Extraer contexto alrededor del tratamiento
                indice = mensaje_lower.find(tratamiento)
                inicio = max(0, indice - 30)
                fin = min(len(mensaje_lower), indice + len(tratamiento) + 30)
                contexto = mensaje[inicio:fin]  # Usar mensaje original para mantener mayúsculas
                
                # Limpiar y retornar
                return contexto.strip()
        
        # Si no se encuentra un tratamiento específico
        return "Tratamiento no especificado claramente"
    
    def _obtener_ultimo_diagnostico(self) -> Optional[str]:
        """
        Obtiene el último diagnóstico mencionado en la historia.
        
        Returns:
            Texto del diagnóstico o None si no hay
        """
        # Buscar en la historia en orden inverso
        for evento in reversed(self.contexto.historia):
            if evento["tipo"] == "herramienta" and "nombre_herramienta" in evento["metadatos"]:
                if evento["metadatos"]["nombre_herramienta"] == "sugerir_diagnostico_clinico":
                    if isinstance(evento["contenido"], dict) and "diagnósticos" in evento["contenido"]:
                        return evento["contenido"]["diagnósticos"].get("principal", None)
        
        return None
    
    def _simulador_llm_por_defecto(self, prompt: str) -> str:
        """
        Simulador simple de respuestas LLM para pruebas.
        
        Args:
            prompt: Texto de entrada
            
        Returns:
            Respuesta simulada
        """
        # Este es un simulador muy básico que devuelve respuestas predefinidas
        # En un sistema real, aquí estaría la llamada al LLM
        
        respuestas = [
            "Basado en los síntomas descritos, podría tratarse de una cervicalgia mecánica. Recomiendo una evaluación completa.",
            "Los resultados indican un posible caso de lumbalgia inespecífica. Es importante realizar ejercicios de fortalecimiento.",
            "Considerando el historial del paciente, se debe evaluar la posibilidad de una tendinitis. Recomiendo reposo y terapia.",
            "La evaluación sugiere una condropatía rotuliana. Se recomienda un programa de rehabilitación específico."
        ]
        
        # Usar el tiempo como semilla para pseudo-aleatoriedad simple
        indice = int(time.time()) % len(respuestas)
        return respuestas[indice]

    def _determinar_prioridad_mensaje(self, mensaje: str) -> PriorityLevel:
        """
        Determina la prioridad de un mensaje según su contenido.
        
        Args:
            mensaje: Texto del mensaje a analizar
            
        Returns:
            Nivel de prioridad ("high", "medium", "low")
        """
        # Palabras clave que indican alta prioridad
        palabras_alta_prioridad = [
            "urgente", "emergencia", "importante", "crítico", "grave",
            "dolor intenso", "insoportable", "empeorando", "sangrado",
            "no puedo", "alergia", "reacción", "adversa"
        ]
        
        # Patrones que indican alta prioridad
        patrones_alta_prioridad = [
            r"dol[a-z]+ (fuerte|intens[a-z]+)",
            r"empeo(r[a-z]+|ó)",
            r"no (puedo|puede|logr[a-z]+)",
            r"urg[a-z]+",
            r"sangr[a-z]+",
            r"muri[a-z]+|fallec[a-z]+",
            r"alergi[a-z]+",
            r"(10|9|8)(\s+)?(/|de)(\s+)?10",  # Calificaciones altas de dolor (8-10/10)
        ]
        
        # Palabras clave que indican prioridad media
        palabras_media_prioridad = [
            "molestia", "dolor", "síntoma", "diagnóstico", "tratamiento",
            "medicamento", "terapia", "cambio", "nuevo", "evaluación"
        ]
        
        # Patrones de baja prioridad (frases comunes sin información clínica)
        patrones_baja_prioridad = [
            r"^(hola|buenos días|buenas tardes|buenas noches)(\s*)(\.|\,|\!)?$",
            r"^(gracias|muchas gracias|ok|perfecto|entendido)(\s*)(\.|\,|\!)?$",
            r"^(sí|no|tal vez|quizás)(\s*)(\.|\,|\!)?$",
            r"^(ok|vale|de acuerdo|comprendo)(\s*)(\.|\,|\!)?$"
        ]
        
        # Normalizar mensaje a minúsculas
        mensaje_norm = mensaje.lower()
        
        # Verificar patrones de baja prioridad primero (mensajes muy cortos y genéricos)
        if len(mensaje) < 10:
            for patron in patrones_baja_prioridad:
                if re.match(patron, mensaje_norm):
                    return "low"
        
        # Verificar palabras clave de alta prioridad
        for palabra in palabras_alta_prioridad:
            if palabra.lower() in mensaje_norm:
                return "high"
        
        # Verificar patrones de alta prioridad
        for patron in patrones_alta_prioridad:
            if re.search(patron, mensaje_norm):
                return "high"
        
        # Verificar palabras clave de prioridad media
        for palabra in palabras_media_prioridad:
            if palabra.lower() in mensaje_norm:
                return "medium"
        
        # Por defecto, asignar prioridad media a mensajes de cierta longitud, baja a muy cortos
        if len(mensaje) > 25:
            return "medium"
        else:
            return "low"

    def _generar_respuesta_predeterminada_profesional(self, razonamiento: List[str]) -> str:
        """Genera una respuesta predeterminada para profesionales de salud."""
        paciente_nombre = self.contexto.paciente["nombre"]
        motivo = self.contexto.visita["motivo_consulta"]
        
        # Extraer información relevante del razonamiento
        sintomas = self._extraer_sintomas_de_mensaje("\n".join(razonamiento))
        sintomas_texto = ", ".join(sintomas) if sintomas else "descritos"
        
        return (
            f"Basado en la evaluación de {paciente_nombre} con {motivo}, "
            f"y considerando los síntomas {sintomas_texto}, "
            f"sería recomendable realizar una valoración completa para confirmar diagnóstico. "
            f"Considere los posibles factores contribuyentes y documente cuidadosamente la evolución."
        )
    
    def _generar_respuesta_predeterminada_paciente(self, razonamiento: List[str]) -> str:
        """Genera una respuesta predeterminada simplificada para pacientes."""
        motivo = self.contexto.visita["motivo_consulta"]
        
        return (
            f"Entiendo su preocupación sobre {motivo}. "
            f"Es importante que continúe siguiendo las indicaciones de su profesional de salud. "
            f"Si los síntomas empeoran, contacte con su médico o acuda a urgencias."
        )
    
    def _generar_respuesta_predeterminada_admin(self, razonamiento: List[str]) -> str:
        """Genera una respuesta predeterminada para personal administrativo."""
        paciente_nombre = self.contexto.paciente["nombre"]
        visita_id = self.contexto.visita["id"]
        
        return (
            f"Para el paciente {paciente_nombre} (visita {visita_id}), "
            f"se recomienda seguir el protocolo administrativo estándar. "
            f"Asegúrese de completar toda la documentación necesaria y verificar que "
            f"los consentimientos estén debidamente firmados."
        )


def ejecutar_shell_interactivo():
    """Ejecuta un shell interactivo para probar el agente MCP."""
    print("\n" + "="*80)
    print(" "*30 + "AGENTE MCP AIDUXCARE")
    print("="*80 + "\n")
    
    print("Inicializando agente MCP para simulación interactiva...")
    
    # Crear contexto de ejemplo
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente"
    )
    
    # Crear agente
    agente = MCPAgent(contexto)
    
    print("\nContexto inicializado:")
    print(f"Paciente: {contexto.paciente['nombre']} (ID: {contexto.paciente['id']})")
    print(f"Visita: {contexto.visita['id']} - Motivo: {contexto.visita['motivo_consulta']}")
    print("\nEscriba sus mensajes y el agente responderá. Escriba 'salir' para terminar.\n")
    
    while True:
        try:
            mensaje = input("\n>>> ")
            
            if mensaje.lower() in ["salir", "exit", "quit", "q"]:
                break
            
            if not mensaje.strip():
                continue
            
            # Procesar mensaje con el agente
            print("\nProcesando mensaje...")
            respuesta = agente.procesar_mensaje(mensaje)
            
            # Mostrar respuesta
            print("\n" + "="*80)
            print("RESPUESTA DEL AGENTE MCP:")
            print("="*80)
            print(respuesta)
            print("="*80)
            
            # Opción para mostrar historia completa
            ver_historia = input("\n¿Ver historia completa? (s/n): ").lower()
            if ver_historia.startswith("s"):
                print("\n" + "="*80)
                print("HISTORIA DEL CONTEXTO:")
                print("="*80)
                print(contexto.obtener_historia_formateada(incluir_metadatos=True))
                print("="*80)
        
        except KeyboardInterrupt:
            print("\n\nInterrumpido por el usuario.")
            break
        except Exception as e:
            print(f"\nError: {str(e)}")
    
    print("\nFinalizando sesión del agente MCP...")
    contexto.finalizar_sesion("completada")
    
    # Mostrar resumen final
    print("\n" + "="*80)
    print("RESUMEN DE LA SESIÓN MCP:")
    print("="*80)
    print(f"Duración: {contexto.metricas.get('duracion_segundos', 0):.1f} segundos")
    print(f"Herramientas usadas: {contexto.metricas.get('herramientas_usadas', 0)}")
    print(f"Total de eventos: {len(contexto.historia)}")
    print("="*80)
    
    print("\n¡Gracias por utilizar el Agente MCP de AiDuxCare!")


if __name__ == "__main__":
    # Si se ejecuta como script, iniciar shell interactivo
    ejecutar_shell_interactivo() 