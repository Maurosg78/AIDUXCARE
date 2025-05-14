import { z, ZodSchema } from "zod.js";

export async function validateBody<T>(schema: ZodSchema<T>, req: Request): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

export function validateQuery<T>(schema: ZodSchema<T>, req: Request): T {
  const url = new URL((req as any).url || "", "http://localhost");
  const query = Object.fromEntries(url.searchParams);
  return schema.parse(query);
}

export function validateParams<T>(schema: ZodSchema<T>, req: Request): T {
  const params = (req as any).params as Record<string, string>;
  return schema.parse(params);
}

export { z, ZodSchema };
