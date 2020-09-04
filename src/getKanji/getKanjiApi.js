import uniq from 'lodash/uniq';
import {
  getEnv, fetch, filterEmpty,
} from '../utils';

const parseKanjiApi = ({
  kun_readings: kunReadings = [],
  on_readings: onReadings = [],
  stroke_count: strokeCount,
  meanings = [],
  jlpt,
} = {}, word) => ({
  kanji: {
    character: word,
    kunyomi: { hiragana: kunReadings.join('、') },
    onyomi: { katakana: onReadings.join('、') },
    strokes: { count: strokeCount },
    meaning: uniq(filterEmpty(meanings)),
    jlpt,
  },
});

const getKanjiApi = async (word) => {
  try {
    const args = {
      url: `${getEnv('KANJI_API_URL', '')}${word}`,
    };
    const response = await fetch(args);

    return Promise.resolve(parseKanjiApi(response, word));
  } catch (err) {
    return Promise.resolve({ error: 'Failed to fetch kanjiApi data' });
  }
};

export default getKanjiApi;
