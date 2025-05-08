import { Router } from 'express';
import PatientService from '@/core/services/patient/PatientService';

const router = Router();
const patientService = new PatientService();

router.get('/', async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    res.json({ success: true, patients });
  } catch {
    res.status(500).json({ success: false, message: 'Error fetching patients' });
  }
});

export default router; 