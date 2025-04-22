import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z
    .object({
      first_name: z.string().optional(),
      second_name: z.string().optional(),
      middle_name: z.string().optional(),
    })
    .optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
