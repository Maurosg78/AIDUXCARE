import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer } from "@mui/material";
import { Patient } from "@/core/types";

interface PatientListProps {
  patients: Patient[];
}

const PatientList: React.FC<PatientListProps> = ({ patients }) => {
  const handleClick = (id: string) => {
    window.location.href = `/patients/${id}/visits`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Fecha de nacimiento</TableCell>
            <TableCell>Género</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => handleClick(patient.id)}
            >
              <TableCell>{patient.firstName}</TableCell>
              <TableCell>{patient.lastName}</TableCell>
              <TableCell>{patient.birthDate}</TableCell>
              <TableCell>{patient.gender}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PatientList;
