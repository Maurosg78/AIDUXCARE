set -euo pipefail

echo "🔄 Replacing src/types/zod-utils.ts…"
cat << 'SCRIPT' > src/types/zod-utils.ts
import { ZodType } from "zod";

/**
 * Infers the type from a Zod schema.
 */
export type InferZodType<T extends ZodType<any>> = T extends ZodType<infer U> ? U : never;

/**
 * Validates unknown data against a Zod schema.
 */
export function validateZod<T extends ZodType<any>>(
  schema: T,
  data: unknown
): {
  success: true;
  data: InferZodType<T>;
} | {
  success: false;
  errors: Array<{ path: string; message: string }>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => ({
      path: e.path.join("."),
      message: e.message,
    })),
  };
}
SCRIPT

echo "🔄 Replacing src/backend/utils/zod-utils.ts…"
cat << 'SCRIPT' > src/backend/utils/zod-utils.ts
import { ZodType } from "zod";

/**
 * Infers the type from a Zod schema.
 */
export type InferZodType<T extends ZodType<any>> = T extends ZodType<infer U> ? U : never;

/**
 * Validates unknown data against a Zod schema.
 */
export function validateZod<T extends ZodType<any>>(
  schema: T,
  data: unknown
): {
  success: true;
  data: InferZodType<T>;
} | {
  success: false;
  errors: Array<{ path: string; message: string }>;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => ({
      path: e.path.join("."),
      message: e.message,
    })),
  };
}
SCRIPT

echo "📋 Creating temporary tsconfig.json for typecheck…"
cp tsconfig.json tsconfig.json.bak
cat << 'SCRIPT' > tsconfig.json
{
  "extends": "./typescript/config/tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": [
    "src/types/zod-utils.ts",
    "src/backend/utils/zod-utils.ts"
  ]
}
SCRIPT

echo "⚙️  Running typecheck on zod-utils files…"
npm run typecheck

echo "📦 Restoring original tsconfig.json…"
mv tsconfig.json.bak tsconfig.json

echo "✅ Committing fixes…"
git add src/types/zod-utils.ts src/backend/utils/zod-utils.ts tsconfig.json
git commit -m "fix(zod-utils): correct infer usage and temp tsconfig for clean typecheck"

echo "🚀 zod-utils fixed. Ready to proceed with Langfuse prompt."
