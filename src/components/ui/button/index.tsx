import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
export default Button; 