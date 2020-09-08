import uniq from 'lodash/uniq';
import { isEmpty } from 'lodash';
import fetchJisho from './fetchJisho';

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

const getWordReadings = async (_, word) => {
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
    const furiganaList = uniq([...perfectMatch, ...match].map(({ reading }) => reading));
    return Promise.resolve(furiganaList);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getWordReadings;
