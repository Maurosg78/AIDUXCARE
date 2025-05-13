"""
Tests para el endpoint de consulta de entradas clínicas.

Este módulo contiene pruebas para el endpoint GET /api/mcp/entries,
verificando que se procesen correctamente las solicitudes de consulta
de entradas clínicas almacenadas en Supabase.
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
import json
from datetime import datetime, timezone

# Activar el modo de datos simulados para tests
os.environ["MOCK_EMR_DATA"] = "TRUE"

# Asegurar que el directorio raíz está en el path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

# Importación directa de app desde main.py
from main import app
from services.supabase_client import SupabaseClientError, get_emr_entries_by_visit

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

# Crear un mock de la función get_emr_entries_by_visit para los tests
async def mock_get_function(visit_id, field=None, role=None):
    """Versión de prueba de get_emr_entries_by_visit."""
    entries = [
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
    
    # Validar visita
    if visit_id != "VIS001":
        raise SupabaseClientError(f"La visita {visit_id} no existe")
    
    # Filtrar por campo si se especificó
    if field:
        entries = [e for e in entries if e["field"] == field]
    
    # Filtrar por rol si se especificó
    if role:
        entries = [e for e in entries if e["role"] == role]
        
    return entries

@patch("services.supabase_client.get_emr_entries_by_visit", side_effect=mock_get_function)
def test_get_entries_all(mock_get_entries):
    """Prueba la consulta de todas las entradas de una visita."""
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

@patch("services.supabase_client.get_emr_entries_by_visit", side_effect=mock_get_function)
def test_get_entries_by_field(mock_get_entries):
    """Prueba la consulta de entradas filtradas por campo."""
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=anamnesis")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["entries"][0]["field"] == "anamnesis"
    assert "field" in data["filters"]
    assert data["filters"]["field"] == "anamnesis"

@patch("services.supabase_client.get_emr_entries_by_visit", side_effect=mock_get_function)
def test_get_entries_with_multiple_filters(mock_get_entries):
    """Prueba la consulta de entradas con múltiples filtros."""
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

@patch("services.supabase_client.get_emr_entries_by_visit", side_effect=mock_get_function)
def test_get_entries_empty_result(mock_get_entries):
    """Prueba la respuesta cuando no hay entradas que coincidan con los filtros."""
    # Realizar la petición con un campo que no existe
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=campo_inexistente")
    
    # Verificar el resultado
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert len(data["entries"]) == 0
    assert data["filters"]["field"] == "campo_inexistente"

@patch("services.supabase_client.get_emr_entries_by_visit", side_effect=mock_get_function)
def test_get_entries_visit_not_found(mock_get_entries):
    """Prueba la respuesta cuando la visita no existe."""
    # Realizar la petición
    response = client.get("/api/mcp/entries?visit_id=VIS999")
    
    # Solo verificamos que sea un código de error (4xx o 5xx)
    assert response.status_code >= 400, f"Se esperaba un código de error, pero se obtuvo {response.status_code}"
    
    # Verificar que hay datos en la respuesta
    data = response.json()
    assert data is not None, "La respuesta debe contener datos JSON"

def test_get_entries_missing_visit_id():
    """Prueba la respuesta cuando no se proporciona el visit_id."""
    # Realizar la petición sin visit_id
    response = client.get("/api/mcp/entries")
    
    # Verificar el resultado
    assert response.status_code == 422  # Unprocessable Entity
    data = response.json()
    # La estructura exacta puede variar, pero debería indicar que falta visit_id
    assert "error" in data or "detail" in data 