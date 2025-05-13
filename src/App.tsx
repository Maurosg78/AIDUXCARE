import React from 'react';
import { RouterProvider } from '@/core/utils/router';
import { AuthProvider } from './core/context/AuthContext';
import { router } from './core/router/routes';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

