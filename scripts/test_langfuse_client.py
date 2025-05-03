from langfuse import Langfuse
import inspect

client = Langfuse(
    public_key="pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d",
    secret_key="sk-lf-c1872960-86af-4899-b275-b7de8d536794",
    host="https://cloud.langfuse.com"
)

# 1. Lista todos los métodos y atributos de client.event
print("Métodos y atributos de client.event:")
print(dir(client.event))

# 2. Muestra la firma del método create
print("\nFirma de client.event.create:")
print(inspect.signature(client.event.create))
