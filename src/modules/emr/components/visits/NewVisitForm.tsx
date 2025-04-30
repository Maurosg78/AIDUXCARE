import VisitService from "../../services/VisitService";
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PatientVisit } from '../../models';
import { v4 as uuid } from 'uuid';

interface NewVisitFormProps {
  patientId?: string;
  onSuccess?: () => void;
}

const NewVisitForm: React.FC<NewVisitFormProps> = ({ patientId, onSuccess }) => {
  const { id: patientIdFromParams } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const actualPatientId = patientId || patientIdFromParams || '';
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    anamnesis: '',
    physicalExam: '',
    diagnosis: '',
    treatmentPlan: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const visit: PatientVisit = {
      id: uuid(),
      patientId: actualPatientId,
      visitDate: form.date,
      visitType: "treatment",
      status: "completed",
      notes: `${form.anamnesis}\n${form.physicalExam}\n${form.diagnosis}\n${form.treatmentPlan}`
    };

    VisitService.create(visit);
    if (onSuccess) onSuccess();
    navigate(`/assistant/patient/${actualPatientId}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label htmlFor="date">Fecha de visita:</label>
        <input id="date" type="date" name="date" value={form.date} onChange={handleChange} required />
      </div>
      <textarea name="anamnesis" placeholder="Anamnesis" value={form.anamnesis} onChange={handleChange} required />
      <textarea name="physicalExam" placeholder="Exploración física" value={form.physicalExam} onChange={handleChange} required />
      <textarea name="diagnosis" placeholder="Diagnóstico" value={form.diagnosis} onChange={handleChange} required />
      <textarea name="treatmentPlan" placeholder="Plan de tratamiento" value={form.treatmentPlan} onChange={handleChange} required />
      <button type="submit">Guardar visita</button>
    </form>
  );
};

export default NewVisitForm;
