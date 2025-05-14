import { z } from "zod";
import { validateZod, InferZodType } from "../../src/types/zod-utils";
import { expectTypeOf } from "expect-type";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

type Inferred = InferZodType<typeof schema>;
expectTypeOf<Inferred>().toEqualTypeOf<{ name: string; age: number }>();

const result = validateZod(schema, { name: "Ana", age: 30 });
if (result.success) {
  expectTypeOf(result.data).toEqualTypeOf<Inferred>();
}
