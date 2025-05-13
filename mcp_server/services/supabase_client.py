"""
Cliente para interactuar con Supabase desde el microservicio MCP.

Este módulo proporciona una clase para realizar operaciones CRUD
en Supabase de forma simplificada y adaptada a las necesidades del proyecto.
"""

from typing import Dict, Any, List, Optional, Union
import httpx
import json
import logging
from settings import settings
from datetime import datetime
import uuid
from core.validators import ValidationAlert

# Configurar logging
logger = logging.getLogger(__name__)

class SupabaseClientError(Exception):
    """Excepción personalizada para errores del cliente Supabase."""
    pass

class SupabaseClient:
    """
    Cliente simplificado para Supabase.
    
    Proporciona métodos para realizar operaciones básicas CRUD
    adaptadas a las necesidades del proyecto.
    """
    
    def __init__(self):
        """Inicializa el cliente con la configuración de conexión."""
        # Para pruebas, si no hay URL de Supabase, usar datos de prueba
        self.is_mock = not settings.SUPABASE_URL or not settings.SUPABASE_KEY
        self.base_url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        
        if self.is_mock:
            logger.warning("Usando datos de prueba para Supabase")
            self.mock_data = self._load_mock_data()
    
    def _load_mock_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Carga datos de prueba para uso sin conexión real a Supabase."""
        return {
            "emr_entries": [
                {
                    "id": "1",
                    "visit_id": "VIS001",
                    "field": "anamnesis",
                    "content": "Paciente masculino de 45 años que acude por dolor torácico...",
                    "role": "health_professional",
                    "timestamp": "2023-09-01T10:00:00",
                    "source": "mcp",
                    "validated": True
                },
                {
                    "id": "2",
                    "visit_id": "VIS001",
                    "field": "diagnóstico",
                    "content": "Sospecha de angina estable...",
                    "role": "health_professional",
                    "timestamp": "2023-09-01T10:30:00",
                    "source": "mcp",
                    "validated": True
                }
            ]
        }
    
    async def query(self, 
                  table: str, 
                  operation: str, 
                  params: Dict[str, Any]
                  ) -> List[Dict[str, Any]]:
        """
        Ejecuta una operación en Supabase.
        
        Args:
            table: Nombre de la tabla
            operation: Tipo de operación (select, insert, update, delete)
            params: Parámetros específicos de la operación
            
        Returns:
            Resultados de la operación
            
        Raises:
            SupabaseClientError: Si hay un error en la operación
        """
        if self.is_mock:
            return await self._mock_query(table, operation, params)
        
        # Implementación real para conexión con Supabase
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {
                    "apikey": self.key,
                    "Authorization": f"Bearer {self.key}",
                    "Content-Type": "application/json"
                }
                
                if operation == "select":
                    # Construir URL con filtros
                    url = f"{self.base_url}/rest/v1/{table}"
                    headers["Prefer"] = "return=representation"
                    
                    # Añadir filtros como parámetros de query
                    query_params = {}
                    if "filters" in params:
                        for key, value in params["filters"].items():
                            query_params[key] = f"eq.{value}"
                    
                    # Ejecutar consulta
                    response = await client.get(url, headers=headers, params=query_params)
                
                elif operation == "insert":
                    url = f"{self.base_url}/rest/v1/{table}"
                    headers["Prefer"] = "return=representation"
                    response = await client.post(url, headers=headers, json=params["data"])
                
                elif operation == "update":
                    url = f"{self.base_url}/rest/v1/{table}"
                    headers["Prefer"] = "return=representation"
                    
                    # Construir filtros para Where
                    query_params = {}
                    for key, value in params["filters"].items():
                        query_params[key] = f"eq.{value}"
                    
                    response = await client.patch(url, headers=headers, params=query_params, json=params["data"])
                
                elif operation == "delete":
                    url = f"{self.base_url}/rest/v1/{table}"
                    headers["Prefer"] = "return=representation"
                    
                    # Construir filtros para Where
                    query_params = {}
                    for key, value in params["filters"].items():
                        query_params[key] = f"eq.{value}"
                    
                    response = await client.delete(url, headers=headers, params=query_params)
                
                else:
                    raise SupabaseClientError(f"Operación no soportada: {operation}")
                
                # Verificar respuesta
                if response.status_code >= 400:
                    raise SupabaseClientError(f"Error en Supabase: {response.text}")
                
                # Devolver resultados
                return response.json()
        
        except httpx.RequestError as e:
            raise SupabaseClientError(f"Error de conexión con Supabase: {str(e)}")
        except Exception as e:
            raise SupabaseClientError(f"Error al ejecutar operación en Supabase: {str(e)}")
    
    async def _mock_query(self, 
                        table: str, 
                        operation: str, 
                        params: Dict[str, Any]
                        ) -> List[Dict[str, Any]]:
        """
        Simula operaciones en Supabase para pruebas.
        
        Args:
            table: Nombre de la tabla simulada
            operation: Tipo de operación simulada
            params: Parámetros para la simulación
            
        Returns:
            Resultados simulados
        """
        # Verificar que la tabla existe en los datos de prueba
        if table not in self.mock_data:
            self.mock_data[table] = []
        
        if operation == "select":
            # Filtrar datos según los criterios
            results = self.mock_data[table]
            
            if "filters" in params:
                for key, value in params["filters"].items():
                    results = [item for item in results if item.get(key) == value]
            
            return results
        
        elif operation == "insert":
            # Añadir un nuevo registro
            new_id = str(len(self.mock_data[table]) + 1)
            new_record = {**params["data"], "id": new_id}
            self.mock_data[table].append(new_record)
            return [new_record]
        
        elif operation == "update":
            # Actualizar registros existentes
            results = []
            for i, item in enumerate(self.mock_data[table]):
                match = True
                for key, value in params["filters"].items():
                    if item.get(key) != value:
                        match = False
                        break
                
                if match:
                    self.mock_data[table][i] = {**item, **params["data"]}
                    results.append(self.mock_data[table][i])
            
            return results
        
        elif operation == "delete":
            # Eliminar registros
            initial_count = len(self.mock_data[table])
            results = []
            
            # Identificar registros a eliminar
            to_delete = []
            for i, item in enumerate(self.mock_data[table]):
                match = True
                for key, value in params["filters"].items():
                    if item.get(key) != value:
                        match = False
                        break
                
                if match:
                    to_delete.append(i)
                    results.append(item)
            
            # Eliminar en orden inverso para no afectar índices
            for i in sorted(to_delete, reverse=True):
                del self.mock_data[table][i]
            
            return results
        
        else:
            raise SupabaseClientError(f"Operación no soportada: {operation}")

async def get_supabase_status() -> Dict[str, Any]:
    """
    Verifica el estado de la conexión con Supabase.
    
    Returns:
        Información sobre el estado de la conexión
    """
    client = SupabaseClient()
    
    try:
        if client.is_mock:
            return {
                "connected": True,
                "url": "mock://supabase.local",
                "mock": True
            }
        
        # Intentar una operación simple para verificar conexión
        result = await client.query(
            "emr_entries",
            "select",
            {"filters": {}, "limit": 1}
        )
        
        return {
            "connected": True,
            "url": client.base_url,
            "mock": False
        }
    
    except Exception as e:
        logger.error(f"Error al verificar conexión con Supabase: {str(e)}")
        return {
            "connected": False,
            "url": client.base_url if not client.is_mock else "mock://supabase.local",
            "error": str(e),
            "mock": client.is_mock
        }

async def store_validation_alerts(visit_id: str, alerts: List[ValidationAlert]) -> bool:
    """
    Almacena alertas de validación en la tabla validation_alerts de Supabase.
    
    Args:
        visit_id: ID de la visita validada
        alerts: Lista de alertas de validación encontradas
        
    Returns:
        True si el almacenamiento fue exitoso, False en caso contrario
    """
    client = SupabaseClient()
    logger.info(f"Almacenando {len(alerts)} alertas de validación para visita {visit_id}")
    
    timestamp = datetime.now().isoformat()
    
    try:
        for alert in alerts:
            alert_data = {
                "id": str(uuid.uuid4()),
                "visit_id": visit_id,
                "field": alert.field if alert.field else "general",
                "severity": "warning",  # Por defecto todas son warnings
                "type": alert.type,
                "message": alert.message,
                "timestamp": timestamp
            }
            
            await client.query(
                table="validation_alerts",
                operation="insert",
                params={"data": alert_data}
            )
        
        logger.info(f"Alertas almacenadas correctamente para visita {visit_id}")
        return True
    
    except Exception as e:
        logger.error(f"Error al almacenar alertas de validación: {str(e)}")
        return False 