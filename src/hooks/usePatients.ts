import useSWR from 'swr';
import { Patient } from '@/core/schemas/PatientSchema';
import { appConfig, getApiUrl } from '@/core/config/appConfig';

// Datos mock de pacientes para desarrollo
const MOCK_PATIENTS: Patient[] = [
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    full_name: 'Juan Pérez',
    birth_date: '1978-05-12T00:00:00Z',
    sex: 'M',
    email: 'juan.perez@ejemplo.com',
    clinical_history: ['Hipertensión', 'Diabetes tipo 2'],
    tags: ['crónico', 'seguimiento'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    full_name: 'María López',
    birth_date: '1985-10-20T00:00:00Z',
    sex: 'F',
    email: 'maria.lopez@ejemplo.com',
    clinical_history: 'Primera visita para evaluación general',
    tags: ['nuevo', 'evaluación'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    full_name: 'Carlos Gómez',
    birth_date: '1961-03-15T00:00:00Z',
    sex: 'M',
    clinical_history: ['Artrosis', 'Fisioterapia post-operatoria'],
    tags: ['rehabilitación', 'mayor'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Función fetcher que primero intenta la API y si falla devuelve datos mock
const fetcher = async () => {
  const url = getApiUrl(appConfig.api.routes.patients);
  console.log('Fetching patients from:', url);
  
  try {
    // Intenta obtener datos de la API
    const res = await fetch(url);
    
    // Si la respuesta no es exitosa, lanza un error para ir al catch
    if (!res.ok) {
      console.warn(`Error ${res.status} al obtener pacientes de la API. Usando datos mock.`);
      throw new Error(`Error fetching patients: ${res.status}`);
    }
    
    return res.json();
  } catch (error: any) {
    // Si hay un error, devuelve datos mock
    console.log('Usando datos mock de pacientes debido a error de API:', error.message);
    return { 
      success: true, 
      patients: MOCK_PATIENTS,
      message: 'Datos mock de pacientes cargados localmente' 
    };
  }
};

export function usePatients() {
  const { data, error, mutate, isValidating } = useSWR<{ patients: Patient[] }>('patients', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    onError: (err) => console.error('SWR Error:', err)
  });

  return {
    patients: data?.patients || MOCK_PATIENTS, // Usa los datos mock como fallback
    isLoading: (!data && !error) || isValidating,
    error,
    mutate
  };
} 