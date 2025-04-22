// back/shared/trpc-types.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const appRouter = t.router({
  signIn: t.procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(({ input }) => {
      return { accessToken: 'token' };
    }),

  signUp: t.procedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(({ input }) => {
      return { accessToken: 'token' };
    }),

  getProfile: t.procedure.input(z.void()).query(() => {
    return { email: 'user@example.com' };
  }),

  findAllUsers: t.procedure.input(z.void()).query(() => {
    return [{ email: 'user@example.com' }];
  }),
});

export type AppRouter = typeof appRouter;
