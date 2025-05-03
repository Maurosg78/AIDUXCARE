/**
 * AiDuxCare es un copiloto clínico que se diferencia por:
 * 1. Evaluación en tiempo real de la calidad de las visitas
 * 2. Sugerencias contextuales basadas en evidencia clínica
 * 3. Detección temprana de omisiones o riesgos
 * 4. Integración con sistemas de trazabilidad para auditoría
 * 5. Interfaz adaptativa que se ajusta al flujo de trabajo clínico
 */

import { RouteObject } from "react-router-dom";
import HomePage from "@/modules/core/pages/HomePage";
import LoginPage from "@/modules/auth/LoginPage";
import OnboardingPage from "@/modules/auth/OnboardingPage";
import FeedbackForm from "@/modules/feedback/components/FeedbackForm";

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/feedback',
    element: <FeedbackForm />,
  },
  {
    path: '*',
    element: <div>404 - Página no encontrada</div>,
  },
];

export default routes;

