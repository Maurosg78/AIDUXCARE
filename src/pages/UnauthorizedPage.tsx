import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center' as const
  },
  title: {
    color: '#dc3545',
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Acceso No Autorizado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <button style={styles.button} onClick={() => navigate('/')}>
        Volver al Inicio
      </button>
    </div>
  );
}; 