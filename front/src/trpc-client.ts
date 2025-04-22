import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../back/shared/types';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3000/api',
    }),
  ],
});
