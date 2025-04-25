import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import elasticsearchConfig from './elasticsearch.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(elasticsearchConfig),
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const node = configService.get<string>('elasticsearch.node');
        const username = configService.get<string>('elasticsearch.username');
        const password = configService.get<string>('elasticsearch.password');

        return {
          node: node || 'http://localhost:9200',
          auth: {
            username: username || 'elastic',
            password: password || 'changeme',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
