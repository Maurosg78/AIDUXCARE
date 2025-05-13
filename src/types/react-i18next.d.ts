// Declaración para react-i18next
declare module 'react-i18next' {
  import { i18n as I18n } from 'i18next';
  import { ComponentType, FC } from 'react';

  interface Resources {
    [namespace: string]: {
      [key: string]: string | Record<string, unknown>;
    };
  }

  interface TranslationOptions {
    defaultValue?: string;
    count?: number;
    context?: string;
    replace?: Record<string, string | number>;
    interpolation?: {
      escapeValue?: boolean;
      prefix?: string;
      suffix?: string;
    };
  }

  export interface TFunction {
    (key: string, options?: TranslationOptions): string;
  }

  export interface WithTranslation {
    t: TFunction;
    i18n: I18n;
  }

  export function useTranslation(
    ns?: string | string[],
    options?: {
      keyPrefix?: string;
      useSuspense?: boolean;
    }
  ): {
    t: TFunction;
    i18n: I18n;
    ready: boolean;
  };
  
  export function withTranslation(
    ns?: string | string[]
  ): <P extends object>(
    component: ComponentType<P>
  ) => FC<P>;

  export const initReactI18next: {
    type: 'react-i18next';
    init: (instance: I18n) => void;
  };
}

export {}; 