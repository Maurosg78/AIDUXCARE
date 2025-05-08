#!/usr/bin/env python3
"""
Script de prueba para verificar el sistema de memoria adaptativa del MCP.
Prueba los diferentes roles de usuario y cómo utilizan la memoria.
"""

from mcp.context import MCPContext, ActorType, PriorityLevel
from mcp.agent_mcp import MCPAgent
from mcp.agent_factory import (
    crear_agente_profesional_salud,
    crear_agente_paciente,
    crear_agente_administrativo
)

def imprimir_separador(titulo):
    """Imprime un separador con título para mejorar la legibilidad."""
    print("\n" + "="*80)
    print(f" {titulo} ".center(80, "="))
    print("="*80 + "\n")

def simular_conversacion(agente, mensajes):
    """
    Simula una conversación con el agente usando los mensajes proporcionados.
    
    Args:
        agente: Instancia de MCPAgent
        mensajes: Lista de tuplas (actor, texto, prioridad)
    
    Returns:
        Lista de respuestas generadas
    """
    respuestas = []
    
    for actor, texto, prioridad in mensajes:
        print(f"\n{actor.upper()}: {texto}")
        
        # Registrar el mensaje en la memoria del contexto
        agente.contexto.agregar_bloque_conversacion(
            actor=actor,
            texto=texto,
            prioridad=prioridad
        )
        
        # Solo procesar con el agente si es mensaje de usuario (no de otros actores)
        if actor == "professional" or (actor == "patient" and agente.contexto.user_role == "patient"):
            respuesta = agente.procesar_mensaje(texto)
            respuestas.append(respuesta)
            print(f"RESPUESTA MCP: {respuesta}")
    
    return respuestas

def test_memoria_profesional_salud():
    """Prueba la memoria adaptativa para un profesional de salud."""
    imprimir_separador("PRUEBA: MEMORIA ADAPTATIVA PARA PROFESIONAL DE SALUD")
    
    # Crear contexto y agente
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="health_professional"
    )
    
    agente = crear_agente_profesional_salud(contexto)
    
    # Imprimir configuración de memoria
    print(f"Configuración de memoria: {contexto.memory_config['health_professional']}")
    
    # Simular una conversación con varios actores
    mensajes = [
        ("patient", "Me duele mucho el cuello desde hace dos semanas, sobre todo al girar a la derecha.", "high"),
        ("professional", "Veo en la historia que tiene antecedentes de tensión cervical. ¿Ha realizado algún movimiento brusco últimamente?", "medium"),
        ("patient", "La semana pasada estuve pintando el techo de mi casa y creo que pude hacerme daño.", "medium"),
        ("professional", "¿Siente hormigueo o pérdida de fuerza en los brazos?", "high"),
        ("patient", "Sí, a veces noto hormigueo en el brazo derecho y la mano.", "high"),
        ("companion", "También ha estado tomando ibuprofeno, pero no le hace mucho efecto.", "medium"),
        ("professional", "Necesito evaluar los síntomas para descartar una radiculopatía cervical.", "high")
    ]
    
    respuestas = simular_conversacion(agente, mensajes)
    
    # Verificar estado de la memoria
    print("\nEstado de la memoria después de la conversación:")
    print(f"Bloques en memoria corta: {len(contexto.short_term_memory)}")
    print(f"Bloques en memoria larga: {len(contexto.long_term_memory)}")
    
    # Mostrar bloques de alta prioridad
    print("\nBloques de alta prioridad:")
    for bloque in contexto.short_term_memory:
        if bloque["priority"] == "high":
            print(f"- {bloque['actor'].upper()}: {bloque['text'][:50]}...")
    
    # Verificar el filtrado de bloques relevantes
    bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
    print(f"\nBloques relevantes filtrados para prompt: {len(bloques_relevantes)}")
    print(f"Tokens estimados: {sum(b['tokens_estimados'] for b in bloques_relevantes)}")
    
    contexto.finalizar_sesion()

def test_memoria_paciente():
    """Prueba la memoria adaptativa para un paciente."""
    imprimir_separador("PRUEBA: MEMORIA ADAPTATIVA PARA PACIENTE")
    
    # Crear contexto y agente
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="patient"
    )
    
    agente = crear_agente_paciente(contexto)
    
    # Imprimir configuración de memoria
    print(f"Configuración de memoria: {contexto.memory_config['patient']}")
    
    # Simular una conversación
    mensajes = [
        ("professional", "Hola Juan, veo que vienes por un dolor cervical persistente.", "medium"),
        ("patient", "Sí, me duele mucho el cuello y a veces siento hormigueo en el brazo.", "high"),
        ("professional", "Parece una posible radiculopatía cervical. Te recomendaré algunos ejercicios y vamos a programar unas pruebas.", "high"),
        ("patient", "¿Es grave? ¿Qué significa radiculopatía?", "high"),
        ("professional", "Es una presión en las raíces nerviosas de la columna cervical. No es grave si la tratamos adecuadamente.", "medium"),
        ("patient", "¿Cuánto tiempo tardará en mejorar?", "medium"),
        ("patient", "Y además, ¿puedo seguir haciendo ejercicio?", "medium")
    ]
    
    respuestas = simular_conversacion(agente, mensajes)
    
    # Verificar estado de la memoria
    print("\nEstado de la memoria después de la conversación:")
    print(f"Bloques en memoria corta: {len(contexto.short_term_memory)}")
    print(f"Bloques en memoria larga: {len(contexto.long_term_memory)}")
    
    # Verificar el filtrado de bloques relevantes
    bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
    print(f"\nBloques relevantes filtrados para prompt: {len(bloques_relevantes)}")
    print(f"Tokens estimados: {sum(b['tokens_estimados'] for b in bloques_relevantes)}")
    
    # Comprobar que la memoria larga no se está utilizando
    if len(contexto.long_term_memory) == 0:
        print("\n✓ Correctamente no se está utilizando memoria a largo plazo para pacientes.")
    else:
        print("\n⚠ Error: La memoria a largo plazo no debería usarse para pacientes.")
    
    contexto.finalizar_sesion()

