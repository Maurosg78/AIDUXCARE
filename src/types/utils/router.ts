import type { ReactNode } from 'react';
import type {
  RouteObject as ReactRouterRouteObject,
  NavigateFunction,
  Location,
  LinkProps as ReactRouterLinkProps,
  Params
} from '@/core/utils/router';

export type RouteObject = ReactRouterRouteObject;
export type NavigateFunction = NavigateFunction;
export type Params<Key extends string = string> = Params<Key>;
export type Location = Location;

export interface LinkProps extends ReactRouterLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: Record<string, unknown>;
}

export interface RouterContext {
  navigate: NavigateFunction;
  goBack: () => void;
  goForward: () => void;
  currentPath: string;
  params: Params;
  location: Location;
} 