import inspect
from langfuse import Langfuse

client = Langfuse(
    public_key="pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d",
    secret_key="sk-lf-c1872960-86af-4899-b275-b7de8d536794",
    host="https://cloud.langfuse.com"
)

print("Métodos disponibles en client.event:")
print(dir(client.event))

if hasattr(client.event, "create"):
    print("\nFirma de client.event.create:")
    print(inspect.signature(client.event.create))
elif hasattr(client.event, "track"):
    print("\nFirma de client.event.track:")
    print(inspect.signature(client.event.track))
else:
    print("\nNo se encontró ni 'create' ni 'track' en client.event.")
