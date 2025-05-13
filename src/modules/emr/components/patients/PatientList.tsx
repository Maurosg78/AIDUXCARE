import { useState, useEffect  } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, TextField } from "@mui/material";
import type { Patient } from '@/types/Patient';
import type { ChangeEvent } from 'react';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  patientService: {
    getPatients(): Promise<Patient[]>;
  };
}

export const PatientList = ({ onSelectPatient, patientService }: PatientListProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatients();
        setPatients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [patientService]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(patient => 
    (patient.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (patient.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <TableContainer component={Paper}>
      <TextField
        label="Buscar paciente"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2, width: '100%' }}
      />
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
          {filteredPatients.map((patient) => (
            <TableRow
              key={patient.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => onSelectPatient(patient)}
            >
              <TableCell>{patient.firstName || ''}</TableCell>
              <TableCell>{patient.lastName || ''}</TableCell>
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
