# Agente MCP para AiDuxCare

Este archivo contiene la estructura base de un agente MCP (Medical Copilot) para AiDuxCare, inspirado en patrones de IA Generativa.

## Código de Referencia

```python
# agents/mcp_agent_initializer.py
"""
Este archivo define la estructura base de un agente MCP para AiDuxCare,
inspirado en el patrón visto en la clase de IA Generativa.
"""

from mcp.client.stdio import StdioClient, StdioServerParameters
from mcp.client.session import ClientSession
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI

from aiduxcare.tools import (
    pubmed_search_tool,
    eval_quality_tool,
    legal_review_tool,
    emr_history_tool,
)

SYSTEM_PROMPT = """
Eres un copiloto clínico altamente capacitado para asistir a profesionales de la salud.
Tu misión es prevenir errores, mejorar la calidad clínica, y proteger legalmente al profesional.
"""

def get_mcp_agent():
    server_params = StdioServerParameters(
        command="python",
        args=["src/agent/mcp_tool_server.py"]
    )

    async def build():
        async with ClientSession(server_params=server_params) as session:
            await session.initialize()
            tools = [
                pubmed_search_tool,
                eval_quality_tool,
                legal_review_tool,
                emr_history_tool
            ]
            model = ChatOpenAI(model="gpt-4o", temperature=0.2).bind_tools(tools)
            memory = [SystemMessage(content=SYSTEM_PROMPT)]
            return model, tools, memory

    return build

# Esto se llamará desde un componente React o servidor para inicializar un agente personalizado MCP
```

## Notas de Integración

Este agente se inicializará desde componentes React o desde el servidor para proporcionar asistencia clínica contextual. El agente utiliza las siguientes herramientas:

1. `pubmed_search_tool` - Búsqueda de literatura médica
2. `eval_quality_tool` - Evaluación de calidad clínica
3. `legal_review_tool` - Revisión legal de decisiones
4. `emr_history_tool` - Acceso al historial médico electrónico

## Próximos Pasos

- Implementar los módulos de herramientas en `aiduxcare.tools`
- Crear el servidor de herramientas en `src/agent/mcp_tool_server.py`
- Integrar con el contexto clínico existente
- Desarrollar pruebas para validar el funcionamiento del agente

## Dependencias

- LangChain Core
- OpenAI
- MCP Client (módulo personalizado) 