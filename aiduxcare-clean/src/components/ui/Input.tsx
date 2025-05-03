import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          className={clsx(
            'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 w-full',
            {
              'border-gray-300 focus:border-blue-300 focus:ring-blue-200': !error,
              'border-red-300 focus:border-red-500 focus:ring-red-200': error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 