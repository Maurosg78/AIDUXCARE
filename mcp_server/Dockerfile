FROM python:3.11-slim

WORKDIR /app

# Copiar todos los archivos
COPY . .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Puerto por defecto
ENV PORT=8001

# Exponer puerto
EXPOSE ${PORT}

# Iniciar aplicación
CMD python main.py 