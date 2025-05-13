# Backend Modular de AiDuxCare

Este módulo implementa un servidor backend modular en TypeScript con Express para AiDuxCare, siguiendo las mejores prácticas de modularidad, tipado y organización de código.

## Estructura del Proyecto

```
src/backend/
├── app.ts              # Punto de entrada principal
├── middleware/         # Middlewares de Express
│   ├── cors.ts         # Configuración segura de CORS
│   ├── errorHandler.ts # Manejo centralizado de errores
│   └── requestLogger.ts # Logging de solicitudes HTTP
├── routes/             # Rutas de la API organizadas por dominio
│   ├── fhir.ts         # Rutas para recursos FHIR
│   ├── mcp.ts          # Rutas para Medical Control Panel
│   ├── export.ts       # Rutas para exportación de datos
│   └── index.ts        # Configuración central de rutas
├── utils/              # Utilidades compartidas
│   ├── config.ts       # Configuración centralizada
│   └── logger.ts       # Sistema de logging
└── tests/              # Pruebas unitarias e integración
    └── app.test.ts     # Pruebas del servidor
```

## Scripts Disponibles

- **`npm run api:ts`**: Ejecuta el servidor backend directamente con ts-node.
- **`npm run api:dev`**: Inicia el servidor en modo desarrollo con recarga automática.
- **`npm run api:build`**: Compila el backend a JavaScript en la carpeta dist/.
- **`npm run dev:backend`**: Inicia el frontend y backend en modo desarrollo.

## Endpoints de API

El backend proporciona los siguientes endpoints:

### API FHIR

- `GET /api/fhir/:resourceType` - Obtiene recursos FHIR por tipo
- `GET /api/fhir/:resourceType/:id` - Obtiene un recurso FHIR específico
- `POST /api/fhir/:resourceType` - Crea un nuevo recurso FHIR

### Medical Control Panel (MCP)

- `GET /api/mcp/patients` - Obtiene lista de pacientes
- `GET /api/mcp/patients/:id` - Obtiene un paciente específico
- `GET /api/mcp/patients/:id/visits` - Obtiene historial de visitas
- `POST /api/mcp/patients/:id/visits` - Crea una nueva visita
- `GET /api/mcp/visits/:id/audit-log` - Obtiene registro de auditoría

### Exportación de Datos

- `GET /api/export/patients` - Exporta pacientes en formato JSON
- `GET /api/export/visits` - Exporta visitas en formato JSON
- `POST /api/export/csv` - Exporta datos en formato CSV

## Variables de Entorno

El servidor utiliza las siguientes variables de entorno:

- `PORT`: Puerto del servidor (por defecto: 3000)
- `NODE_ENV`: Entorno de ejecución ('development', 'production', etc.)
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS, separados por comas
- `LOG_LEVEL`: Nivel de logging ('error', 'warn', 'info', 'debug')

## Desarrollo

Para comenzar el desarrollo:

```bash
# Instalar dependencias
npm install

# Iniciar el servidor en modo desarrollo
npm run api:dev

# Correr las pruebas
npm test
``` 