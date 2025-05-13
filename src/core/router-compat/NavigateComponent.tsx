import { Navigate as RRNav } from '@/core/utils/router';
import type { FC } from 'react';

// Usar los tipos de nuestro adaptador
import type { NavigateOptions } from '@/core/utils/router';

export interface NavigateProps extends NavigateOptions {
  to: string | number;
}

/**
 * Componente Navigate compatible que funciona con React Router v6
 * y proporciona compatibilidad con props adicionales como state
 */
const Navigate: FC<NavigateProps> = ({ to, replace, state }) =>
  <RRNav to={to} replace={replace} state={state} />;

export default Navigate; 