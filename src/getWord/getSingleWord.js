/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import get from 'lodash/get';
import { rejectError, isKanji } from '../utils';
import getJisho from './getJisho';
import { getSingleKanji } from '../getKanji';

const hasWords = (data) => Boolean(get(data, 'words', []).length);

const parseWordData = (data, options) => {
  const { isSecondChoice } = options;

  if (!hasWords) return { error: 'No word found' };

  return {
    ...data,
    error: isSecondChoice
      ? 'First attempt to fetch data failed'
      : '',
  };
};

const getKanjiAsWord = async (options, word) => {
  try {
    const { kunyomi: { hiragana } = {}, meaning } = get(
      await getSingleKanji({ ...options, allowRefetch: false }, word),
      'kanji.kanji',
      {},
    );

    if (hiragana && meaning) {
      const data = {
        kanjiWithin: [word],
        words: [{
          senses: [{
            englishDefinitions: [meaning],
          }],
          japanese: [{
            word, reading: hiragana,
          }],
        }],
        error: 'No result found on Jisho\'s API',
      };

      return Promise.resolve(parseWordData(data, options));
    }
    return rejectError('Failed to fetch data from the word APIs');
  } catch (err) {
    return Promise.reject(err);
  }
};

const getSingleWord = async (options, word) => {
  try {
    const { isSecondChoice } = options;

    const jishoData = await getJisho(word);
    const isInvalid = (data) => !hasWords(data) || data.error;

    if (isInvalid(jishoData)) {
      if (!isSecondChoice && isKanji(word)) {
        return getKanjiAsWord(options, word);
      }
      return rejectError('Failed to fetch data from the word APIs');
    }

    return Promise.resolve(parseWordData(jishoData, options));
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getSingleWord;
