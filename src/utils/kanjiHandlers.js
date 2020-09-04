// const notKanjiRegex = /[^一-龯]/;
const kanjiRegexLit = '[一-龯]';
// const kanjiRegex = /[一-龯]/;
// const allkanjiRegex = /[一-龯]/g;
// const allkanjiRegexAsOne = /[一-龯]+/g;

const getKanji = (string, greed = false) => string.match(new RegExp(kanjiRegexLit, greed ? 'g' : ''));
const hasKanji = (string) => Boolean(getKanji(string));

export {
  getKanji,
  hasKanji,
};
