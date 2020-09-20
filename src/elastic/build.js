import createIndex from './createIndex';
import putMapping from './putMapping';

const build = async (client) => {
  const mapping = {
    en: { type: 'text', analyzer: 'english' },
    jp: { type: 'text', analyzer: 'kuromoji' },
  };

  try {
    await createIndex(client, 'tatoeba');
    await putMapping(client, 'tatoeba', mapping);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

export default build;
