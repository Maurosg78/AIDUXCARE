// import React from "react";
import { RouteObject } from "react-router-dom";
import PatientVisitListPage from "@/modules/emr/pages/PatientVisitListPage";
import VisitDetailPage from "@/modules/emr/pages/VisitDetailPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <div>Inicio de AiDuxCare</div>,
  },
  {
    path: "/patients/:patientId/visits",
    element: <PatientVisitListPage />,
  },
  {
    path: "/visits/:visitId",
    element: <VisitDetailPage />,
  },
];

export default routes;

