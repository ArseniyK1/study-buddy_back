import { z } from 'zod';

export const usersSchema = z.object({
  name_filter: z.string().optional(),
});

export type UsersInput = z.infer<typeof usersSchema>;
