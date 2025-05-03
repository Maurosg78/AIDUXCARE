import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useRoutes } from './router/routes';

function App() {
  // Obtener las rutas con el hook personalizado
  const routes = useRoutes();
  
  // Crear el router con las rutas
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
