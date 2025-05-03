import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas. Por favor intenta nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error durante el inicio de sesión.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <Card.Header>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">AiDuxCare</h2>
            <p className="mt-2 text-gray-600">Iniciar sesión en tu cuenta</p>
          </div>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email" required>Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                error={!!errors.email}
                errorMessage={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" required>Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                error={!!errors.password}
                errorMessage={errors.password?.message}
                {...register('password')}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Iniciar sesión'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-sm text-center text-gray-600">
              <p className="mb-2">Credenciales de prueba:</p>
              <p>Doctor: demo@example.com / password123</p>
              <p>Admin: admin@example.com / admin123</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
} 