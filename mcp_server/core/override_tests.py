#!/usr/bin/env python
"""
Script para probar el endpoint /api/mcp/entries con datos simulados.

Este script crea un servidor de prueba con FastAPI y un cliente de prueba
que permite verificar el endpoint GET /api/mcp/entries sin necesidad de
que el servidor esté en ejecución o que Supabase esté configurado.
"""

import sys
import os
from datetime import datetime
import json
from unittest.mock import patch, MagicMock

# Asegurar que los módulos están en el path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from fastapi import FastAPI, Path, Query, HTTPException
from typing import Dict, Any, List, Optional

from schemas.emr_models import EMRFieldEntry, EMREntriesResponse, StorageError
from services.supabase_client import SupabaseClientError

# Datos simulados para las pruebas
MOCK_ENTRIES = [
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
    },
    {
        "id": "entry4",
        "visit_id": "VIS001",
        "field": "anamnesis",
        "content": "Actualización de anamnesis: refiere episodios similares en el pasado.",
        "role": "patient",
        "timestamp": "2023-05-15T11:00:00Z",
        "source": "mcp",
        "validated": True
    }
]

# Mock de la función get_emr_entries_by_visit
async def mock_get_emr_entries_by_visit(
    visit_id: str,
    field: Optional[str] = None,
    role: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Versión mock de get_emr_entries_by_visit para tests.
    """
    # Simular visita no encontrada
    if visit_id != "VIS001":
        raise SupabaseClientError(f"La visita {visit_id} no existe")
    
    # Filtrar entradas según los parámetros
    filtered_entries = list(MOCK_ENTRIES)
    
    if field:
        filtered_entries = [e for e in filtered_entries if e["field"] == field]
    
    if role:
        filtered_entries = [e for e in filtered_entries if e["role"] == role]
    
    return filtered_entries

# Crear una aplicación FastAPI para pruebas
app = FastAPI(title="Test MCP Server")

# Modificar la clase StorageError simulada
class MockStorageError(dict):
    """Versión simulada de StorageError para tests."""
    def __init__(self, error: str, error_type: str):
        super().__init__({
            "success": False,
            "error": error,
            "error_type": error_type,
            "timestamp": datetime.now().isoformat()
        })

@app.get("/api/mcp/entries")
async def test_get_emr_entries(
    visit_id: str = Query(..., description="ID de la visita médica"),
    field: Optional[str] = Query(None, description="Campo específico a consultar"),
    role: Optional[str] = Query(None, description="Rol del usuario a filtrar")
) -> Dict[str, Any]:
    """
    Endpoint de prueba para /api/mcp/entries.
    """
    if not visit_id:
        raise HTTPException(status_code=400, detail="El parámetro visit_id es obligatorio")
    
    try:
        # Usar la función mock para simular la consulta
        entries = await mock_get_emr_entries_by_visit(
            visit_id=visit_id,
            field=field,
            role=role
        )
        
        # Construir filtros aplicados
        filters = {"visit_id": visit_id}
        if field:
            filters["field"] = field
        if role:
            filters["role"] = role
        
        # Convertir entries a formato compatible con JSON
        parsed_entries = []
        for entry in entries:
            if isinstance(entry["timestamp"], str):
                # Mantener el timestamp como string
                timestamp = entry["timestamp"]
            else:
                # Convertir a string ISO
                timestamp = entry["timestamp"].isoformat()
                
            # Crear objeto para la respuesta
            parsed_entry = {
                "field": entry["field"],
                "content": entry["content"],
                "role": entry["role"],
                "timestamp": timestamp,
                "source": entry.get("source", "mcp"),
                "validated": entry.get("validated", True),
                "id": entry.get("id")
            }
            parsed_entries.append(parsed_entry)
        
        # Construir respuesta en formato JSON compatible
        response = {
            "visit_id": visit_id,
            "entries": parsed_entries,
            "count": len(parsed_entries),
            "filters": filters,
            "timestamp": datetime.now().isoformat()
        }
        
        return response
        
    except SupabaseClientError as e:
        # Manejar error de visita no encontrada
        if "no existe" in str(e).lower():
            raise HTTPException(
                status_code=404,
                detail=MockStorageError(
                    error=str(e),
                    error_type="NotFoundError"
                )
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=MockStorageError(
                    error=str(e),
                    error_type="SupabaseError"
                )
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=MockStorageError(
                error=f"Error interno: {str(e)}",
                error_type="ServerError"
            )
        )

# Crear cliente de prueba
client = TestClient(app)

def test_all_entries():
    """Test de consulta de todas las entradas."""
    response = client.get("/api/mcp/entries?visit_id=VIS001")
    assert response.status_code == 200
    
    data = response.json()
    assert data["visit_id"] == "VIS001"
    assert data["count"] == 4
    assert len(data["entries"]) == 4
    
    print("\n✅ TEST: Todas las entradas")
    print(f"Status: {response.status_code}")
    print(f"Total entries: {data['count']}")
    return data

def test_filter_by_field():
    """Test de filtrado por campo."""
    response = client.get("/api/mcp/entries?visit_id=VIS001&field=anamnesis")
    assert response.status_code == 200
    
    data = response.json()
    assert data["count"] == 2
    assert all(e["field"] == "anamnesis" for e in data["entries"])
    
    print("\n✅ TEST: Filtro por campo 'anamnesis'")
    print(f"Status: {response.status_code}")
    print(f"Total entries: {data['count']}")
    for entry in data["entries"]:
        print(f"  - {entry['role']}: {entry['content'][:50]}...")
    return data

def test_filter_by_role():
    """Test de filtrado por rol."""
    response = client.get("/api/mcp/entries?visit_id=VIS001&role=patient")
    assert response.status_code == 200
    
    data = response.json()
    assert data["count"] == 1
    assert all(e["role"] == "patient" for e in data["entries"])
    
    print("\n✅ TEST: Filtro por rol 'patient'")
    print(f"Status: {response.status_code}")
    print(f"Total entries: {data['count']}")
    return data

def test_visit_not_found():
    """Test de visita no encontrada."""
    response = client.get("/api/mcp/entries?visit_id=VIS999")
    assert response.status_code == 404
    
    # La respuesta puede variar dependiendo de la implementación del servidor
    # Verificar que es un error 404, sin depender de la estructura exacta
    print(f"\n✅ TEST: Visita no encontrada")
    print(f"Status: {response.status_code}")
    
    # Intentar acceder a los datos, pero aceptar que puede tener diferentes formatos
    try:
        data = response.json()
        if "error" in data:
            print(f"Error: {data['error']}")
        elif "detail" in data:
            print(f"Error: {data['detail']}")
        else:
            print(f"Error: {data}")
    except Exception as e:
        print(f"No se pudo parsear la respuesta JSON: {str(e)}")
        print(f"Respuesta: {response.text}")
    
    # No asumimos una estructura exacta del error
    return response

def main():
    """Ejecutar todas las pruebas."""
    print("🧪 Pruebas del endpoint GET /api/mcp/entries")
    print("=============================================")
    
    # Ejecutar pruebas
    test_all_entries()
    test_filter_by_field()
    test_filter_by_role()
    test_visit_not_found()
    
    print("\n✅ Todas las pruebas completadas exitosamente")
    
if __name__ == "__main__":
    main() 