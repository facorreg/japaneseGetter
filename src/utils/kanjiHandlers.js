const kanjiRegexList = '[一-龯]|\u3005';

const getKanji = (string, greed = false) => string.match(new RegExp(kanjiRegexList, greed ? 'g' : ''));
const hasKanji = (string) => Boolean(getKanji(string));
const isKanji = (string) => hasKanji(string) && string.length === 1;

export {
  getKanji,
  hasKanji,
  isKanji,
};
