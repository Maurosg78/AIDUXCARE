#!/usr/bin/env python3
"""
Script para probar la implementación del MCP usando Langraph.

Este script crea una instancia del grafo MCP, inicializa un contexto
con datos de prueba y ejecuta una conversación simple.
"""

from langchain_core.messages import HumanMessage
from langraph_mcp import (
    build_mcp_graph, 
    initialize_context, 
    run_graph
)

def main():
    """Función principal de prueba."""
    print("📊 Iniciando prueba del MCP con Langraph 📊")
    print("-" * 50)
    
    # Crear grafo MCP
    print("Construyendo grafo MCP...")
    mcp_graph = build_mcp_graph(model_name="gpt-3.5-turbo")
    
    # Inicializar contexto
    print("Inicializando contexto con visita de prueba...")
    context = initialize_context(
        visit_id="VISITA_TEST_001", 
        user_role="health_professional"
    )
    
    # Mensajes de prueba
    test_messages = [
        "El paciente refiere dolor cervical irradiado al brazo derecho desde hace 3 días",
        "¿Cuál es el diagnóstico más probable según los síntomas?",
        "¿Tiene antecedentes de problemas similares en visitas anteriores?"
    ]
    
    # Ejecutar conversación
    current_messages = []
    
    print("\n🔄 Iniciando conversación de prueba 🔄")
    print("=" * 80)
    
    for i, msg_text in enumerate(test_messages, 1):
        print(f"\n📝 Mensaje #{i}: {msg_text}")
        print("-" * 50)
        
        # Crear mensaje y añadirlo a la conversación
        message = HumanMessage(content=msg_text)
        current_messages.append(message)
        
        # Ejecutar grafo
        result = run_graph(mcp_graph, context, current_messages)
        
        # Obtener respuesta y herramientas utilizadas
        if result.messages and len(result.messages) > len(current_messages):
            response = result.messages[-1].content
            current_messages.append(result.messages[-1])
            tools_used = [t.get("tool", "unknown") for t in result.tool_results]
            
            print(f"\n🤖 Respuesta: {response}")
            print(f"🔧 Herramientas utilizadas: {', '.join(tools_used) if tools_used else 'ninguna'}")
            print(f"🧠 Bloques de memoria: {len(result.filtered_memory)}")
        else:
            print("❌ No se obtuvo respuesta del MCP")
    
    print("\n✅ Prueba completada con éxito ✅")

if __name__ == "__main__":
    main() 