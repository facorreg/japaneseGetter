import { rejectError } from '../utils';
import log from '../logs';

const putMapping = async (client, index, properties) => {
  const prefix = `Mapping of ${index}`;
  try {
    await client.indices.putMapping({
      index,
      body: { properties },
    });
    log(`${prefix} succeeded`);
    return Promise.resolve();
  } catch (err) {
    return rejectError(`${prefix} failed`);
  }
};

export default putMapping;
