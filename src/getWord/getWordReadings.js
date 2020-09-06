import uniq from 'lodash';
import fetchJisho from './fetchJisho';

const getWordReadings = async (_, word) => {
  try {
    const response = await fetchJisho(word);
    const furiganaList = uniq(
      response.reduce((acc, { japanese }) => ([
        ...acc,
        ...japanese,
      ]), [])
        .filter(({ word: resWord, reading }) => word === resWord && reading)
        .map(({ reading }) => reading),
    );
    return Promise.resolve(furiganaList);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getWordReadings;
