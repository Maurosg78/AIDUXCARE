import type { ReactElement } from 'react';
import type { RenderResult } from '@testing-library/react';

export type TestRenderResult = RenderResult;

export interface TestQueries {
  getByText: (text: string) => HTMLElement;
  getByRole: (role: string) => HTMLElement;
  queryByText: (text: string) => HTMLElement | null;
  queryByRole: (role: string) => HTMLElement | null;
}

export interface TestUtils {
  render: (ui: ReactElement) => TestRenderResult;
  screen: TestQueries;
  fireEvent: {
    click: (element: HTMLElement) => void;
    change: (element: HTMLElement, value: string) => void;
    submit: (element: HTMLElement) => void;
  };
} 