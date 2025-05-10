// Declaración de módulos para next-auth y componentes relacionados

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    expires: string;
    accessToken?: string;
  }

  function getServerSession(...args: any[]): Promise<Session | null>;
}

declare module 'next-auth/providers/credentials' {
  const CredentialsProvider: any;
  export default CredentialsProvider;
}

declare module 'next-auth/middleware' {
  export function withAuth(
    middleware: any,
    options?: any
  ): any;
}

declare module 'next/server' {
  export class NextResponse {
    static redirect(url: string): NextResponse;
    static next(): NextResponse;
    static json(data: any): NextResponse;
  }

  export interface NextRequest {
    url: string;
    headers: Headers;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string): void;
      delete(name: string): void;
      clear(): void;
    };
  }
}

declare module 'next' {
  export interface NextApiRequest {
    headers: {
      [key: string]: string | string[] | undefined;
    };
    query: {
      [key: string]: string | string[] | undefined;
    };
    cookies: {
      [key: string]: string | undefined;
    };
    body: any;
  }

  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json(data: any): void;
    send(data: any): void;
    end(): void;
    setHeader(name: string, value: string): void;
  }
} 