import nodeFetch from 'node-fetch';
import rejectError from './rejectError';

const fetch = async (args) => {
  const {
    url,
    headers = {},
    args: queryArgs = {},
  } = args;

  const argString = Object
    .keys(queryArgs)
    .map((key, i) => `${!i ? '?' : ''}${key}=${queryArgs[key]}`)
    .join('&');

  const response = await nodeFetch(encodeURI(`${url}${argString}`), headers);
  if (!response.ok) return rejectError('response-code');

  const json = await response.json();
  if (json.error) return rejectError(json.error);

  return json;
};

export default fetch;
