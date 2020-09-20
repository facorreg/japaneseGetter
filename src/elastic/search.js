import { rejectError } from '../utils';

const search = async (client, args) => {
  try {
    const searchResults = await client.search(args);
    return Promise.resolve(searchResults);
  } catch (err) {
    return rejectError('Search query failed', err);
  }
};

export default search;
