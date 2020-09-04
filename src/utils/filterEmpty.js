import isEmpty from 'lodash/isEmpty';

const filterEmpty = (array) => array.filter((e) => !isEmpty(e));

export default filterEmpty;
