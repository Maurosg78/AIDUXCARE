#!/usr/bin/env python3
"""
Script simplificado para probar la implementación por roles del MCP.
"""

from mcp.context import MCPContext
from mcp.agent_mcp import MCPAgent

def test_roles():
    """Prueba básica de la implementación de roles."""
    print("\n=== PRUEBA DE ROLES DE USUARIO MCP ===\n")
    
    # Crear contexto con rol de profesional de salud
    contexto = MCPContext(
        paciente_id="P001",
        paciente_nombre="Juan Pérez",
        visita_id="V20250508-001",
        profesional_email="fisio@aiduxcare.com",
        motivo_consulta="Dolor cervical persistente",
        user_role="health_professional"  # Usando el nuevo parámetro de rol
    )
    
    # Crear agente
    agente = MCPAgent(contexto)
    
    # Verificar que el rol se haya asignado correctamente
    print(f"Rol de usuario asignado: {contexto.user_role}")
    
    # Procesar un mensaje simple
    mensaje = "El paciente refiere dolor cervical"
    respuesta = agente.procesar_mensaje(mensaje)
    
    print(f"\nMensaje: {mensaje}")
    print(f"\nRespuesta: {respuesta}\n")
    
    # Finalizar sesión
    contexto.finalizar_sesion()
    print("\n=== PRUEBA COMPLETADA ===\n")

if __name__ == "__main__":
    test_roles() 