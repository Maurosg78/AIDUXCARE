import React from 'react';
import { Layout as MainLayout } from './layout/Layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
} 