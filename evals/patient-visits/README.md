# Pruebas Clínicas de Visitas de Pacientes

Este directorio contiene los scripts de evaluación (evals) para probar la funcionalidad de gestión de visitas de pacientes en AiDuxCare.

## Archivos de prueba

### eval.patient-visits.js
- Ubicación: `evals/patient-visits/eval.patient-visits.js`
- Descripción:
  - Evalúa el servicio genérico de visitas (`VisitService`).
  - Verifica la creación, recuperación, actualización y eliminación de visitas.
- Ejecución:
  ```bash
  # Ejecuta esta prueba junto con las demás
  npx tsx scripts/runAllEvals.ts
  # o por separado:
  node evals/patient-visits/eval.patient-visits.js
  ```

### eval.eva-martinez.js
- Ubicación: `evals/patient-visits/eval.eva-martinez.js`
- Descripción:
  - Prueba específica para el paciente con ID `eva-martinez-1988`.
  - Limpia datos previos, crea dos visitas simuladas y comprueba que `getByPatientId` devuelva exactamente 2 registros.
- Ejecución:
  ```bash
  # Ejecuta todas las pruebas (incluye esta):
  npx tsx scripts/runAllEvals.ts
  # o por separado:
  node evals/patient-visits/eval.eva-martinez.js
  ```

## Ejecución de todas las evaluaciones

Desde la raíz del proyecto:
```bash
npx tsx scripts/runAllEvals.ts
```

## Consideraciones

- Los scripts utilizan `StorageService` con respaldo en memoria, por lo que funcionan en Node.js y en el navegador (localStorage).
- Asegúrate de compilar TypeScript para generar los módulos:
  ```bash
  npx tsc
  ```
- Para añadir nuevas pruebas:
  1. Crea un archivo `eval.xxxx.js` en este directorio.
  2. Exporta una función `runXxxxEval()`.
  3. Importa y llama a esa función en `scripts/runAllEvals.ts`. 