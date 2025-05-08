#!/usr/bin/env python3
"""
Script de prueba para verificar la integración del MCP con el EMR.
Simula una visita médica, carga el contexto desde el EMR y ejecuta
un ciclo de conversación con el agente.
"""

import asyncio
import json
from typing import Dict, Any
from mcp.context import MCPContext
from mcp.agent_mcp import MCPAgent
from mcp.agent_factory import create_agent_by_role
from mcp.integracion_emr import (
    obtener_datos_visita,
    convertir_a_contexto_mcp,
    sincronizar_con_emr
)

def imprimir_separador(titulo):
    """Imprime un separador con título para mejorar la legibilidad."""
    print("\n" + "="*80)
    print(f" {titulo} ".center(80, "="))
    print("="*80 + "\n")

def formato_json_para_mostrar(datos: Dict[str, Any]) -> str:
    """Formatea un diccionario JSON para mostrarlo más legible en consola."""
    return json.dumps(datos, indent=2, ensure_ascii=False)

async def test_carga_emr_basica():
    """Prueba básica de carga de datos desde el EMR."""
    imprimir_separador("PRUEBA: CARGA BÁSICA DE DATOS EMR")
    
    visit_id = "VISITA123"  # ID simulado para prueba
    
    print(f"Obteniendo datos de la visita con ID: {visit_id}")
    try:
        # Obtener datos del EMR
        datos_visita = await obtener_datos_visita(visit_id)
        
        # Mostrar resumen de la visita
        print("\n📋 Resumen de la visita obtenida del EMR:")
        print(f"  Paciente: {datos_visita['paciente']['nombre']} (ID: {datos_visita['paciente']['id']})")
        print(f"  Motivo: {datos_visita['visita']['motivo_consulta']}")
        print(f"  Fecha: {datos_visita['visita']['fecha']}")
        print(f"  Profesional: {datos_visita['profesional']['nombre']} ({datos_visita['profesional']['email']})")
        
        print("\n📑 Formularios disponibles:")
        if "formularios" in datos_visita:
            for form_name in datos_visita["formularios"].keys():
                print(f"  - {form_name}")
        else:
            print("  No hay formularios disponibles")
        
        print("\n📜 Visitas anteriores:")
        if "visitas_anteriores" in datos_visita and datos_visita["visitas_anteriores"]:
            for visita in datos_visita["visitas_anteriores"]:
                print(f"  - {visita['fecha']}: {visita['motivo']} (Dx: {visita.get('diagnostico', 'No registrado')})")
        else:
            print("  No hay visitas anteriores registradas")
        
    except Exception as e:
        print(f"❌ Error al obtener datos de la visita: {e}")
        return

async def test_crear_contexto_mcp_desde_emr():
    """Prueba la creación de un contexto MCP a partir de datos del EMR."""
    imprimir_separador("PRUEBA: CREAR CONTEXTO MCP DESDE EMR")
    
    visit_id = "VISITA123"  # ID simulado para prueba
    user_role = "health_professional"  # Probamos con rol de profesional de salud
    
    try:
        # Obtener datos del EMR
        print(f"Obteniendo datos de la visita con ID: {visit_id}")
        datos_visita = await obtener_datos_visita(visit_id)
        
        # Convertir a contexto MCP
        print(f"Convirtiendo datos a contexto MCP para rol: {user_role}")
        contexto = convertir_a_contexto_mcp(datos_visita, user_role)
        
        # Mostrar información del contexto creado
        print("\n📊 Contexto MCP creado:")
        print(f"  Paciente: {contexto.paciente['nombre']} (ID: {contexto.paciente['id']})")
        print(f"  Visita: {contexto.visita['id']}")
        print(f"  Motivo: {contexto.visita['motivo_consulta']}")
        print(f"  Rol: {contexto.user_role}")
        
        # Mostrar datos adicionales del paciente
        print("\n🧑‍⚕️ Datos del paciente en contexto:")
        for clave, valor in contexto.paciente['datos'].items():
            if isinstance(valor, list):
                print(f"  {clave}: {', '.join(valor) if valor else 'Ninguno'}")
            else:
                print(f"  {clave}: {valor}")
        
        # Mostrar bloques de memoria creados
        print("\n🧠 Bloques de memoria en contexto:")
        print(f"  Memoria a corto plazo: {len(contexto.short_term_memory)} bloques")
        print(f"  Memoria a largo plazo: {len(contexto.long_term_memory)} bloques")
        
        # Mostrar los primeros bloques como ejemplo
        if contexto.short_term_memory:
            print("\n📝 Ejemplos de bloques de memoria:")
            for i, bloque in enumerate(contexto.short_term_memory[:3]):  # Mostramos hasta 3 ejemplos
                print(f"  Bloque {i+1}:")
                print(f"    Actor: {bloque['actor']}")
                print(f"    Prioridad: {bloque['priority']}")
                print(f"    Texto: {bloque['text'][:100]}...")
        
        # Finalizar el contexto
        contexto.finalizar_sesion()
        
    except Exception as e:
        print(f"❌ Error al crear contexto desde EMR: {e}")

