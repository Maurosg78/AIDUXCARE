FROM python:3.11-slim

WORKDIR /app

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos necesarios
COPY . .

# Puerto para el API
EXPOSE 8000

# Configurar comando de inicio
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 