"""
Modelos Pydantic para datos de Registro Médico Electrónico (EMR).

Este módulo define los esquemas relacionados con el almacenamiento
y recuperación de datos clínicos estructurados.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class StoreEMRRequest(BaseModel):
    """
    Modelo para validar solicitudes de almacenamiento de datos en el EMR.
    """
    visit_id: str = Field(..., description="ID de la visita médica")
    field: str = Field(..., description="Campo del EMR (anamnesis, diagnostico, etc)")
    role: str = Field(..., description="Rol del usuario que valida")
    content: str = Field(..., description="Contenido validado para almacenar")
    overwrite: bool = Field(False, description="Si se debe sobrescribir un campo existente")

class StoreEMRResponse(BaseModel):
    """
    Modelo para respuestas de almacenamiento en el EMR.
    """
    success: bool = Field(..., description="Si la operación fue exitosa")
    entry_id: Optional[str] = Field(None, description="ID de la entrada creada")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp de la operación")
    field: str = Field(..., description="Campo del EMR almacenado")
    message: str = Field(..., description="Mensaje descriptivo del resultado")
    data: Optional[Dict[str, Any]] = Field(None, description="Datos adicionales")

class StorageError(BaseModel):
    """Datos de error para almacenamiento."""
    success: bool = False
    error: str
    error_type: str
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
    
    def model_dump(self, **kwargs):
        """Serializar a diccionario con fechas en formato ISO."""
        data = super().model_dump(**kwargs)
        # Convertir cualquier datetime a string ISO
        if "timestamp" in data and isinstance(data["timestamp"], datetime):
            data["timestamp"] = data["timestamp"].isoformat()
        return data

class EMRFieldEntry(BaseModel):
    """
    Entrada de un campo específico del EMR.
    
    Representa una pieza de información clínica validada, como puede ser
    una anamnesis, un diagnóstico o un plan terapéutico.
    """
    field: str
    content: str
    role: str
    timestamp: datetime
    source: str = "mcp"
    validated: bool = True
    metadata: Dict[str, Any] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "field": "anamnesis",
                "content": "Paciente masculino de 45 años...",
                "role": "health_professional",
                "timestamp": "2023-09-01T12:00:00",
                "source": "mcp",
                "validated": True,
                "metadata": {"confidence": 0.92}
            }
        }
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class EMREntriesResponse(BaseModel):
    """
    Respuesta para consultas de entradas del EMR.
    
    Contiene una lista de entradas clínicas que cumplen con los criterios
    de búsqueda especificados.
    """
    visit_id: str
    entries: List[EMRFieldEntry]
    count: int
    filters: Dict[str, str]
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        } 