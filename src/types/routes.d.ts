import { ReactNode } from 'react';
import { RouteObject } from 'react-router-dom';

export interface ExtendedRouteObject extends RouteObject {
  protected?: boolean;
  roles?: string[];
  children?: ExtendedRouteObject[];
}

export interface RouteConfig {
  path: string;
  element: ReactNode;
  protected?: boolean;
  roles?: string[];
  children?: RouteConfig[];
}

export { ExtendedRouteObject, RouteConfig }; 