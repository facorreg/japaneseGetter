import isArray from 'lodash/isArray';

const objectPropsEnforceArray = (object, keys) => ({
  ...object,
  ...keys.reduce((acc, key) => ({
    ...acc,
    [key]: isArray(object[key]) ? object[key] : [],
  })),
});

export default objectPropsEnforceArray;
