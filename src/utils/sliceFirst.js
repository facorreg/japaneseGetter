import isEmpty from 'lodash/isEmpty';

const sliceFirst = (array) => (!isEmpty(array) ? array.slice(1) : array);

export default sliceFirst;
