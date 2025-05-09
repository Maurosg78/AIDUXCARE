"""
Modelos de validación para operaciones relacionadas con el EMR.

Este módulo define esquemas Pydantic para las operaciones de persistencia
de datos en el EMR, asegurando la validación de datos antes de almacenarlos.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
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
    """
    Modelo para errores de almacenamiento.
    """
    success: bool = False
    error: str = Field(..., description="Descripción del error")
    error_type: str = Field(..., description="Tipo de error")
    timestamp: datetime = Field(default_factory=datetime.now) 