import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, List, ListItem, ListItemText, Divider, Button, Stack } from "@mui/material";
import VisitService from "../services/VisitService";
import { PatientVisit } from "../models/PatientVisit";

const PatientVisitListPage: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<PatientVisit[]>([]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (patientId) {
        const result = await VisitService.getByPatientId(patientId);
        setVisits(result);
      }
    };
    fetchVisits();
  }, [patientId]);

  const handleNewVisit = () => {
    navigate(`/patients/${patientId}/visits/new`);
  };

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Visitas del paciente</Typography>
        <Button variant="contained" onClick={handleNewVisit}>
          Añadir visita
        </Button>
      </Stack>
      <List>
        {visits.map((visit) => (
          <React.Fragment key={visit.id}>
            <ListItem>
              <ListItemText
                primary={`${visit.visitType} — ${visit.visitDate}`}
                secondary={visit.notes || "Sin notas"}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
};

export default PatientVisitListPage;

