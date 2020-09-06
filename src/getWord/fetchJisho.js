import {
  fetch,
  getEnv,
  objectListKeysToCamelCase,
} from '../utils';

const fetchJisho = async (word) => {
  try {
    const { data: rawResponse } = await fetch({
      url: getEnv('JISHO_URL', ''),
      args: { keyword: word },
    });

    return Promise.resolve(objectListKeysToCamelCase(rawResponse));
  } catch (err) {
    return Promise.reject(err);
  }
};

export default fetchJisho;
