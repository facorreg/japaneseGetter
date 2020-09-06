import isEmpty from 'lodash/isEmpty';
import { rejectError } from '../utils';
import getJisho from './getJisho';

const parseWordData = (data, options) => {
  const { isSecondChoice } = options;

  if (isEmpty(data) || isEmpty(data.words)) return { error: 'No word found' };

  return {
    ...data,
    error: isSecondChoice
      ? 'First attempt to fetch data failed'
      : '',
  };
};

const getSingleKanji = async (options, word) => {
  try {
    const jishoData = await getJisho(word);
    const isInvalid = (data) => isEmpty(data) || data.error;

    if (isInvalid(jishoData)) {
      return rejectError('Failed to fetch data from the word APIs');
    }

    const mergedData = await parseWordData(jishoData, options);
    return { ...mergedData };
  } catch (err) {
    return Promise.reject(err);
  }
};

export default getSingleKanji;
