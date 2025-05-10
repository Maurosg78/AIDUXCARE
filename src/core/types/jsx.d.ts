import React from 'react';

// Declaraciones para JSX
declare namespace React {
  interface ElementProps {
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface Element extends React.ReactElement<any, any> {}

  interface JSX {
    Element: React.ReactElement<any, any>;
  }
}

declare module '@types/react/jsx-runtime' {
  export * from 'react/jsx-runtime';
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
  }
  
  export function jsx(
    type: any,
    props: any,
    key?: string | number | null
  ): React.ReactElement<any, any>;
  
  export function jsxs(
    type: any,
    props: any,
    key?: string | number | null
  ): React.ReactElement<any, any>;
  
  export function Fragment(
    props: { children?: React.ReactNode }
  ): React.ReactElement<any, any>;
}

// Declaraciones para los módulos de iconos de MUI
declare module '@mui/icons-material/*' {
  import { SvgIconProps } from '@mui/material';
  const Icon: React.FC<SvgIconProps>;
  export default Icon;
}

// Declaraciones específicas para iconos comúnmente utilizados
declare module '@mui/icons-material/Assessment' {
  import { SvgIconProps } from '@mui/material';
  const AssessmentIcon: React.FC<SvgIconProps>;
  export default AssessmentIcon;
}

declare module '@mui/icons-material/Cancel' {
  import { SvgIconProps } from '@mui/material';
  const CancelIcon: React.FC<SvgIconProps>;
  export default CancelIcon;
}

declare module '@mui/icons-material/AccessTime' {
  import { SvgIconProps } from '@mui/material';
  const AccessTimeIcon: React.FC<SvgIconProps>;
  export default AccessTimeIcon;
}

declare module '@mui/icons-material/AutoFixHigh' {
  import { SvgIconProps } from '@mui/material';
  const AutoFixHighIcon: React.FC<SvgIconProps>;
  export default AutoFixHighIcon;
} 