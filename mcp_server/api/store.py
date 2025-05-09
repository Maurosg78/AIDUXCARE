"""
Endpoint para almacenar registros clínicos validados.

Este módulo proporciona el endpoint para guardar campos
de historia clínica en la base de datos.
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, Any, Optional
import logging
import uuid
from datetime import datetime

# Router para almacenamiento
router = APIRouter(prefix="/api/mcp", tags=["almacenamiento"])

# Simulación de almacenamiento
stored_data = {}

def simulate_store_emr_entry(
    visit_id: str,
    field: str,
    role: str,
    content: str,
    overwrite: bool = False
) -> Dict[str, Any]:
    """
    Simula el almacenamiento de una entrada EMR en Supabase.
    
    Args:
        visit_id: ID de la visita
        field: Campo a almacenar (anamnesis, exploracion, etc.)
        role: Rol del usuario (health_professional, etc.)
        content: Contenido del campo
        overwrite: Si se debe sobrescribir en caso de existir
    
    Returns:
        Dict con la información de la entrada almacenada
    
    Raises:
        Exception: Si ocurre algún error en el almacenamiento
    """
    logging.info(f"Simulando almacenamiento para visita {visit_id}, campo {field}")
    
    # Crear clave única para el almacenamiento
    key = f"{visit_id}:{field}"
    
    # Verificar si ya existe
    if key in stored_data and not overwrite:
        raise Exception(f"El campo {field} ya existe para la visita {visit_id}")
    
    # Generar entrada
    entry = {
        "id": str(uuid.uuid4()),
        "visit_id": visit_id,
        "field": field,
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    
    # Almacenar
    stored_data[key] = entry
    
    return entry

class StoreEMRRequest:
    """Modelo para petición de almacenamiento EMR."""
    
    def __init__(
        self,
        visit_id: str,
        field: str,
        role: str,
        content: str,
        overwrite: bool = False
    ):
        self.visit_id = visit_id
        self.field = field
        self.role = role
        self.content = content
        self.overwrite = overwrite

@router.post("/store", summary="Almacenar campo de registro clínico")
async def store_emr_field(
    request: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Almacena un campo de registro clínico validado.
    
    Args:
        request: Datos del campo a almacenar
    
    Returns:
        Dict con confirmación y detalles del almacenamiento
    """
    try:
        # Validar campos obligatorios
        required_fields = ["visit_id", "field", "role", "content"]
        for field in required_fields:
            if field not in request:
                raise HTTPException(
                    status_code=422,
                    detail=f"Campo obligatorio '{field}' no proporcionado"
                )
        
        # Extraer valores
        visit_id = request["visit_id"]
        field = request["field"]
        role = request["role"]
        content = request["content"]
        overwrite = request.get("overwrite", False)
        
        # Simulación de almacenamiento
        try:
            result = simulate_store_emr_entry(
                visit_id=visit_id,
                field=field,
                role=role,
                content=content,
                overwrite=overwrite
            )
            
            # Respuesta exitosa
            return {
                "success": True,
                "entry_id": result["id"],
                "visit_id": visit_id,
                "field": field,
                "timestamp": result["timestamp"]
            }
        except Exception as e:
            # Manejar errores específicos de almacenamiento
            error_msg = str(e)
            if "ya existe" in error_msg:
                raise HTTPException(status_code=409, detail=error_msg)
            elif "no existe" in error_msg:
                raise HTTPException(status_code=404, detail=error_msg)
            else:
                raise HTTPException(status_code=500, detail=f"Error al almacenar: {error_msg}")
    
    except HTTPException:
        # Re-lanzar excepciones HTTP ya procesadas
        raise
    
    except Exception as e:
        # Error general no esperado
        logging.error(f"Error inesperado en store_emr_field: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        ) 