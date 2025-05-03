import inspect
from datetime import datetime
from langfuse import Langfuse

# Inspección opcional de la firma (puedes comentarlo luego)
print("Firma de client.event:", inspect.signature(Langfuse(
    public_key="pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d",
    secret_key="sk-lf-c1872960-86af-4899-b275-b7de8d536794",
    host="https://cloud.langfuse.com"
).event))

# Inicializa el cliente
client = Langfuse(
    public_key="pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d",
    secret_key="sk-lf-c1872960-86af-4899-b275-b7de8d536794",
    host="https://cloud.langfuse.com"
)

# 1. Crear un evento de prueba
event = client.event(
    event_type="form.update",
    payload={"patientId": "test", "changedFields": ["x"]},
    timestamp=datetime.utcnow()
)
print("Evento creado:", event)

# 2. Listar los últimos 5 eventos de tipo form.update
events, _ = client.get_events(event_type="form.update", limit=5)
print("=== Últimos 5 form.update ===")
for e in events:
    print(f"ID: {getattr(e, 'id', None)}")
    print(f"Timestamp: {getattr(e, 'timestamp', None)}")
    print(f"Payload: {getattr(e, 'payload', None)}")
    print("-" * 40)
