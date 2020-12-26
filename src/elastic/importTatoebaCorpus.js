import bulk from './bulk';
import data from '../../tatoeba.json';
import { getEnv } from '../utils';

const bulkParser = ((dbulk, { jp, en }) => [
  ...dbulk, {
    index: {
      _index: getEnv('CORPUS_ES_INDEX', 'tatoeba'),
      _type: '_doc',
    },
  },
  { jp, en },
]);

const importTatoebaCorpus = (client) => bulk(client, data, bulkParser);

export default importTatoebaCorpus;
