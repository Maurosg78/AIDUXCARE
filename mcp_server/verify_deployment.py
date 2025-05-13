#!/usr/bin/env python
"""
Script para verificar que todos los archivos necesarios para el despliegue en Railway 
estén presentes y correctamente configurados.
"""

import os
import json
import importlib.util
import sys

def check_file_exists(file_path, required=True):
    """Verifica si un archivo existe y es legible."""
    exists = os.path.isfile(file_path)
    if required and not exists:
        print(f"❌ ERROR: Archivo requerido no encontrado: {file_path}")
        return False
    elif exists:
        print(f"✅ Archivo encontrado: {file_path}")
        return True
    else:
        print(f"⚠️ Archivo opcional no encontrado: {file_path}")
        return False

def check_directory_exists(dir_path, required=True):
    """Verifica si un directorio existe."""
    exists = os.path.isdir(dir_path)
    if required and not exists:
        print(f"❌ ERROR: Directorio requerido no encontrado: {dir_path}")
        return False
    elif exists:
        print(f"✅ Directorio encontrado: {dir_path}")
        return True
    else:
        print(f"⚠️ Directorio opcional no encontrado: {dir_path}")
        return False

def check_railway_json():
    """Verifica el archivo railway.json."""
    if not check_file_exists("railway.json"):
        return False
    
    try:
        with open("railway.json", "r") as f:
            config = json.load(f)
        
        if "build" not in config:
            print("❌ ERROR: railway.json incompleto: falta sección 'build'")
            return False
        
        for key in ["rootDir", "buildCommand", "startCommand"]:
            if key not in config["build"]:
                print(f"❌ ERROR: railway.json incompleto: falta clave '{key}' en la sección 'build'")
                return False
        
        if config["build"]["rootDir"] != "mcp_server":
            print(f"⚠️ ADVERTENCIA: 'rootDir' no está configurado como 'mcp_server', es: {config['build']['rootDir']}")
        
        if config["build"]["startCommand"] != "python main.py":
            print(f"⚠️ ADVERTENCIA: 'startCommand' no está configurado como 'python main.py', es: {config['build']['startCommand']}")
        
        print("✅ railway.json está correctamente configurado")
        return True
    except json.JSONDecodeError:
        print("❌ ERROR: railway.json no es un JSON válido")
        return False
    except Exception as e:
        print(f"❌ ERROR: al verificar railway.json: {str(e)}")
        return False

def check_main_py():
    """Verifica que main.py existe y es importable."""
    if not check_file_exists("main.py"):
        return False
    
    try:
        spec = importlib.util.spec_from_file_location("main", "main.py")
        module = importlib.util.module_from_spec(spec)
        sys.modules["main"] = module
        spec.loader.exec_module(module)
        
        # Verificar que la versión es 1.29.0
        if hasattr(module, "app") and hasattr(module.app, "title") and "1.29.0" in module.app.version:
            print(f"✅ main.py contiene la versión correcta: {module.app.version}")
        else:
            print("⚠️ ADVERTENCIA: main.py no contiene la versión 1.29.0 o no se pudo verificar")
        
        return True
    except ImportError as e:
        print(f"❌ ERROR: main.py no se puede importar: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ ERROR: al verificar main.py: {str(e)}")
        return False

def check_requirements():
    """Verifica que requirements.txt existe y contiene las dependencias necesarias."""
    if not check_file_exists("requirements.txt"):
        return False
    
    try:
        with open("requirements.txt", "r") as f:
            requirements = f.read()
        
        required_packages = [
            "fastapi", "uvicorn", "langchain-core", "langgraph", 
            "langfuse", "supabase", "pydantic", "python-dotenv",
            "anthropic"
        ]
        
        missing_packages = []
        for package in required_packages:
            if package not in requirements:
                missing_packages.append(package)
        
        if missing_packages:
            print(f"❌ ERROR: requirements.txt no contiene todas las dependencias requeridas. Falta: {', '.join(missing_packages)}")
            return False
        
        print("✅ requirements.txt contiene todas las dependencias requeridas")
        return True
    except Exception as e:
        print(f"❌ ERROR: al verificar requirements.txt: {str(e)}")
        return False

def main():
    """Función principal que ejecuta todas las verificaciones."""
    print("🔍 Iniciando verificación para despliegue en Railway...")
    print("\n📁 Verificando estructura de directorios...")
    
    required_dirs = ["api", "core", "schemas", "services"]
    optional_dirs = ["app", "tests"]
    
    all_dirs_exist = True
    for dir_name in required_dirs:
        if not check_directory_exists(dir_name):
            all_dirs_exist = False
    
    for dir_name in optional_dirs:
        check_directory_exists(dir_name, required=False)
    
    print("\n📄 Verificando archivos clave...")
    files_ok = (
        check_file_exists("main.py") and
        check_railway_json() and
        check_requirements()
    )
    
    # Verificar main.py en más detalle
    print("\n🔍 Verificando contenido de main.py...")
    main_py_ok = check_main_py()
    
    # Resultado final
    print("\n📋 Resumen de la verificación:")
    if all_dirs_exist and files_ok and main_py_ok:
        print("✅ Todo está listo para el despliegue en Railway! 🚀")
        return 0
    else:
        print("❌ Hay problemas que deben resolverse antes del despliegue.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 