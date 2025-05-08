# Microservicio MCP - AiDuxCare v1.20.0

Microservicio independiente para el MCP (Model Context Protocol) de AiDuxCare, implementado con FastAPI y Langraph.

## Descripción

Este microservicio proporciona un API REST para interactuar con el agente MCP de AiDuxCare, que utiliza Langraph para
implementar un flujo de trabajo basado en grafos para procesamiento de lenguaje natural en el contexto médico.

El servicio está completamente desacoplado del frontend y otros componentes, lo que permite:
- Escalabilidad independiente
- Actualizaciones sin interrupciones
- Pruebas aisladas
- Mayor control sobre los recursos y la configuración

## Arquitectura

```
[Frontend React] ─────────────► [API Supabase] ─────────────► [Microservicio MCP (FastAPI)]
        ▲                                                            ▲
        │                                                            │
[Usuario / Input Audio]                                   [Modelos LLM / Agente Langraph]
```

## Características

- **Endpoints REST para interacción con MCP**:
  - `/api/mcp`: Endpoint base para interacción general
  - `/api/mcp/respond`: Endpoint optimizado para integración con frontend React
- **Auto-documentación completa**: Swagger UI disponible en `/docs`
- **CORS habilitado**: Para integración con frontend
- **Validación con Pydantic**: Validación robusta de solicitudes y respuestas
- **Trazabilidad**: Registro detallado de cada paso del procesamiento
- **Control de errores**: Manejo estandarizado y descriptivo de errores
- **Herramientas médicas por rol**: Adaptación de herramientas según roles
- **Memoria contextual adaptativa**: Filtrado por rol y prioridad
- **Configuración mediante variables de entorno**

## Requisitos

- Python 3.11+
- FastAPI
- Uvicorn
- Langchain
- Langgraph
- Pydantic

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/aiduxcare.git
cd aiduxcare
```

2. Instalar dependencias:
```bash
cd mcp_server
pip install -r requirements.txt
```

3. Configurar variables de entorno:
Crea un archivo `.env` en el directorio `mcp_server/` con la siguiente configuración:
```
DEBUG=false
CORS_ORIGINS=http://localhost:3000,https://aiduxcare.vercel.app
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=tu_api_key_de_openai
```

## Uso

### Iniciar el servidor:

```bash
cd mcp_server
python run.py
```

Opciones disponibles:
- `--host`: Host donde escuchará el servidor (por defecto: 0.0.0.0)
- `--port`: Puerto donde escuchará el servidor (por defecto: 8000)
- `--reload`: Activar auto-recarga en cambios (desarrollo)
- `--debug`: Activar modo debug

### Acceder a la documentación:

Abrir en el navegador: `http://localhost:8000/docs`

### Ejemplo de petición al endpoint general:

```bash
curl -X POST http://localhost:8000/api/mcp \
     -H "Content-Type: application/json" \
     -d '{
           "visit_id": "VISITA123",
           "role": "health_professional",
           "user_input": "El paciente refiere dolor lumbar al levantar peso"
         }'
```

### Ejemplo de petición al endpoint para frontend:

```bash
curl -X POST http://localhost:8000/api/mcp/respond \
     -H "Content-Type: application/json" \
     -d '{
           "visit_id": "VIS123",
           "role": "health_professional",
           "user_input": "El paciente refiere dolor irradiado hacia el brazo derecho",
           "previous_messages": [
             {
               "id": "msg_1",
               "timestamp": "2025-05-10T10:30:00Z",
               "sender_type": "user",
               "sender_name": "Dr. García",
               "content": "Nuevo paciente con dolor cervical",
               "metadata": {
                 "visit_id": "VIS123"
               }
             }
           ]
         }'
```

### Respuesta del endpoint para frontend:

```json
{
  "response": "Basado en la descripción, el paciente presenta signos compatibles con cervicalgia con componente radicular...",
  "conversation_item": {
    "id": "msg_2",
    "timestamp": "2025-05-10T15:45:22.456123",
    "sender_type": "assistant",
    "sender_name": "AiDuxCare MCP",
    "content": "Basado en la descripción, el paciente presenta signos compatibles con cervicalgia con componente radicular...",
    "metadata": {
      "tools_used": ["diagnostico"],
      "visit_id": "VIS123"
    }
  },
  "context_summary": {
    "active_tools": ["diagnostico"],
    "memory_blocks_count": 3,
    "processing_time_ms": 1250.5,
    "user_role": "health_professional"
  },
  "trace": [
    {
      "timestamp": "2025-05-10T15:45:21.123456",
      "action": "request_received",
      "metadata": {
        "visit_id": "VIS123", 
        "role": "health_professional", 
        "input_length": 60
      }
    },
    // ... más entradas de traza ...
  ]
}
```

## Integración con React Frontend

Para integrar el microservicio con el frontend de React, puedes usar el siguiente código:

