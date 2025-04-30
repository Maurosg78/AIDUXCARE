import React from 'react';
import PatientService from '../../services/PatientService';

export const DevTools: React.FC = () => {
  if (!import.meta.env.DEV) return null;

  const handleClear = () => {
    PatientService.clearAll();
    window.location.reload();
  };

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#eee', padding: '8px', borderRadius: '8px' }}>
      <button onClick={handleClear}>🧹 Limpiar pacientes</button>
    </div>
  );
};
