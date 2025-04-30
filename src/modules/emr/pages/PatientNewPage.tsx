import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../core/config/routes';

const PatientNewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Nuevo Paciente</h1>
      {/* Aquí irá el formulario de nuevo paciente */}
      <button onClick={() => navigate(ROUTES.EMR.PATIENT_LIST)}>
        Volver a la lista
      </button>
    </div>
  );
};

export default PatientNewPage; 