```jsx
// MCPChatComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MCP_SERVER_URL = process.env.REACT_APP_MCP_SERVER_URL || 'http://localhost:8000';

const MCPChatComponent = ({ visitId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextSummary, setContextSummary] = useState(null);

  // Enviar mensaje al MCP
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Crear mensajes para mostrar inmediatamente
    const userMessage = {
      id: `msg_${messages.length + 1}`,
      timestamp: new Date().toISOString(),
      sender_type: 'user',
      sender_name: 'You', // O el nombre del usuario actual
      content: userInput,
      metadata: {
        visit_id: visitId
      }
    };
    
    // Actualizar UI inmediatamente con el mensaje del usuario
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // Preparar solicitud para el microservicio
      const request = {
        visit_id: visitId,
        role: userRole,
        user_input: userInput,
        previous_messages: messages
      };
      
      // Llamar al endpoint del microservicio
      const response = await axios.post(
        `${MCP_SERVER_URL}/api/mcp/respond`, 
        request
      );
      
      // Actualizar estado con la respuesta
      setMessages(prev => [...prev, response.data.conversation_item]);
      setContextSummary(response.data.context_summary);
      
    } catch (error) {
      console.error('Error al comunicarse con MCP:', error);
      // Mostrar mensaje de error en el chat
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender_type: 'system',
        sender_name: 'Error',
        content: `No se pudo obtener respuesta: ${error.message}`,
        metadata: { error: true }
      }]);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="mcp-chat-container">
      <div className="mcp-chat-messages">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`message ${msg.sender_type}`}
          >
            <div className="message-header">
              <span className="sender-name">{msg.sender_name}</span>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{msg.content}</div>
            {msg.metadata?.tools_used && (
              <div className="tools-used">
                Tools: {msg.metadata.tools_used.join(', ')}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message-loading">
            Pensando...
          </div>
        )}
      </div>
      
      {contextSummary && (
        <div className="context-summary">
          <h4>Contexto actual</h4>
          <div className="context-items">
            <div>Herramientas activas: {contextSummary.active_tools.join(', ') || 'Ninguna'}</div>
            <div>Bloques de memoria: {contextSummary.memory_blocks_count}</div>
            <div>Tiempo de procesamiento: {contextSummary.processing_time_ms.toFixed(2)}ms</div>
          </div>
        </div>
      )}
      
      <div className="mcp-chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !userInput.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default MCPChatComponent;
```

### Uso del componente en la página de detalle de visita:

```jsx
// VisitDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MCPChatComponent from '../components/MCPChatComponent';

const VisitDetailPage = () => {
  const { id } = useParams(); // Obtiene el ID de la visita de la URL
  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('health_professional'); // Por defecto o desde contexto de autenticación
  
  useEffect(() => {
    // Cargar datos de la visita desde Supabase
    const fetchVisitData = async () => {
      try {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setVisitData(data);
      } catch (error) {
        console.error('Error al cargar visita:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisitData();
  }, [id]);
  
  if (loading) return <div>Cargando datos de la visita...</div>;
  if (!visitData) return <div>No se encontró la visita</div>;
  
  return (
    <div className="visit-detail-container">
      <h1>Visita: {visitData.title || `#${visitData.id}`}</h1>
      
      <div className="visit-info">
        <p>Paciente: {visitData.patient_name}</p>
        <p>Fecha: {new Date(visitData.date).toLocaleDateString()}</p>
        <p>Motivo: {visitData.reason}</p>
        {/* Más detalles de la visita */}
      </div>
      
      <div className="visit-chat-section">
        <h2>Conversación con Asistente Médico</h2>
        <MCPChatComponent 
          visitId={id}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default VisitDetailPage;
```

## Pruebas

Para ejecutar las pruebas:
```bash
cd mcp_server
pytest tests/
```

Para ejecutar pruebas específicas:
```bash
python -m pytest tests/test_api.py::test_frontend_mcp_respond_endpoint -v
```

## Despliegue en producción

### Railway

1. Crear proyecto en Railway
2. Vincular repositorio GitHub
3. Configurar variables de entorno
4. Establecer comando de inicio: `cd mcp_server && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Docker

1. Crear Dockerfile:
```Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY mcp_server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY langraph_mcp.py .
COPY mcp_server/ .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Construir imagen:
```bash
docker build -t aiduxcare-mcp:v1.20.0 .
```

3. Ejecutar contenedor:
```bash
docker run -p 8000:8000 --env-file mcp_server/.env aiduxcare-mcp:v1.20.0
```

## Estructura del proyecto

```
mcp_server/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # Endpoints MCP y MCP/respond
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuración (CORS, settings)
│   │   └── utils.py            # Funciones auxiliares
│   ├── langraph/
│   │   ├── __init__.py
│   │   └── processor.py        # Integración con `langraph_mcp.py`
│   └── schemas/
│       ├── __init__.py
│       └── request.py          # Validación con Pydantic
├── tests/
│   └── test_api.py             # Test de los endpoints
├── README_mcp_server.md        # Este archivo
├── requirements.txt            # Dependencias
├── run.py                      # Script para iniciar el servidor
└── .env                        # Variables de entorno (gitignore)
```

## Próximos pasos

- Implementación de autenticación (JWT)
- Integración con bases de datos vectoriales para memoria semántica
- Optimización de rendimiento y escalabilidad
- Monitoreo y alertas
- CI/CD para despliegue automático

## Mantenimiento

Para actualizar el microservicio:

1. Modificar los archivos necesarios
2. Ejecutar pruebas: `pytest tests/`
3. Incrementar versión en `app/core/config.py`
4. Hacer commit y push a repositorio
5. Desplegar nueva versión

## Licencia

Este proyecto es propiedad de AiDuxCare y está protegido por derechos de autor. 