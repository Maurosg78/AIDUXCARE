import { useState, useEffect } from 'react';
import type { Patient  } from '@/core/types';
import PatientService from '@/modules/emr/services/PatientServiceNew';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('No se pudieron cargar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPatient = await PatientService.create(patientData);
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      console.error('Error al crear paciente:', err);
      setError('No se pudo crear el paciente');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedPatient = await PatientService.update(id, patientData);
      setPatients(prev => 
        prev.map(patient => patient.id === id ? updatedPatient : patient)
      );
      return updatedPatient;
    } catch (err) {
      console.error('Error al actualizar paciente:', err);
      setError('No se pudo actualizar el paciente');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await PatientService.delete(id);
      setPatients(prev => prev.filter(patient => patient.id !== id));
    } catch (err) {
      console.error('Error al eliminar paciente:', err);
      setError('No se pudo eliminar el paciente');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchPatients = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!query.trim()) {
        return loadPatients();
      }
      const results = await PatientService.search(query);
      setPatients(results);
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      setError('No se pudieron buscar los pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    patients,
    isLoading,
    error,
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients
  };
} 