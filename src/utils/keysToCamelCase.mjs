/* eslint-disable no-use-before-define */
import isObject from 'lodash/isObject';

const objectListKeysToCamelCase = (objectList) => (
  objectList.map((object) => objectKeysToCamelCase(object))
);

const snakeCaseToCamelCase = (str) => (
  str
    .split('_')
    .map((keyPart, i) => (
      i > 0
        ? `${keyPart.charAt(0).toUpperCase()}${keyPart.slice(1)}`
        : keyPart))
    .join('')
);

const objectKeysToCamelCase = (object) => (
  isObject(object)
    ? Object.keys(object)
      .reduce((accumulator, key) => ({
        ...accumulator,
        [snakeCaseToCamelCase(key)]: recursHandler(object[key]),
      }), {})
    : object
);

const recursHandler = (object) => {
  if (!isObject(object)) return object;
  if (object.length) return objectListKeysToCamelCase(object);

  return objectKeysToCamelCase(object);
};

export {
  objectKeysToCamelCase,
  objectListKeysToCamelCase,
};
