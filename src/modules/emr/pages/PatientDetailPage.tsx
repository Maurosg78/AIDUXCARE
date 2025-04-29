import React from 'react';
import { useParams } from 'react-router-dom';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Detalle del Paciente</h1>
      <p>ID del paciente: {id}</p>
    </div>
  );
};

export default PatientDetailPage;
