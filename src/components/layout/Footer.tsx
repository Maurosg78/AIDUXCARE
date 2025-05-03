import { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            © {new Date().getFullYear()} AiDuxCare. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 italic">
            Este entorno de prueba no almacena datos personales reales. 
            Todos los datos han sido anonimizados o generados artificialmente.
          </p>
        </div>
      </div>
    </footer>
  );
}; 