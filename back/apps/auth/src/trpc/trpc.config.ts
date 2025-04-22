import { INestApplication, Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

export const t = initTRPC.create();

@Injectable()
export class TrpcService {
  async applyMiddleware(app: INestApplication, router: any) {
    app.use(
      '/api',
      trpcExpress.createExpressMiddleware({
        router,
      }),
    );
  }
}
