import isEmpty from 'lodash/isEmpty';
import getEnv from './getEnv';
import { getKanji, hasKanji } from './kanjiHandlers';
import {
  objectKeysToCamelCase,
  objectListKeysToCamelCase,
} from './keysToCamelCase';

const filterEmpty = (array) => array.filter((e) => isEmpty(e));

export {
  getEnv,
  getKanji,
  hasKanji,
  filterEmpty,
  objectListKeysToCamelCase,
  objectKeysToCamelCase,
};
