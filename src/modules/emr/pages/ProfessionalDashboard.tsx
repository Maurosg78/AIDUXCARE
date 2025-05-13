import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Link } from 'react-router';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Bienvenido, {user?.name || 'Profesional'}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control para profesionales de la salud
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Pacientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
          <p className="text-gray-600 mb-4">
            Gestiona tus pacientes y sus historiales médicos
          </p>
          <Link
            to="/patients"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ver Pacientes
          </Link>
        </div>

        {/* Tarjeta de Visitas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Visitas</h2>
          <p className="text-gray-600 mb-4">
            Consulta y gestiona las visitas programadas
          </p>
          <Link
            to="/visits"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ver Visitas
          </Link>
        </div>

        {/* Tarjeta de Registros */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Registros Médicos</h2>
          <p className="text-gray-600 mb-4">
            Accede a los registros médicos y documentación
          </p>
          <Link
            to="/records"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ver Registros
          </Link>
        </div>
      </div>
    </div>
  );
} 