async def test_ciclo_conversacion_completo():
    """
    Prueba un ciclo completo de conversación con un agente MCP
    inicializado desde datos del EMR.
    """
    imprimir_separador("PRUEBA: CICLO COMPLETO DE CONVERSACIÓN")
    
    visit_id = "VISITA123"  # ID simulado para prueba
    
    try:
        # Crear agente directamente desde visita EMR
        print(f"Creando agente MCP para visita ID: {visit_id}")
        agente = await MCPAgent.desde_visita_emr(
            visit_id=visit_id,
            user_role="health_professional",
            max_iteraciones=3  # Limitamos para la prueba
        )
        
        # Información inicial
        print("\n🤖 Agente MCP creado:")
        print(f"  Rol: {agente.contexto.user_role}")
        print(f"  Max iteraciones: {agente.max_iteraciones}")
        print(f"  Herramientas permitidas: {agente.config.get('herramientas_permitidas', [])}")
        
        # Procesar un mensaje de prueba
        mensaje_prueba = "El paciente refiere que el dolor cervical ha empeorado con irradiación al brazo derecho. ¿Cuál sería el mejor abordaje terapéutico considerando su historial?"
        
        print(f"\n📩 Mensaje a procesar: '{mensaje_prueba}'")
        print("\nProcesando mensaje...\n")
        
        # Procesar el mensaje
        respuesta = agente.procesar_mensaje(mensaje_prueba)
        
        # Mostrar la respuesta
        print("=== RESPUESTA DEL AGENTE ===")
        print(respuesta)
        print("============================\n")
        
        # Mostrar estadísticas del procesamiento
        print("\n📊 Estadísticas de procesamiento:")
        print(f"  Herramientas usadas: {agente.contexto.metricas.get('herramientas_usadas', 0)}")
        print(f"  Total de eventos: {len(agente.contexto.historia)}")
        
        # Mostrar estado de memoria tras procesamiento
        print("\n🧠 Estado de la memoria tras procesamiento:")
        print(f"  Bloques en memoria a corto plazo: {len(agente.contexto.short_term_memory)}")
        print(f"  Bloques en memoria a largo plazo: {len(agente.contexto.long_term_memory)}")
        
        # Mostrar bloques filtrados (los que se enviaron al LLM)
        bloques_relevantes = agente.contexto.filter_relevant_blocks(max_tokens=300)
        print(f"\n🔍 Bloques relevantes enviados al LLM: {len(bloques_relevantes)}")
        
        # Simular sincronización con EMR
        print("\n🔄 Sincronizando con EMR para obtener actualizaciones...")
        await agente.sincronizar_contexto_emr()
        print("  Sincronización completada")
        
        # Finalizar la sesión
        agente.contexto.finalizar_sesion()
        print("\n✅ Sesión finalizada correctamente")
        
    except Exception as e:
        print(f"❌ Error en el ciclo de conversación: {e}")

async def test_roles_con_emr():
    """
    Prueba la creación de agentes con diferentes roles
    utilizando la misma visita del EMR.
    """
    imprimir_separador("PRUEBA: DIFERENTES ROLES CON MISMA VISITA EMR")
    
    visit_id = "VISITA123"  # ID simulado para prueba
    roles = ["health_professional", "patient", "admin_staff"]
    
    for rol in roles:
        print(f"\n--- PROBANDO ROL: {rol} ---\n")
        
        try:
            # Obtener datos del EMR
            datos_visita = await obtener_datos_visita(visit_id)
            
            # Crear contexto para el rol específico
            contexto = convertir_a_contexto_mcp(datos_visita, rol)
            
            # Crear agente con el rol
            agente = create_agent_by_role(contexto)
            
            # Mostrar configuración del agente
            print(f"Configuración para rol '{rol}':")
            print(f"  Max iteraciones: {agente.max_iteraciones}")
            print(f"  Herramientas permitidas: {agente.config.get('herramientas_permitidas', [])}")
            print(f"  Mostrar razonamiento: {agente.config.get('mostrar_razonamiento', False)}")
            
            # Contar bloques de memoria disponibles según rol
            bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
            print(f"  Bloques de memoria relevantes: {len(bloques_relevantes)}")
            
            # Finalizar contexto
            contexto.finalizar_sesion()
            
        except Exception as e:
            print(f"❌ Error al probar rol {rol}: {e}")

async def ejecutar_todas_las_pruebas():
    """Ejecuta todas las pruebas en secuencia."""
    await test_carga_emr_basica()
    await test_crear_contexto_mcp_desde_emr()
    await test_ciclo_conversacion_completo()
    await test_roles_con_emr()
    
    imprimir_separador("TODAS LAS PRUEBAS COMPLETADAS")

if __name__ == "__main__":
    # Ejecutar todas las pruebas de forma asíncrona
    asyncio.run(ejecutar_todas_las_pruebas()) 