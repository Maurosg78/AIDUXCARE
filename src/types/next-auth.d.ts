// Declaración de módulos para next-auth y componentes relacionados
import type { NextAuthOptions } from './auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { JWT } from 'next-auth/jwt';
import type { NextRequest, NextResponse } from 'next/server';
import type {
  Session as CustomSession,
  User as CustomUser,
  Account as CustomAccount,
  Profile as CustomProfile,
  Provider as CustomProvider,
  CredentialInput as CustomCredentialInput,
  CredentialsConfig as CustomCredentialsConfig
} from './custom/SessionTypes';

declare module 'next-auth' {
  type Session = CustomSession;
  type _User = CustomUser;
  type _Account = CustomAccount;
  type _Profile = CustomProfile;
  type _Provider = CustomProvider;

  function NextAuth(options: NextAuthOptions): Promise<Session | null>;
  export default NextAuth;

  function getServerSession(
    req: NextApiRequest,
    res: NextApiResponse,
    options?: NextAuthOptions
  ): Promise<Session | null>;
}

declare module 'next-auth/providers/credentials' {
  type CredentialInput = CustomCredentialInput;
  type CredentialsConfig = CustomCredentialsConfig;

  function CredentialsProvider(config: CredentialsConfig): Provider;
  export default CredentialsProvider;
}

declare module 'next-auth/middleware' {
  interface MiddlewareOptions {
    callbacks?: {
      authorized?: (params: { token: JWT; req: NextRequest }) => boolean;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
    };
  }

  export function withAuth(
    middleware: (req: NextRequest) => Promise<NextResponse>,
    options?: MiddlewareOptions
  ): (req: NextRequest) => Promise<NextResponse>;
}

declare module 'next/server' {
  interface RequestCookies {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string): void;
    delete(name: string): void;
    clear(): void;
  }

  export interface NextRequest {
    url: string;
    headers: Headers;
    cookies: RequestCookies;
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
    body: unknown;
  }

  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json<T>(data: T): void;
    send<T>(data: T): void;
    end(): void;
    setHeader(name: string, value: string): void;
  }
} 