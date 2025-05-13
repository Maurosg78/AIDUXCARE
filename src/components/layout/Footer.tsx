import React from 'react';

/**
 * Componente de pie de página que muestra información de copyright
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="bg-white border-t border-aidux-gray/20 py-4 mt-auto text-aidux-slate">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm mb-1">
            © {new Date().getFullYear()} AiDuxCare. Todos los derechos reservados.
          </p>
          <p className="text-xs text-aidux-gray italic">
            Este entorno de prueba no almacena datos personales reales. 
            Todos los datos han sido anonimizados o generados artificialmente.
          </p>
        </div>
      </div>
    </footer>
  );
} 