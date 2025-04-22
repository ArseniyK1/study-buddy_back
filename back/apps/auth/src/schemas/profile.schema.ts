import { z } from 'zod';

export const profileSchema = z.object({
  user_id: z.number(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
