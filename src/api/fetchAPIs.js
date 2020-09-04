import isEmpty from 'lodash/isEmpty';
import fetch from 'node-fetch';
import { hasKanji } from '../utils/index';
import { parseKanjiData } from './kanji';
import { parseWordData } from './word';
import buildAPIargs from './buildAPIArgs';

const fetchData = async (args, options) => {
  const reject = () => Promise.reject(new Error('unable to fetch data1'));

  try {
    const {
      url,
      headers = {},
      extractMethod,
      extractMethodArgs,
      args: queryArgs,
    } = args;

    const argString = !isEmpty(queryArgs)
      ? Object
        .keys(queryArgs)
        .map((key, i) => `${!i ? '?' : ''}${key}=${queryArgs[key]}`)
      : '';

    const response = await fetch(encodeURI(`${url}${argString}`), headers);
    if (!response.ok) return reject();

    const json = await response.json();
    if (json.error) return reject();

    return extractMethod(options, json, extractMethodArgs);
  } catch (err) {
    return Promise.reject(err);
  }
};

const fetchAPIs = async (rawOptions, args) => {
  const { word } = args || {};
  const { handleAsWord, allowRefetch } = rawOptions;
  const isWord = handleAsWord || word.length > 1 || !hasKanji(word);

  const options = {
    ...rawOptions,
    isWord,
    fetchAPIs, // avoids dependance cycle
  };

  const apiArgs = {
    ...options,
    args: { word },
  };

  const parseResult = isWord ? parseWordData : parseKanjiData;
  const parseResultOptions = {
    ...options,
    refetch: !isWord && allowRefetch,
  };

  const APIs = buildAPIargs(apiArgs);
  const fetchCatchErr = (res) => fetchData(res, apiArgs).catch((err) => err);

  try {
    const promises = await Promise.all(APIs.map(fetchCatchErr));
    if (isEmpty(promises)) return Promise.reject(new Error('failed to fetch'));

    return parseResult(parseResultOptions, promises);
  } catch (err) {
    return Promise.reject(err);
  }
};

export default fetchAPIs;
