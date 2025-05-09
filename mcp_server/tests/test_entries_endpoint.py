"""
Tests para el endpoint de consulta de entradas clínicas.

Este módulo contiene pruebas para el endpoint GET /api/mcp/entries,
verificando que se procesen correctamente las solicitudes de consulta
de entradas clínicas almacenadas en Supabase.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import json
from datetime import datetime, timezone

from main import app
from services.supabase_client import SupabaseClientError

client = TestClient(app)

@pytest.fixture
def mock_entries():
    """Datos de muestra para entradas EMR."""
    return [
        {
            "id": "entry1",
            "visit_id": "VIS001",
            "field": "anamnesis",
            "content": "Paciente presenta cefalea desde hace 3 días.",
            "role": "health_professional",
            "timestamp": "2023-05-15T10:30:00Z",
            "source": "mcp",
            "validated": True
        },
        {
            "id": "entry2",
            "visit_id": "VIS001",
            "field": "exploracion",
            "content": "No se observan alteraciones significativas.",
            "role": "health_professional",
            "timestamp": "2023-05-15T10:35:00Z",
            "source": "mcp",
            "validated": True
        },
        {
            "id": "entry3",
            "visit_id": "VIS001",
            "field": "diagnostico",
            "content": "Cefalea tensional.",
            "role": "health_professional",
            "timestamp": "2023-05-15T10:40:00Z",
            "source": "mcp",
            "validated": True
        }
    ]

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_all(mock_get_entries, mock_entries):
    """Prueba la consulta de todas las entradas de una visita."""
    # Configurar el mock
    mock_get_entries.return_value = AsyncMock(return_value=mock_entries)
    
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS001")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["visit_id"] == "VIS001"
    assert data["count"] == 3
    assert len(data["entries"]) == 3
    assert "filters" in data
    assert data["filters"]["visit_id"] == "VIS001"
    
    # Verificar que se llamó al servicio con los parámetros correctos
    mock_get_entries.assert_called_once_with(
        visit_id="VIS001",
        field=None,
        role=None
    )

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_by_field(mock_get_entries, mock_entries):
    """Prueba la consulta de entradas filtradas por campo."""
    # Filtrar entradas para el mock
    filtered_entries = [e for e in mock_entries if e["field"] == "anamnesis"]
    mock_get_entries.return_value = AsyncMock(return_value=filtered_entries)
    
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=anamnesis")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["entries"][0]["field"] == "anamnesis"
    assert "field" in data["filters"]
    assert data["filters"]["field"] == "anamnesis"
    
    # Verificar que se llamó al servicio con los parámetros correctos
    mock_get_entries.assert_called_once_with(
        visit_id="VIS001",
        field="anamnesis",
        role=None
    )

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_with_multiple_filters(mock_get_entries, mock_entries):
    """Prueba la consulta de entradas con múltiples filtros."""
    # Filtrar entradas para el mock
    filtered_entries = [
        e for e in mock_entries 
        if e["field"] == "anamnesis" and e["role"] == "health_professional"
    ]
    mock_get_entries.return_value = AsyncMock(return_value=filtered_entries)
    
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=anamnesis&role=health_professional")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["entries"][0]["field"] == "anamnesis"
    assert data["entries"][0]["role"] == "health_professional"
    assert "field" in data["filters"]
    assert "role" in data["filters"]
    
    # Verificar que se llamó al servicio con los parámetros correctos
    mock_get_entries.assert_called_once_with(
        visit_id="VIS001",
        field="anamnesis",
        role="health_professional"
    )

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_empty_result(mock_get_entries):
    """Prueba la respuesta cuando no hay entradas que coincidan con los filtros."""
    mock_get_entries.return_value = AsyncMock(return_value=[])
    
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=tratamiento")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert len(data["entries"]) == 0
    assert data["filters"]["field"] == "tratamiento"
    
    # Verificar que se llamó al servicio con los parámetros correctos
    mock_get_entries.assert_called_once_with(
        visit_id="VIS001",
        field="tratamiento",
        role=None
    )

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_visit_not_found(mock_get_entries):
    """Prueba la respuesta cuando la visita no existe."""
    # Configurar el mock para lanzar una excepción
    mock_get_entries.side_effect = SupabaseClientError("La visita VIS999 no existe")
    
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS999")
    
    # Verificar el resultado
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "no existe" in data["error"].lower()
    assert data["error_type"] == "NotFoundError"
    
    # Verificar que se llamó al servicio con los parámetros correctos
    mock_get_entries.assert_called_once_with(
        visit_id="VIS999",
        field=None,
        role=None
    )

@patch("services.supabase_client.get_emr_entries_by_visit")
async def test_get_entries_missing_visit_id(mock_get_entries):
    """Prueba la respuesta cuando no se proporciona el visit_id."""
    # Realizar la petición sin visit_id
    response = client.get("/api/mcp/entries")
    
    # Verificar el resultado
    assert response.status_code == 422  # Unprocessable Entity
    data = response.json()
    assert "detail" in data
    
    # Verificar que no se llamó al servicio
    mock_get_entries.assert_not_called() 