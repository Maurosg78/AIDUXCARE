"""
Módulo para validación automática de registros clínicos.

Este módulo implementa la funcionalidad de validación para detectar
omisiones críticas y contenido insuficiente en registros clínicos.
"""

from typing import Dict, List, Any, Optional
import logging

# Logger para el módulo de validación
logger = logging.getLogger("mcp-validator")

# Campos obligatorios en un registro clínico completo
REQUIRED_FIELDS = ["anamnesis", "exploracion", "diagnostico", "plan"]

# Longitud mínima recomendada para cada campo (en caracteres)
MIN_LENGTH = {
    "anamnesis": 50,
    "exploracion": 30,
    "diagnostico": 10,
    "plan": 30
}

class ValidationAlert:
    """Representa una alerta de validación."""
    
    def __init__(self, alert_type: str, message: str, field: Optional[str] = None):
        """
        Inicializa una alerta de validación.
        
        Args:
            alert_type: Tipo de alerta (e.g., "campo_faltante", "texto_breve")
            message: Mensaje descriptivo
            field: Campo al que aplica la alerta (opcional)
        """
        self.type = alert_type
        self.message = message
        self.field = field
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte la alerta a un diccionario."""
        result = {
            "type": self.type,
            "message": self.message
        }
        if self.field:
            result["field"] = self.field
        return result

def validate_emr_record(visit_data: Dict[str, Any]) -> List[ValidationAlert]:
    """
    Valida un registro de historia clínica electrónica.
    
    Args:
        visit_data: Diccionario con los campos del registro
    
    Returns:
        Lista de alertas de validación
    """
    alerts = []
    
    # Verificar campos obligatorios
    for field in REQUIRED_FIELDS:
        if field not in visit_data or not visit_data[field]:
            alert = ValidationAlert(
                f"{field}_faltante",
                f"El campo '{field}' es obligatorio y no está presente.",
                field
            )
            alerts.append(alert)
    
    # Verificar longitud mínima
    for field, content in visit_data.items():
        if field in MIN_LENGTH and content and len(content) < MIN_LENGTH[field]:
            alert = ValidationAlert(
                f"{field}_demasiado_breve",
                f"El contenido del campo '{field}' es demasiado breve (mínimo recomendado: {MIN_LENGTH[field]} caracteres).",
                field
            )
            alerts.append(alert)
    
    # Log del resultado
    if alerts:
        logger.warning(f"Se encontraron {len(alerts)} alertas de validación")
    else:
        logger.info("Validación completada sin alertas")
    
    return alerts 