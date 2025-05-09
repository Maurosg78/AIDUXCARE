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

# Puerto para el API (Railway asignará un puerto en producción)
ENV PORT=${PORT:-8001}
EXPOSE $PORT

# Configurar comando de inicio
CMD ["python", "run_app.py"] 