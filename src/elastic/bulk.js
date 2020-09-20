import cliProgress from 'cli-progress';
import log from '../logs';
import { getEnv, rejectError } from '../utils';

const bulk = (client, data, parser) => {
  const loadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  loadingBar.start(data.length, 0);
  // const parserWithLoader = parser(loadingBar);

  return (async () => {
    try {
      const dbulk = data.reduce((acc, d, index) => {
        if (getEnv('ENV') !== 'prod') {
          loadingBar.update(index);
        }
        return parser(acc, d);
      }, []);
      await client.bulk({ body: dbulk });
      log(`Successfully imported ${data.length}`);
      return Promise.resolve();
    } catch (err) {
      return rejectError('Failed bulk operation', err);
    }
  })()
    .finally(() => loadingBar.stop());
};

export default bulk;
