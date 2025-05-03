from langfuse import Langfuse

# Inicializa el cliente
client = Langfuse(
    public_key="pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d",
    secret_key="sk-lf-c1872960-86af-4899-b275-b7de8d536794",
    host="https://cloud.langfuse.com"
)

# 1️⃣ Crea un evento de prueba
event = client.track_event(
    event_type="form.update",
    payload={"patientId": "test-patient", "changedFields": ["testField"]},
)

print("Evento creado:", event.id)

# 2️⃣ Lista los últimos eventos de este tipo
events, _ = client.get_events(event_type="form.update", limit=5)
print("Últimos 5 form.update:")
for ev in events:
    print(f" • {ev.id} @ {ev.timestamp} → {ev.payload}")
