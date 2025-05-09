#!/usr/bin/env python
"""
Script para verificar que todas las importaciones del microservicio funcionan correctamente.

Ejecutar desde mcp_server/:
    python verify_imports.py
"""

import sys
import importlib
import os
from typing import List, Tuple

def verify_module_imports(module_name: str) -> Tuple[bool, List[str]]:
    """
    Verifica si un módulo se puede importar correctamente.
    
    Args:
        module_name: Nombre del módulo a verificar
        
    Returns:
        Tupla con (éxito, lista de errores)
    """
    errors = []
    success = True
    
    try:
        module = importlib.import_module(module_name)
        print(f"✅ {module_name}: Importado correctamente")
    except ModuleNotFoundError as e:
        errors.append(f"Módulo no encontrado: {str(e)}")
        success = False
    except ImportError as e:
        errors.append(f"Error de importación: {str(e)}")
        success = False
    except Exception as e:
        errors.append(f"Error desconocido: {str(e)}")
        success = False
        
    if not success:
        for error in errors:
            print(f"❌ {module_name}: {error}")
            
    return success, errors

def main():
    """Función principal para verificar importaciones."""
    # Asegurar que el directorio actual está en el path
    if os.getcwd() not in sys.path:
        sys.path.insert(0, os.getcwd())
    
    # Módulos básicos a verificar
    modules = [
        "main",
        "settings",
        "api",
        "api.routes",
        "schemas",
        "schemas.emr_models",
        "schemas.mcp_models",
        "services",
        "services.supabase_client",
        "core",
        "core.tracing",
        "core.langraph_runner"
    ]
    
    # Verificar cada módulo
    all_success = True
    all_errors = []
    
    print("🔍 Verificando importaciones...\n")
    
    for module in modules:
        success, errors = verify_module_imports(module)
        if not success:
            all_success = False
            all_errors.extend(errors)
    
    # Mostrar resultado final
    print("\n==== Resultado Final ====")
    if all_success:
        print("✅ Todas las importaciones funcionan correctamente")
    else:
        print(f"❌ Se encontraron {len(all_errors)} errores de importación")
        
    return 0 if all_success else 1

if __name__ == "__main__":
    sys.exit(main()) 