"""
Módulo para la integración del MCP con el sistema EMR (Historia Clínica Electrónica).

Este módulo proporciona funciones para:
1. Obtener datos de visitas médicas desde el EMR
2. Convertir esos datos al formato de contexto utilizado por el MCP
3. Sincronizar el estado entre ambos sistemas

Está diseñado para ser compatible con la arquitectura modular por roles
y el sistema de memoria contextual adaptativa.
"""

import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from mcp.context import MCPContext, UserRole, PriorityLevel

# Simulación de base de datos EMR (en producción sería la integración con Supabase)
# Estos datos se utilizan para las pruebas y como fallback cuando no hay conexión
EMR_VISITAS_SIMULADAS = {
    "VISITA123": {
        "visita": {
            "id": "VISITA123",
            "fecha": "2025-05-08T09:00:00.000Z",
            "estado": "activa",
            "motivo_consulta": "Dolor cervical con irradiación a miembro superior derecho",
            "modalidad": "presencial"
        },
        "paciente": {
            "id": "PAC001",
            "nombre": "Juan Pérez",
            "edad": 42,
            "genero": "masculino",
            "alergias": ["AINEs", "Penicilina"],
            "condiciones_cronicas": ["Hipertensión arterial"]
        },
        "profesional": {
            "id": "PROF001",
            "nombre": "Dra. María López",
            "email": "maria.lopez@aiduxcare.com",
            "especialidad": "Fisioterapia"
        },
        "visitas_anteriores": [
            {
                "id": "VISITA100",
                "fecha": "2025-02-15T10:30:00.000Z",
                "motivo": "Dolor lumbar",
                "diagnostico": "Lumbalgia mecánica",
                "tratamiento": "Ejercicios de estabilización lumbar"
            },
            {
                "id": "VISITA110",
                "fecha": "2025-03-20T11:00:00.000Z",
                "motivo": "Seguimiento dolor lumbar",
                "diagnostico": "Lumbalgia en remisión",
                "tratamiento": "Continuar ejercicios y añadir actividad aeróbica suave"
            }
        ],
        "formularios": {
            "anamnesis": {
                "dolor_actual": "Dolor cervical que se irradia al brazo derecho desde hace 1 semana",
                "intensidad_dolor": 7,
                "factores_agravantes": "Movimientos del cuello, trabajar con ordenador",
                "factores_alivio": "Reposo, calor local"
            },
            "exploracion_fisica": {
                "movilidad_cervical": "Limitada en rotación derecha y lateroflexión derecha",
                "fuerza_muscular": "Disminuida en deltoides y bíceps derecho (4/5)",
                "sensibilidad": "Hipoestesia en cara lateral del brazo derecho"
            }
        }
    },
    "VISITA456": {
        "visita": {
            "id": "VISITA456",
            "fecha": "2025-05-08T16:30:00.000Z",
            "estado": "programada",
            "motivo_consulta": "Rehabilitación post-quirúrgica rodilla",
            "modalidad": "presencial"
        },
        "paciente": {
            "id": "PAC002",
            "nombre": "Elena Gómez",
            "edad": 29,
            "genero": "femenino",
            "alergias": [],
            "condiciones_cronicas": []
        },
        "profesional": {
            "id": "PROF001",
            "nombre": "Dra. María López",
            "email": "maria.lopez@aiduxcare.com",
            "especialidad": "Fisioterapia"
        },
        "visitas_anteriores": [
            {
                "id": "VISITA445",
                "fecha": "2025-04-20T09:15:00.000Z",
                "motivo": "Evaluación pre-quirúrgica",
                "diagnostico": "Rotura de LCA pendiente de cirugía",
                "tratamiento": "Fortalecimiento previo a cirugía"
            }
        ],
        "formularios": {
            "anamnesis": {
                "intervencion_quirurgica": "Reconstrucción de LCA hace 2 semanas",
                "dolor_actual": "Dolor moderado con inflamación",
                "intensidad_dolor": 5,
                "limitaciones_actuales": "No puede apoyar completamente, usa muletas"
            }
        }
    }
}

async def obtener_datos_visita(visit_id: str) -> Dict:
    """
    Obtiene los datos completos de una visita médica desde el EMR.
    
    En un entorno de producción, esta función realizaría una consulta a la API del EMR
    o directamente a la base de datos Supabase.
    
    Args:
        visit_id: Identificador único de la visita
        
    Returns:
        Diccionario con todos los datos de la visita, paciente y profesional
        
    Raises:
        ValueError: Si la visita no existe
    """
    # Simulamos una pequeña latencia como en un entorno real
    # En producción, aquí iría el código de consulta a la API o base de datos
    
    # Verificamos si existe la visita simulada
    if visit_id in EMR_VISITAS_SIMULADAS:
        return EMR_VISITAS_SIMULADAS[visit_id]
    
    # Si no existe, lanzamos un error
    raise ValueError(f"Visita no encontrada: {visit_id}")

