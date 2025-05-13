#!/usr/bin/env python3
"""
Ejemplo simple de uso de la memoria adaptativa MCP.
"""

from mcp.context import MCPContext, ActorType, PriorityLevel

def imprimir_separador(titulo):
    """Imprime un separador con título para mejorar la legibilidad."""
    print("\n" + "="*80)
    print(f" {titulo} ".center(80, "="))
    print("="*80 + "\n")

def demo_memoria_adaptativa():
    """Demostración básica de la memoria adaptativa."""
    imprimir_separador("DEMOSTRACIÓN DE MEMORIA ADAPTATIVA POR ROL")
    
    # Crear contextos para diferentes roles
    roles = ["health_professional", "patient", "admin_staff"]
    contextos = {}
    
    for rol in roles:
        contextos[rol] = MCPContext(
            paciente_id="P001",
            paciente_nombre="Juan Pérez",
            visita_id="V20250508-001",
            profesional_email="contacto@aiduxcare.com",
            motivo_consulta="Dolor cervical persistente",
            user_role=rol
        )
    
    # Añadir los mismos bloques de conversación a todos los contextos
    bloques_conversacion = [
        ("patient", "Me duele mucho el cuello desde hace dos semanas.", "high"),
        ("professional", "¿Ha realizado algún movimiento brusco últimamente?", "medium"),
        ("patient", "Estuve pintando el techo de mi casa.", "medium"),
        ("professional", "¿Siente hormigueo en los brazos?", "high"),
        ("patient", "Sí, en el brazo derecho.", "high"),
        ("companion", "Ha estado tomando ibuprofeno sin efecto.", "low"),
        ("system", "Resultados de visitas anteriores: Tensión cervical recurrente.", "high"),
        ("professional", "Vamos a examinar para descartar radiculopatía.", "high"),
        ("admin_staff", "El paciente tiene seguro ADESLAS.", "medium"),
        ("professional", "Necesitaremos autorización para resonancia.", "medium")
    ]
    
    # Cargar bloques en todos los contextos
    for rol, contexto in contextos.items():
        print(f"\n=== Cargando bloques en contexto para rol: {rol} ===")
        
        for actor, texto, prioridad in bloques_conversacion:
            contexto.agregar_bloque_conversacion(
                actor=actor, 
                texto=texto, 
                prioridad=prioridad
            )
            
        print(f"Bloques en memoria corta: {len(contexto.short_term_memory)}")
        print(f"Bloques en memoria larga: {len(contexto.long_term_memory)}")
    
    # Filtrar bloques relevantes para cada rol
    for rol, contexto in contextos.items():
        imprimir_separador(f"BLOQUES RELEVANTES PARA ROL: {rol}")
        
        bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
        
        print(f"Total de bloques: {len(contexto.short_term_memory)}")
        print(f"Bloques filtrados: {len(bloques_relevantes)}")
        print(f"Tokens estimados: {sum(b['tokens_estimados'] for b in bloques_relevantes)}")
        
        print("\nBloques incluidos en el filtrado:")
        for bloque in bloques_relevantes:
            print(f"- {bloque['actor'].upper()} ({bloque['priority']}): {bloque['text']}")
        
        # Análisis de prioridades
        alta = sum(1 for b in bloques_relevantes if b["priority"] == "high")
        media = sum(1 for b in bloques_relevantes if b["priority"] == "medium")
        baja = sum(1 for b in bloques_relevantes if b["priority"] == "low")
        
        print(f"\nDistribución de prioridades: {alta} alta, {media} media, {baja} baja")
    
    imprimir_separador("COMPARACIÓN DE FILTRADO POR ROL")
    
    # Comparar los resultados entre roles
    for rol, contexto in contextos.items():
        bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
        tokens = sum(b["tokens_estimados"] for b in bloques_relevantes)
        
        # Conteo por actores
        por_actor = {}
        for bloque in bloques_relevantes:
            actor = bloque["actor"]
            por_actor[actor] = por_actor.get(actor, 0) + 1
        
        print(f"Rol {rol}: {len(bloques_relevantes)} bloques, {tokens} tokens")
        print(f"  Distribución por actor: {por_actor}")
    
    imprimir_separador("DEMOSTRACIÓN COMPLETADA")

if __name__ == "__main__":
    demo_memoria_adaptativa() 