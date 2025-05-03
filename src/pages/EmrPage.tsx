import React from 'react';
import { useAuth } from '../modules/auth/AuthContext';
import { StructuredVisitForm } from '../modules/emr/components/StructuredVisitForm';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666'
  }
};

export const EmrPage = () => {
  const { user } = useAuth();
  const demoPatientId = 'demo-patient';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Historia Clínica Electrónica</h1>
        <p style={styles.subtitle}>
          Fisioterapeuta: {user?.name}
        </p>
        <p style={styles.subtitle}>
          Paciente: Demo
        </p>
      </header>

      <main>
        <StructuredVisitForm patientId={demoPatientId} />
      </main>
    </div>
  );
}; 