from notion_client import Client

# Configura tu token secreto y el ID de la base de datos
NOTION_TOKEN = "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"
DATABASE_ID = "1e69c5b052d180258c62d43830641f2a"

notion = Client(auth=NOTION_TOKEN)

# Lista de hitos para cargar
milestones = [
    {
        "Hito / Milestone": "MVP funcional al 100%",
        "Descripción": "Sistema operativo, probado por el equipo, con funcionalidades mínimas estables.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "En progreso"
    },
    {
        "Hito / Milestone": "Validación con usuarios reales",
        "Descripción": "Pruebas en clínica o socios estratégicos con feedback documentado.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Demo profesional grabado del producto",
        "Descripción": "Video breve mostrando uso clínico real o simulado.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Pitch deck profesional completo",
        "Descripción": "Problema, solución, equipo, mercado, modelo y roadmap.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Plan financiero a 3 años",
        "Descripción": "Proyección de ingresos, costos, pricing, punto de equilibrio.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Evidencia de tracción de mercado",
        "Descripción": "Ingresos reales, pilotos o cartas de intención firmadas.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Carta de apoyo de incubadora",
        "Descripción": "Aceptación oficial tras evaluación del proyecto (Spark Niagara).",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🌐 Ambos",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Registro de empresa en Canadá",
        "Descripción": "Incorporación en Ontario con condiciones legales del SUV.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🌐 Ambos",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Documentación migratoria completa",
        "Descripción": "Pasaportes, IELTS, prueba de fondos, formularios IRCC, etc.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Envío formal de solicitud a IRCC",
        "Descripción": "Aplicación a SUV + permiso de trabajo abierto de 3 años.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇪🇸 España",
        "Estado": "Pendiente"
    },
    {
        "Hito / Milestone": "Inicio de operaciones desde Canadá",
        "Descripción": "Mudanza, trabajo con incubadora, primeros pasos operativos.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇨🇦 Canadá",
        "Estado": "Futuro"
    },
    {
        "Hito / Milestone": "Generación de empleo o alianzas locales",
        "Descripción": "Primeras contrataciones o colaboración con entidades de salud canadienses.",
        "¿Requisito para aplicar?": "✅ Sí",
        "Ubicación": "🇨🇦 Canadá",
        "Estado": "Futuro"
    }
]

# Crear cada item en la base de datos de Notion
for milestone in milestones:
    notion.pages.create(
        parent={"database_id": DATABASE_ID},
        properties={
            "Nombre": {"title": [{"text": {"content": milestone["Hito / Milestone"]}}]},
            "Descripción": {"rich_text": [{"text": {"content": milestone["Descripción"]}}]},
            "¿Requisito para aplicar?": {"select": {"name": milestone["¿Requisito para aplicar?"]}},
            "Ubicación": {"select": {"name": milestone["Ubicación"]}},
            "Estado": {"select": {"name": milestone["Estado"]}}
        }
    )

print("✅ Roadmap cargado exitosamente en Notion.")

