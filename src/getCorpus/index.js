import get from 'lodash/get';
import flatten from 'lodash/flatten';
import { search } from '../elastic';
import { rejectError } from '../utils';

const getQuery = (lists) => {
  const specificProps = {
    en: {
      auto_generate_synonyms_phrase_query: true,
      // default_operator: 'AND',
      analyzer: 'english',
    },
    jp: {
      analyzer: 'kuromoji',
    },
  };

  return ({
    bool: {
      must: Object.keys(lists).map((key) => ({
        bool: {
          should: lists[key].map((e) => ({
            query_string: {
              query: e,
              default_field: key,
              ...specificProps[key],
            },
          })),
        },
      })),
    },
  });
};

const getSingleCorpus = async (args) => {
  const {
    esClient,
    jpList,
    enList,
    from = 0,
    size = 1,
    pos,
    maxRetry = 1,
  } = args;
  try {
    const query = {
      index: 'tatoeba',
      from,
      size,
      body: { query: getQuery({ en: enList, jp: jpList }) },
    };

    const res = await search(esClient, query);
    const hits = get(res, 'body.hits.hits', [])
      .map(({ _source: source }) => ({ ...source, pos }));

    const found = hits.length; // && filtered.length;
    const remainingToFind = size - hits.length;
    const shouldRecurs = (!found || remainingToFind) && maxRetry > 1;

    const complementaryResults = shouldRecurs
      ? (await getSingleCorpus({ ...args, maxRetry: maxRetry - 1 }))
      : [];

    return Promise.resolve([...hits, ...complementaryResults]);
  } catch (err) {
    return rejectError('Failed to get examples because ', err);
  }
};

const getCorpus = async (args) => {
  const { esClient, enList } = args;

  const corpuses = await Promise.all(
    enList.map(async (enQuery) => {
      const isTokenable = await esClient.indices.analyze({
        index: 'tatoeba',
        body: {
          analyzer: 'english',
          text: enQuery,
        },
      });

      return isTokenable
        ? getSingleCorpus({ ...args, enList: [enQuery] })
        : [];
    }),
  );

  return flatten(corpuses);
};

export default getCorpus;
