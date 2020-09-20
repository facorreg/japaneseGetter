import { rejectError } from '../utils';

const createIndex = async (esClient, index) => {
  try {
    await esClient.indices.create({ index });
    return Promise.resolve();
  } catch (err) {
    return rejectError(`Failed to create index because ${err.message || err}`);
  }
};

export default createIndex;
