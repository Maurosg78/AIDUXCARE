# Evals de AiDuxCare

Esta carpeta contiene evaluaciones automatizadas para validar los módulos clave del sistema AiDuxCare. Sigue una estructura basada en buenas prácticas de OpenAI para agentes inteligentes.

## Estructura
- `evals/<modulo>/eval.<modulo>.ts`: lógica del test
- `evals/<modulo>/__mocks__`: datos de entrada simulados
- `evals/<modulo>/__criteria__`: criterios para pasar/fallar la prueba

## Módulos actuales
- `patient-visits`: evalúa la relación paciente-visita y alertas clínicas
