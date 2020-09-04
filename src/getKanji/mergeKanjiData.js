import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';

const getMeanings = (kanjiAliveData, kanjiApiData) => {
  const meanings = [kanjiAliveData, kanjiApiData]
    .map((obj) => get(obj, 'kanji.meaning', []));

  const allMeanings = uniq([...meanings[0], ...meanings[1]]);

  const [meaning, shortMeaning] = [
    allMeanings,
    [...allMeanings].splice(0, 3),
  ].map((arr) => arr.join(', '));

  return {
    kanjiAliveMeanings: meanings[0],
    kanjiApiDataMeanings: meanings[1],
    meaning,
    shortMeaning: `${shortMeaning}...`,
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
    kanjiApiDataMeanings,
    meaning,
    shortMeaning,
  } = getMeanings(kanjiAliveData, kanjiApiData);

  const finalDataArgs = isEmpty(kanjiAliveMeanings)
    ? { ...kanjiApiData.kanji, meaning: kanjiApiDataMeanings }
    : {
      ...kanjiAliveData,
      meaning,
      shortMeaning,
      jlpt: get(kanjiApiData, 'kanji.jlpt'),
    };

  return buildFinalKanjiData(finalDataArgs);
};

export default mergeKanjiData;
