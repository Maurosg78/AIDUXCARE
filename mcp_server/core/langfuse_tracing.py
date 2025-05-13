"""
Módulo para trazabilidad con Langfuse.

Este módulo proporciona una integración simulada con Langfuse
para el trazado de operaciones del MCP.
"""

import logging
import uuid
from typing import Dict, Any, List, Optional

# Logger para el módulo
logger = logging.getLogger("langfuse-tracing")

class MockLangfuseClient:
    """Cliente simulado de Langfuse para entornos de desarrollo y pruebas."""
    
    def __init__(self):
        """Inicializa el cliente simulado de Langfuse."""
        self.traces = {}  # Almacena trazas por ID
        logger.info("Cliente simulado de Langfuse inicializado")
    
    def trace(self, name: str, **kwargs) -> "MockTrace":
        """Crea una traza simulada."""
        trace_id = str(uuid.uuid4())
        trace = MockTrace(trace_id, name, **kwargs)
        self.traces[trace_id] = trace
        logger.info(f"Traza creada: {name} (ID: {trace_id})")
        return trace
    
    def span(self, name: str, **kwargs) -> "MockSpan":
        """Crea un span simulado."""
        span_id = str(uuid.uuid4())
        span = MockSpan(span_id, name, **kwargs)
        logger.info(f"Span creado: {name} (ID: {span_id})")
        return span
    
    def generation(self, name: str, **kwargs) -> "MockGeneration":
        """Crea una generación simulada."""
        gen_id = str(uuid.uuid4())
        gen = MockGeneration(gen_id, name, **kwargs)
        logger.info(f"Generación creada: {name} (ID: {gen_id})")
        return gen

class MockTrace:
    """Traza simulada de Langfuse."""
    
    def __init__(self, id: str, name: str, **kwargs):
        """Inicializa una traza simulada."""
        self.id = id
        self.name = name
        self.metadata = kwargs.get("metadata", {})
        self.spans = []
        self.generations = []
        self.status = "success"
    
    def span(self, name: str, **kwargs) -> "MockSpan":
        """Crea un span dentro de esta traza."""
        span = MockSpan(str(uuid.uuid4()), name, **kwargs)
        self.spans.append(span)
        return span
    
    def generation(self, name: str, **kwargs) -> "MockGeneration":
        """Crea una generación dentro de esta traza."""
        gen = MockGeneration(str(uuid.uuid4()), name, **kwargs)
        self.generations.append(gen)
        return gen
    
    def update(self, **kwargs) -> None:
        """Actualiza esta traza."""
        if "metadata" in kwargs:
            self.metadata.update(kwargs["metadata"])
        if "status" in kwargs:
            self.status = kwargs["status"]
    
    def __enter__(self):
        """Soporte para contexto."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Salida de contexto."""
        if exc_type:
            self.update(status="error")

class MockSpan:
    """Span simulado de Langfuse."""
    
    def __init__(self, id: str, name: str, **kwargs):
        """Inicializa un span simulado."""
        self.id = id
        self.name = name
        self.metadata = kwargs.get("metadata", {})
        self.status = "success"
    
    def update(self, **kwargs) -> None:
        """Actualiza este span."""
        if "metadata" in kwargs:
            self.metadata.update(kwargs["metadata"])
        if "status" in kwargs:
            self.status = kwargs["status"]
    
    def end(self) -> None:
        """Finaliza este span."""
        logger.debug(f"Span finalizado: {self.name} (ID: {self.id})")
    
    def __enter__(self):
        """Soporte para contexto."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Salida de contexto."""
        self.end()
        if exc_type:
            self.update(status="error")

class MockGeneration:
    """Generación simulada de Langfuse."""
    
    def __init__(self, id: str, name: str, **kwargs):
        """Inicializa una generación simulada."""
        self.id = id
        self.name = name
        self.metadata = kwargs.get("metadata", {})
        self.status = "success"
        self.prompt = kwargs.get("prompt", "")
        self.completion = kwargs.get("completion", "")
    
    def update(self, **kwargs) -> None:
        """Actualiza esta generación."""
        if "metadata" in kwargs:
            self.metadata.update(kwargs["metadata"])
        if "status" in kwargs:
            self.status = kwargs["status"]
        if "completion" in kwargs:
            self.completion = kwargs["completion"]
    
    def end(self) -> None:
        """Finaliza esta generación."""
        logger.debug(f"Generación finalizada: {self.name} (ID: {self.id})")
    
    def __enter__(self):
        """Soporte para contexto."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Salida de contexto."""
        self.end()
        if exc_type:
            self.update(status="error")

# Cliente simulado global
try:
    langfuse_client = MockLangfuseClient()
    logger.info("Langfuse inicializado correctamente")
except Exception as e:
    langfuse_client = None
    logger.error(f"Error al inicializar Langfuse: {str(e)}")

def create_trace(name: str, metadata: Optional[Dict[str, Any]] = None) -> MockTrace:
    """
    Crea una nueva traza en Langfuse.
    
    Args:
        name: Nombre de la traza
        metadata: Metadatos adicionales
    
    Returns:
        Objeto de traza
    """
    if not langfuse_client:
        logger.warning("Langfuse no está inicializado, retornando traza simulada")
        return MockTrace(str(uuid.uuid4()), name, metadata=metadata or {})
    
    return langfuse_client.trace(name, metadata=metadata or {}) 