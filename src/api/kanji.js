import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import { filterEmpty } from '../utils/index';

const parseKanjiLive = (_, response = {}, args) => {
  const { word } = args;
  const {
    kanji = {},
    examples = [],
    radical,
    references,
    error,
  } = response;

  if (error || isEmpty(kanji.meaning)) return {};

  const extractEnglishMeaning = (array) => (
    array.map(({ meaning: { english = '' } = {}, ...rest }) => ({
      ...rest,
      meaning: uniq(filterEmpty(english.split(', '))),
    })));

  const [englishMeaning, ...rest] = extractEnglishMeaning([kanji, ...examples]);

  return {
    examples: rest,
    kanji: {
      ...kanji,
      character: word,
      meaning: englishMeaning.meaning,
    },
    radical,
    references,
  };
};

const parseKanjiApi = (_, {
  kun_readings: kunReadings = [],
  on_readings: onReadings = [],
  stroke_count: strokeCount,
  meanings = [],
  jlpt,
} = {}, { word }) => ({
  kanji: {
    character: word,
    kunyomi: { hiragana: kunReadings.join('、') },
    onyomi: { katakana: onReadings.join('、') },
    strokes: { count: strokeCount },
    meaning: uniq(filterEmpty(meanings)),
    jlpt,
  },
});

const parseKanjiData = async (options, data) => {
  const [kanjiLiveData, kanjiApiData] = data;
  const { allowRefetch, fetchAPIs } = options;

  const meanings = data
    .map((obj) => get(obj, 'kanji.meaning', []));

  const allMeanings = meanings.reduce((acc, meaning = []) => (uniq([...acc, ...meaning])), []);

  const [meaning, shortMeaning] = [
    allMeanings,
    [...[...allMeanings].splice(0, 3), '...'],
  ].map((arr) => arr.join(', '));

  const [kanjiLiveMeanings, kanjiApiDataMeanings] = meanings;

  /*
    @todo: try to not throw away all the data,
      some of it may be valuable, even if there's no translation
      for it.
  */

  if (!kanjiLiveMeanings && !kanjiApiDataMeanings) {
    return allowRefetch
      // eslint-disable-next-line no-use-before-define
      ? fetchAPIs({ ...options, allowRefetch: false, isSecondChoice: true })
      : new Error('failed to fetch data');
  }

  const buildFinalKanjiData = (kanjiData) => ({
    kanji: {
      kanji: {
        ...kanjiData,
      },
    },
  });

  if (isEmpty(kanjiLiveMeanings)) {
    return buildFinalKanjiData({
      ...kanjiApiData.kanji,
      meaning: kanjiApiDataMeanings,
    });
  }

  return buildFinalKanjiData(kanjiLiveData, {
    ...kanjiLiveData.kanji,
    meaning,
    shortMeaning,
    jlpt: get(kanjiApiData, 'kanji.jlpt'),
  });
};

export { parseKanjiApi, parseKanjiLive, parseKanjiData };
