import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';
import {
  fetch,
  getEnv,
  getKanji,
  objectListKeysToCamelCase,
} from '../utils';

const getJisho = async (word) => {
  try {
    const { data: rawResponse } = await fetch({
      url: getEnv('JISHO_URL', ''),
      args: { keyword: word },
    });

    const response = objectListKeysToCamelCase(rawResponse);

    const words = response.map(({ senses, ...rest }) => ({
      senses: senses
        .filter(({ partsOfSpeech }) => isArray(partsOfSpeech) && !partsOfSpeech.includes('Wikipedia definition')),
      ...rest,
    }))
      .filter(({ senses }) => isArray(senses) && senses.length);

    const kanjiWithin = uniq(words.reduce((accumulator, { japanese }) => {
      const within = japanese
        .map(({ word: wordWithin, reading }) => getKanji(wordWithin || reading, true) || [])
        .reduce((acc, arr) => [...acc, ...arr]);

      return ([
        ...accumulator,
        ...uniq(within),
      ]);
    }, []));

    return Promise.resolve({
      kanjiWithin,
      words,
    });
  } catch (err) {
    return Promise.resolve({ error: 'Failed to fetch jisho api data' });
  }
};

export default getJisho;
