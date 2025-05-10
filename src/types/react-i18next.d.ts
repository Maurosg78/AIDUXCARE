// Declaración para react-i18next
declare module 'react-i18next' {
  interface Resources {
    [namespace: string]: {
      [key: string]: string | object;
    };
  }

  export function useTranslation(ns?: string | string[]): {
    t: (key: string, options?: object) => string;
    i18n: {
      changeLanguage: (lng: string) => Promise<void>;
      language: string;
    };
  };

  export interface TFunction {
    (key: string, options?: object): string;
  }

  export interface WithTranslation {
    t: TFunction;
    i18n: {
      changeLanguage: (lng: string) => Promise<void>;
      language: string;
    };
  }

  export function withTranslation(ns?: string | string[]): <P extends object>(
    component: React.ComponentType<P & WithTranslation>
  ) => React.FC<P>;
} 