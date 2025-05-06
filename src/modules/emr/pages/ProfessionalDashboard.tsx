import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisitService, Visit } from '../services/VisitService';
import { useAuth } from '../../../core/context/AuthContext';

const ProfessionalDashboard: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadVisits = async () => {
      try {
        if (!user?.email) {
          throw new Error('Usuario no autenticado');
        }
        const professionalVisits = await VisitService.getProfessionalVisits(user.email);
        setVisits(professionalVisits);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar visitas');
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [user]);

  const handleVisitClick = (visitId: string) => {
    navigate(`/visits/${visitId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel del Profesional</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Visitas Programadas</h2>
          
          {visits.length === 0 ? (
            <p className="text-gray-500">No hay visitas programadas</p>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  onClick={() => handleVisitClick(visit.id)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{visit.patientName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(visit.scheduledDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{visit.motivo}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        visit.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard; 