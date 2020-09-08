import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';
import { getKanji } from '../utils';
import fetchJisho from './fetchJisho';

const getJisho = async (word) => {
  try {
    const response = await fetchJisho(word);

    const words = response
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
