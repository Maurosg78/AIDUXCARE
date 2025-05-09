FROM python:3.11-slim

WORKDIR /app

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8001

# Copiar requirements.txt primero para aprovechar la caché de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto (Railway requiere PORT)
EXPOSE ${PORT}

# Comando por defecto
CMD python main.py 