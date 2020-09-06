import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

const getMeanings = (kanjiAliveData, kanjiApiData) => {
  const meanings = [kanjiAliveData, kanjiApiData]
    .map((obj) => get(obj, 'kanji.meaning', []));

  const allMeanings = uniq([...meanings[0], ...meanings[1]]);

  const [meaning, shortMeaning, kanjiAliveMeanings, kanjiApiDataMeanings] = [
    allMeanings,
    [...allMeanings].splice(0, 3),
    ...meanings,
  ].map((arr) => arr.join(', '));

  const useShortMeanings = meaning.split(',').length > 3;

  return {
    kanjiAliveMeanings,
    kanjiApiDataMeanings,
    meaning,
    shortMeaning: useShortMeanings ? `${shortMeaning}...` : '',
  };
};

const buildFinalKanjiData = (kanjiData) => ({
  kanji: {
    ...kanjiData,
  },
});

const mergeKanjiData = async (kanjiAliveData, kanjiApiData) => {
  const {
    kanjiAliveMeanings,
    // kanjiApiDataMeanings,
    meaning,
    shortMeaning,
  } = getMeanings(kanjiAliveData, kanjiApiData);

  const finalDataArgs = isEmpty(kanjiAliveMeanings)
    ? { kanji: { ...kanjiApiData.kanji, meaning, shortMeaning } }
    : {
      ...kanjiAliveData,
      kanji: {
        ...kanjiAliveData.kanji,
        meaning,
        shortMeaning,
        jlpt: get(kanjiApiData, 'kanji.jlpt'),
      },
    };

  return buildFinalKanjiData(finalDataArgs);
};

export default mergeKanjiData;
