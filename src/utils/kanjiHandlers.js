const kanjiRegexLit = '[一-龯]';

const getKanji = (string, greed = false) => string.match(new RegExp(kanjiRegexLit, greed ? 'g' : ''));
const hasKanji = (string) => Boolean(getKanji(string));

export {
  getKanji,
  hasKanji,
};
