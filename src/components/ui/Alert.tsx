import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'warning' | 'error' | 'success' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  type = 'info',
  className = '',
}) => {
  const bgColors = {
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    success: 'bg-green-50 border-green-400 text-green-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };

  return (
    <div className={`p-4 rounded-md border ${bgColors[type]} ${className}`}>
      {children}
    </div>
  );
}; 