import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Global()
@Module({
  imports: [ElasticsearchModule],
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
