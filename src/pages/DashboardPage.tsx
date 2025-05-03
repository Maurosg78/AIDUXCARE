import React from 'react';
import { useAuth } from '../modules/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../core/config/constants';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  welcome: {
    margin: 0
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  moduleCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  moduleTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px'
  },
  moduleDescription: {
    color: '#666',
    marginBottom: '15px'
  },
  moduleButton: {
    padding: '8px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  }
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.welcome}>Bienvenido, {user?.name}</h1>
        <button style={styles.button} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      <main>
        <div style={styles.moduleCard}>
          <h2 style={styles.moduleTitle}>Información del Usuario</h2>
          <p style={styles.moduleDescription}>
            Rol: {user?.role}
            <br />
            Email: {user?.email}
          </p>
        </div>

        {user?.role === UserRole.PHYSIOTHERAPIST && (
          <>
            <div style={styles.moduleCard}>
              <h2 style={styles.moduleTitle}>Historia Clínica Electrónica</h2>
              <p style={styles.moduleDescription}>
                Accede al módulo de EMR para gestionar las historias clínicas de tus pacientes.
              </p>
              <a 
                href="/dashboard/emr" 
                style={styles.moduleButton}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/emr');
                }}
                data-testid="emr-link"
              >
                Ir al EMR
              </a>
            </div>

            <div style={styles.moduleCard}>
              <h2 style={styles.moduleTitle}>📝 Feedback</h2>
              <p style={styles.moduleDescription}>
                Tu opinión es importante para mejorar AiDuxCare. Comparte tu experiencia usando el sistema.
              </p>
              <a 
                href="/dashboard/feedback" 
                style={styles.moduleButton}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard/feedback');
                }}
                data-testid="feedback-link"
              >
                Dar Feedback
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}; 