"""
Cliente de Supabase para persistencia de datos del MCP.

Este módulo proporciona funciones para interactuar con la base de datos
Supabase, permitiendo almacenar entradas validadas del EMR y consultar
información de visitas existentes.
"""

import os
import httpx
import json
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from settings import settings, logger

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Headers para las peticiones a Supabase
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

class SupabaseClientError(Exception):
    """Excepción personalizada para errores del cliente Supabase."""
    pass

async def check_visit_exists(visit_id: str) -> bool:
    """
    Verifica si una visita existe en Supabase.
    
    Args:
        visit_id: ID de la visita a verificar
        
    Returns:
        True si la visita existe, False en caso contrario
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase no está configurado. Se asume que la visita existe.")
        return True
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/visits",
                headers=SUPABASE_HEADERS,
                params={"visit_id": f"eq.{visit_id}", "select": "visit_id"}
            )
            
            if response.status_code != 200:
                logger.error(f"Error al verificar visita: {response.text}")
                return False
                
            # Si hay al menos un resultado, la visita existe
            return len(response.json()) > 0
    
    except Exception as e:
        logger.error(f"Error al verificar existencia de visita: {str(e)}")
        return False

async def check_field_exists(visit_id: str, field: str) -> bool:
    """
    Verifica si un campo de EMR ya existe para una visita.
    
    Args:
        visit_id: ID de la visita
        field: Campo del EMR (ej: anamnesis, diagnostico)
        
    Returns:
        True si el campo ya existe, False en caso contrario
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase no está configurado. Se asume que el campo no existe.")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/emr_entries",
                headers=SUPABASE_HEADERS,
                params={
                    "visit_id": f"eq.{visit_id}",
                    "field": f"eq.{field}",
                    "select": "id"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error al verificar campo: {response.text}")
                return False
                
            # Si hay al menos un resultado, el campo existe
            return len(response.json()) > 0
    
    except Exception as e:
        logger.error(f"Error al verificar existencia de campo: {str(e)}")
        return False

async def store_emr_entry(
    visit_id: str,
    field: str,
    role: str,
    content: str,
    overwrite: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Almacena una entrada validada del EMR en Supabase.
    
    Args:
        visit_id: ID de la visita médica
        field: Campo del EMR (ej: anamnesis, diagnostico)
        role: Rol del usuario que valida (health_professional, admin_staff)
        content: Contenido validado para almacenar
        overwrite: Si se debe sobrescribir un campo existente
        
    Returns:
        Registro insertado o None si hay error
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase no está configurado. No se puede almacenar la entrada.")
        return None
    
    try:
        # Verificar que la visita existe
        visit_exists = await check_visit_exists(visit_id)
        if not visit_exists:
            raise SupabaseClientError(f"La visita {visit_id} no existe")
        
        # Verificar si el campo ya existe
        field_exists = await check_field_exists(visit_id, field)
        if field_exists and not overwrite:
            raise SupabaseClientError(f"El campo {field} ya existe para la visita {visit_id}")
        
        # Preparar datos para insertar o actualizar
        entry_data = {
            "id": str(uuid.uuid4()),
            "visit_id": visit_id,
            "field": field,
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "source": "mcp",
            "validated": True
        }
        
        # Determinar si insertar o actualizar
        method = 'POST'
        if field_exists and overwrite:
            method = 'PATCH'
            params = {
                "visit_id": f"eq.{visit_id}",
                "field": f"eq.{field}"
            }
        else:
            params = {}
        
        # Realizar la petición a Supabase
        async with httpx.AsyncClient() as client:
            if method == 'POST':
                response = await client.post(
                    f"{SUPABASE_URL}/rest/v1/emr_entries",
                    headers=SUPABASE_HEADERS,
                    json=entry_data
                )
            else:  # PATCH
                response = await client.patch(
                    f"{SUPABASE_URL}/rest/v1/emr_entries",
                    headers=SUPABASE_HEADERS,
                    params=params,
                    json=entry_data
                )
            
            if response.status_code not in (200, 201):
                logger.error(f"Error al almacenar en Supabase: {response.text}")
                return None
            
            result = response.json()
            logger.info(f"EMR entry almacenada correctamente: {visit_id}/{field}")
            return result[0] if isinstance(result, list) else result
    
    except SupabaseClientError as e:
        logger.warning(f"Error de cliente Supabase: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error al almacenar entrada EMR: {str(e)}")
        return None

async def get_supabase_status() -> Dict[str, Any]:
    """
    Verifica el estado de la conexión con Supabase.
    
    Returns:
        Dict con información sobre el estado de Supabase
    """
    status = {
        "connected": False,
        "url": SUPABASE_URL.replace(SUPABASE_KEY, "***") if SUPABASE_URL else "No configurado",
        "timestamp": datetime.now().isoformat()
    }
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        return status
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/",
                headers=SUPABASE_HEADERS
            )
            
            status["connected"] = response.status_code == 200
            status["status_code"] = response.status_code
            
            return status
    
    except Exception as e:
        logger.error(f"Error al verificar estado de Supabase: {str(e)}")
        status["error"] = str(e)
        return status 