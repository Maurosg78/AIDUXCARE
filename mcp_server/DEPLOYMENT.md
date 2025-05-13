# Guía de Despliegue - MCP Server AiDuxCare v1.21.0

Esta guía explica cómo desplegar el microservicio MCP para AiDuxCare en diferentes entornos.

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue Local](#despliegue-local)
3. [Despliegue en Railway](#despliegue-en-railway)
4. [Despliegue en VPS](#despliegue-en-vps)
5. [Variables de Entorno](#variables-de-entorno)
6. [Monitorización](#monitorización)
7. [Solución de Problemas](#solución-de-problemas)

## Requisitos Previos

- Python 3.11+
- Docker y Docker Compose (para contenedores)
- Acceso a la API de OpenAI (para modelos GPT)
- Git
- Cuenta en Railway (opcional)
- Servidor VPS con Ubuntu 20.04+ (opcional)

## Despliegue Local

### Usando Python Virtual Environment

1. Clonar el repositorio:
```bash
git clone https://github.com/Maurosg78/AIDUXCARE.git
cd AIDUXCARE/mcp_server
```

2. Crear y activar entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con las configuraciones apropiadas
```

5. Ejecutar el servidor:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Usando Docker

1. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con las configuraciones apropiadas
```

2. Construir y ejecutar con Docker Compose:
```bash
docker-compose up --build
```

## Despliegue en Railway

Railway es una plataforma PaaS que facilita el despliegue de aplicaciones.

1. Crear una cuenta en [Railway](https://railway.app/)

2. Instalar la CLI de Railway:
```bash
npm i -g @railway/cli
```

3. Iniciar sesión desde la terminal:
```bash
railway login
```

4. Inicializar el proyecto en Railway:
```bash
cd AIDUXCARE/mcp_server
railway init
```

5. Establecer variables de entorno:
```bash
railway variables set ENVIRONMENT=production
railway variables set DEBUG=false
railway variables set OPENAI_API_KEY=sk-...
railway variables set LOG_LEVEL=INFO
# Añadir otras variables necesarias
```

6. Desplegar la aplicación:
```bash
railway up
```

## Despliegue en VPS

### Preparación del Servidor

1. Conectarse al servidor:
```bash
ssh usuario@direccion-ip
```

2. Actualizar el sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Instalar dependencias:
```bash
sudo apt install -y python3-pip python3-venv docker.io docker-compose git
```

4. Clonar el repositorio:
```bash
git clone https://github.com/Maurosg78/AIDUXCARE.git
cd AIDUXCARE/mcp_server
```

### Método 1: Despliegue con Docker

1. Configurar variables de entorno:
```bash
cp env.example .env
nano .env  # Editar con las configuraciones apropiadas
```

2. Construir y ejecutar el contenedor:
```bash
sudo docker-compose up -d --build
```

### Método 2: Despliegue con Gunicorn y Nginx

1. Crear y activar entorno virtual:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
pip install gunicorn
```

3. Configurar variables de entorno:
```bash
cp env.example .env
nano .env  # Editar con las configuraciones apropiadas
```

4. Crear un archivo systemd para gestionar el servicio:
```bash
sudo nano /etc/systemd/system/mcp-server.service
```

5. Añadir la siguiente configuración:
```ini
[Unit]
Description=MCP Server - AiDuxCare
After=network.target

[Service]
User=usuario
Group=usuario
WorkingDirectory=/ruta/a/AIDUXCARE/mcp_server
ExecStart=/ruta/a/AIDUXCARE/mcp_server/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=on-failure
Environment="DEBUG=false"
Environment="ENVIRONMENT=production"
Environment="OPENAI_API_KEY=sk-..."
# Añadir otras variables necesarias

[Install]
WantedBy=multi-user.target
```

6. Iniciar y habilitar el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl start mcp-server
sudo systemctl enable mcp-server
```

7. Configurar Nginx como proxy inverso:
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/mcp-server
```

8. Añadir configuración de Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

9. Activar la configuración y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/mcp-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| DEBUG | Modo de depuración | false |
| ENVIRONMENT | Entorno de ejecución | production |
| LOG_LEVEL | Nivel de logs | INFO |
| OPENAI_API_KEY | Clave API de OpenAI | - |
| HOST | Host del servidor | 0.0.0.0 |
| PORT | Puerto del servidor | 8000 |
| LLM_MODEL | Modelo de LLM a utilizar | gpt-3.5-turbo |
| MAX_TOKENS | Máximo de tokens | 2000 |
| TEMPERATURE | Temperatura para generación | 0.7 |
| CORS_ORIGINS | Orígenes permitidos para CORS | http://localhost:3000,https://aiduxcare.vercel.app |

## Monitorización

### Logs

Los logs se pueden consultar:

- En despliegue local: a través de la consola
- En Docker: `docker logs mcp-server`
- En systemd: `sudo journalctl -u mcp-server`
- En Railway: a través del panel de control

### Endpoints de Estado

- **GET /api/health**: Devuelve el estado del servicio
- **GET /docs**: Documentación interactiva OpenAPI
- **GET /redoc**: Documentación alternativa

## Solución de Problemas

### Error: No se puede conectar al servidor

1. Verificar que el servidor está en ejecución:
```bash
# Para systemd
sudo systemctl status mcp-server

# Para Docker
docker ps
```

2. Comprobar logs:
```bash
# Para systemd
sudo journalctl -u mcp-server -n 50

# Para Docker
docker logs mcp-server
```

3. Verificar firewall:
```bash
sudo ufw status
# Si el puerto está bloqueado
sudo ufw allow 8000
```

### Error: ModuleNotFoundError

1. Verificar que todas las dependencias están instaladas:
```bash
pip install -r requirements.txt
```

2. Comprobar que estás en el directorio correcto:
```bash
cd /ruta/a/AIDUXCARE/mcp_server
```

### Error: Problemas con la API de OpenAI

1. Verificar que la clave API es válida:
```bash
# Test de la API con curl
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json"
```

2. Comprobar límites de uso:
```bash
# Revisar el panel de control de OpenAI
```

Si persisten los problemas, contactar al equipo de desarrollo de AiDuxCare. 