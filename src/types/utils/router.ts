import type { ReactNode } from 'react';

export interface RouteObject {
  path: string;
  element: ReactNode;
  children?: RouteObject[];
}

export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface RouterContext {
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  currentPath: string;
} 