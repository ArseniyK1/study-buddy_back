import { registerAs } from '@nestjs/config';

export default registerAs('elasticsearch', () => ({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
  password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'study-budy-logs',
}));
