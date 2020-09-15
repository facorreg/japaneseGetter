import isArray from 'lodash/isArray';
import uniq from 'lodash/uniq';
import { getKanji, replaceFullWidthLatin } from '../utils';
import fetchJisho from './fetchJisho';

const removeWikiIfExistsEslewhere = (responses, currSense) => {
  if (!currSense.partsOfSpeech.includes('Wikipedia definition')) return true;

  const loweredWikiWords = currSense.englishDefinitions.map((replaceFullWidthLatin));
  const sense = responses
    .find(({ senses = [] }) => senses.find(({ englishDefinitions, partsOfSpeech }) => (
      isArray(englishDefinitions) && isArray(partsOfSpeech)
      && !partsOfSpeech.includes('Wikipedia definition')
      && englishDefinitions.find((e) => loweredWikiWords.includes(replaceFullWidthLatin(e)))
    )));

  return !sense;
};

const getJisho = async (word) => {
  try {
    const response = await fetchJisho(word);
    const words = response.map(({ senses, ...rest }) => ({
      senses: senses
        .filter((sense) => (
          (isArray(sense.partsOfSpeech) && removeWikiIfExistsEslewhere(response, sense))
          || !isArray(sense.partsOfSpeech))),
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
