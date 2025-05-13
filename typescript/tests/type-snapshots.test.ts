import { expectType } from 'tsd';
import type { Patient, Visit } from '@/types/patient';
import type { LangfuseTrace } from '@/types/custom/LangfuseTypes';
import type { Session } from '@/types/custom/SessionTypes';
import type { usePatients } from '@/hooks/usePatients';

// Test 1: Validar que Patient.id sea string
{
  const patient: Patient = {
    id: '123',
    name: 'Test Patient',
    // ... otros campos requeridos
  };
  expectType<string>(patient.id);
}

// Test 2: Validar que Visit.date sea Date | string
{
  const visit: Visit = {
    id: '123',
    patientId: '456',
    date: new Date(),
    // ... otros campos requeridos
  };
  expectType<Date | string>(visit.date);
}

// Test 3: Validar que LangfuseTrace.traceId sea opcional y de tipo string
{
  const trace: LangfuseTrace = {
    id: '123',
    name: 'Test Trace',
    startTime: new Date().toISOString(),
    // traceId es opcional
  };
  expectType<string | undefined>(trace.traceId);
}

// Test 4: Validar que session.user.role esté correctamente definido
{
  const session: Session = {
    user: {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    },
    expires: new Date().toISOString()
  };
  expectType<'admin' | 'doctor' | 'nurse' | 'patient'>(session.user.role);
}

// Test 5: Validar que usePatients() devuelva Patient[]
{
  const patients = usePatients();
  expectType<Patient[]>(patients);
}

// Test 6: Validar tipos de funciones de utilidad
{
  // Ejemplo de validación de función de utilidad
  const formatDate = (date: Date | string): string => {
    return new Date(date).toISOString();
  };
  expectType<(date: Date | string) => string>(formatDate);
}

// Test 7: Validar tipos de eventos
{
  interface EventHandler<T> {
    (event: T): void;
  }

  const handlePatientUpdate: EventHandler<Patient> = (patient) => {
    expectType<string>(patient.id);
    expectType<string>(patient.name);
  };
}

// Test 8: Validar tipos de respuestas de API
{
  interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
  }

  const response: ApiResponse<Patient> = {
    data: {
      id: '123',
      name: 'Test Patient',
      // ... otros campos requeridos
    },
    status: 200,
    message: 'Success'
  };

  expectType<Patient>(response.data);
  expectType<number>(response.status);
  expectType<string>(response.message);
}

// Test 9: Validar tipos de estados
{
  type LoadingState = 'idle' | 'loading' | 'success' | 'error';
  const state: LoadingState = 'idle';
  expectType<'idle' | 'loading' | 'success' | 'error'>(state);
}

// Test 10: Validar tipos de configuraciones
{
  interface Config {
    apiUrl: string;
    timeout: number;
    retries: number;
    debug: boolean;
  }

  const config: Config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    debug: true
  };

  expectType<string>(config.apiUrl);
  expectType<number>(config.timeout);
  expectType<number>(config.retries);
  expectType<boolean>(config.debug);
} 