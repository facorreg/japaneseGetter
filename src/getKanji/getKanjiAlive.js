import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import {
  fetch, filterEmpty, getEnv,
} from '../utils';

const parseKanjiAlive = (response = {}, word) => {
  const {
    kanji = {},
    examples = [],
    radical,
    references,
    error,
  } = response;

  if (error || isEmpty(kanji.meaning)) return {};

  const extractEnglishMeaning = (array) => (
    array.map(({ meaning: { english = '' } = {}, ...rest }) => ({
      ...rest,
      meaning: uniq(filterEmpty(english.split(', '))),
    })));

  const [englishMeaning, ...rest] = extractEnglishMeaning([kanji, ...examples]);

  return {
    examples: rest,
    kanji: {
      ...kanji,
      character: word,
      meaning: englishMeaning.meaning,
    },
    radical,
    references,
  };
};

const getKanjiAliveData = async (word, apiKey) => {
  try {
    const args = {
      url: `${getEnv('KANJI_ALIVE_URL', '')}${word}`,
      headers: {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'kanjialive-api.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      },
    };

    const response = await fetch(args);
    return Promise.resolve(parseKanjiAlive(response, word));
  } catch (err) {
    return Promise.resolve({ error: 'Failed to fetch KanjiAlive data' });
  }
};

export default getKanjiAliveData;
