import isArray from 'lodash';

const objectPropsEnforceArray = (object, keys) => ({
  ...object,
  ...keys.reduce((acc, key) => ({
    ...acc,
    [key]: isArray(object[key]) ? object[key] : [],
  })),
});

export default objectPropsEnforceArray;
