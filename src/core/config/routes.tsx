import { RouteObject } from "react-router-dom";
import AssistantPage from "../../modules/assistant/pages/AssistantPage";
import PatientsPage from "../../modules/emr/pages/PatientsPage";
import NewVisitPage from "../../modules/emr/pages/NewVisitPage";

export const routes: RouteObject[] = [
  { path: "/", element: <PatientsPage /> },
  { path: "/assistant", element: <AssistantPage /> },
  { path: "/assistant/patient/:id", element: <NewVisitPage /> },
  // otras rutas aquí...
]; 