import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

type Props = {
  warnings: string[];
};

const VisitAlert: React.FC<Props> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <AlertTitle>Evaluación incompleta</AlertTitle>
      {warnings.map((msg, index) => (
        <div key={index}>• {msg}</div>
      ))}
    </Alert>
  );
};

export default VisitAlert;
