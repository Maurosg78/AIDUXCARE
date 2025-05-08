# Servidor Temporal API (`simple-server.mjs`)

## 🧠 Contexto del problema

El proyecto AiDuxCare enfrenta una incompatibilidad técnica entre los módulos CommonJS (.cjs) y ESM en un entorno TypeScript. Específicamente, el archivo `server.ts` no puede importar correctamente los routers definidos como CJS (por ejemplo, `routes/patients.cjs`) cuando se ejecuta mediante TSX en un contexto ESM.

Este problema se manifiesta como errores 404 en rutas que deberían estar correctamente configuradas.

## 🛠️ Solución implementada

Se desarrolló un servidor temporal (`simple-server.mjs`) que utiliza la API `createRequire()` de Node.js para cargar correctamente los routers CJS sin conflicto:

```js
// simple-server.mjs
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { Console } from 'console';
import process from 'process';

// Configurar console global
const console = new Console(process.stdout, process.stderr);
const require = createRequire(import.meta.url);

const app = express();
app.use(cors());
app.use(express.json());

const patientsRouter = require('./routes/patients.cjs');
console.log('⚙️ JS Inline route /api/patients loaded');
app.use('/api/patients', patientsRouter);

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(4000, () => {
  console.log('🚀 API temporal escuchando en http://localhost:4000');
});
```

## 🔍 Verificación

Ejecutar: `npm run api`

Comprobar: `curl http://localhost:4000/api/patients`

Debe responder con: `{ success: true, message: 'JS inline route active', data: [] }`

## 📦 Cambios en package.json

```json
"scripts": {
  "api": "node simple-server.mjs"
}
```

## 🧭 Plan de migración

Esta solución es temporal. El objetivo es migrar todas las rutas a formato ESM nativo (.mjs o .ts compilado a ESM). Una vez completada esta transición, se restablecerá server.ts como punto de entrada principal del backend.

## 🧾 Registro

- Repositorio oficial: https://github.com/Maurosg78/AIDUXCARE
- Rama activa: v1.8-migrado
- Fecha de implementación: 7 de mayo de 2025
- Responsable técnico: @mauriciosobarzo 