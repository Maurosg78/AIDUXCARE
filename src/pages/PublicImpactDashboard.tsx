import React from 'react';
import ImpactDashboard from '../components/ImpactDashboard';
import simulatedData from '@/public-data/evals-simulated.json';

const PublicImpactDashboard: React.FC = () => {
  const testimonials = simulatedData.evaluations.map(evaluation => ({
    id: evaluation.id,
    name: evaluation.patientName,
    role: 'Paciente',
    content: `${evaluation.motivo} - ${evaluation.observaciones}`
  }));

  return (
    <ImpactDashboard 
      metrics={simulatedData.metrics}
      testimonials={testimonials}
    />
  );
};

export default PublicImpactDashboard; 