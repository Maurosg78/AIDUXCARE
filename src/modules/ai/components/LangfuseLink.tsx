import React from 'react';
import { Button } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

interface LangfuseLinkProps {
  traceId?: string;
  patientId: string;
}

const LangfuseLink: React.FC<LangfuseLinkProps> = ({ traceId }) => {
  if (!traceId) return null;

  const langfuseUrl = `https://cloud.langfuse.com/project/cma5fncph00uyad070wfdjna6/trace/${traceId}`;

  return (
    <Button
      variant="text"
      size="small"
      startIcon={<LaunchIcon />}
      href={langfuseUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ mt: 1 }}
    >
      Ver en Langfuse
    </Button>
  );
};

export default LangfuseLink; 