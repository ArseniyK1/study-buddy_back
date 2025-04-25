import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly indexPrefix: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly nestElasticsearchService: NestElasticsearchService,
  ) {
    this.indexPrefix =
      this.configService.get<string>('elasticsearch.indexPrefix') ||
      'study-budy-logs';
  }

  async onModuleInit() {
    // Создаем индекс для логов, если он не существует
    const indexName = this.getIndexName();
    const indexExists = await this.nestElasticsearchService.indices.exists({
      index: indexName,
    });

    if (!indexExists) {
      await this.nestElasticsearchService.indices.create({
        index: indexName,
        mappings: {
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            context: { type: 'keyword' },
            method: { type: 'keyword' },
            url: { type: 'keyword' },
            clientIp: { type: 'ip' },
            userId: { type: 'keyword' },
            userAgent: { type: 'text' },
            errorMessage: { type: 'text' },
            errorStack: { type: 'text' },
            query: { type: 'text' },
            params: { type: 'object' },
            duration: { type: 'long' },
          },
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
      });
    }
  }

  async onModuleDestroy() {
    // Закрываем соединение с Elasticsearch
    await this.nestElasticsearchService.close();
  }

  /**
   * Получает имя индекса для текущего месяца
   */
  private getIndexName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${this.indexPrefix}-${year}.${month}`;
  }

  /**
   * Сохраняет лог в Elasticsearch
   */
  async saveLog(logData: any): Promise<void> {
    const indexName = this.getIndexName();

    await this.nestElasticsearchService.index({
      index: indexName,
      body: {
        ...logData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Поиск логов по различным критериям
   */
  async searchLogs(params: {
    level?: string;
    context?: string;
    startDate?: Date;
    endDate?: Date;
    query?: string;
    from?: number;
    size?: number;
  }): Promise<any> {
    const indexName = this.getIndexName();
    const {
      level,
      context,
      startDate,
      endDate,
      query,
      from = 0,
      size = 10,
    } = params;

    const must: any[] = [];

    if (level) {
      must.push({ term: { level } });
    }

    if (context) {
      must.push({ term: { context } });
    }

    if (startDate || endDate) {
      const range: any = { timestamp: {} };
      if (startDate) range.timestamp.gte = startDate.toISOString();
      if (endDate) range.timestamp.lte = endDate.toISOString();
      must.push({ range });
    }

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['message', 'errorMessage', 'query'],
        },
      });
    }

    const result = await this.nestElasticsearchService.search({
      index: indexName,
      from,
      size,
      query: {
        bool: { must },
      },
      sort: [{ timestamp: 'desc' }],
    });

    return {
      total:
        typeof result.hits.total === 'number'
          ? result.hits.total
          : (result.hits.total as any)?.value || 0,
      hits: result.hits.hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
      })),
    };
  }
}
