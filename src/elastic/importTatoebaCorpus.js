import bulk from './bulk';
import data from '../../test.json';

const bulkParser = ((dbulk, { jp, en }) => [
  ...dbulk, {
    index: {
      _index: 'tatoeba',
      _type: '_doc',
    },
  },
  { jp, en },
]);

const importTatoebaCorpus = (client) => bulk(client, data, bulkParser);

export default importTatoebaCorpus;
