import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

import { getKanji, objectListKeysToCamelCase } from '../utils';

const parseJisho = (options, { data }) => {
  if (isEmpty(data) || !isArray(data)) return null;
  const { fetchAPIs } = options;

  const wordData = data.map(({ senses, ...rest }) => ({
    senses: senses
      .filter(({ parts_of_speech: partsOfSpeech = [] }) => !partsOfSpeech.includes('Wikipedia definition')),
    ...rest,
  }));

  const kanjiWithin = wordData.reduce((accumulator, { japanese }) => {
    const within = japanese
      // do we get all kanjis ?
      .map(({ word, reading }) => getKanji(word || reading, true) || [])
      .reduce((acc, arr) => [...acc, ...arr]);

    return ([
      ...accumulator,
      ...uniq(within),
    ]);
  }, [])
    .map((word) => (
      // eslint-disable-next-line no-use-before-define
      fetchAPIs({ ...options, allowRefetch: false }, { word })
        .catch((err) => Promise.resolve({ word, error: err }))
    ));

  return {
    kanjiWithin,
    words: objectListKeysToCamelCase(wordData),
  };
};

/*
  parse the data from the responses.

  Usuful only in the kanji case where data from two
    responses needs to be merged
*/

const parseWordData = (options, [data] = []) => {
  const { isSecondChoice } = options;

  if (isEmpty(data)) return new Error('failed to fetch data');

  return {
    ...data,
    error: isSecondChoice
      ? 'First attempt to fetch data failed'
      : '',
  };
};

export { parseJisho, parseWordData };
