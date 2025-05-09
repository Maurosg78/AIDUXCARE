# Dockerfile principal que utiliza el de mcp_server
# Esto ayuda a Railway a encontrar el punto de entrada correcto

FROM python:3.11-slim

WORKDIR /app

# Copiar todo el código al contenedor
COPY . .

# Instalar dependencias
RUN cd mcp_server && pip install --no-cache-dir -r requirements.txt

# Establecer variables de entorno
ENV PORT=8001

# Exponer el puerto
EXPOSE ${PORT}

# Comando para iniciar la aplicación
CMD cd mcp_server && python main.py 