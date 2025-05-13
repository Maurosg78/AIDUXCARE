# Despliegue de AiDuxCare MCP v1.29.0 en Railway

Este documento describe el proceso de despliegue del microservicio MCP (Model Context Protocol) de AiDuxCare v1.29.0 en Railway.

## Requisitos Previos

- Cuenta en [Railway](https://railway.app/)
- Cuenta en [Supabase](https://supabase.com/) con base de datos configurada
- Cuenta en [Anthropic](https://www.anthropic.com/) para acceso a Claude
- Cuenta en [Langfuse](https://langfuse.com/) para trazabilidad

## Configuración de Variables de Entorno

El microservicio requiere las siguientes variables de entorno:

### Supabase
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase

### Anthropic (Claude)
- `ANTHROPIC_API_KEY`: API Key de Anthropic
- `MODEL_PROVIDER`: Configurado como "anthropic"
- `DEFAULT_MODEL`: Configurado como "claude-3-sonnet-20240229"

### Langfuse
- `LANGFUSE_PUBLIC_KEY`: Clave pública de Langfuse
- `LANGFUSE_SECRET_KEY`: Clave secreta de Langfuse
- `LANGFUSE_HOST`: URL de Langfuse (normalmente "https://cloud.langfuse.com")

### MCP Server
- `PORT`: Puerto del servidor (Railway asignará este valor automáticamente)
- `ENABLE_TRACE`: Habilitar trazabilidad con Langfuse (true/false)
- `DEBUG`: Modo debug (false en producción)
- `ENVIRONMENT`: Entorno de ejecución ("production")
- `LOG_LEVEL`: Nivel de log ("INFO" recomendado para producción)

## Pasos para el Despliegue

1. **Crear Nuevo Proyecto en Railway**
   - Inicia sesión en Railway
   - Crea un nuevo proyecto

2. **Conectar Repositorio**
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio que contiene el código de AiDuxCare

3. **Configurar Variables de Entorno**
   - En la pestaña "Variables", agrega todas las variables mencionadas anteriormente
   - Asegúrate de usar los valores correctos para tus servicios

4. **Despliegue**
   - Railway detectará automáticamente el archivo `railway.json` y seguirá las instrucciones
   - El despliegue se realizará automáticamente

5. **Verificación**
   - Una vez completado el despliegue, Railway proporcionará una URL
   - Verifica el funcionamiento accediendo a la URL + "/api/health"

## Monitoreo y Logs

- Railway proporciona acceso a los logs del microservicio
- Langfuse te permitirá ver las trazas de los llamados a Claude
- Supabase almacenará los registros de validaciones y alertas

## Mantenimiento

- Los despliegues posteriores se realizarán automáticamente cuando se hagan push a la rama principal
- Puedes configurar despliegues manuales o programados en Railway

## Solución de Problemas

Si encuentras problemas durante el despliegue:

1. **Verifica los logs en Railway** para identificar errores
2. **Revisa las variables de entorno** y asegúrate de que todas estén correctamente configuradas
3. **Verifica la conectividad con Supabase y Langfuse** desde el panel de Railway

## Comandos Útiles

- El microservicio se inicia utilizando `python run_app.py`
- Para pruebas locales, copia `env.example` a `.env` y configura las variables

## Notas de Seguridad

- Nunca expongas tus claves API en el código
- Utiliza siempre variables de entorno para las claves
- Asegúrate de que las claves de Supabase tengan los permisos mínimos necesarios 