def test_memoria_administrativo():
    """Prueba la memoria adaptativa para personal administrativo."""
    imprimir_separador("PRUEBA: MEMORIA ADAPTATIVA PARA ADMINISTRATIVO")
    
    # Crear contexto y agente
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="admin_staff"
    )
    
    agente = crear_agente_administrativo(contexto)
    
    # Imprimir configuración de memoria
    print(f"Configuración de memoria: {contexto.memory_config['admin_staff']}")
    
    # Simular una conversación
    mensajes = [
        ("professional", "Buenos días. El paciente Juan Pérez necesita una resonancia cervical urgente.", "high"),
        ("admin_staff", "Voy a revisar la disponibilidad para la próxima semana.", "medium"),
        ("professional", "Necesitamos la prueba lo antes posible, está presentando síntomas neurológicos.", "high"),
        ("admin_staff", "¿Tiene seguro privado o es por el sistema público?", "medium"),
        ("professional", "Tiene ADESLAS, pero podríamos necesitar un informe detallado para la autorización.", "medium"),
        ("admin_staff", "Entendido. ¿Debo incluir los antecedentes de hernias cervicales previas?", "medium"),
        ("professional", "Sí, eso ayudará a acelerar la autorización.", "medium"),
        ("admin_staff", "¿Hay alguna consideración legal que deba tener en cuenta para este tipo de derivación urgente?", "high")
    ]
    
    respuestas = simular_conversacion(agente, mensajes)
    
    # Verificar estado de la memoria
    print("\nEstado de la memoria después de la conversación:")
    print(f"Bloques en memoria corta: {len(contexto.short_term_memory)}")
    print(f"Bloques en memoria larga: {len(contexto.long_term_memory)}")
    
    # Verificar el filtrado de bloques relevantes para el prompt
    bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
    print(f"\nBloques relevantes filtrados para prompt: {len(bloques_relevantes)}")
    print(f"Tokens estimados: {sum(b['tokens_estimados'] for b in bloques_relevantes)}")
    
    # Comprobar que solo se filtran bloques relevantes para administrativos
    contador_admin = 0
    for bloque in bloques_relevantes:
        if bloque["actor"] == "admin_staff":
            contador_admin += 1
    
    print(f"\nBloques de admin_staff en filtrado: {contador_admin}")
    
    contexto.finalizar_sesion()

def test_optimizacion_tokens():
    """Prueba la optimización de tokens en diferentes escenarios."""
    imprimir_separador("PRUEBA: OPTIMIZACIÓN DE TOKENS")
    
    # Crear contexto y agente
    contexto = MCPContext(
        paciente_id="P002",
        paciente_nombre="María López",
        visita_id="V20250508-002",
        profesional_email="medico@aiduxcare.com",
        motivo_consulta="Cefalea tensional",
        user_role="health_professional"
    )
    
    agente = crear_agente_profesional_salud(contexto)
    
    # Cargar la memoria con muchos bloques de diferentes prioridades
    for i in range(30):
        # Alternar actores y prioridades
        actor = "patient" if i % 2 == 0 else "professional"
        prioridad = "high" if i % 5 == 0 else ("medium" if i % 3 == 0 else "low")
        
        # Texto de longitud variable para simular conversación real
        longitud_texto = 20 + (i * 5)  # 20, 25, 30, ... caracteres
        texto = f"Mensaje de prueba número {i} con longitud variable " + "a" * (longitud_texto - 40)
        
        contexto.agregar_bloque_conversacion(actor, texto, prioridad)
    
    # Probar filtrado con diferentes límites de tokens
    for limite_tokens in [100, 200, 300, 500]:
        bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=limite_tokens)
        tokens_estimados = sum(b["tokens_estimados"] for b in bloques_relevantes)
        
        print(f"\nLímite de {limite_tokens} tokens:")
        print(f"- Bloques seleccionados: {len(bloques_relevantes)}")
        print(f"- Tokens estimados: {tokens_estimados}")
        print(f"- Eficiencia: {round(tokens_estimados / limite_tokens * 100, 1)}%")
        
        # Contar bloques por prioridad
        alta = sum(1 for b in bloques_relevantes if b["priority"] == "high")
        media = sum(1 for b in bloques_relevantes if b["priority"] == "medium")
        baja = sum(1 for b in bloques_relevantes if b["priority"] == "low")
        
        print(f"- Distribución: {alta} alta, {media} media, {baja} baja")
    
    contexto.finalizar_sesion()

def ejecutar_todas_las_pruebas():
    """Ejecuta todas las pruebas de memoria adaptativa."""
    test_memoria_profesional_salud()
    test_memoria_paciente()
    test_memoria_administrativo()
    test_optimizacion_tokens()
    
    imprimir_separador("TODAS LAS PRUEBAS DE MEMORIA COMPLETADAS")


if __name__ == "__main__":
    ejecutar_todas_las_pruebas() 