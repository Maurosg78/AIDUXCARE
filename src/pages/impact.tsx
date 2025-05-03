import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ExclamationCircleIcon
} from '@heroicons/react/solid';

interface ImpactStats {
  avgScore: number;
  percentHighQuality: number;
  topMissingFields: Array<{ field: string; count: number }>;
  topWarnings: Array<{ warning: string; count: number }>;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  description?: string;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
            {description && (
              <dd className="mt-2 text-sm text-gray-500">
                {description}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const TopList = ({ 
  title, 
  items, 
  valueLabel 
}: { 
  title: string; 
  items: Array<{ field?: string; warning?: string; count: number }>; 
  valueLabel: string;
}) => (
  <div className="bg-white shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        {title}
      </h3>
      <div className="mt-5">
        <div className="flow-root">
          <ul className="-mb-8">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>
                <div className="relative pb-8">
                  {itemIdx !== items.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                        {itemIdx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {item.field || item.warning}
                        </span>
                        <span className="ml-2 font-medium text-indigo-600">
                          {item.count} {valueLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default function PublicImpactDashboard() {
  const { data, isLoading, error } = useQuery<ImpactStats>({
    queryKey: ['impactStats'],
    queryFn: async () => {
      const response = await fetch('/api/public/impact');
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Cargando estadísticas...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600 sm:text-4xl">
              Error al cargar estadísticas
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Impacto Clínico de AiDuxCare
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Estadísticas de los últimos 30 días
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              <StatCard
                title="Score Promedio de Completitud"
                value={`${data.avgScore}%`}
                icon={ChartBarIcon}
                description="Promedio de completitud de datos clínicos"
              />
              <StatCard
                title="Visitas de Alta Calidad"
                value={`${data.percentHighQuality}%`}
                icon={CheckCircleIcon}
                description="Porcentaje de visitas con score >80%"
              />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TopList
              title="Campos Más Comúnmente Omitidos"
              items={data.topMissingFields}
              valueLabel="veces"
            />
            <TopList
              title="Advertencias Más Frecuentes"
              items={data.topWarnings}
              valueLabel="ocurrencias"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 