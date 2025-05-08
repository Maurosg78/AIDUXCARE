#!/usr/bin/env python3
"""
Script de prueba para verificar el funcionamiento del módulo MCP.
Prueba los diferentes roles de usuario para demostrar la modularidad
del comportamiento del agente MCP.
"""

from mcp.context import MCPContext
from mcp.agent_mcp import MCPAgent
from mcp.agent_factory import (
    create_agent_by_role,
    crear_agente_profesional_salud,
    crear_agente_paciente,
    crear_agente_administrativo
)

def imprimir_separador(titulo):
    """Imprime un separador con título para mejorar la legibilidad."""
    print("\n" + "="*80)
    print(f" {titulo} ".center(80, "="))
    print("="*80 + "\n")

def test_agente_profesional_salud():
    """Prueba el agente MCP con rol de profesional de salud."""
    imprimir_separador("PRUEBA: PROFESIONAL DE SALUD")
    
    # Crear contexto con rol profesional de salud
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="health_professional"
    )
    
    # Crear agente usando la fábrica
    agente = crear_agente_profesional_salud(contexto)
    
    # Procesar un mensaje y mostrar respuesta
    mensaje_prueba = "El paciente refiere dolor cervical con irradiación a brazo derecho desde hace una semana. Estoy considerando aplicar manipulación cervical."
    
    print(f"Rol de usuario: {contexto.user_role}")
    print(f"Mensaje de prueba: '{mensaje_prueba}'")
    print("\nProcesando mensaje...\n")
    
    respuesta = agente.procesar_mensaje(mensaje_prueba)
    
    print("=== RESPUESTA DEL AGENTE ===")
    print(respuesta)
    print("============================\n")
    
    # Mostrar información de herramientas utilizadas
    print(f"Herramientas usadas: {contexto.metricas.get('herramientas_usadas', 0)}")
    print(f"Total de eventos: {len(contexto.historia)}")
    
    # Finalizar sesión
    contexto.finalizar_sesion()


def test_agente_paciente():
    """Prueba el agente MCP con rol de paciente."""
    imprimir_separador("PRUEBA: PACIENTE")
    
    # Crear contexto con rol paciente
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="patient"
    )
    
    # Crear agente usando la fábrica
    agente = crear_agente_paciente(contexto)
    
    # Procesar un mensaje y mostrar respuesta
    mensaje_prueba = "Siento dolor en el cuello que se extiende al brazo. ¿Qué podría ser y qué tratamiento necesito?"
    
    print(f"Rol de usuario: {contexto.user_role}")
    print(f"Mensaje de prueba: '{mensaje_prueba}'")
    print("\nProcesando mensaje...\n")
    
    respuesta = agente.procesar_mensaje(mensaje_prueba)
    
    print("=== RESPUESTA DEL AGENTE ===")
    print(respuesta)
    print("============================\n")
    
    # Mostrar información de herramientas utilizadas
    print(f"Herramientas usadas: {contexto.metricas.get('herramientas_usadas', 0)}")
    print(f"Total de eventos: {len(contexto.historia)}")
    
    # Finalizar sesión
    contexto.finalizar_sesion()


def test_agente_administrativo():
    """Prueba el agente MCP con rol administrativo."""
    imprimir_separador("PRUEBA: ADMINISTRATIVO")
    
    # Crear contexto con rol administrativo
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="admin_staff"
    )
    
    # Crear agente usando la fábrica
    agente = crear_agente_administrativo(contexto)
    
    # Procesar un mensaje y mostrar respuesta
    mensaje_prueba = "Necesito saber las visitas anteriores del paciente y si hay alguna consideración legal para la próxima sesión de terapia manual programada."
    
    print(f"Rol de usuario: {contexto.user_role}")
    print(f"Mensaje de prueba: '{mensaje_prueba}'")
    print("\nProcesando mensaje...\n")
    
    respuesta = agente.procesar_mensaje(mensaje_prueba)
    
    print("=== RESPUESTA DEL AGENTE ===")
    print(respuesta)
    print("============================\n")
    
    # Mostrar información de herramientas utilizadas
    print(f"Herramientas usadas: {contexto.metricas.get('herramientas_usadas', 0)}")
    print(f"Total de eventos: {len(contexto.historia)}")
    
    # Finalizar sesión
    contexto.finalizar_sesion()


def test_directo_con_roles():
    """Prueba la creación directa de agentes con diferentes roles."""
    imprimir_separador("PRUEBA: CREACIÓN DIRECTA CON DIFERENTES ROLES")
    
    roles = ["health_professional", "patient", "admin_staff"]
    
    for rol in roles:
        print(f"\n--- PROBANDO ROL: {rol} ---\n")
        
        # Crear contexto con rol específico
        contexto = MCPContext(
            paciente_id="P002",
            paciente_nombre="María López",
            visita_id="V20250508-002",
            profesional_email="admin@aiduxcare.com",
            motivo_consulta="Evaluación de lumbalgia",
            user_role=rol
        )
        
        # Crear agente directamente con la factory function
        agente = create_agent_by_role(contexto)
        
        # Verificar configuración
        print(f"Configuración: {agente.config}")
        print(f"Herramientas permitidas: {agente.config.get('herramientas_permitidas', [])}")
        
        # Finalizar contexto
        contexto.finalizar_sesion()


def ejecutar_todas_las_pruebas():
    """Ejecuta todas las pruebas disponibles."""
    test_agente_profesional_salud()
    test_agente_paciente()
    test_agente_administrativo()
    test_directo_con_roles()
    
    imprimir_separador("TODAS LAS PRUEBAS COMPLETADAS")


if __name__ == "__main__":
    ejecutar_todas_las_pruebas() 