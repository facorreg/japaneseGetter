/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import get from 'lodash/get';
import { rejectError } from '../utils';
import getKanjiAlive from './getKanjiAlive';
import getKanjiApi from './getKanjiApi';
import mergeKanjiData from './mergeKanjiData';
import { getSingleWord } from '../getWord';

const getSingleKanji = async (options, kanji) => {
  const { allowRefetch } = options;

  try {
    const kanjiAliveData = await getKanjiAlive(kanji);
    const kanjiApiData = await getKanjiApi(kanji);
    const isInvalid = (data) => data.error || get(data, 'kanji.meanings');
    const error = kanjiAliveData.error || kanjiApiData.error || '';

    if (isInvalid(kanjiAliveData) && isInvalid(kanjiApiData)) {
      return allowRefetch
        ? getSingleWord({ ...options, isSecondChoice: true }, kanji)
        : rejectError('Failed to fetch data from the kanji APIs');
    }

    const mergedData = await mergeKanjiData(kanjiAliveData, kanjiApiData);
    return { ...mergedData, error };
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getSingleKanji;
