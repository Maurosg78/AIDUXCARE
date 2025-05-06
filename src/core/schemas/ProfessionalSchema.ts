import { z } from 'zod';

export const ProfessionalSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string()
});

export type Professional = z.infer<typeof ProfessionalSchema>; 