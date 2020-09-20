import { rejectError } from '../utils';

const deleteIndex = async (esClient, index) => {
  try {
    await esClient.indices.delete({ index });
    return Promise.resolve();
  } catch (err) {
    return rejectError(`Failed to create delete because ${err.message || err}`);
  }
};

export default deleteIndex;
