/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import getSingleKanji from './getSingleKanji';
import { rejectError } from '../utils';

const getKanjiList = async (options, kanjiList) => {
  const promises = kanjiList.map((kanji) => (
    getSingleKanji(options, kanji).catch(() => null)));

  const kanjiListData = await Promise.all(promises);

  return kanjiListData.length
    ? Promise.resolve(kanjiListData)
    : rejectError('Failed to fetch the kanji list');
};

export default getKanjiList;
