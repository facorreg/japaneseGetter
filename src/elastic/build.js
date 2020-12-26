import createIndex from './createIndex';
// import putMapping from './putMapping';
import { getEnv } from '../utils';

const build = async (client) => {
  const body = {
    settings: {
      number_of_shards: 2,
      index: {
        max_ngram_diff: 20,
      },
      analysis: {
        filter: {
          updated_english_stopwords: {
            type: 'stop',
            stopwords: [
              'an',
              'and',
              'are',
              'but',
              'if',
              'is',
              'it',
              'no',
              'not',
              'or',
              'the',
              'their',
              'then',
              'there',
              'these',
              'they',
              'this',
              'to',
              'was',
              'will',
            ],
          },
          english_stemmer: {
            type: 'stemmer',
            language: 'english',
          },
          english_possessive_stemmer: {
            type: 'stemmer',
            language: 'possessive_english',
          },
        },
        tokenizer: {
          ngram_tokenizer: {
            type: 'ngram',
            min_gram: 3,
            max_gram: 8,
          },
          jp_baseform_tokenizer: {
            type: 'kuromoji_tokenizer',
            mode: 'search',
          },
        },
        analyzer: {
          updated_english_analyzer: {
            tokenizer: 'standard',
            filter: [
              'lowercase',
              'english_stemmer',
              'english_possessive_stemmer',
              'updated_english_stopwords',
            ],
          },
          ngram_tokenizer_analyzer: {
            type: 'custom',
            tokenizer: 'ngram_tokenizer',
            filter: [
              'lowercase',
              'english_stemmer',
              'english_possessive_stemmer',
              'updated_english_stopwords',
            ],
          },
          jp_baseform: {
            tokenizer: 'jp_baseform_tokenizer',
            type: 'custom',
          },
        },
      },
    },
    mappings: {
      properties: {
        en: {
          type: 'text',
          analyzer: 'english',
          fields: {
            ngram: {
              type: 'text',
              analyzer: 'ngram_tokenizer_analyzer',
            },
          },
        },
        jp: {
          type: 'text',
          analyzer: 'kuromoji',
          fields: {
            baseform: {
              type: 'text',
              analyzer: 'jp_baseform',
            },
          },
        },
      },
    },
  };

  try {
    await createIndex(client, getEnv('CORPUS_ES_INDEX', 'tatoeba'), {}, body);
    // await putMapping(client, getEnv('CORPUS_ES_INDEX', 'tatoeba'), mappings);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

export default build;
