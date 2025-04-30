export const ROUTES = {
  LOGIN: "/login",
  EMR: {
    PATIENT_LIST: "/assistant/patients",
    PATIENT_DETAIL: (id: string) => `/assistant/patient/${id}`,
    PATIENT_NEW: "/assistant/patients/new"
  }
};

