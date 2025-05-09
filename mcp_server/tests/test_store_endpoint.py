"""
Tests para el endpoint de almacenamiento de contenido validado.

Este módulo contiene pruebas para el endpoint POST /api/mcp/store,
verificando que se procesen correctamente las solicitudes de almacenamiento
de contenido validado en Supabase.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import json

from main import app
from services.supabase_client import SupabaseClientError

client = TestClient(app)

@pytest.fixture
def valid_emr_data():
    """Datos válidos para una solicitud de almacenamiento."""
    return {
        "visit_id": "VIS001",
        "field": "anamnesis",
        "role": "health_professional",
        "content": "Paciente refiere dolores de cabeza frecuentes en las últimas dos semanas.",
        "overwrite": False
    }

@patch("services.supabase_client.store_emr_entry")
async def test_store_emr_success(mock_store_emr, valid_emr_data):
    """Prueba la respuesta exitosa del endpoint de almacenamiento."""
    # Configurar el mock
    mock_result = {
        "id": "12345",
        "visit_id": valid_emr_data["visit_id"],
        "field": valid_emr_data["field"],
        "content": valid_emr_data["content"],
        "timestamp": "2023-07-15T12:00:00Z"
    }
    mock_store_emr.return_value = AsyncMock(return_value=mock_result)
    
    # Realizar la petición
    response = client.post("/api/mcp/store", json=valid_emr_data)
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["entry_id"] == "12345"
    assert data["field"] == valid_emr_data["field"]
    assert "timestamp" in data
    
    # Verificar que se llamó a store_emr_entry con los argumentos correctos
    mock_store_emr.assert_called_once_with(
        visit_id=valid_emr_data["visit_id"],
        field=valid_emr_data["field"],
        role=valid_emr_data["role"],
        content=valid_emr_data["content"],
        overwrite=valid_emr_data["overwrite"]
    )

@patch("services.supabase_client.store_emr_entry")
async def test_store_emr_not_found(mock_store_emr, valid_emr_data):
    """Prueba la respuesta cuando la visita no existe."""
    # Configurar el mock para lanzar una excepción
    mock_store_emr.side_effect = SupabaseClientError("La visita VIS001 no existe")
    
    # Realizar la petición
    response = client.post("/api/mcp/store", json=valid_emr_data)
    
    # Verificar el resultado
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "no existe" in data["error"].lower()
    assert data["error_type"] == "NotFoundError"

@patch("services.supabase_client.store_emr_entry")
async def test_store_emr_conflict(mock_store_emr, valid_emr_data):
    """Prueba la respuesta cuando el campo ya existe y no se permite sobrescribir."""
    # Configurar el mock para lanzar una excepción
    mock_store_emr.side_effect = SupabaseClientError(
        "El campo anamnesis ya existe para la visita VIS001"
    )
    
    # Realizar la petición
    response = client.post("/api/mcp/store", json=valid_emr_data)
    
    # Verificar el resultado
    assert response.status_code == 409
    data = response.json()
    assert "error" in data
    assert "ya existe" in data["error"].lower()
    assert data["error_type"] == "ConflictError"

@patch("services.supabase_client.store_emr_entry")
async def test_store_emr_overwrite(mock_store_emr, valid_emr_data):
    """Prueba la sobrescritura exitosa de un campo existente."""
    # Modificar datos para permitir sobrescritura
    overwrite_data = valid_emr_data.copy()
    overwrite_data["overwrite"] = True
    
    # Configurar el mock
    mock_result = {
        "id": "12345",
        "visit_id": overwrite_data["visit_id"],
        "field": overwrite_data["field"],
        "content": overwrite_data["content"],
        "timestamp": "2023-07-15T12:00:00Z"
    }
    mock_store_emr.return_value = AsyncMock(return_value=mock_result)
    
    # Realizar la petición
    response = client.post("/api/mcp/store", json=overwrite_data)
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    # Verificar que se llamó con overwrite=True
    mock_store_emr.assert_called_once_with(
        visit_id=overwrite_data["visit_id"],
        field=overwrite_data["field"],
        role=overwrite_data["role"],
        content=overwrite_data["content"],
        overwrite=True
    ) 