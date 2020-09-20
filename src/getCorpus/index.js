import get from 'lodash/get';
import flatten from 'lodash/flatten';
import { search } from '../elastic';
import { rejectError } from '../utils';

const getQuery = (lists) => {
  const specificProps = {
    en: {
      auto_generate_synonyms_phrase_query: true,
      default_operator: 'AND',
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
    enTokens,
  } = args;
  try {
    const matcher = (str, array) => str.match(new RegExp(array.join('|')));
    const query = {
      index: 'tatoeba',
      from,
      size,
      body: { query: getQuery({ en: enList, jp: jpList }) },
    };

    const res = await search(esClient, query);
    const hits = get(res, 'body.hits.hits', [])
      .map(({ _source: source }) => ({ ...source, pos }));
    const filtered = hits
      .filter(({ jp, en }) => matcher(jp, jpList) && matcher(en, enTokens));

    const found = hits.length; // && filtered.length;
    const remainingToFind = size - filtered.length;
    const shouldRecurs = (!found || remainingToFind) && maxRetry > 1;

    const complementaryResults = shouldRecurs
      ? (await getSingleCorpus({ ...args, from: hits.length, maxRetry: maxRetry - 1 }))
      : [];

    return Promise.resolve([...filtered, ...complementaryResults]);
  } catch (err) {
    return rejectError('Failed to get examples because ', err);
  }
};

const getCorpus = async (args) => {
  const { esClient, enList } = args;
  const corpuses = await Promise.all(
    enList.map(async (enQuery) => {
      const tokensResponse = await esClient.indices.analyze({
        index: 'tatoeba',
        body: {
          analyzer: 'english',
          text: enQuery,
        },
      });

      const tokens = get(tokensResponse, 'body.tokens', []).map(({ token }) => token);

      return tokens.length
        ? getSingleCorpus({ ...args, enList: [enQuery], enTokens: tokens })
        : [];
    }),
  );

  return flatten(corpuses);
};

export default getCorpus;
