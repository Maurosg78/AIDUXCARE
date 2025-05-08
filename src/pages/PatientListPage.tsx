import { useTranslation } from 'react-i18next';
import { usePatients } from '../hooks/usePatients';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function PatientListPage() {
  const { t } = useTranslation();
  const { patients, isLoading, error } = usePatients();
  const navigate = useNavigate();

  if (isLoading) return <div>{t('common.loading')}</div>;
  if (error) return <div>{t('common.error')}</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('patients.title')}</h1>
        <Button onClick={() => navigate('/patients/new')}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('patients.new')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('patients.name')}</TableHead>
            <TableHead>{t('patients.age')}</TableHead>
            <TableHead>{t('patients.gender')}</TableHead>
            <TableHead>{t('common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients?.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  {t('common.view')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 