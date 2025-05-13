// Declaraciones de módulos para evitar errores TS2306
declare module '@mui/material';
declare module '@mui/material/*';
declare module '@mui/icons-material';
declare module '@mui/icons-material/*';
declare module '@mui/x-date-pickers';
declare module '@mui/x-date-pickers/*';

// Declaraciones específicas para Material UI
declare module '@mui/material/Select' {
  export interface SelectChangeEvent<T = string> {
    target: {
      value: T;
      name: string;
    };
  }
}

// Declaración para axios
declare module 'axios';

// Declaración para date-fns/locale
declare module 'date-fns/locale'; 