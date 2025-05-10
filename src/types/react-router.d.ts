import React from 'react';

// Interfaces para react-router-dom v6
declare module 'react-router-dom' {
  export interface RouteObject {
    caseSensitive?: boolean;
    children?: RouteObject[];
    element?: React.ReactNode;
    index?: boolean;
    path?: string;
  }

  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  }

  export interface Params {
    [key: string]: string;
  }

  export function useNavigate(): (to: string, options?: { replace?: boolean; state?: any }) => void;
  export function useParams<T extends Params = Params>(): T;
  export function useLocation(): Location;
  
  export function createBrowserRouter(routes: RouteObject[]): any;
  export function RouterProvider(props: { router: any }): JSX.Element;
  
  export const BrowserRouter: React.ComponentType<{ children?: React.ReactNode }>;
  export const Routes: React.ComponentType<{ children?: React.ReactNode }>;
  export const Route: React.ComponentType<{
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }>;
  export const Navigate: React.ComponentType<{ to: string; replace?: boolean }>;
  export const Link: React.ComponentType<{ to: string; children?: React.ReactNode }>;
  export const Outlet: React.ComponentType;
}

// Declaración para compatibilidad con react-router-dom v6.30.0
declare module 'react-router' {
  export * from 'react-router-dom';
}

// Asegurarnos de que Link funcione
declare module 'react-router' {
  export interface LinkProps {
    to: string;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }
  
  export const Link: React.FC<LinkProps>;
} 