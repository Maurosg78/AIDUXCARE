"""
Pruebas para el API del microservicio MCP.

Este módulo contiene pruebas para el endpoint /mcp
utilizando el cliente de pruebas de FastAPI.
"""

import json
import pytest
from fastapi.testclient import TestClient

from app.main import app

# Cliente para pruebas
client = TestClient(app)

def test_root_endpoint():
    """Prueba el endpoint raíz."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "documentation" in response.json()
    assert "health" in response.json()

def test_health_endpoint():
    """Prueba el endpoint de estado."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()
    assert "service" in response.json()
    assert "model" in response.json()

def test_mcp_endpoint_with_valid_data():
    """Prueba el endpoint MCP con datos válidos."""
    test_data = {
        "visit_id": "VISITA_TEST_001",
        "role": "health_professional",
        "user_input": "El paciente refiere dolor cervical desde hace 3 días",
        "context_override": {
            "test": True
        }
    }
    
    response = client.post("/api/mcp", json=test_data)
    
    # Esta prueba puede fallar si el MCP no está correctamente configurado,
    # por lo que verificamos primero si hay error en la respuesta
    if response.status_code != 200:
        print(f"Error en respuesta: {response.json()}")
        
    assert response.status_code == 200
    assert "output" in response.json()
    assert "trace" in response.json()
    assert isinstance(response.json()["trace"], list)
    assert len(response.json()["trace"]) > 0

def test_mcp_endpoint_with_invalid_data():
    """Prueba el endpoint MCP con datos inválidos."""
    # Falta visit_id y user_input
    test_data = {
        "role": "health_professional"
    }
    
    response = client.post("/api/mcp", json=test_data)
    assert response.status_code == 422  # Unprocessable Entity
    assert "error" in response.json()
    assert "details" in response.json()["error"]

def test_mcp_endpoint_with_invalid_role():
    """Prueba el endpoint MCP con un rol inválido."""
    test_data = {
        "visit_id": "VISITA_TEST_001",
        "role": "invalid_role",  # Rol no válido
        "user_input": "El paciente refiere dolor cervical desde hace 3 días"
    }
    
    response = client.post("/api/mcp", json=test_data)
    assert response.status_code == 422  # Unprocessable Entity
    assert "error" in response.json()

# Para ejecutar las pruebas manualmente:
if __name__ == "__main__":
    test_root_endpoint()
    test_health_endpoint()
    # test_mcp_endpoint_with_valid_data()  # Comentado para evitar ejecución completa del MCP en pruebas manuales
    test_mcp_endpoint_with_invalid_data()
    test_mcp_endpoint_with_invalid_role()
    print("Todas las pruebas se han ejecutado correctamente") 