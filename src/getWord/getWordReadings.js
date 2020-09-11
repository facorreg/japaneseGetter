import uniq from 'lodash/uniq';
import get from 'lodash/get';
import { isEmpty } from 'lodash';
import { isKanji } from '../utils';
import fetchJisho from './fetchJisho';
import getSingleKanji from '../getKanji/getSingleKanji';

const hasPerfectMatch = (word, { word: resWord, reading }) => (
  (word === resWord || word === reading) && reading
);

const hasMatch = (word, { word: resWord, reading = '' }) => (
  (
    word.includes(resWord)
    || resWord.includes(word)
    || word.includes(reading)
    || reading.includes(word)
  ) && reading
);

const getReadingFromKanji = async (options, kanji) => {
  const response = await getSingleKanji(options, kanji);
  const { kunyomi = {}, onyomi = {} } = get(response, 'kanji.kanji', {});

  return [
    { reading: kunyomi.hiragana },
    { reading: onyomi.katakana },
  ].filter(({ reading }) => reading);
};

const getWordReadings = async (options, word) => {
  try {
    const response = await fetchJisho(word);
    const reducedResponse = response.reduce((acc, { japanese }) => ([
      ...acc,
      ...japanese,
    ]), []);

    const perfectMatch = reducedResponse.filter((r) => hasPerfectMatch(word, r));
    const match = isEmpty(perfectMatch)
      ? reducedResponse.filter((r) => hasMatch(word, r))
      : [];
    const kanjiReading = isEmpty(perfectMatch) && isEmpty(match) && isKanji(word)
      ? await getReadingFromKanji(options, word)
      : [];

    const furiganaList = uniq([
      ...perfectMatch, ...match, ...kanjiReading,
    ].map(({ reading }) => reading));

    return Promise.resolve(furiganaList);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getWordReadings;
