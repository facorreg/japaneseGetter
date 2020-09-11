// [\x2E80 -\x2FD5] |
/* @todo: rework regexp, they suck */
const kanjiRegexList = '[一-龯々〆〤]';
const allkanjiRegexAsOne = /[一-龯々〆〤]+/g;
const allNonKanjiRegex = '[^一-龯々〆〤]';
const allNonKanjiRegexAsOne = /[^一-龯々〆〤]+/g;

const matchBuiltdRegex = (string, regexStr, greed) => string.match(
  new RegExp(regexStr, greed ? 'g' : ''),
);
const getKanji = (string, greed = false) => matchBuiltdRegex(string, kanjiRegexList, greed);
const getCharacters = (string, greed = false) => matchBuiltdRegex(string, allNonKanjiRegex, greed);
const hasKanji = (string) => Boolean(getKanji(string));
const hasCharacters = (string) => Boolean(getCharacters(string));
const isKanji = (string) => hasKanji(string) && string.length === 1;

export {
  getKanji,
  hasKanji,
  getCharacters,
  hasCharacters,
  isKanji,
  allkanjiRegexAsOne,
  allNonKanjiRegexAsOne,
};
