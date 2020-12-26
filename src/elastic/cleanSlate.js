import deleteIndex from './deleteIndex';
import { getEnv } from '../utils';

const cleanSlate = (client) => deleteIndex(client, getEnv('CORPUS_ES_INDEX', 'tatoeba'));

export default cleanSlate;
