import httpx
import sys
from collections import Counter

PUBLIC_KEY = "pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d"
SECRET_KEY = "sk-lf-c1872960-86af-4899-b275-b7de8d536794"
PROJECT_ID = "cma5fncph00uyad070wfdjna6"
BASE_URL = "https://cloud.langfuse.com/api/public/observations"

trace_id = None
span_name = None
limit = 100  # Aumentado a 100 para obtener más spans

if len(sys.argv) > 1:
    trace_id = sys.argv[1]
if len(sys.argv) > 2:
    span_name = sys.argv[2]

params = {"projectId": PROJECT_ID, "limit": limit}
if trace_id:
    params["traceId"] = trace_id
if span_name:
    params["name"] = span_name

auth = (PUBLIC_KEY, SECRET_KEY)

def main():
    print(f"Consultando observations de Langfuse para el proyecto {PROJECT_ID}...")
    print(f"Parámetros: {params}")
    with httpx.Client() as client:
        response = client.get(BASE_URL, params=params, auth=auth)
        response.raise_for_status()
        data = response.json()
        observations = data.get("data", data)

        if not observations:
            print("No se encontraron spans/observations.")
            return

        # Contar frecuencia de nombres
        names = [obs.get("name") for obs in observations]
        freq = Counter(names)

        # Imprimir ordenado por frecuencia (de mayor a menor)
        print("\nFrecuencia de nombres de spans:")
        for name, count in freq.most_common():
            print(f"{name}: {count}")

if __name__ == "__main__":
    main()
