import { useState  } from 'react';
import VisitLogDashboard from '../components/VisitLogDashboard';

const VisitDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('details');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'logs':
        return <VisitLogDashboard />;
      case 'details':
        return <div>Detalles de la visita</div>;
      case 'forms':
        return <div>Formularios clínicos</div>;
      default:
        return <div>Detalles de la visita</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Detalles de la Visita</h1>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-6 font-medium ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-4 px-6 font-medium ${
              activeTab === 'forms'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Formularios
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-6 font-medium ${
              activeTab === 'logs'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registro de Actividad
          </button>
        </nav>
      </div>
      
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default VisitDetails; 