def convertir_a_contexto_mcp(
    datos_visita: Dict, 
    user_role: UserRole = "health_professional"
) -> MCPContext:
    """
    Convierte los datos del EMR al formato de contexto utilizado por el MCP.
    
    Args:
        datos_visita: Datos completos de la visita obtenidos del EMR
        user_role: Rol del usuario que iniciará la sesión MCP
        
    Returns:
        Instancia de MCPContext inicializada con los datos del EMR
    """
    # Extraemos datos relevantes de la visita
    visita = datos_visita["visita"]
    paciente = datos_visita["paciente"]
    profesional = datos_visita["profesional"]
    
    # Creamos el contexto MCP
    contexto = MCPContext(
        paciente_id=paciente["id"],
        paciente_nombre=paciente["nombre"],
        visita_id=visita["id"],
        profesional_email=profesional["email"],
        motivo_consulta=visita["motivo_consulta"],
        user_role=user_role,
        datos_iniciales={
            "edad": paciente["edad"],
            "genero": paciente["genero"],
            "alergias": paciente.get("alergias", []),
            "condiciones_cronicas": paciente.get("condiciones_cronicas", [])
        }
    )
    
    # Añadimos las visitas anteriores como bloques de memoria a largo plazo
    if "visitas_anteriores" in datos_visita and datos_visita["visitas_anteriores"]:
        for visita_anterior in datos_visita["visitas_anteriores"]:
            texto_visita = (
                f"Visita {visita_anterior['fecha']}: {visita_anterior['motivo']}. "
                f"Diagnóstico: {visita_anterior.get('diagnostico', 'No registrado')}. "
                f"Tratamiento: {visita_anterior.get('tratamiento', 'No registrado')}"
            )
            
            contexto.agregar_bloque_conversacion(
                actor="system",
                texto=texto_visita,
                prioridad="medium"
            )
    
    # Añadimos información de los formularios como bloques de memoria de alta prioridad
    if "formularios" in datos_visita:
        for nombre_formulario, datos_formulario in datos_visita["formularios"].items():
            # Construimos un texto con el contenido del formulario
            texto_formulario = f"Formulario {nombre_formulario}: "
            for campo, valor in datos_formulario.items():
                texto_formulario += f"{campo}: {valor}. "
            
            # Lo añadimos como bloque de alta prioridad
            contexto.agregar_bloque_conversacion(
                actor="professional",
                texto=texto_formulario,
                prioridad="high"
            )
    
    # Registramos la carga de datos del EMR en la historia del contexto
    contexto.agregar_evento(
        origen="sistema",
        tipo="carga_emr",
        contenido="Datos cargados desde EMR",
        metadatos={
            "visita_id": visita["id"],
            "fecha_visita": visita["fecha"],
            "formularios_cargados": list(datos_visita.get("formularios", {}).keys())
        }
    )
    
    return contexto

async def sincronizar_con_emr(contexto: MCPContext, visit_id: str) -> None:
    """
    Sincroniza el contexto MCP con los datos más recientes del EMR.
    
    Esta función se puede llamar periódicamente para mantener
    el contexto actualizado con los cambios en el EMR.
    
    Args:
        contexto: Contexto MCP activo
        visit_id: ID de la visita a sincronizar
    """
    try:
        # Obtener datos actualizados
        datos_visita = await obtener_datos_visita(visit_id)
        
        # Verificar si hay nuevos formularios
        if "formularios" in datos_visita:
            # Extraer los IDs de formularios ya procesados
            formularios_procesados = set()
            for evento in contexto.historia:
                if evento["tipo"] == "carga_emr" and "formularios_cargados" in evento["metadatos"]:
                    formularios_procesados.update(evento["metadatos"]["formularios_cargados"])
            
            # Procesar solo formularios nuevos
            for nombre_formulario, datos_formulario in datos_visita["formularios"].items():
                if nombre_formulario not in formularios_procesados:
                    # Construir texto del formulario
                    texto_formulario = f"Formulario {nombre_formulario} (actualización): "
                    for campo, valor in datos_formulario.items():
                        texto_formulario += f"{campo}: {valor}. "
                    
                    # Añadir como bloque de alta prioridad
                    contexto.agregar_bloque_conversacion(
                        actor="professional",
                        texto=texto_formulario,
                        prioridad="high"
                    )
            
            # Registrar la sincronización
            contexto.agregar_evento(
                origen="sistema",
                tipo="sincronizacion_emr",
                contenido="Sincronización con EMR completada",
                metadatos={
                    "visita_id": visit_id,
                    "timestamp": datetime.now().isoformat()
                }
            )
    
    except Exception as e:
        # Registrar error de sincronización
        contexto.agregar_evento(
            origen="sistema",
            tipo="error",
            contenido=f"Error al sincronizar con EMR: {str(e)}",
            metadatos={
                "visita_id": visit_id,
                "timestamp": datetime.now().isoformat()
            }
        )

def obtener_estructura_emr() -> Dict[str, Any]:
    """
    Devuelve información sobre la estructura de datos del EMR para debug.
    
    Returns:
        Diccionario con metadatos de la estructura del EMR
    """
    return {
        "tablas": [
            "pacientes", 
            "visitas", 
            "profesionales", 
            "formularios"
        ],
        "formularios_disponibles": [
            "anamnesis",
            "exploracion_fisica",
            "evaluacion_funcional",
            "plan_tratamiento",
            "consentimiento_informado"
        ],
        "version_api": "v1.18.0",
        "endpoints": {
            "visitas": "/api/visitas/{id}",
            "pacientes": "/api/pacientes/{id}",
            "formularios": "/api/formularios/visita/{visita_id}"
        }
    } 