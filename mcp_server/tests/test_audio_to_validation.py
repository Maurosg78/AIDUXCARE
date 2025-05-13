"""
Test funcional para flujo completo de audio a validación.

Este test simula el proceso completo de:
1. Transcripción de campos clínicos desde audio
2. Almacenamiento de cada campo en /store
3. Validación automática en /validate
4. Verificación de alertas en validation_alerts
"""

import pytest
import json
import asyncio
import logging
from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("audio-to-validation-test")

# Crear app de prueba
app = FastAPI()
from api.store import router as store_router
from api.validate import router as validate_router
app.include_router(store_router)
app.include_router(validate_router)

# Cliente para pruebas
client = TestClient(app)

# ID de visita para pruebas
VIS_TEST = "VIS_TEST"

# Datos simulados de transcripción desde audio
TEST_AUDIO_FIELDS = {
    "anamnesis": "Paciente masculino de 58 años con dolor precordial de inicio súbito hace 2 horas. Irradiado a brazo izquierdo. Antecedentes de HTA y dislipemia.",
    "exploracion": "PA 160/95, FC 95, afebril. Auscultación cardíaca arrítmica sin soplos. Ligeros crepitantes bibasales.",
    "diagnostico": "Síndrome coronario agudo. Fibrilación auricular de reciente diagnóstico.",
    "plan": "1. Realizar ECG urgente. 2. Analítica con marcadores cardíacos. 3. AAS 300mg. 4. Nitroglicerina sublingual."
}

# Datos incompletos para prueba de validación fallida
TEST_INCOMPLETE_FIELDS = {
    "anamnesis": "Paciente con dolor",
    "exploracion": "Exploración normal"
    # Falta diagnóstico y plan
}

class MockStorageClient:
    """Cliente simulado para almacenamiento."""
    
    def __init__(self):
        self.stored_fields = {}
        self.validation_alerts = []
    
    async def store_field(self, visit_id, field, content, role="health_professional"):
        """Simula almacenamiento de un campo clínico."""
        key = f"{visit_id}:{field}"
        self.stored_fields[key] = {
            "id": f"entry_{len(self.stored_fields) + 1}",
            "visit_id": visit_id,
            "field": field,
            "content": content,
            "role": role,
            "timestamp": datetime.now().isoformat()
        }
        return {"success": True, "entry_id": self.stored_fields[key]["id"]}
    
    async def store_alerts(self, visit_id, alerts):
        """Simula almacenamiento de alertas de validación."""
        for alert in alerts:
            self.validation_alerts.append({
                "id": f"alert_{len(self.validation_alerts) + 1}",
                "visit_id": visit_id,
                "field": alert.field,
                "type": alert.type,
                "message": alert.message,
                "timestamp": datetime.now().isoformat()
            })
        return True
    
    def get_stored_fields_count(self, visit_id):
        """Devuelve la cantidad de campos almacenados para una visita."""
        return len([k for k in self.stored_fields.keys() if k.startswith(f"{visit_id}:")])
    
    def get_alerts_count(self):
        """Devuelve la cantidad de alertas almacenadas."""
        return len(self.validation_alerts)
    
    def clear(self):
        """Limpia los datos almacenados."""
        self.stored_fields = {}
        self.validation_alerts = []

# Fixture para el cliente de almacenamiento simulado
@pytest.fixture
def mock_storage():
    client = MockStorageClient()
    yield client
    client.clear()

# Simular getters del servicio EMR
def mock_get_visit_fields(visit_id):
    """Simula recuperación de campos de una visita."""
    if visit_id == VIS_TEST:
        return TEST_AUDIO_FIELDS
    elif visit_id == "VIS_INCOMPLETE":
        return TEST_INCOMPLETE_FIELDS
    else:
        return {}

