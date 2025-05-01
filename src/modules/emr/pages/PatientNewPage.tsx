import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientNewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Nuevo Paciente</h1>
      {/* Aquí irá el formulario de nuevo paciente */}
      <button onClick={() => navigate('/')}>
        Volver a la lista
      </button>
    </div>
  );
};

export default PatientNewPage; 