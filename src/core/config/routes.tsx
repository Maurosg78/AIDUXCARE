import { RouteObject } from "react-router-dom";
import HomePage from "@/modules/core/pages/HomePage";
import PatientVisitListPage from "@/modules/emr/pages/PatientVisitListPage";
import VisitDetailPage from "@/modules/emr/pages/VisitDetailPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
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