# Test del flujo completo con campos válidos
@pytest.mark.asyncio
async def test_audio_to_validation_complete_flow(mock_storage):
    """Prueba el flujo completo desde audio hasta validación con campos válidos."""
    # Configurar mocks para los endpoints
    with patch('api.store.simulate_store_emr_entry', side_effect=mock_storage.store_field), \
         patch('api.validate.get_visit_fields', side_effect=mock_get_visit_fields), \
         patch('api.validate.store_validation_alerts', side_effect=mock_storage.store_alerts):
        
        # 1. Almacenar cada campo desde la "transcripción de audio"
        for field, content in TEST_AUDIO_FIELDS.items():
            store_payload = {
                "visit_id": VIS_TEST,
                "field": field,
                "role": "health_professional",
                "content": content,
                "overwrite": True
            }
            
            response = client.post("/api/mcp/store", json=store_payload)
            assert response.status_code == 200
            assert response.json()["success"] is True
        
        # Verificar que se almacenaron todos los campos
        assert mock_storage.get_stored_fields_count(VIS_TEST) == 4
        
        # 2. Ejecutar validación automática
        response = client.get(f"/api/mcp/validate?visit_id={VIS_TEST}")
        assert response.status_code == 200
        
        # 3. Verificar el resultado de la validación
        validation_data = response.json()
        assert validation_data["validation_passed"] is True
        assert len(validation_data["alerts"]) == 0
        assert len(validation_data["fields_validated"]) == 4
        
        # 4. Verificar que no se almacenaron alertas (porque no hay)
        assert mock_storage.get_alerts_count() == 0
        
        logger.info("✅ Test exitoso: Flujo completo desde audio hasta validación (caso sin alertas)")

# Test del flujo con campos incompletos que generan alertas
@pytest.mark.asyncio
async def test_audio_to_validation_incomplete_flow(mock_storage):
    """Prueba el flujo con campos incompletos que generan alertas de validación."""
    # Configurar mocks para los endpoints
    with patch('api.store.simulate_store_emr_entry', side_effect=mock_storage.store_field), \
         patch('api.validate.get_visit_fields', side_effect=mock_get_visit_fields), \
         patch('api.validate.store_validation_alerts', side_effect=mock_storage.store_alerts):
        
        # 1. Almacenar campos incompletos
        for field, content in TEST_INCOMPLETE_FIELDS.items():
            store_payload = {
                "visit_id": "VIS_INCOMPLETE",
                "field": field,
                "role": "health_professional",
                "content": content,
                "overwrite": True
            }
            
            response = client.post("/api/mcp/store", json=store_payload)
            assert response.status_code == 200
        
        # Verificar que se almacenaron solo los campos proporcionados
        assert mock_storage.get_stored_fields_count("VIS_INCOMPLETE") == 2
        
        # 2. Ejecutar validación automática
        response = client.get("/api/mcp/validate?visit_id=VIS_INCOMPLETE")
        assert response.status_code == 200
        
        # 3. Verificar el resultado de la validación
        validation_data = response.json()
        assert validation_data["validation_passed"] is False
        
        # Debe tener alertas por campos faltantes y textos breves
        assert len(validation_data["alerts"]) >= 2
        
        # Verificar alertas específicas
        alert_types = [alert["type"] for alert in validation_data["alerts"]]
        assert "diagnostico_faltante" in alert_types
        assert "plan_faltante" in alert_types
        assert "anamnesis_demasiado_breve" in alert_types
        
        # 4. Verificar que se almacenaron las alertas
        assert mock_storage.get_alerts_count() >= 2
        
        logger.info("✅ Test exitoso: Flujo con campos incompletos (caso con alertas)")

# Test de manejo de errores
@pytest.mark.asyncio
async def test_error_handling_in_audio_validation_flow(mock_storage):
    """Prueba el manejo de errores en el flujo de audio a validación."""
    # Simular error en almacenamiento
    async def store_with_error(*args, **kwargs):
        raise Exception("Error simulado en almacenamiento")
    
    # Configurar mocks para simular error
    with patch('api.store.simulate_store_emr_entry', side_effect=store_with_error):
        # Intentar almacenar un campo
        store_payload = {
            "visit_id": VIS_TEST,
            "field": "anamnesis",
            "role": "health_professional",
            "content": "Contenido de prueba",
            "overwrite": True
        }
        
        # Debe fallar y devolver error 500
        response = client.post("/api/mcp/store", json=store_payload)
        assert response.status_code == 500
        assert "Error al almacenar" in response.json()["detail"]
        
        logger.info("✅ Test exitoso: Manejo de errores en el flujo")

if __name__ == "__main__":
    # Para ejecutar manualmente este test
    logging.basicConfig(level=logging.INFO)
    pytest.main(["-xvs", __file__]) 