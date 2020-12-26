import { rejectError } from '../utils';

const createIndex = async (esClient, index, options = {}, body) => {
  try {
    await esClient.indices.create({ index, ...options, body });
    return Promise.resolve();
  } catch (err) {
    return rejectError(`Failed to create index because ${err.message || err}`);
  }
};

export default createIndex;
