import { Client } from '@elastic/elasticsearch';
import { getEnv } from '../utils';
import log from '../logs';

const createESClient = () => {
  const client = new Client({
    node: `http://localhost:${getEnv('ELASTIC_PORT', 9200)}`,
  });

  log('Successfull connection to ES');
  return client;
};

export default createESClient;
