import { Navigate as RRNav, NavigateProps as RRNavProps } from 'react-router-dom';
import type { FC } from 'react';

export interface NavigateProps<S = unknown> {
  to: RRNavProps['to'];
  replace?: RRNavProps['replace'];
  state?: S;
}

/**
 * Componente Navigate compatible que funciona con React Router v6
 * y proporciona compatibilidad con props adicionales como state
 */
const Navigate: FC<NavigateProps> = ({ to, replace, state }) =>
  <RRNav to={to} replace={replace} state={state} />;

export default Navigate; 