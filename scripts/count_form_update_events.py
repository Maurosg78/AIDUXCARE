import httpx
from collections import Counter

# Claves de acceso
PUBLIC_KEY = "pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d"
SECRET_KEY = "sk-lf-c1872960-86af-4899-b275-b7de8d536794"
PROJECT_ID = "cma5fncph00uyad070wfdjna6"

# Endpoint de observaciones (spans)
BASE_URL = "https://cloud.langfuse.com/api/public/observations"

# Parámetros de búsqueda
params = {
    "projectId": PROJECT_ID,
    "limit": 100,  # puedes subirlo si necesitas más resultados
    "name": "form.update"
}

auth = (PUBLIC_KEY, SECRET_KEY)

def main():
    print("🔍 Buscando eventos 'form.update' en Langfuse...")
    print("📝 Usando parámetros:", params)
    
    with httpx.Client() as client:
        try:
            response = client.get(BASE_URL, params=params, auth=auth)
            response.raise_for_status()
            data = response.json()
            print("🔄 Respuesta de Langfuse:", data)
            
            observations = data.get("data", data)

            if not observations:
                print("⚠️ No se encontraron eventos 'form.update'.")
                return

            print(f"✅ Encontrados {len(observations)} eventos 'form.update':\n")
            for obs in observations:
                print(f"- ID: {obs.get('id')} | traceId: {obs.get('traceId')} | input: {obs.get('input')}")
                
        except httpx.HTTPError as e:
            print("❌ Error al hacer la petición:", e)
            print("Respuesta:", e.response.text if hasattr(e, 'response') else 'No hay respuesta')
        except Exception as e:
            print("❌ Error inesperado:", e)

if __name__ == "__main__":
    main() 