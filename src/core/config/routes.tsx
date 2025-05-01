// import React from "react";
import { RouteObject } from "react-router-dom";
import PatientVisitListPage from "@/modules/emr/pages/PatientVisitListPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <div>Inicio de AiDuxCare</div>,
  },
  {
    path: "/patients/:patientId/visits",
    element: <PatientVisitListPage />,
  },
];

export default routes;

