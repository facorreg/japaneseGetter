import get from 'lodash/get';
import { rejectError } from '../utils';
import getKanjiAlive from './getKanjiAlive';
import getKanjiApi from './getKanjiApi';
import mergeKanjiData from './mergeKanjiData';

const getSingleKanji = async (options, word) => {
  const { allowRefetch, kanjiAliveApiKey } = options;

  try {
    const kanjiAliveData = await getKanjiAlive(word, kanjiAliveApiKey);
    const kanjiApiData = await getKanjiApi(word);
    const isInvalid = (data) => data.error || get(data, 'kanji.meanings');
    const error = kanjiAliveData.error || kanjiApiData.error || '';

    if (isInvalid(kanjiAliveData) && isInvalid(kanjiApiData)) {
      return allowRefetch
        ? {} // fetch word
        : rejectError('Failed to fetch data from the kanji APIs');
    }

    const mergedData = await mergeKanjiData(kanjiAliveData, kanjiApiData);
    return { ...mergedData, error };
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getSingleKanji;
