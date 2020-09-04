import { getEnv } from '../utils';
import { parseKanjiLive, parseKanjiApi } from './kanji';
import { parseJisho } from './word';

const buildAPIargs = ({
  isWord, kanjiLiveApiKey, args: { word },
}) => (
  !isWord ? [{
    url: `${getEnv('KANJI_ALIVE_URL', '')}${word}`,
    headers: {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'kanjialive-api.p.rapidapi.com',
        'x-rapidapi-key': kanjiLiveApiKey,
      },
    },
    extractMethod: parseKanjiLive,
    extractMethodArgs: { word },
  },
  {
    url: `${getEnv('KANJI_API_URL', '')}${word}`,
    extractMethod: parseKanjiApi,
    extractMethodArgs: { word },
  }]
    : [{
      url: `${getEnv('JISHO_URL', '')}`,
      extractMethod: parseJisho,
      args: { keyword: word },
    }]
);

export default buildAPIargs;
