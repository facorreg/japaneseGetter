import flattenDeep from 'lodash/flattenDeep';
import uniq from 'lodash/uniq';
import getSingleWord from './getSingleWord';
import {
  escapeRegExp, hasCharacters, getKanji, getCharacters,
} from '../utils';

const getUsefulCharLists = (string) => ({
  kanji: getKanji(string, true) || [],
  chars: getCharacters(string, true) || [],
});

/*
  jisho's matching being slightly naive,
    there's no need for a more complex alogrithm

  for instance, though 大学いんせい will match with
    大学院生, 大学いん生 wont
*/

const isCoherentMatch = (word, jword, syllables = 1) => {
  if (!jword) return false;

  const wordCharLists = getUsefulCharLists(word);
  const jwordCharLists = getUsefulCharLists(jword);

  const isImpossible = (obj, obj2, propName) => (
    Boolean(obj[propName].find((prop) => !obj2[propName].includes(prop)))
  );

  if (
    isImpossible(wordCharLists, jwordCharLists, 'kanji')
    || isImpossible(jwordCharLists, wordCharLists, 'chars')
  ) return null;

  const reg = new RegExp(escapeRegExp(jword)
    .replace(/[一-龯々〆〤]/g, ((`(.${syllables > 1 ? `{1-${syllables}}` : ''})`))));

  const match = word.match(reg);

  return match;
};

const getWordTraductions = async (options, word) => {
  try {
    const { words = [] } = await getSingleWord({ ...options, allowRefetch: false }, word);
    const translations = uniq(
      flattenDeep(
        words
          .filter(({ japanese = [] }) => (
            japanese.findIndex(({ word: jword, reading }) => (
              jword === word
              || reading === word
              || (hasCharacters(word) && isCoherentMatch(word, jword))
            )) >= 0))
          .map(({ senses = [] }) => (
            senses.map(({ englishDefinitions = [] }) => englishDefinitions))),
      )
        .map((e) => e.toLowerCase()),
    );
    return Promise.resolve(translations);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getWordTraductions;
