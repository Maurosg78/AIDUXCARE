import type { Mock } from 'jest-mock';

export type JestMock<T> = Mock<T>;
export type JestMockFunction<T extends (...args: any[]) => any> = Mock<ReturnType<T>, Parameters<T>>;

export interface JestMockContext {
  calls: any[][];
  instances: any[];
  invocationCallOrder: number[];
  results: { type: 'return' | 'throw'; value: any }[];
  lastCall: any[];
} 