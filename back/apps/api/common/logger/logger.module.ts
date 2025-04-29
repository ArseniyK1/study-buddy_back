import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';

@Global()
@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
