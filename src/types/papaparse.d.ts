declare module 'papaparse' {
  export interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    download?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    fastMode?: boolean;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
    complete?: (results: ParseResult<any>) => void;
    error?: (error: Error) => void;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
    }>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  }

  export interface UnparseConfig {
    quotes?: boolean | boolean[] | ((value: any) => boolean);
    quoteChar?: string;
    escapeChar?: string;
    delimiter?: string;
    header?: boolean;
    newline?: string;
    skipEmptyLines?: boolean | 'greedy';
    columns?: string[] | { [key: string]: any } | ((fields: any) => string[]);
  }

  export interface UnparseObject {
    fields?: string[];
    data: any[][];
  }

  export function parse<T = any>(
    input: string | File | NodeJS.ReadableStream,
    config?: ParseConfig
  ): ParseResult<T>;

  export function unparse(
    data: Array<Object> | Array<Array<any>> | UnparseObject,
    config?: UnparseConfig
  ): string;

  const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default Papa;
} 