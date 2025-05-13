"""
Test para verificar el almacenamiento de alertas de validación.

Este módulo prueba que el endpoint /api/mcp/validate guarde correctamente
las alertas generadas en la tabla validation_alerts.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from fastapi import FastAPI
import logging
import json
from typing import Dict, Any, List
from unittest.mock import patch, MagicMock

# Configurar logging de pruebas
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simular la app y los endpoints
app = FastAPI()
from api.validate import router as validate_router
app.include_router(validate_router)

# Cliente de prueba
client = TestClient(app)

# Casos de prueba
TEST_VISITS = {
    "VIS001": {  # Caso sin alertas
        "anamnesis": "Paciente masculino de 42 años con dolor lumbar irradiado a pierna derecha por trayecto L5. Inicio hace 3 días tras levantar cajas pesadas en mudanza. Dolor 7/10, empeora con movimiento y sedestación prolongada.",
        "exploracion": "PA 130/85, FC 78, afebril. Postura antiálgica. Limitación flexión lumbar. Lasègue positivo 45° derecha. ROT conservados. No déficit motor.",
        "diagnostico": "Lumbociática aguda derecha. Probable hernia discal L4-L5 o L5-S1.",
        "plan": "1. Reposo relativo 48h. 2. Diclofenaco 50mg/8h con protección gástrica. 3. Paracetamol 1g/8h alternando."
    },
    "VIS002": {  # Caso con campos demasiado breves
        "anamnesis": "Cefalea desde ayer.",
        "exploracion": "Normal.",
        "diagnostico": "Cefalea tensional.",
        "plan": "Paracetamol."
    },
    "VIS003": {  # Caso con campos faltantes
        "anamnesis": "Paciente femenina de 35 años con tos productiva, fiebre de 38.5°C.",
        "exploracion": "Febril. Orofaringe hiperémica."
        # Sin diagnóstico ni plan
    }
}

# Mock para simular la función store_validation_alerts
class MockSupabaseClient:
    def __init__(self):
        self.stored_alerts = {}
    
    async def store_alerts(self, visit_id, alerts):
        """Simula el almacenamiento y registra las alertas para verificación."""
        self.stored_alerts[visit_id] = alerts
        return True

# Fixture para simular la base de datos
@pytest.fixture
def mock_db():
    """Crea un mock de la base de datos para las pruebas."""
    return MockSupabaseClient()

# Patch para simular get_visit_fields
def mock_get_visit_fields(visit_id):
    """Simula la función get_visit_fields para devolver datos de prueba."""
    if visit_id not in TEST_VISITS:
        raise ValueError(f"Visita {visit_id} no encontrada")
    return TEST_VISITS[visit_id]

# Test para verificar que no se almacenan alertas cuando no hay errores
@pytest.mark.asyncio
async def test_no_alerts_storage(mock_db):
    """Prueba que no se almacenan alertas cuando la validación no encuentra problemas."""
    with patch('api.validate.get_visit_fields', side_effect=mock_get_visit_fields), \
         patch('api.validate.store_validation_alerts', side_effect=mock_db.store_alerts):
        
        # Realizar validación
        response = client.get("/api/mcp/validate?visit_id=VIS001")
        assert response.status_code == 200
        
        # Verificar respuesta
        data = response.json()
        assert data["validation_passed"] is True
        assert len(data["alerts"]) == 0
        
        # Verificar que no se almacenaron alertas
        assert "VIS001" not in mock_db.stored_alerts

# Test para verificar el almacenamiento de alertas por campos demasiado breves
@pytest.mark.asyncio
async def test_brief_fields_alerts_storage(mock_db):
    """Prueba que se almacenan alertas cuando hay campos demasiado breves."""
    with patch('api.validate.get_visit_fields', side_effect=mock_get_visit_fields), \
         patch('api.validate.store_validation_alerts', side_effect=mock_db.store_alerts):
        
        # Realizar validación
        response = client.get("/api/mcp/validate?visit_id=VIS002")
        assert response.status_code == 200
        
        # Verificar respuesta
        data = response.json()
        assert data["validation_passed"] is False
        assert len(data["alerts"]) > 0
        
        # Verificar tipos de alertas
        alert_types = [alert["type"] for alert in data["alerts"]]
        assert any("demasiado_breve" in alert_type for alert_type in alert_types)
        
        # Verificar que se almacenaron alertas
        assert "VIS002" in mock_db.stored_alerts
        assert len(mock_db.stored_alerts["VIS002"]) == len(data["alerts"])

# Test para verificar el almacenamiento de alertas por campos faltantes
@pytest.mark.asyncio
async def test_missing_fields_alerts_storage(mock_db):
    """Prueba que se almacenan alertas cuando faltan campos obligatorios."""
    with patch('api.validate.get_visit_fields', side_effect=mock_get_visit_fields), \
         patch('api.validate.store_validation_alerts', side_effect=mock_db.store_alerts):
        
        # Realizar validación
        response = client.get("/api/mcp/validate?visit_id=VIS003")
        assert response.status_code == 200
        
        # Verificar respuesta
        data = response.json()
        assert data["validation_passed"] is False
        assert len(data["alerts"]) > 0
        
        # Verificar tipos de alertas específicas
        alert_types = [alert["type"] for alert in data["alerts"]]
        assert "diagnostico_faltante" in alert_types
        assert "plan_faltante" in alert_types
        
        # Verificar que se almacenaron alertas
        assert "VIS003" in mock_db.stored_alerts
        assert len(mock_db.stored_alerts["VIS003"]) == len(data["alerts"])
        
        # Verificar que las alertas almacenadas son las correctas
        stored_types = [alert.type for alert in mock_db.stored_alerts["VIS003"]]
        assert "diagnostico_faltante" in stored_types
        assert "plan_faltante" in stored_types 